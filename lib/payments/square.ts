import "server-only"

import { createHash, createHmac, timingSafeEqual } from "node:crypto"
import { COMPANY } from "@/lib/company"
import { SQUARE_CHARGE_CURRENCY, SQUARE_CHECKOUT_ENABLED, SQUARE_LOCATION_ID } from "@/lib/payments/square-availability"

const SQUARE_VERSION = "2026-09-16"
const SQUARE_API = "https://connect.squareup.com"

export function squareConfigured(): boolean {
  return SQUARE_CHECKOUT_ENABLED && Boolean(process.env.SQUARE_ACCESS_TOKEN?.trim())
}

export function squareWebhookUrl(): string {
  return `${COMPANY.url}/api/payments/square/webhook`
}

function accessToken(): string {
  const token = process.env.SQUARE_ACCESS_TOKEN?.trim()
  if (!token) throw new Error("square_unconfigured")
  return token
}

export function squareIdempotencyKey(orderNumber: string, sourceId: string): string {
  const hash = createHash("sha256").update(`${orderNumber}:${sourceId}`).digest("hex").slice(0, 40)
  return `sq${hash}`
}

export function isSquareSourceId(value: string): boolean {
  return /^[A-Za-z0-9:_-]{10,255}$/.test(value)
}

type SquareErrorBody = { errors?: { code?: string }[] }
type SquarePayment = {
  id?: string
  status?: string
  reference_id?: string
  location_id?: string
  amount_money?: { amount?: number; currency?: string }
}

export type SquareCharge = {
  id: string
  status: string
  amountCents: number
  currency: string
  referenceId: string
}

function safeCode(value: string | undefined): string {
  return (value ?? "UNKNOWN").replace(/[^A-Za-z0-9_]/g, "").slice(0, 40) || "UNKNOWN"
}

/** Charges the locked US-dollar amount. The order total in euro is never taken from the browser. */
export async function createSquarePayment(input: {
  sourceId: string
  verificationToken?: string
  idempotencyKey: string
  amountCents: number
  orderNumber: string
  email: string
  countryCode?: string | null
  address?: string | null
  city?: string | null
  postalCode?: string | null
}): Promise<SquareCharge> {
  if (!Number.isInteger(input.amountCents) || input.amountCents < 1) throw new Error("square_bad_amount")
  if (!isSquareSourceId(input.sourceId)) throw new Error("square_bad_token")
  if (input.verificationToken && !isSquareSourceId(input.verificationToken)) throw new Error("square_bad_token")

  const response = await fetch(`${SQUARE_API}/v2/payments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      "Content-Type": "application/json",
      "Square-Version": SQUARE_VERSION,
    },
    body: JSON.stringify({
      source_id: input.sourceId,
      idempotency_key: input.idempotencyKey.slice(0, 45),
      amount_money: { amount: input.amountCents, currency: SQUARE_CHARGE_CURRENCY },
      location_id: SQUARE_LOCATION_ID,
      autocomplete: true,
      reference_id: input.orderNumber.slice(0, 40),
      note: `3DJools ${input.orderNumber}`.slice(0, 500),
      buyer_email_address: input.email.slice(0, 255),
      ...(input.verificationToken ? { verification_token: input.verificationToken } : {}),
      ...(input.address || input.city || input.postalCode || input.countryCode
        ? {
            billing_address: {
              address_line_1: input.address?.slice(0, 500) || undefined,
              locality: input.city?.slice(0, 255) || undefined,
              postal_code: input.postalCode?.slice(0, 20) || undefined,
              country: input.countryCode || undefined,
            },
          }
        : {}),
    }),
  })

  const body = (await response.json()) as SquareErrorBody & { payment?: SquarePayment }
  if (!response.ok || !body.payment?.id) {
    throw new Error(`square_${safeCode(body.errors?.[0]?.code)}`)
  }

  return {
    id: body.payment.id,
    status: body.payment.status ?? "UNKNOWN",
    amountCents: body.payment.amount_money?.amount ?? 0,
    currency: body.payment.amount_money?.currency ?? "",
    referenceId: body.payment.reference_id ?? "",
  }
}

function readCharge(payment: SquarePayment | undefined): SquareCharge | null {
  if (!payment?.id) return null
  return {
    id: payment.id,
    status: payment.status ?? "UNKNOWN",
    amountCents: payment.amount_money?.amount ?? 0,
    currency: payment.amount_money?.currency ?? "",
    referenceId: payment.reference_id ?? "",
  }
}

/** Reads a payment Square already accepted, so a retry cannot charge the card again. */
export async function getSquarePayment(paymentId: string): Promise<SquareCharge | null> {
  if (!/^[A-Za-z0-9]{8,192}$/.test(paymentId)) return null
  const response = await fetch(`${SQUARE_API}/v2/payments/${encodeURIComponent(paymentId)}`, {
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      "Square-Version": SQUARE_VERSION,
      Accept: "application/json",
    },
  })
  if (!response.ok) return null
  const body = (await response.json()) as { payment?: SquarePayment }
  return readCharge(body.payment)
}

function signatureMatches(body: string, signature: string, url: string, key: string): boolean {
  const digest = createHmac("sha256", key).update(url + body).digest("base64")
  const left = Buffer.from(digest)
  const right = Buffer.from(signature)
  return left.length === right.length && timingSafeEqual(left, right)
}

/** Confirms the raw body was signed for the production webhook URL. */
export function verifySquareWebhook(body: string, signature: string): boolean {
  const key = process.env.key_2?.trim()
  if (!key || !signature) return false
  const urls = [squareWebhookUrl(), "https://3djools.com/api/payments/square/webhook"]
  return urls.some((url) => signatureMatches(body, signature, url, key))
}

export type SquareWebhookPayment = {
  id: string
  status: string
  referenceId: string
  amountCents: number
  currency: string
  locationId: string
}

export function readSquareWebhookPayment(body: string): { type: string; payment: SquareWebhookPayment | null } {
  const event = JSON.parse(body) as {
    type?: string
    data?: { object?: { payment?: SquarePayment } }
  }
  const payment = event.data?.object?.payment
  if (!payment?.id || !payment.reference_id) return { type: event.type ?? "", payment: null }
  return {
    type: event.type ?? "",
    payment: {
      id: payment.id,
      status: payment.status ?? "",
      referenceId: payment.reference_id,
      amountCents: payment.amount_money?.amount ?? 0,
      currency: payment.amount_money?.currency ?? "",
      locationId: payment.location_id ?? "",
    },
  }
}
