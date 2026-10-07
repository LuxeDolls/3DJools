import { NextResponse, type NextRequest } from "next/server"
import type Stripe from "stripe"
import { getStripe } from "@/lib/payments/stripe"
import { settleStripeSession } from "@/lib/payments/stripe-order"

export const dynamic = "force-dynamic"

const HANDLED = new Set(["checkout.session.completed", "checkout.session.async_payment_succeeded"])

/** Confirms a card payment after Stripe signs the event. The success page is not fulfillment. */
export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim()
  const signature = request.headers.get("stripe-signature")
  if (!secret || !signature) return NextResponse.json({ ok: false }, { status: 400 })

  const rawBody = await request.text()
  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, secret)
  } catch (err) {
    console.error("[v0] Stripe webhook signature failed:", err instanceof Error ? err.message : "invalid")
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  if (!HANDLED.has(event.type)) return NextResponse.json({ ok: true })

  const session = event.data.object as Stripe.Checkout.Session
  const orderNumber = session.metadata?.order_number || session.client_reference_id || ""
  if (!orderNumber || !session.id || session.payment_status !== "paid") {
    return NextResponse.json({ ok: true })
  }

  const settled = await settleStripeSession(orderNumber, session.id)
  if (!settled.ok && settled.reason !== "not_found") {
    console.error("[v0] Stripe payment was not settled", orderNumber, settled.reason)
  }
  return NextResponse.json({ ok: true })
}
