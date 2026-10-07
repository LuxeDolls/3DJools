import { NextResponse, type NextRequest } from "next/server"
import { COMPANY } from "@/lib/company"
import { settleStripeSession } from "@/lib/payments/stripe-order"

export const dynamic = "force-dynamic"

/** Sends the buyer back to the order page after Hosted Checkout. Payment is confirmed server-side. */
export async function GET(request: NextRequest) {
  const orderNumber = request.nextUrl.searchParams.get("order")?.trim() ?? ""
  const sessionId = request.nextUrl.searchParams.get("session_id")?.trim() ?? ""
  const settled = orderNumber && sessionId
    ? await settleStripeSession(orderNumber, sessionId)
    : { ok: false as const, reason: "not_found", locale: "en" }

  const dest = new URL(`/${settled.locale}/order/${encodeURIComponent(orderNumber || "unknown")}`, COMPANY.url)
  if (!settled.ok) dest.searchParams.set("stripe", settled.reason === "not_completed" ? "pending" : "failed")
  return NextResponse.redirect(dest)
}
