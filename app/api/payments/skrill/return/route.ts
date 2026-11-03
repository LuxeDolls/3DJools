import { NextResponse, type NextRequest } from "next/server"
import { COMPANY } from "@/lib/company"
import { isLocale } from "@/lib/i18n/config"
import { parseOrderNotes } from "@/lib/orders/notes"
import { getOrderByOrderNumber } from "@/lib/orders/queries"

export const dynamic = "force-dynamic"

const PAID_STATUSES = new Set(["paid", "processing", "shipped", "delivered", "partially_paid"])

/**
 * Display-only return handler for Skrill Hosted Checkout.
 * Never authorizes settlement or downgrades a confirmed paid order.
 */
export async function GET(request: NextRequest) {
  const orderNumber = request.nextUrl.searchParams.get("order")?.trim() ?? ""
  const cancelled = request.nextUrl.searchParams.get("cancelled") === "1"

  const order = orderNumber ? await getOrderByOrderNumber(orderNumber) : null
  const notes = parseOrderNotes(order?.notes)
  const rawLocale = notes.checkout_locale || "en"
  const locale = isLocale(rawLocale) ? rawLocale : "en"

  const dest = new URL(`/${locale}/order/${encodeURIComponent(orderNumber || "unknown")}`, COMPANY.url)

  // Stored paid status always wins over a cancellation query hint.
  if (order && PAID_STATUSES.has(order.status)) {
    return NextResponse.redirect(dest)
  }

  if (cancelled || notes.skrill_last_status === "CANCELLED") {
    dest.searchParams.set("skrill", "cancelled")
  } else if (notes.skrill_last_status === "FAILED") {
    dest.searchParams.set("skrill", "failed")
  }

  return NextResponse.redirect(dest)
}
