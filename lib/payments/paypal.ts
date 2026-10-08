import { COMPANY } from "@/lib/company"
import { PAYPAL_CHECKOUT_ENABLED } from "@/lib/payments/paypal-availability"

const LIVE_API = "https://api-m.paypal.com"
const SANDBOX_API = "https://api-m.sandbox.paypal.com"

const PAYPAL_LOCALES: Record<string, string> = {
  en: "en-BE",
  de: "de-DE",
  fr: "fr-BE",
  it: "it-IT",
  es: "es-ES",
  nl: "nl-BE",
}

export type PaypalPayment = {
  paypalOrderId: string
  captureId: string
  amountCents: number
  currency: string
  customId: string
}

type PaypalLink = { rel?: string; href?: string }
type PaypalMoney = { currency_code?: string; value?: string }
type PaypalCapture = { id?: string; status?: string; amount?: PaypalMoney }
type PaypalOrder = {
  id?: string
  status?: string
  purchase_units?: Array<{
    custom_id?: string
    payments?: { captures?: PaypalCapture[] }
  }>
  links?: PaypalLink[]
}

// Flip back to "previous" to restore the original PayPal app.
// Those credentials stay in PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET.
const PAYPAL_ACCOUNT: "current" | "previous" = "current"

const CURRENT_PAYPAL_CLIENT_ID =
  "BAAcfmQdYrRFdeBfaPlDmJYMNRl8MTG-rJIXkFMP1NlogUo3k2clmGeDvvnHzuyiB9fDfVp6Nu_hiALc2U"

function paypalCredentials(): { id: string; secret: string } | null {
  const id =
    PAYPAL_ACCOUNT === "current"
      ? CURRENT_PAYPAL_CLIENT_ID
      : process.env.PAYPAL_CLIENT_ID?.trim()
  const secret =
    PAYPAL_ACCOUNT === "current"
      ? process.env.API_KEY_2?.trim()
      : process.env.PAYPAL_CLIENT_SECRET?.trim()
  if (!id || !secret) return null
  return { id, secret }
}

export function paypalConfigured(): boolean {
  return PAYPAL_CHECKOUT_ENABLED && paypalCredentials() !== null
}

export function isPaypalOrderId(value: string): boolean {
  return /^[A-Z0-9]{8,36}$/.test(value)
}

export function knownPaypalOrderIds(stored: string | undefined): string[] {
  return (stored ?? "").split(",").map((id) => id.trim()).filter(isPaypalOrderId)
}

export function appendPaypalOrderId(stored: string | undefined, id: string): string {
  const ids = knownPaypalOrderIds(stored)
  if (!ids.includes(id)) ids.push(id)
  return ids.join(",")
}

function apiBase(): string {
  const raw = process.env.PAYPAL_API_URL?.trim()
  if (raw) {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`)
    if (url.protocol !== "https:") throw new Error("paypal_bad_api")
    return url.origin
  }
  return process.env.PAYPAL_ENV === "sandbox" ? SANDBOX_API : LIVE_API
}

export function paypalAmount(cents: number): string {
  if (!Number.isInteger(cents) || cents <= 0) throw new Error("paypal_bad_amount")
  return `${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, "0")}`
}

function centsFromPaypal(value: string | undefined): number | null {
  const match = /^(\d+)\.(\d{2})$/.exec(value ?? "")
  if (!match) return null
  return Number(match[1]) * 100 + Number(match[2])
}

function paypalHost(href: string): boolean {
  try {
    const host = new URL(href).hostname
    return host === "paypal.com" || host.endsWith(".paypal.com")
  } catch {
    return false
  }
}

async function accessToken(): Promise<string> {
  const credentials = paypalCredentials()
  if (!credentials) throw new Error("paypal_unconfigured")
  const { id, secret } = credentials
  const res = await fetch(`${apiBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  })
  if (!res.ok) throw new Error("paypal_auth_failed")
  const data = (await res.json()) as { access_token?: string }
  if (!data.access_token) throw new Error("paypal_auth_failed")
  return data.access_token
}

async function paypalFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = await accessToken()
  return fetch(`${apiBase()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  })
}

function issueCode(text: string): string {
  try {
    const data = JSON.parse(text) as { name?: string; details?: Array<{ issue?: string }> }
    return data.details?.[0]?.issue || data.name || ""
  } catch {
    return ""
  }
}

function completedCapture(order: PaypalOrder, paypalOrderId: string): PaypalPayment | null {
  const unit = order.purchase_units?.[0]
  const capture = unit?.payments?.captures?.find((item) => item.status === "COMPLETED")
  const amountCents = centsFromPaypal(capture?.amount?.value)
  if (!capture?.id || amountCents == null || !unit?.custom_id) return null
  return {
    paypalOrderId,
    captureId: capture.id,
    amountCents,
    currency: (capture.amount?.currency_code ?? "").toUpperCase(),
    customId: unit.custom_id,
  }
}

export async function createPaypalCheckout(input: {
  orderNumber: string
  amountCents: number
  locale: string
}): Promise<{ paypalOrderId: string; approveUrl: string }> {
  const locale = PAYPAL_LOCALES[input.locale] ?? "en-BE"
  const returnUrl = `${COMPANY.url}/api/payments/paypal/return?order=${encodeURIComponent(input.orderNumber)}`
  const cancelUrl = `${COMPANY.url}/${input.locale}/order/${encodeURIComponent(input.orderNumber)}?paypal=cancelled`
  const res = await paypalFetch("/v2/checkout/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Prefer: "return=representation",
      "PayPal-Request-Id": `3djools-${input.orderNumber}-${Date.now()}`,
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          custom_id: input.orderNumber,
          invoice_id: `${input.orderNumber}-${Date.now().toString(36)}`.slice(0, 127),
          description: `3DJools ${input.orderNumber}`.slice(0, 127),
          amount: { currency_code: "EUR", value: paypalAmount(input.amountCents) },
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            brand_name: "3DJools",
            locale,
            shipping_preference: "NO_SHIPPING",
            user_action: "PAY_NOW",
            return_url: returnUrl,
            cancel_url: cancelUrl,
          },
        },
      },
    }),
  })
  const text = await res.text()
  if (!res.ok) {
    console.error("[v0] PayPal create failed", res.status, issueCode(text))
    throw new Error("paypal_create_failed")
  }
  const data = JSON.parse(text) as PaypalOrder
  const paypalOrderId = data.id ?? ""
  const approve = data.links?.find((link) => link.rel === "payer-action" || link.rel === "approve")
  const approveUrl = approve?.href ?? ""
  if (!isPaypalOrderId(paypalOrderId) || !paypalHost(approveUrl)) {
    throw new Error("paypal_create_failed")
  }
  return { paypalOrderId, approveUrl }
}

async function readPaypalOrder(paypalOrderId: string): Promise<PaypalOrder | null> {
  const res = await paypalFetch(`/v2/checkout/orders/${paypalOrderId}`)
  if (!res.ok) {
    console.error("[v0] PayPal order lookup failed", res.status)
    return null
  }
  return (await res.json()) as PaypalOrder
}

/**
 * Captures an approved PayPal order, or reads an already captured one.
 * The caller must still match custom id, currency and amount to the store order.
 */
export async function confirmPaypalOrder(paypalOrderId: string): Promise<PaypalPayment | null> {
  if (!isPaypalOrderId(paypalOrderId)) return null
  const existing = await readPaypalOrder(paypalOrderId)
  if (!existing) return null
  if (existing.status === "COMPLETED") return completedCapture(existing, paypalOrderId)
  if (existing.status !== "APPROVED") return null

  const res = await paypalFetch(`/v2/checkout/orders/${paypalOrderId}/capture`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Prefer: "return=representation",
      "PayPal-Request-Id": `capture-${paypalOrderId}`,
    },
    body: "{}",
  })
  const text = await res.text()
  if (!res.ok) {
    const issue = issueCode(text)
    if (issue !== "ORDER_ALREADY_CAPTURED") {
      console.error("[v0] PayPal capture failed", res.status, issue)
      return null
    }
    const again = await readPaypalOrder(paypalOrderId)
    return again?.status === "COMPLETED" ? completedCapture(again, paypalOrderId) : null
  }
  const captured = JSON.parse(text) as PaypalOrder
  return captured.status === "COMPLETED" ? completedCapture(captured, paypalOrderId) : null
}

export async function verifyPaypalWebhook(rawBody: string, headers: Headers): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID?.trim()
  if (!webhookId) return false
  const certUrl = headers.get("paypal-cert-url") ?? ""
  if (!paypalHost(certUrl)) return false
  let event: unknown
  try {
    event = JSON.parse(rawBody)
  } catch {
    return false
  }
  const res = await paypalFetch("/v1/notifications/verify-webhook-signature", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      auth_algo: headers.get("paypal-auth-algo") ?? "",
      cert_url: certUrl,
      transmission_id: headers.get("paypal-transmission-id") ?? "",
      transmission_sig: headers.get("paypal-transmission-sig") ?? "",
      transmission_time: headers.get("paypal-transmission-time") ?? "",
      webhook_id: webhookId,
      webhook_event: event,
    }),
  })
  if (!res.ok) return false
  const data = (await res.json()) as { verification_status?: string }
  return data.verification_status === "SUCCESS"
}

export function paypalOrderIdFromEvent(event: {
  event_type?: string
  resource?: {
    id?: string
    supplementary_data?: { related_ids?: { order_id?: string } }
  }
}): string {
  const related = event.resource?.supplementary_data?.related_ids?.order_id ?? ""
  if (isPaypalOrderId(related)) return related
  const id = event.resource?.id ?? ""
  if (event.event_type?.startsWith("CHECKOUT.ORDER.") && isPaypalOrderId(id)) return id
  return ""
}
