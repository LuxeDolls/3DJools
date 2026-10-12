import "server-only"

import { desc, eq, ilike, inArray, or, sql } from "drizzle-orm"
import { db } from "@/lib/db"
import { orders, shipmentEvents, type OrderRow, type ShipmentEventRow } from "@/lib/db/schema"
import {
  OWN_CARRIER,
  randomTrackingNumber,
  trackingPageUrl,
  localeForCountry,
  type ShipmentStatus,
} from "@/lib/shipping/tracking"

function eventId(): string {
  return `shp_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
}

async function uniqueTrackingNumber(): Promise<string> {
  for (let attempt = 0; attempt < 6; attempt++) {
    const code = randomTrackingNumber()
    const existing = await db
      .select({ id: orders.id })
      .from(orders)
      .where(eq(orders.trackingNumber, code))
      .limit(1)
    if (existing.length === 0) return code
  }
  return randomTrackingNumber()
}

export async function getShipmentEvents(orderId: string): Promise<ShipmentEventRow[]> {
  return db
    .select()
    .from(shipmentEvents)
    .where(eq(shipmentEvents.orderId, orderId))
    .orderBy(desc(shipmentEvents.createdAt))
}

export async function getShipmentEventsForOrders(orderIds: string[]): Promise<Record<string, ShipmentEventRow[]>> {
  if (orderIds.length === 0) return {}
  const rows = await db
    .select()
    .from(shipmentEvents)
    .where(inArray(shipmentEvents.orderId, orderIds))
    .orderBy(desc(shipmentEvents.createdAt))
  const grouped: Record<string, ShipmentEventRow[]> = {}
  for (const row of rows) {
    const list = grouped[row.orderId] ?? []
    list.push(row)
    grouped[row.orderId] = list
  }
  return grouped
}

/** Assigns a 3DJools tracking number and our tracking page when an order ships. */
export async function ensureTrackingNumber(orderId: string): Promise<OrderRow | null> {
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1)
  if (!order) return null

  const trackingNumber = order.trackingNumber?.trim() || (await uniqueTrackingNumber())
  const carrier = order.carrier?.trim() || OWN_CARRIER
  const locale = localeForCountry(order.shippingCountry)
  const trackingUrl = trackingPageUrl(trackingNumber, locale)

  await db
    .update(orders)
    .set({
      trackingNumber,
      carrier,
      trackingUrl,
      updatedAt: new Date(),
    })
    .where(eq(orders.id, orderId))

  return { ...order, trackingNumber, carrier, trackingUrl }
}

export async function ensureShipmentOnShip(orderId: string): Promise<void> {
  const order = await ensureTrackingNumber(orderId)
  if (!order) return
  const existing = await db
    .select({ id: shipmentEvents.id })
    .from(shipmentEvents)
    .where(eq(shipmentEvents.orderId, orderId))
    .limit(1)
  if (existing.length > 0) return

  await db.insert(shipmentEvents).values({
    id: eventId(),
    orderId,
    status: "label_created",
    carrier: order.carrier || OWN_CARRIER,
    comment: null,
    createdAt: new Date(),
  })
}

export async function insertShipmentEvent(input: {
  orderId: string
  status: ShipmentStatus
  comment: string | null
  carrier: string
}): Promise<ShipmentEventRow> {
  const row: ShipmentEventRow = {
    id: eventId(),
    orderId: input.orderId,
    status: input.status,
    comment: input.comment,
    carrier: input.carrier,
    createdAt: new Date(),
  }
  await db.insert(shipmentEvents).values(row)
  return row
}

export async function getShipmentByTrackingNumber(code: string): Promise<{
  order: OrderRow
  events: ShipmentEventRow[]
} | null> {
  const [order] = await db
    .select()
    .from(orders)
    .where(sql`upper(${orders.trackingNumber}) = ${code}`)
    .limit(1)
  if (!order) return null
  const events = await getShipmentEvents(order.id)
  return { order, events }
}

const OPEN_SHIPMENT_STATUSES = ["processing", "paid", "partially_paid", "shipped", "delivered"] as const

export async function listShipmentOrders(query = ""): Promise<OrderRow[]> {
  const q = query.trim()
  if (!q) {
    return db
      .select()
      .from(orders)
      .where(inArray(orders.status, [...OPEN_SHIPMENT_STATUSES]))
      .orderBy(desc(orders.updatedAt))
      .limit(40)
  }
  const pattern = `%${q.replace(/[%_]/g, "")}%`
  return db
    .select()
    .from(orders)
    .where(
      or(
        ilike(orders.orderNumber, pattern),
        ilike(orders.trackingNumber, pattern),
        ilike(orders.email, pattern),
        ilike(orders.shippingName, pattern),
      ),
    )
    .orderBy(desc(orders.updatedAt))
    .limit(30)
}
