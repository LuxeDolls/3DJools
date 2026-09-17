import "server-only"

import { and, desc, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import {
  orderItems,
  orders,
  type NewOrderItemRow,
  type OrderItemRow,
  type OrderRow,
  type OrderStatus,
} from "@/lib/db/schema"

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

  return { ...order, items }
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
export async function getOrderByOrderNumber(orderNumber: string): Promise<OrderWithItems | null> {
  const [order] = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1)
  if (!order) return null
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id))
  return { ...order, items }
}

/* -------------------------- admin reads/writes -------------------------- */

export async function getAllOrders(): Promise<OrderWithItems[]> {
  const rows = await db.select().from(orders).orderBy(desc(orders.createdAt))
  return attachItems(rows)
}

export async function getOrderById(orderId: string): Promise<OrderWithItems | null> {
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1)
  if (!order) return null
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id))
  return { ...order, items }
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  await db.update(orders).set({ status, updatedAt: new Date() }).where(eq(orders.id, orderId))
}

export type TrackingInput = {
  trackingNumber: string
  trackingUrl?: string
  carrier?: string
}

export async function updateOrderTracking(orderId: string, tracking: TrackingInput): Promise<OrderWithItems | null> {
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
  return getOrderById(orderId)
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
