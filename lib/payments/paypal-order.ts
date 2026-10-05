import { parseOrderNotes } from "@/lib/orders/notes"
import { getOrderByOrderNumber, mergeOrderNotes, updateOrderStatus } from "@/lib/orders/queries"
import { confirmPaypalOrder, knownPaypalOrderIds } from "@/lib/payments/paypal"

const PAID_STATUSES = new Set(["paid", "processing", "shipped", "delivered", "partially_paid"])
const PAYABLE_STATUSES = new Set(["awaiting_payment", "reviewing_payment"])

export type PaypalSettleResult =
  | { ok: true; already: boolean; locale: string }
  | { ok: false; reason: string; locale: string }

/** Marks a PayPal order paid only after PayPal's API confirms the exact euro amount. */
export async function settleStoredPaypalOrder(
  orderNumber: string,
  paypalOrderId: string,
): Promise<PaypalSettleResult> {
  const order = await getOrderByOrderNumber(orderNumber)
  const locale = parseOrderNotes(order?.notes).checkout_locale || "en"
  if (!order || order.paymentMethod !== "paypal") return { ok: false, reason: "not_found", locale }
  if (!knownPaypalOrderIds(parseOrderNotes(order.notes).paypal_order_ids).includes(paypalOrderId)) {
    return { ok: false, reason: "unknown_payment", locale }
  }
  if (PAID_STATUSES.has(order.status)) return { ok: true, already: true, locale }
  if (!PAYABLE_STATUSES.has(order.status)) return { ok: false, reason: "invalid_status", locale }

  const payment = await confirmPaypalOrder(paypalOrderId)
  if (!payment) {
    await mergeOrderNotes(order.id, { paypal_last_status: "not_completed" })
    return { ok: false, reason: "not_completed", locale }
  }
  if (
    payment.customId !== order.orderNumber ||
    payment.currency !== "EUR" ||
    payment.amountCents !== order.totalCents
  ) {
    console.error("[v0] PayPal amount did not match order", order.orderNumber)
    await mergeOrderNotes(order.id, { paypal_last_status: "amount_mismatch" })
    return { ok: false, reason: "mismatch", locale }
  }

  await mergeOrderNotes(order.id, {
    paypal_capture_id: payment.captureId,
    paypal_last_status: "COMPLETED",
  })
  await updateOrderStatus(order.id, "paid")
  return { ok: true, already: false, locale }
}
