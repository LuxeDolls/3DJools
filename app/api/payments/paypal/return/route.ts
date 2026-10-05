import { NextResponse, type NextRequest } from "next/server"
import { COMPANY } from "@/lib/company"
import { isLocale } from "@/lib/i18n/config"
import { isPaypalOrderId } from "@/lib/payments/paypal"
import { settleStoredPaypalOrder } from "@/lib/payments/paypal-order"

export const dynamic = "force-dynamic"

function orderUrl(locale: string, orderNumber: string, query?: string): string {
  const safeLocale = isLocale(locale) ? locale : "en"
  const path = `${COMPANY.url}/${safeLocale}/order/${encodeURIComponent(orderNumber)}`
  return query ? `${path}?${query}` : path
}

/** PayPal sends the buyer here after approval. Payment is captured server-side. */
export async function GET(request: NextRequest) {
  const orderNumber = request.nextUrl.searchParams.get("order")?.trim() ?? ""
  const paypalOrderId = request.nextUrl.searchParams.get("token")?.trim() ?? ""
  if (!orderNumber || !isPaypalOrderId(paypalOrderId)) {
    return NextResponse.redirect(COMPANY.url)
  }

  try {
    const result = await settleStoredPaypalOrder(orderNumber, paypalOrderId)
    if (result.ok) return NextResponse.redirect(orderUrl(result.locale, orderNumber))
    return NextResponse.redirect(orderUrl(result.locale, orderNumber, "paypal=failed"))
  } catch (err) {
    console.error("[v0] PayPal return failed:", err)
    return NextResponse.redirect(orderUrl("en", orderNumber, "paypal=failed"))
  }
}
