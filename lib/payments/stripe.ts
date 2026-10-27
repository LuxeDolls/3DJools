import "server-only"

import Stripe from "stripe"
import { COMPANY } from "@/lib/company"
import { countryIso } from "@/lib/payments/phone-country"
import { STRIPE_CHECKOUT_ENABLED } from "@/lib/payments/stripe-availability"

// SDK 23 pins Stripe-Version 2026-09-30.endive. Do not override it.
let client: Stripe | null = null

function stripeSecretKey(): string {
  return process.env.STRIPE_ACCESS_TOKEN_3?.trim() || ""
}

export function stripePublishableKey(): string {
  return process.env.key_3?.trim() || ""
}

export function stripeConfigured(): boolean {
  return STRIPE_CHECKOUT_ENABLED && Boolean(stripeSecretKey()) && Boolean(stripePublishableKey())
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

const STRIPE_LOCALES = ["en", "de", "fr", "it", "es", "nl"] as const

const PHONE_WARNINGS: Record<(typeof STRIPE_LOCALES)[number], string> = {
  en: "Check the country code next to the phone number. If it shows +1, change it to your own country before you pay.",
  nl: "Controleer de landcode naast het telefoonnummer. Staat er +1, wijzig die naar je eigen land voordat je betaalt.",
  de: "Prüfen Sie die Landesvorwahl neben der Telefonnummer. Steht dort +1, ändern Sie sie vor der Zahlung in Ihr Land.",
  fr: "Vérifiez l'indicatif à côté du numéro. S'il affiche +1, changez-le pour votre pays avant de payer.",
  it: "Controlla il prefisso accanto al numero. Se vedi +1, cambialo con quello del tuo paese prima di pagare.",
  es: "Comprueba el prefijo junto al número. Si pone +1, cámbialo por el de tu país antes de pagar.",
}

function checkoutLocale(locale: string): (typeof STRIPE_LOCALES)[number] {
  return STRIPE_LOCALES.find((item) => item === locale) ?? "en"
}

function stripeAddress(input: {
  address?: string
  city?: string
  postalCode?: string
  country?: string
}): Stripe.AddressParam | undefined {
  const country = countryIso(input.country ?? "")
  const line1 = input.address?.trim()
  const city = input.city?.trim()
  const postalCode = input.postalCode?.trim()
  if (!country || !line1 || !city || !postalCode) return undefined
  return {
    line1: line1.slice(0, 200),
    city: city.slice(0, 100),
    postal_code: postalCode.slice(0, 20),
    country,
  }
}

/** Opens Stripe Hosted Checkout for the exact euro amount stored on the order. */
export async function createStripeCheckout(input: {
  orderNumber: string
  amountCents: number
  locale: string
  email: string
  phone?: string
  name?: string
  address?: string
  city?: string
  postalCode?: string
  country?: string
}): Promise<{ sessionId: string; url: string }> {
  if (!STRIPE_CHECKOUT_ENABLED) throw new Error("card_unavailable")
  if (!Number.isInteger(input.amountCents) || input.amountCents < 50) {
    throw new Error("Invalid card amount")
  }

  const locale = input.locale || "en"
  const origin = COMPANY.url
  const orderPath = `${origin}/${locale}/order/${encodeURIComponent(input.orderNumber)}`
  const address = stripeAddress(input)
  const phone = input.phone && /^\+[1-9]\d{7,15}$/.test(input.phone) ? input.phone : undefined
  let customerId: string | undefined
  if (phone) {
    try {
      const customer = await getStripe().customers.create({
        email: input.email,
        name: input.name?.slice(0, 256) || undefined,
        phone,
        address,
        shipping: address && input.name ? { name: input.name.slice(0, 256), phone, address } : undefined,
      })
      customerId = customer.id
    } catch (err) {
      console.error("[v0] Stripe customer phone prefill failed:", err)
    }
  }
  const session = await getStripe().checkout.sessions.create(
    {
      ui_mode: "hosted_page",
      mode: "payment",
      locale: checkoutLocale(locale),
      billing_address_collection: "auto",
      phone_number_collection: { enabled: true },
      automatic_tax: { enabled: false },
      allow_promotion_codes: false,
      submit_type: "auto",
      tax_id_collection: { enabled: true, required: "never" },
      name_collection: {
        individual: { enabled: true, optional: true },
      },
      integration_identifier: "hosted_web_0001",
      origin_context: "web",
      ...(customerId ? { customer: customerId } : { customer_email: input.email }),
      client_reference_id: input.orderNumber,
      metadata: { order_number: input.orderNumber },
      custom_text: {
        submit: { message: PHONE_WARNINGS[checkoutLocale(locale)] },
      },
      success_url: `${origin}/api/payments/stripe/return?order=${encodeURIComponent(input.orderNumber)}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${orderPath}?stripe=cancelled`,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: input.amountCents,
            product_data: { name: `DnD3D ${input.orderNumber}`.slice(0, 250) },
          },
        },
      ],
    },
    { idempotencyKey: `card-${input.orderNumber}-${input.amountCents}-${Date.now()}` },
  )

  if (!session.url) throw new Error("Stripe Checkout did not return a URL")
  return { sessionId: session.id, url: session.url }
}
