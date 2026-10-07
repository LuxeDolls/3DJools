import "server-only"

import Stripe from "stripe"
import { COMPANY } from "@/lib/company"

// SDK 23 pins Stripe-Version 2026-09-30.endive. Do not override it.
let client: Stripe | null = null

function stripeSecretKey(): string {
  return (
    process.env.STRIPE_ACCESS_TOKEN?.trim() ||
    process.env.STRIPE_ACCESS_TOKEN_2?.trim() ||
    process.env.STRIPE_SECRET_KEY?.trim() ||
    ""
  )
}

export function stripeConfigured(): boolean {
  return Boolean(stripeSecretKey())
}

export function getStripe(): Stripe {
  const key = stripeSecretKey()
  if (!key) throw new Error("Stripe is not configured")
  if (!client) client = new Stripe(key)
  return client
}

export function appendStripeSessionId(stored: string | undefined, id: string): string {
  const ids = (stored ?? "").split(",").map((part) => part.trim()).filter(Boolean)
  if (!ids.includes(id)) ids.push(id)
  return ids.join(",")
}

/** Opens Stripe Hosted Checkout for the exact euro amount stored on the order. */
export async function createStripeCheckout(input: {
  orderNumber: string
  amountCents: number
  locale: string
  email: string
}): Promise<{ sessionId: string; url: string }> {
  if (!Number.isInteger(input.amountCents) || input.amountCents < 50) {
    throw new Error("Invalid card amount")
  }

  const locale = input.locale || "en"
  const origin = COMPANY.url
  const orderPath = `${origin}/${locale}/order/${encodeURIComponent(input.orderNumber)}`
  const session = await getStripe().checkout.sessions.create(
    {
      ui_mode: "hosted_page",
      mode: "payment",
      billing_address_collection: "auto",
      phone_number_collection: { enabled: true },
      automatic_tax: { enabled: false },
      allow_promotion_codes: false,
      submit_type: "auto",
      name_collection: {
        individual: { enabled: true, optional: true },
        business: { enabled: true, optional: true },
      },
      saved_payment_method_options: { payment_method_save: "enabled" },
      customer_creation: "always",
      integration_identifier: "hosted_web_0001",
      origin_context: "web",
      customer_email: input.email,
      client_reference_id: input.orderNumber,
      metadata: { order_number: input.orderNumber },
      success_url: `${origin}/api/payments/stripe/return?order=${encodeURIComponent(input.orderNumber)}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${orderPath}?stripe=cancelled`,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: input.amountCents,
            product_data: { name: `3DJools ${input.orderNumber}`.slice(0, 250) },
          },
        },
      ],
    },
    { idempotencyKey: `card-${input.orderNumber}-${input.amountCents}-${Date.now()}` },
  )

  if (!session.url) throw new Error("Stripe Checkout did not return a URL")
  return { sessionId: session.id, url: session.url }
}
