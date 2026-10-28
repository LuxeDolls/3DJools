import "server-only"

import { and, eq, lte } from "drizzle-orm"
import { db } from "@/lib/db"
import { orders } from "@/lib/db/schema"
import { updateOrderStatus } from "@/lib/orders/queries"

/**
 * Days an order spends in "processing" (picking, packing, courier handover)
 * before it automatically moves to "shipped". Matches how long fulfillment
 * actually takes — this only removes the need for an admin to click through
 * each order by hand.
 */
export const AUTO_SHIP_AFTER_DAYS = 2

export type OrderAutomationResult = {
  movedToProcessing: string[]
  movedToShipped: string[]
}

/**
 * Advances real orders through the fulfillment pipeline on a timer:
 *  - "paid" → "processing" as soon as this runs after payment clears.
 *  - "processing" → "shipped" once AUTO_SHIP_AFTER_DAYS have passed.
 *
 * Every transition goes through `updateOrderStatus`, so it assigns a real
 * tracking number through the existing courier/DHL/DPD handoff
 * (`ensureShipmentOnShip`) and sends the same customer email an admin
 * triggers by changing the status manually. This does not invent shipments,
 * statuses, or delays beyond the real processing window above — it only
 * automates the existing manual admin workflow.
 */
export async function runOrderAutomation(): Promise<OrderAutomationResult> {
  const movedToProcessing: string[] = []
  const movedToShipped: string[] = []

  const paidOrders = await db.select({ id: orders.id }).from(orders).where(eq(orders.status, "paid"))
  for (const { id } of paidOrders) {
    await updateOrderStatus(id, "processing")
    movedToProcessing.push(id)
  }

  const cutoff = new Date(Date.now() - AUTO_SHIP_AFTER_DAYS * 24 * 60 * 60 * 1000)
  const readyToShip = await db
    .select({ id: orders.id })
    .from(orders)
    .where(and(eq(orders.status, "processing"), lte(orders.updatedAt, cutoff)))
  for (const { id } of readyToShip) {
    await updateOrderStatus(id, "shipped")
    movedToShipped.push(id)
  }

  return { movedToProcessing, movedToShipped }
}
