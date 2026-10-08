import { NextResponse, type NextRequest } from "next/server"
import { readSquareWebhookPayment, verifySquareWebhook } from "@/lib/payments/square"
import { settleSquarePayment } from "@/lib/payments/square-order"

export const dynamic = "force-dynamic"

const HANDLED = new Set(["payment.updated", "payment.created"])

/** Marks a Square order paid only after the signed event matches the locked dollar amount. */
export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get("x-square-hmacsha256-signature") ?? ""
  if (!verifySquareWebhook(rawBody, signature)) {
    return NextResponse.json({ ok: false }, { status: 403 })
  }

  let event: ReturnType<typeof readSquareWebhookPayment>
  try {
    event = readSquareWebhookPayment(rawBody)
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
  if (!HANDLED.has(event.type) || !event.payment) return NextResponse.json({ ok: true })

  const settled = await settleSquarePayment({
    orderNumber: event.payment.referenceId,
    paymentId: event.payment.id,
    status: event.payment.status,
    amountCents: event.payment.amountCents,
    currency: event.payment.currency,
    locationId: event.payment.locationId,
  })
  if (settled === "retry") return NextResponse.json({ ok: false }, { status: 500 })
  return NextResponse.json({ ok: true })
}
