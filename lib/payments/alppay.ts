import "server-only"

import { createHmac, timingSafeEqual } from "node:crypto"
import { COMPANY } from "@/lib/company"
import { toIsoDate } from "@/lib/payments/cardholder"

// Second card checkout, alongside Stripe.
// Docs: https://alp-pay.api-docs.info/
// The shop is identified by its API key. The key is not sent in the body.
// Hosted page collects the card. We never send card data.
// Sandbox shop 381 stays first. Live shop 581 is used after it.

const SANDBOX_HOST = "https://engine-sandbox.alp-pay.com"
const LIVE_HOST = "https://engine.alp-pay.com"

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

const CALLING_CODES: Record<string, string> = {
  BE: "32",
  AT: "43",
  BG: "359",
  HR: "385",
  CY: "357",
  CZ: "420",
  DK: "45",
  EE: "372",
  FI: "358",
  FR: "33",
  DE: "49",
  GR: "30",
  HU: "36",
  IE: "353",
  IT: "39",
  LV: "371",
  LT: "370",
  LU: "352",
  MT: "356",
  NL: "31",
  NO: "47",
  PL: "48",
  PT: "351",
  RO: "40",
  SK: "421",
  SI: "386",
  ES: "34",
  SE: "46",
  CH: "41",
  GB: "44",
}

function sandboxReady(): boolean {
  return Boolean(process.env.API?.trim() && process.env.key?.trim())
}

function liveReady(): boolean {
  return Boolean(process.env.API_2?.trim() && process.env.Key?.trim())
}

export function alppayConfigured(): boolean {
  return liveReady() || sandboxReady()
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
  const live = process.env.API_2?.trim()
  if (liveReady() && live) return live
  const sandbox = process.env.API?.trim()
  if (!sandbox) throw new Error("alppay_not_configured")
  return sandbox
}

function host(): string {
  return liveReady() ? LIVE_HOST : SANDBOX_HOST
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  if (left.length !== right.length) return false
  return timingSafeEqual(left, right)
}

function signatureMatches(rawBody: string, given: string, secret: string): boolean {
  const hex = createHmac("sha256", secret).update(rawBody, "utf8").digest("hex")
  const b64 = createHmac("sha256", secret).update(rawBody, "utf8").digest("base64")
  return safeEqual(given, hex) || safeEqual(given.toLowerCase(), hex) || safeEqual(given, b64)
}

/** HMAC-SHA256 of the raw webhook body. Header name is Signature. Sandbox key first, live key after it. */
export function verifyAlppaySignature(rawBody: string, header: string | null): boolean {
  if (!header) return false
  const given = header.trim().replace(/^sha256=/i, "")
  const sandbox = process.env.key?.trim()
  if (sandbox && signatureMatches(rawBody, given, sandbox)) return true
  const live = process.env.Key?.trim()
  return Boolean(live && signatureMatches(rawBody, given, live))
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

const CALLING_CODE_LIST = Object.values(CALLING_CODES).sort((a, b) => b.length - a.length)

/** AlpPay accepts only "calling-code national-number", one space, no plus. */
function phoneForGateway(raw: string | undefined, country: string): string | undefined {
  if (!raw?.trim()) return undefined
  let digits = raw.replace(/\D/g, "")
  if (digits.startsWith("00")) digits = digits.slice(2)
  const prefixed = CALLING_CODE_LIST.find((code) => digits.startsWith(code) && digits.length - code.length >= 6)
  const localCode = CALLING_CODES[country]
  const code = prefixed ?? (localCode && digits.startsWith("0") ? localCode : "")
  const national = prefixed ? digits.slice(prefixed.length) : digits.replace(/^0+/, "")
  if (!code || national.length < 6) return undefined
  const formatted = `${code} ${national}`
  if (!/^\d{1,4} \d{6,14}$/.test(formatted) || formatted.length > 18) return undefined
  return formatted
}

function alppayErrorFields(data: unknown): string[] {
  if (!data || typeof data !== "object" || !Array.isArray((data as { errors?: unknown }).errors)) return []
  return (data as { errors: { field?: unknown }[] }).errors
    .map((item) => (typeof item.field === "string" ? item.field : ""))
    .filter(Boolean)
}

export type AlppayCheckoutInput = {
  orderNumber: string
  amountCents: number
  locale: string
  email: string
  firstName: string
  lastName: string
  dateOfBirth?: string
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
  const dateOfBirth = input.dateOfBirth ? toIsoDate(input.dateOfBirth) : null
  if (dateOfBirth) customer.dateOfBirth = dateOfBirth
  const phone = phoneForGateway(input.phone, country)
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
  const post = async (payload: unknown) => {
    const response = await fetch(`${host()}/api/v1/payments`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      cache: "no-store",
    })
    const text = await response.text()
    let data: unknown = null
    try {
      data = JSON.parse(text)
    } catch {
      data = null
    }
    return { response, data }
  }
  // BASIC_CARD_HPP is the hosted card page. Retry without it only when this shop
  // rejects that method code, not when another field is invalid.
  let sent = await post({ ...body, paymentMethod: "BASIC_CARD_HPP" })
  if (sent.response.status === 400 && alppayErrorFields(sent.data).includes("paymentMethod")) {
    sent = await post(body)
  }
  const { response, data } = sent
  const payment = parseAlppayPayment(data)
  const redirectRaw =
    data && typeof data === "object"
      ? ((data as { result?: { redirectUrl?: unknown } }).result?.redirectUrl ??
        (data as { redirectUrl?: unknown }).redirectUrl)
      : ""
  const redirectUrl = typeof redirectRaw === "string" ? redirectRaw.trim() : ""
  if (!response.ok || !payment || !redirectUrl.startsWith("https://")) {
    console.error("[v0] AlpPay create failed", response.status, alppayErrorFields(data).join(",") || "no-field")
    throw new Error("alppay_create_failed")
  }
  return { paymentId: payment.id, redirectUrl }
}

export async function getAlppayPayment(id: string): Promise<AlppayPayment> {
  if (!isAlppayPaymentId(id)) throw new Error("alppay_bad_id")
  const response = await fetch(`${host()}/api/v1/payments/${id}`, {
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
