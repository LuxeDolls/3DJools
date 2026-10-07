import { NextResponse, type NextRequest } from "next/server"
import { COMPANY } from "@/lib/company"
import { isAlppayPaymentId } from "@/lib/payments/alppay"
import { settleAlppayPayment } from "@/lib/payments/alppay-order"
import { getOrderByOrderNumber } from "@/lib/orders/queries"
import { parseOrderNotes } from "@/lib/orders/notes"

export const dynamic = "force-dynamic"

/** Sends the buyer back to the order page. Payment is confirmed from the gateway, not from the query string. */
export async function GET(request: NextRequest) {
  const orderNumber = request.nextUrl.searchParams.get("order")?.trim() ?? ""
  const rawId = request.nextUrl.searchParams.get("id")?.trim() ?? ""
  let paymentId = isAlppayPaymentId(rawId) ? rawId : ""
  let locale = "en"

  if (!paymentId && orderNumber) {
    const order = await getOrderByOrderNumber(orderNumber)
    const notes = parseOrderNotes(order?.notes)
    locale = notes.checkout_locale || "en"
    const stored = (notes.alppay_payment_ids ?? "").split(",").map((part) => part.trim()).filter(isAlppayPaymentId)
    paymentId = stored.at(-1) ?? ""
  }

  let failed = false
  if (paymentId) {
    try {
      const settled = await settleAlppayPayment(paymentId)
      locale = settled.locale || locale
      failed = !settled.ok && settled.reason !== "not_completed"
    } catch (err) {
      console.error("[v0] AlpPay return lookup failed:", err instanceof Error ? err.message : "invalid")
      failed = true
    }
  }

  const dest = new URL(`/${locale}/order/${encodeURIComponent(orderNumber || "unknown")}`, COMPANY.url)
  if (failed) dest.searchParams.set("alppay", "failed")
  return NextResponse.redirect(dest)
}
