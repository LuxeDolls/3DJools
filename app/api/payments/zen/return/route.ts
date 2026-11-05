import { NextResponse, type NextRequest } from "next/server"
import { COMPANY } from "@/lib/company"
import { isLocale } from "@/lib/i18n/config"
import { parseOrderNotes } from "@/lib/orders/notes"
import { getOrderByOrderNumber } from "@/lib/orders/queries"
import { syncZenOrderStatus } from "@/lib/payments/zen-order"

export const dynamic = "force-dynamic"

const PAID_STATUSES = new Set(["paid", "processing", "shipped", "delivered", "partially_paid"])

/**
 * Return handler for ZEN Checkout (`urlSuccess`, `urlFailure`, `urlRedirect`).
 * Verifies live transaction status with ZEN's API before redirecting to the order page.
 */
export async function GET(request: NextRequest) {
  const orderNumber = request.nextUrl.searchParams.get("order")?.trim() ?? ""
  const cancelled = request.nextUrl.searchParams.get("cancelled") === "1"

  const order = orderNumber ? await getOrderByOrderNumber(orderNumber) : null
  const notes = parseOrderNotes(order?.notes)
  const rawLocale = notes.checkout_locale || "en"
  const locale = isLocale(rawLocale) ? rawLocale : "en"

  const dest = new URL(`/${locale}/order/${encodeURIComponent(orderNumber || "unknown")}`, COMPANY.url)

  if (order && PAID_STATUSES.has(order.status)) {
    return NextResponse.redirect(dest)
  }

  if (order && order.paymentMethod === "zen") {
    const synced = await syncZenOrderStatus(order)
    if (synced === "paid") {
      return NextResponse.redirect(dest)
    }
    if (cancelled || synced === "cancelled" || notes.zen_last_status === "CANCELLED") {
      dest.searchParams.set("zen", "cancelled")
      return NextResponse.redirect(dest)
    }
    if (synced === "failed" || notes.zen_last_status === "REJECTED") {
      dest.searchParams.set("zen", "failed")
      return NextResponse.redirect(dest)
    }
  }

  if (cancelled) {
    dest.searchParams.set("zen", "cancelled")
  }

  return NextResponse.redirect(dest)
}
