import { parseOrderNotes } from "@/lib/orders/notes"
import { getOrderByOrderNumber, mergeOrderNotes, updateOrderStatus } from "@/lib/orders/queries"
import { getAlppayPayment, isAlppayPaymentId } from "@/lib/payments/alppay"
import { isAlppayFailureState, recordAlppayFailure } from "@/lib/payments/alppay-limit"

const PAID_STATUSES = new Set(["paid", "processing", "shipped", "delivered", "partially_paid"])
const PAYABLE_STATUSES = new Set(["awaiting_payment", "reviewing_payment"])

export type AlppaySettleResult =
  | { ok: true; already: boolean; locale: string }
  | { ok: false; reason: string; locale: string }

/** Marks an AlpPay card order paid only after the gateway confirms the exact euro amount. */
export async function settleAlppayPayment(paymentId: string): Promise<AlppaySettleResult> {
  if (!isAlppayPaymentId(paymentId)) return { ok: false, reason: "not_found", locale: "en" }
  const payment = await getAlppayPayment(paymentId)
  const order = payment.referenceId ? await getOrderByOrderNumber(payment.referenceId) : null
  const locale = parseOrderNotes(order?.notes).checkout_locale || "en"
  if (!order || order.paymentMethod !== "alppay") return { ok: false, reason: "not_found", locale }
  if (PAID_STATUSES.has(order.status)) return { ok: true, already: true, locale }
  if (!PAYABLE_STATUSES.has(order.status)) return { ok: false, reason: "invalid_status", locale }

  if (payment.paymentType !== "DEPOSIT" || payment.currency !== "EUR" || payment.amountCents !== order.totalCents) {
    console.error("[v0] AlpPay amount did not match order", order.orderNumber)
    await mergeOrderNotes(order.id, { alppay_last_status: "amount_mismatch" })
    return { ok: false, reason: "mismatch", locale }
  }
  if (payment.state !== "COMPLETED") {
    await mergeOrderNotes(order.id, { alppay_last_status: payment.state || "unpaid" })
    if (isAlppayFailureState(payment.state)) {
      await recordAlppayFailure({
        email: order.email,
        paymentId: payment.id,
        orderNumber: order.orderNumber,
        state: payment.state,
      })
    }
    return { ok: false, reason: isAlppayFailureState(payment.state) ? "declined" : "not_completed", locale }
  }

  await mergeOrderNotes(order.id, { alppay_last_status: "COMPLETED", alppay_payment_id: payment.id })
  await updateOrderStatus(order.id, "paid")
  return { ok: true, already: false, locale }
}
