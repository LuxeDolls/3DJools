import "server-only"

import { createHmac, timingSafeEqual } from "node:crypto"
import { COMPANY } from "@/lib/company"

// Second card checkout, alongside Stripe. Sandbox only.
// Docs: https://alp-pay.api-docs.info/
// Shop 381 is identified by the shop API key. The key is not sent in the body.
// Hosted page collects the card. We never send card data.

const HOST = "https://engine-sandbox.alp-pay.com"

const COUNTRY_CODES: Record<string, string> = {
  Belgium: "BE",
  Austria: "AT",
  Bulgaria: "BG",
  Croatia: "HR",
  Cyprus: "CY",
  Czechia: "CZ",
  Denmark: "DK",
  Estonia: "EE",
  Finland: "FI",
  France: "FR",
  Germany: "DE",
  Greece: "GR",
  Hungary: "HU",
  Ireland: "IE",
  Italy: "IT",
  Latvia: "LV",
  Lithuania: "LT",
  Luxembourg: "LU",
  Malta: "MT",
  Netherlands: "NL",
  Norway: "NO",
  Poland: "PL",
  Portugal: "PT",
  Romania: "RO",
  Slovakia: "SK",
  Slovenia: "SI",
  Spain: "ES",
  Sweden: "SE",
  Switzerland: "CH",
  "United Kingdom": "GB",
}

export function alppayConfigured(): boolean {
  return Boolean(process.env.API?.trim() && process.env.key?.trim())
}

export function isAlppayPaymentId(id: string): boolean {
  return /^[a-zA-Z0-9]{32}$/.test(id)
}

export function appendAlppayPaymentId(stored: string | undefined, id: string): string {
  const ids = (stored ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
  if (!ids.includes(id)) ids.push(id)
  return ids.join(",")
}

export function countryCode(country: string): string | null {
  return COUNTRY_CODES[country.trim()] ?? null
}

function apiKey(): string {
  const key = process.env.API?.trim()
  if (!key) throw new Error("alppay_not_configured")
  return key
}

function signingKey(): string {
  const key = process.env.key?.trim()
  if (!key) throw new Error("alppay_not_configured")
  return key
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  if (left.length !== right.length) return false
  return timingSafeEqual(left, right)
}

/** HMAC-SHA256 of the raw webhook body. Header name is Signature. */
export function verifyAlppaySignature(rawBody: string, header: string | null): boolean {
  if (!header || !process.env.key?.trim()) return false
  const given = header.trim().replace(/^sha256=/i, "")
  const mac = createHmac("sha256", signingKey()).update(rawBody, "utf8")
  const hex = mac.digest("hex")
  const b64 = createHmac("sha256", signingKey()).update(rawBody, "utf8").digest("base64")
  return safeEqual(given, hex) || safeEqual(given.toLowerCase(), hex) || safeEqual(given, b64)
}

export type AlppayPayment = {
  id: string
  referenceId: string
  state: string
  paymentType: string
  currency: string
  amountCents: number | null
}

export function parseAlppayPayment(body: unknown): AlppayPayment | null {
  if (!body || typeof body !== "object") return null
  const root = body as Record<string, unknown>
  const result =
    root.result && typeof root.result === "object" ? (root.result as Record<string, unknown>) : root
  const id = typeof result.id === "string" ? result.id.trim() : ""
  if (!isAlppayPaymentId(id)) return null
  const amountRaw = typeof result.amount === "number" ? result.amount : Number(result.amount)
  const amountCents = Number.isFinite(amountRaw) ? Math.round(amountRaw * 100) : null
  return {
    id,
    referenceId: typeof result.referenceId === "string" ? result.referenceId.trim() : "",
    state: typeof result.state === "string" ? result.state.trim().toUpperCase() : "",
    paymentType: typeof result.paymentType === "string" ? result.paymentType.trim().toUpperCase() : "",
    currency: typeof result.currency === "string" ? result.currency.trim().toUpperCase() : "",
    amountCents,
  }
}

function euros(cents: number): number {
  return Number((cents / 100).toFixed(2))
}

function phoneForGateway(raw: string | undefined): string | undefined {
  if (!raw) return undefined
  const stripped = raw
    .trim()
    .replace(/^\+/, "")
    .replace(/[^\d ]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
  if (stripped.length < 8 || stripped.length > 18) return undefined
  return stripped
}

export type AlppayCheckoutInput = {
  orderNumber: string
  amountCents: number
  locale: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  address: string
  city: string
  postalCode: string
  country: string
}

export async function createAlppayCheckout(
  input: AlppayCheckoutInput,
): Promise<{ paymentId: string; redirectUrl: string }> {
  if (!alppayConfigured()) throw new Error("alppay_not_configured")
  if (!Number.isInteger(input.amountCents) || input.amountCents <= 0) throw new Error("alppay_bad_amount")
  const country = countryCode(input.country)
  if (!country) throw new Error("alppay_bad_country")

  const orderNumber = input.orderNumber.trim()
  const customer: Record<string, string> = {
    referenceId: orderNumber.slice(0, 128),
    email: input.email.trim().slice(0, 256),
    firstName: input.firstName.trim().slice(0, 128),
    lastName: input.lastName.trim().slice(0, 128),
    locale: input.locale.slice(0, 2).toLowerCase(),
  }
  const phone = phoneForGateway(input.phone)
  if (phone) customer.phone = phone

  const body = {
    paymentType: "DEPOSIT",
    amount: euros(input.amountCents),
    currency: "EUR",
    referenceId: orderNumber.slice(0, 256),
    description: `3DJools order ${orderNumber}`.slice(0, 512),
    customer,
    billingAddress: {
      countryCode: country,
      city: input.city.trim().slice(0, 50),
      addressLine1: input.address.trim().slice(0, 300),
      postalCode: input.postalCode.trim().slice(0, 12),
    },
    returnUrl: `${COMPANY.url}/api/payments/alppay/return?order=${encodeURIComponent(orderNumber)}&id={id}&state={state}`,
    webhookUrl: `${COMPANY.url}/api/payments/alppay/webhook`,
  }

  const headers = {
    Authorization: `Bearer ${apiKey()}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  }
  // BASIC_CARD_HPP is the hosted card page. If this shop is not enabled for that
  // method code, retry with the documented hosted example, which omits it.
  let response = await fetch(`${HOST}/api/v1/payments`, {
    method: "POST",
    headers,
    body: JSON.stringify({ ...body, paymentMethod: "BASIC_CARD_HPP" }),
    cache: "no-store",
  })
  if (response.status === 400) {
    response = await fetch(`${HOST}/api/v1/payments`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      cache: "no-store",
    })
  }
  const text = await response.text()
  let data: unknown = null
  try {
    data = JSON.parse(text)
  } catch {
    data = null
  }
  const payment = parseAlppayPayment(data)
  const redirectRaw =
    data && typeof data === "object"
      ? ((data as { result?: { redirectUrl?: unknown } }).result?.redirectUrl ??
        (data as { redirectUrl?: unknown }).redirectUrl)
      : ""
  const redirectUrl = typeof redirectRaw === "string" ? redirectRaw.trim() : ""
  if (!response.ok || !payment || !redirectUrl.startsWith("https://")) {
    console.error("[v0] AlpPay create failed", response.status)
    throw new Error("alppay_create_failed")
  }
  return { paymentId: payment.id, redirectUrl }
}

export async function getAlppayPayment(id: string): Promise<AlppayPayment> {
  if (!isAlppayPaymentId(id)) throw new Error("alppay_bad_id")
  const response = await fetch(`${HOST}/api/v1/payments/${id}`, {
    headers: { Authorization: `Bearer ${apiKey()}`, Accept: "application/json" },
    cache: "no-store",
  })
  const text = await response.text()
  let data: unknown = null
  try {
    data = JSON.parse(text)
  } catch {
    data = null
  }
  const payment = parseAlppayPayment(data)
  if (!response.ok || !payment || payment.id !== id) {
    console.error("[v0] AlpPay lookup failed", response.status)
    throw new Error("alppay_lookup_failed")
  }
  return payment
}
