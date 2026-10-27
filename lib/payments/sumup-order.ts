import "server-only"

import { localizedPath } from "@/lib/i18n/paths"
import { parseOrderNotes } from "@/lib/orders/notes"
import { getOrderByOrderNumber, mergeOrderNotes, updateOrderStatus } from "@/lib/orders/queries"
import { appendSumupCheckoutId, createSumupCheckout, getSumupCheckout, sumupOrderNumber } from "@/lib/payments/sumup"
import { SUMUP_CHARGE_CURRENCY } from "@/lib/payments/sumup-availability"

const PAID_STATUSES = new Set(["paid", "processing", "shipped", "delivered", "partially_paid"])
const PAYABLE_STATUSES = new Set(["awaiting_payment", "reviewing_payment"])

export type SumupSettleResult =
  | { ok: true; already: boolean; locale: string }
  | { ok: false; reason: string; locale: string }

/** Marks a SumUp order paid only after SumUp confirms the exact euro amount for this checkout. */
export async function settleSumupCheckout(
  orderNumber: string,
  checkoutId: string,
): Promise<SumupSettleResult> {
  const order = await getOrderByOrderNumber(orderNumber)
  const locale = order ? parseOrderNotes(order.notes).checkout_locale || "en" : "en"
  if (!order || order.paymentMethod !== "sumup") return { ok: false, reason: "not_found", locale }
  if (PAID_STATUSES.has(order.status)) return { ok: true, already: true, locale }
  if (!PAYABLE_STATUSES.has(order.status)) return { ok: false, reason: "invalid_status", locale }

  const checkout = await getSumupCheckout(checkoutId)
  if (!checkout || sumupOrderNumber(checkout.reference) !== order.orderNumber) {
    return { ok: false, reason: "mismatch", locale }
  }
  if (checkout.currency !== SUMUP_CHARGE_CURRENCY || checkout.amountCents !== order.totalCents) {
    console.error("[v0] SumUp amount did not match order", order.orderNumber)
    await mergeOrderNotes(order.id, { sumup_last_status: "amount_mismatch" })
    return { ok: false, reason: "mismatch", locale }
  }
  if (checkout.status !== "PAID") {
    await mergeOrderNotes(order.id, { sumup_last_status: checkout.status || "UNKNOWN" })
    return { ok: false, reason: checkout.status === "FAILED" ? "declined" : "not_completed", locale }
  }

  await mergeOrderNotes(order.id, { sumup_checkout_id: checkout.id, sumup_last_status: "PAID" })
  await updateOrderStatus(order.id, "paid")
  return { ok: true, already: false, locale }
}

/** Opens a fresh SumUp Hosted Checkout page for an order that is still awaiting payment. */
export async function openSumupCheckout(input: {
  orderNumber: string
  amountCents: number
  locale: string
}): Promise<{ url: string; checkoutId: string }> {
  const orderPath = localizedPath(input.locale, `/order/${input.orderNumber}`)
  const checkout = await createSumupCheckout({
    orderNumber: input.orderNumber,
    amountCents: input.amountCents,
    locale: input.locale,
    orderPath,
  })
  return { url: checkout.url, checkoutId: checkout.id }
}

export function appendSumupCheckoutIds(stored: string | undefined, id: string): string {
  return appendSumupCheckoutId(stored, id)
}
