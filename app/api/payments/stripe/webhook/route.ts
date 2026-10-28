import { NextResponse, type NextRequest } from "next/server"
import type Stripe from "stripe"
import { getStripe } from "@/lib/payments/stripe"
import { recordStripeDecline, settleStripeSession } from "@/lib/payments/stripe-order"
import { stripeWebhookSecrets } from "@/lib/payments/stripe-webhook-secret"
import { notifyCardDeclined } from "@/lib/notifications/admin"

export const dynamic = "force-dynamic"

const HANDLED = new Set([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "payment_intent.payment_failed",
])

/** Confirms a card payment after Stripe signs the event. The success page is not fulfillment. */
export async function POST(request: NextRequest) {
  const secrets = await stripeWebhookSecrets()
  const signature = request.headers.get("stripe-signature")
  if (!secrets.length || !signature) return NextResponse.json({ ok: false }, { status: 400 })

  const rawBody = await request.text()
  let event: Stripe.Event | undefined
  let signatureError = "invalid"
  for (const secret of secrets) {
    try {
      event = getStripe().webhooks.constructEvent(rawBody, signature, secret)
      break
    } catch (error) {
      event = undefined
      signatureError = error instanceof Error ? error.message : "invalid"
    }
  }
  if (!event) {
    console.error("[v0] Stripe webhook signature failed:", signatureError)
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  if (!HANDLED.has(event.type)) return NextResponse.json({ ok: true })

  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent
    const orderNumber = paymentIntent.metadata?.order_number || ""
    const reason =
      paymentIntent.last_payment_error?.message ||
      paymentIntent.last_payment_error?.decline_code ||
      paymentIntent.last_payment_error?.code ||
      "Unknown reason"
    if (orderNumber) {
      const order = await recordStripeDecline(orderNumber, reason)
      if (order) {
        await notifyCardDeclined(order, reason).catch((error) => {
          console.error("[v0] Card-declined admin notification failed:", error)
        })
      }
    }
    return NextResponse.json({ ok: true })
  }

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
