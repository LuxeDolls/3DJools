import { parseOrderNotes } from "@/lib/orders/notes"
import { getOrderByOrderNumber, mergeOrderNotes, updateOrderStatus } from "@/lib/orders/queries"
import type { OrderWithItems } from "@/lib/orders/queries"
import { getStripe } from "@/lib/payments/stripe"

const PAID_STATUSES = new Set(["paid", "processing", "shipped", "delivered", "partially_paid"])
const PAYABLE_STATUSES = new Set(["awaiting_payment", "reviewing_payment"])

export type StripeSettleResult =
  | { ok: true; already: boolean; locale: string }
  | { ok: false; reason: string; locale: string }

/** Marks a card order paid only after Stripe confirms the exact euro amount. */
export async function settleStripeSession(
  orderNumber: string,
  sessionId: string,
): Promise<StripeSettleResult> {
  const order = await getOrderByOrderNumber(orderNumber)
  const locale = parseOrderNotes(order?.notes).checkout_locale || "en"
  if (!order || order.paymentMethod !== "card") return { ok: false, reason: "not_found", locale }
  if (PAID_STATUSES.has(order.status)) return { ok: true, already: true, locale }
  if (!PAYABLE_STATUSES.has(order.status)) return { ok: false, reason: "invalid_status", locale }

  const session = await getStripe().checkout.sessions.retrieve(sessionId)
  const reference = session.metadata?.order_number || session.client_reference_id || ""
  if (reference !== order.orderNumber || session.currency !== "eur" || session.amount_total !== order.totalCents) {
    console.error("[v0] Stripe amount did not match order", order.orderNumber)
    await mergeOrderNotes(order.id, { stripe_last_status: "amount_mismatch" })
    return { ok: false, reason: "mismatch", locale }
  }
  if (session.payment_status !== "paid") {
    await mergeOrderNotes(order.id, { stripe_last_status: session.payment_status || session.status || "unpaid" })
    return { ok: false, reason: "not_completed", locale }
  }

  const paymentIntent = typeof session.payment_intent === "string" ? session.payment_intent : undefined
  await mergeOrderNotes(order.id, {
    stripe_last_status: "paid",
    stripe_payment_intent: paymentIntent,
  })
  await updateOrderStatus(order.id, "paid")
  return { ok: true, already: false, locale }
}

/**
 * Records a Stripe PaymentIntent decline against the order (e.g. card declined,
 * insufficient funds, expired card) so the order page can show it and admins can
 * be notified immediately, without waiting for the customer to return from Stripe.
 */
export async function recordStripeDecline(
  orderNumber: string,
  reason: string,
): Promise<OrderWithItems | null> {
  const order = await getOrderByOrderNumber(orderNumber)
  if (!order || order.paymentMethod !== "card" || !PAYABLE_STATUSES.has(order.status)) return null

  await mergeOrderNotes(order.id, {
    stripe_last_status: "declined",
    stripe_decline_reason: reason.slice(0, 300),
  })
  return getOrderByOrderNumber(orderNumber)
}
