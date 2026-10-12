"use server"

import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"
import { isAdmin } from "@/lib/admin-auth"
import { db } from "@/lib/db"
import { orders } from "@/lib/db/schema"
import { getOrderById } from "@/lib/orders/queries"
import { sendShipmentEventEmail } from "@/lib/email/order-emails"
import {
  ensureTrackingNumber,
  getShipmentEvents,
  insertShipmentEvent,
  listShipmentOrders,
} from "@/lib/shipping/events"
import { isCarrierName, isShipmentStatus, OWN_CARRIER, PARTNER_CARRIERS } from "@/lib/shipping/tracking"

async function assertAdmin() {
  if (!(await isAdmin())) throw new Error("Unauthorized")
}

export async function searchShipmentOrders(query: string) {
  await assertAdmin()
  const rows = await listShipmentOrders(query)
  return rows.map(toShipmentOrder)
}

export async function getShipmentDetail(orderId: string) {
  await assertAdmin()
  const order = await getOrderById(orderId)
  if (!order) return null
  const events = await getShipmentEvents(orderId)
  return {
    order: toShipmentOrder(order),
    events: events.map((event) => ({
      id: event.id,
      status: event.status,
      comment: event.comment,
      carrier: event.carrier,
      createdAt: event.createdAt.toISOString(),
    })),
  }
}

export async function addShipmentEvent(input: {
  orderId: string
  status: string
  comment: string
  carrier: string
}): Promise<{ ok: boolean; error?: string; emailed?: boolean }> {
  await assertAdmin()
  if (!isShipmentStatus(input.status)) return { ok: false, error: "Choose a delivery status." }
  if (!isCarrierName(input.carrier)) return { ok: false, error: "Choose a carrier." }
  if (input.status === "handed_to_partner" && !(PARTNER_CARRIERS as readonly string[]).includes(input.carrier)) {
    return { ok: false, error: "Handing over requires DHL or DPD." }
  }

  const comment = input.comment.trim().slice(0, 1000)
  const existing = await getOrderById(input.orderId)
  if (!existing) return { ok: false, error: "Order not found." }
  if (existing.status === "cancelled" || existing.status === "refunded") {
    return { ok: false, error: "This order is cancelled or refunded." }
  }
  const order = await ensureTrackingNumber(input.orderId)
  if (!order) return { ok: false, error: "Order not found." }

  const carrier = input.carrier || order.carrier || OWN_CARRIER
  await insertShipmentEvent({
    orderId: order.id,
    status: input.status,
    comment: comment || null,
    carrier,
  })

  const nextStatus = input.status === "delivered" ? "delivered" : order.status === "delivered" ? "delivered" : "shipped"
  await db
    .update(orders)
    .set({
      status: nextStatus,
      carrier,
      updatedAt: new Date(),
    })
    .where(eq(orders.id, order.id))

  const updated = await getOrderById(order.id)
  let emailed = false
  if (updated) {
    const result = await sendShipmentEventEmail(updated, {
      status: input.status,
      comment: comment || null,
      carrier,
    })
    emailed = result.sent
  }

  revalidatePath("/admin/shipments")
  revalidatePath("/admin/orders")
  revalidatePath(`/admin/orders/${order.id}`)
  return { ok: true, emailed }
}

function toShipmentOrder(order: {
  id: string
  orderNumber: string
  email: string
  status: string
  shippingName: string | null
  shippingCity: string | null
  shippingCountry: string | null
  trackingNumber: string | null
  trackingUrl: string | null
  carrier: string | null
  totalCents: number
  updatedAt: Date
}) {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    email: order.email,
    status: order.status,
    shippingName: order.shippingName,
    shippingCity: order.shippingCity,
    shippingCountry: order.shippingCountry,
    trackingNumber: order.trackingNumber,
    trackingUrl: order.trackingUrl,
    carrier: order.carrier,
    totalCents: order.totalCents,
    updatedAt: order.updatedAt.toISOString(),
  }
}
