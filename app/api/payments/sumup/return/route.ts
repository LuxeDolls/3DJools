import { NextResponse, type NextRequest } from "next/server"
import { COMPANY } from "@/lib/company"
import { parseOrderNotes } from "@/lib/orders/notes"
import { getOrderByOrderNumber } from "@/lib/orders/queries"
import { settleSumupCheckout } from "@/lib/payments/sumup-order"

export const dynamic = "force-dynamic"

/** Sends the buyer back to the order page after Hosted Checkout. Payment is confirmed server-side. */
export async function GET(request: NextRequest) {
  const orderNumber = request.nextUrl.searchParams.get("order")?.trim() ?? ""
  const order = orderNumber ? await getOrderByOrderNumber(orderNumber) : null
  const notes = order ? parseOrderNotes(order.notes) : {}
  const checkoutId = notes.sumup_checkout_ids?.split(",").filter(Boolean).at(-1) ?? ""

  const settled = order && checkoutId
    ? await settleSumupCheckout(orderNumber, checkoutId)
    : { ok: false as const, reason: "not_found", locale: notes.checkout_locale || "en" }

  const dest = new URL(`/${settled.locale}/order/${encodeURIComponent(orderNumber || "unknown")}`, COMPANY.url)
  if (!settled.ok) dest.searchParams.set("sumup", settled.reason === "not_completed" ? "pending" : "failed")
  return NextResponse.redirect(dest)
}
