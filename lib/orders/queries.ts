import "server-only"

import { and, desc, eq, isNull, like } from "drizzle-orm"
import { after } from "next/server"
import { db } from "@/lib/db"
import {
  orderItems,
  orders,
  type NewOrderItemRow,
  type OrderItemRow,
  type OrderRow,
  type OrderStatus,
} from "@/lib/db/schema"
import { notifyNewOrder, notifyOrderStatusChange } from "@/lib/notifications/admin"
import { sendOrderShippedEmail, sendOrderStatusUpdateEmail } from "@/lib/email/order-emails"
import { ensureShipmentOnShip } from "@/lib/shipping/events"
import { buildOrderNotes, parseOrderNotes } from "@/lib/orders/notes"

export type OrderWithItems = OrderRow & { items: OrderItemRow[] }

function generateId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`
}

function generateOrderNumber(): string {
  const now = new Date()
  const ymd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate(),
  ).padStart(2, "0")}`
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase()
  return `V3-${ymd}-${rand}`
}

export type CreateOrderInput = {
  userId?: string | null
  email: string
  status?: OrderStatus
  paymentMethod: OrderRow["paymentMethod"]
  subtotalCents: number
  shippingCents: number
  totalCents: number
  shipping?: {
    name?: string
    address1?: string
    address2?: string
    city?: string
    postalCode?: string
    country?: string
  }
  notes?: string
  items: Array<Omit<NewOrderItemRow, "id" | "orderId">>
}

/**
 * Creates an order header + its line items. Callers are responsible for
 * server-side recomputation of prices/totals before calling this.
 */
export async function createOrder(input: CreateOrderInput): Promise<OrderWithItems> {
  const orderId = generateId("ord")
  const [order] = await db
    .insert(orders)
    .values({
      id: orderId,
      orderNumber: generateOrderNumber(),
      userId: input.userId ?? null,
      email: input.email,
      status: input.status ?? "pending",
      paymentMethod: input.paymentMethod,
      subtotalCents: input.subtotalCents,
      shippingCents: input.shippingCents,
      totalCents: input.totalCents,
      shippingName: input.shipping?.name ?? null,
      shippingAddress1: input.shipping?.address1 ?? null,
      shippingAddress2: input.shipping?.address2 ?? null,
      shippingCity: input.shipping?.city ?? null,
      shippingPostalCode: input.shipping?.postalCode ?? null,
      shippingCountry: input.shipping?.country ?? null,
      notes: input.notes ?? null,
    })
    .returning()

  const items = input.items.length
    ? await db
        .insert(orderItems)
        .values(input.items.map((item) => ({ ...item, id: generateId("oit"), orderId })))
        .returning()
    : []

  const orderWithItems = { ...order, items }
  // Scheduled via after() rather than a bare fire-and-forget promise: on
  // Vercel's serverless runtime, the function can be frozen the instant the
  // response is sent, which would silently drop an un-awaited promise before
  // it finishes — after() keeps the invocation alive until this resolves.
  after(() =>
    notifyNewOrder(orderWithItems).catch((error) => {
      console.error("[v0] New-order admin notification failed:", error)
    }),
  )

  return orderWithItems
}

/** Customer-area read: only the signed-in user's own orders. */
export async function getOrdersByUserId(userId: string): Promise<OrderWithItems[]> {
  const rows = await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt))
  return attachItems(rows)
}

/** Customer-area read for a single order, scoped to its owner. */
export async function getOrderForUser(userId: string, orderId: string): Promise<OrderWithItems | null> {
  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.userId, userId)))
    .limit(1)
  if (!order) return null
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id))
  return { ...order, items }
}

/**
 * Public confirmation read: fetch an order by its unique order number. The
 * order number acts as the access token for the post-checkout thank-you page
 * so guests (no account) can still see their confirmation.
 */
export async function getOrderNumberBySquareOrderId(squareOrderId: string): Promise<string | null> {
  if (!/^[A-Za-z0-9]{8,64}$/.test(squareOrderId)) return null
  const [row] = await db
    .select({ orderNumber: orders.orderNumber })
    .from(orders)
    .where(like(orders.notes, `%square_order_id=${squareOrderId}%`))
    .limit(1)
  return row?.orderNumber ?? null
}

export async function getOrderByOrderNumber(orderNumber: string): Promise<OrderWithItems | null> {
  const [order] = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1)
  if (!order) return null
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id))
  return { ...order, items }
}

/* -------------------------- admin reads/writes -------------------------- */

export async function getAllOrders(): Promise<OrderWithItems[]> {
  const rows = await db.select().from(orders).where(isNull(orders.archivedAt)).orderBy(desc(orders.createdAt))
  return attachItems(rows)
}

export async function getOrderById(orderId: string): Promise<OrderWithItems | null> {
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1)
  if (!order) return null
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id))
  return { ...order, items }
}

export async function mergeOrderNotes(orderId: string, fields: Record<string, string | undefined>): Promise<void> {
  const current = await getOrderById(orderId)
  if (!current) return
  const notes = buildOrderNotes({ ...parseOrderNotes(current.notes), ...fields })
  await db.update(orders).set({ notes: notes ?? null, updatedAt: new Date() }).where(eq(orders.id, orderId))
}

/** Drops an unpaid order without emailing the customer. Used when card checkout cannot start. */
export async function abandonUnpaidOrder(orderId: string): Promise<void> {
  await db
    .update(orders)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(and(eq(orders.id, orderId), eq(orders.status, "awaiting_payment")))
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  const previous = await getOrderById(orderId)
  if (!previous || previous.status === status) {
    return
  }

  await db.update(orders).set({ status, updatedAt: new Date() }).where(eq(orders.id, orderId))
  if (status === "shipped") {
    await ensureShipmentOnShip(orderId)
  }
  const updated = await getOrderById(orderId)
  if (updated) {
    after(() =>
      notifyOrderStatusChange(updated, previous.status).catch((error) => {
        console.error("[v0] Order-status admin notification failed:", error)
      }),
    )
    after(() => {
      const send =
        status === "shipped"
          ? sendOrderShippedEmail(updated)
          : sendOrderStatusUpdateEmail(updated, previous.status)
      return send.catch((error) => {
        console.error("[v0] Order-status customer email failed:", error)
      })
    })
  }
}

export type TrackingInput = {
  trackingNumber: string
  trackingUrl?: string
  carrier?: string
}

export async function updateOrderTracking(orderId: string, tracking: TrackingInput): Promise<OrderWithItems | null> {
  const previous = await getOrderById(orderId)
  await db
    .update(orders)
    .set({
      trackingNumber: tracking.trackingNumber || null,
      trackingUrl: tracking.trackingUrl || null,
      carrier: tracking.carrier || null,
      // Assigning tracking implies the order has shipped.
      status: "shipped",
      updatedAt: new Date(),
    })
    .where(eq(orders.id, orderId))
  await ensureShipmentOnShip(orderId)
  const updated = await getOrderById(orderId)
  if (updated && previous && previous.status !== "shipped") {
    after(() =>
      notifyOrderStatusChange(updated, previous.status).catch((error) => {
        console.error("[v0] Shipment admin notification failed:", error)
      }),
    )
    after(() =>
      sendOrderShippedEmail(updated).catch((error) => {
        console.error("[v0] Shipment customer email failed:", error)
      }),
    )
  }
  return updated
}

async function attachItems(rows: OrderRow[]): Promise<OrderWithItems[]> {
  if (rows.length === 0) return []
  const all = await db.select().from(orderItems)
  const byOrder = new Map<string, OrderItemRow[]>()
  for (const item of all) {
    const list = byOrder.get(item.orderId) ?? []
    list.push(item)
    byOrder.set(item.orderId, list)
  }
  return rows.map((order) => ({ ...order, items: byOrder.get(order.id) ?? [] }))
}
