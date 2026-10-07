import { NextResponse, type NextRequest } from "next/server"
import { parseAlppayPayment, verifyAlppaySignature } from "@/lib/payments/alppay"
import { settleAlppayPayment } from "@/lib/payments/alppay-order"

export const dynamic = "force-dynamic"

/** Confirms a Visa/Mastercard payment after AlpPay signs the body. The return page is not fulfillment. */
export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  if (!verifyAlppaySignature(rawBody, request.headers.get("signature"))) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  let body: unknown = null
  try {
    body = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
  const payment = parseAlppayPayment(body)
  if (!payment) return NextResponse.json({ ok: false }, { status: 400 })

  try {
    const settled = await settleAlppayPayment(payment.id)
    if (!settled.ok && settled.reason !== "not_found" && settled.reason !== "not_completed" && settled.reason !== "declined") {
      console.error("[v0] AlpPay payment was not settled", settled.reason)
    }
  } catch (err) {
    console.error("[v0] AlpPay webhook failed:", err instanceof Error ? err.message : "invalid")
    return NextResponse.json({ ok: false }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
