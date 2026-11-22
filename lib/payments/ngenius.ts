import "server-only"

import { after } from "next/server"
import { SITE_ORIGIN } from "@/lib/catalog/image-urls"
import type { OrderWithItems } from "@/lib/orders/queries"
import { getOrderById, mergeOrderNotes, updateOrderStatus } from "@/lib/orders/queries"
import { parseOrderNotes } from "@/lib/orders/notes"
import { notifyCardDeclined } from "@/lib/notifications/admin"

export const NGENIUS_CHECKOUT_ENABLED = true

const DEFAULT_API_BASE = "https://api-gateway.ngenius-payments.com"
const DEFAULT_SDK_URL = "https://paypage.ngenius-payments.com/hosted-sessions/sdk.js"
const FALLBACK_EUR_AED_RATE = 3.95
const PAYABLE_STATUSES = new Set(["pending", "awaiting_payment", "reviewing_payment"])
const SUCCESS_STATES = new Set(["PURCHASED", "CAPTURED", "AUTHORISED"])
const FAILED_STATES = new Set(["FAILED", "DECLINED", "THREE_DS_FAILURE", "CANCELLED"])

function readEnv(name: string): string {
  return (process.env[name] ?? "").trim()
}

export function ngeniusConfigured(): boolean {
  return Boolean(readEnv("NGENIUS_API_KEY") && readEnv("NGENIUS_OUTLET_REF"))
}

export function ngeniusPublicConfig(): {
  hostedSessionApiKey: string
  outletRef: string
  sdkUrl: string
} | null {
  if (!NGENIUS_CHECKOUT_ENABLED || !ngeniusConfigured()) return null
  return {
    hostedSessionApiKey: readEnv("NGENIUS_HOSTED_SESSION_API_KEY"),
    outletRef: readEnv("NGENIUS_OUTLET_REF"),
    sdkUrl: readEnv("NGENIUS_SDK_URL") || DEFAULT_SDK_URL,
  }
}

function apiBase(): string {
  return (readEnv("NGENIUS_API_URL") || DEFAULT_API_BASE).replace(/\/+$/, "")
}

export type EurToAedQuote = {
  rate: number
  aedMinorUnits: number
  aedFormatted: string
}

export async function getEurToAedRate(): Promise<number> {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/EUR", {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(4000),
    })
    if (res.ok) {
      const data = (await res.json()) as { rates?: Record<string, number> }
      const rate = data?.rates?.AED
      if (typeof rate === "number" && Number.isFinite(rate) && rate > 2 && rate < 10) {
        return rate
      }
    }
  } catch {
    // Fall through to secondary rate source
  }

  try {
    const res = await fetch(
      "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/eur.json",
      {
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(4000),
      },
    )
    if (res.ok) {
      const data = (await res.json()) as { eur?: Record<string, number> }
      const rate = data?.eur?.aed
      if (typeof rate === "number" && Number.isFinite(rate) && rate > 2 && rate < 10) {
        return rate
      }
    }
  } catch {
    // Fall through to static fallback
  }

  return FALLBACK_EUR_AED_RATE
}

export function formatAedMinorUnits(minorUnits: number): string {
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(minorUnits / 100)
}

export async function convertEurCentsToAed(eurCents: number): Promise<EurToAedQuote> {
  const rate = await getEurToAedRate()
  const aedMinorUnits = Math.max(100, Math.round((eurCents / 100) * rate * 100))
  return {
    rate: Number(rate.toFixed(4)),
    aedMinorUnits,
    aedFormatted: formatAedMinorUnits(aedMinorUnits),
  }
}

async function getNgeniusAccessToken(): Promise<string> {
  const apiKey = readEnv("NGENIUS_API_KEY")
  if (!apiKey) throw new Error("ngenius_missing_api_key")

  const res = await fetch(`${apiBase()}/identity/auth/access-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/vnd.ni-identity.v1+json",
      Accept: "application/vnd.ni-identity.v1+json",
      Authorization: `Basic ${apiKey}`,
    },
    body: JSON.stringify({ grant_type: "client_credentials" }),
    cache: "no-store",
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`ngenius_auth_${res.status}: ${text.slice(0, 200)}`)
  }

  const data = (await res.json()) as { access_token?: string }
  if (!data.access_token) throw new Error("ngenius_no_access_token")
  return data.access_token
}

export async function createNgeniusHostedOrder(input: {
  orderNumber: string
  amountCents: number
  locale: string
  email: string
  shippingName?: string | null
  address1?: string | null
  city?: string | null
}): Promise<{ ngeniusOrderRef: string; paymentUrl: string; aedMinorUnits: number }> {
  const outletRef = readEnv("NGENIUS_OUTLET_REF")
  if (!outletRef) throw new Error("ngenius_missing_outlet_ref")

  const quote = await convertEurCentsToAed(input.amountCents)
  const accessToken = await getNgeniusAccessToken()
  const { firstName, lastName } = splitName(input.shippingName)
  const billingAddress: Record<string, string> = {}
  if (firstName) billingAddress.firstName = firstName.slice(0, 45)
  if (lastName) billingAddress.lastName = lastName.slice(0, 45)
  if (input.address1?.trim()) billingAddress.address1 = input.address1.trim().slice(0, 100)
  if (input.city?.trim()) billingAddress.city = input.city.trim().slice(0, 50)

  const redirectUrl = `${SITE_ORIGIN}/${input.locale}/order/${encodeURIComponent(input.orderNumber)}`
  const body: Record<string, unknown> = {
    action: "PURCHASE",
    amount: {
      currencyCode: "AED",
      value: quote.aedMinorUnits,
    },
    merchantOrderReference: input.orderNumber,
    emailAddress: input.email,
    merchantAttributes: {
      redirectUrl,
      skipConfirmationPage: true,
    },
  }
  if (Object.keys(billingAddress).length > 0) {
    body.billingAddress = billingAddress
  }

  const res = await fetch(
    `${apiBase()}/transactions/outlets/${encodeURIComponent(outletRef)}/orders`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/vnd.ni-payment.v2+json",
        Accept: "application/vnd.ni-payment.v2+json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    },
  )

  const payload = (await res.json().catch(() => null)) as
    | { reference?: unknown; _links?: { payment?: { href?: unknown } } }
    | null
  const ngeniusOrderRef = typeof payload?.reference === "string" ? payload.reference.trim() : ""
  const paymentUrl =
    typeof payload?._links?.payment?.href === "string" ? payload._links.payment.href.trim() : ""

  if (!res.ok || !ngeniusOrderRef || !paymentUrl.startsWith("https://")) {
    throw new Error(`ngenius_create_${res.status}: ${JSON.stringify(payload ?? {}).slice(0, 250)}`)
  }

  return {
    ngeniusOrderRef,
    paymentUrl,
    aedMinorUnits: quote.aedMinorUnits,
  }
}

function splitName(fullName: string | null | undefined): { firstName?: string; lastName?: string } {
  const trimmed = (fullName ?? "").trim()
  if (!trimmed) return {}
  const parts = trimmed.split(/\s+/)
  if (parts.length === 1) return { firstName: parts[0], lastName: parts[0] }
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") }
}

export async function chargeNgeniusHostedSession(input: {
  sessionId: string
  orderNumber: string
  aedMinorUnits: number
  email: string
  shippingName?: string | null
  address1?: string | null
  city?: string | null
}): Promise<Record<string, unknown>> {
  const outletRef = readEnv("NGENIUS_OUTLET_REF")
  if (!outletRef) throw new Error("ngenius_missing_outlet_ref")

  const accessToken = await getNgeniusAccessToken()
  const { firstName, lastName } = splitName(input.shippingName)
  const billingAddress: Record<string, string> = {}
  if (firstName) billingAddress.firstName = firstName.slice(0, 45)
  if (lastName) billingAddress.lastName = lastName.slice(0, 45)
  if (input.address1?.trim()) billingAddress.address1 = input.address1.trim().slice(0, 100)
  if (input.city?.trim()) billingAddress.city = input.city.trim().slice(0, 50)

  const body: Record<string, unknown> = {
    action: "PURCHASE",
    amount: {
      currencyCode: "AED",
      value: input.aedMinorUnits,
    },
    merchantOrderReference: input.orderNumber,
    emailAddress: input.email,
  }
  if (Object.keys(billingAddress).length > 0) {
    body.billingAddress = billingAddress
  }

  const res = await fetch(
    `${apiBase()}/transactions/outlets/${encodeURIComponent(outletRef)}/payment/hosted-session/${encodeURIComponent(input.sessionId)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/vnd.ni-payment.v2+json",
        Accept: "application/vnd.ni-payment.v2+json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    },
  )

  const payload = (await res.json().catch(() => null)) as Record<string, unknown> | null
  if (!res.ok || !payload) {
    throw new Error(`ngenius_charge_${res.status}: ${JSON.stringify(payload ?? {}).slice(0, 250)}`)
  }
  return payload
}

export async function getNgeniusOrderStatus(ngeniusOrderRef: string): Promise<Record<string, unknown> | null> {
  const outletRef = readEnv("NGENIUS_OUTLET_REF")
  if (!outletRef || !ngeniusOrderRef) return null

  const accessToken = await getNgeniusAccessToken()
  const res = await fetch(
    `${apiBase()}/transactions/outlets/${encodeURIComponent(outletRef)}/orders/${encodeURIComponent(ngeniusOrderRef)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.ni-payment.v2+json",
      },
      cache: "no-store",
    },
  )

  if (!res.ok) return null
  return (await res.json().catch(() => null)) as Record<string, unknown> | null
}

export function extractNgeniusPaymentDetails(payload: Record<string, unknown>): {
  orderRef: string | null
  state: string | null
  currency: string | null
  amountValue: number | null
  failureMessage: string | null
} {
  const embedded = payload._embedded as { payment?: Array<Record<string, unknown>> } | undefined
  const payment = Array.isArray(embedded?.payment) && embedded.payment.length > 0 ? embedded.payment[0] : payload

  const orderRefRaw =
    (typeof payload.orderReference === "string" && payload.orderReference) ||
    (typeof payment.orderReference === "string" && payment.orderReference) ||
    (typeof payload.reference === "string" && payload.reference) ||
    null

  const state = typeof payment.state === "string" ? payment.state.toUpperCase() : null
  const amount = payment.amount as { currencyCode?: unknown; value?: unknown } | undefined
  const currency = typeof amount?.currencyCode === "string" ? amount.currencyCode.toUpperCase() : null
  const amountValue =
    typeof amount?.value === "number" && Number.isFinite(amount.value) ? amount.value : null

  const authResponse = payment.authResponse as { resultMessage?: unknown } | undefined
  const failureMessage =
    (typeof authResponse?.resultMessage === "string" && authResponse.resultMessage) ||
    (typeof payment.resultMessage === "string" && payment.resultMessage) ||
    null

  return {
    orderRef: orderRefRaw,
    state,
    currency,
    amountValue,
    failureMessage,
  }
}

export async function applyNgeniusPaymentUpdate(
  order: OrderWithItems,
  payload: Record<string, unknown>,
): Promise<OrderWithItems> {
  const details = extractNgeniusPaymentDetails(payload)
  const notes = parseOrderNotes(order.notes)
  const expectedAed = Number(notes.ngenius_aed_minor_units || 0)

  const amountValid =
    details.currency === "AED" &&
    details.amountValue !== null &&
    (expectedAed <= 0 || Math.abs(details.amountValue - expectedAed) <= Math.max(50, Math.round(expectedAed * 0.02)))

  const isSuccess = Boolean(details.state && SUCCESS_STATES.has(details.state) && amountValid)
  const isFailed = Boolean(details.state && FAILED_STATES.has(details.state))

  await mergeOrderNotes(order.id, {
    ngenius_order_ref: details.orderRef || notes.ngenius_order_ref,
    ngenius_last_status: details.state || notes.ngenius_last_status,
    ngenius_settled_aed:
      details.amountValue !== null ? String(details.amountValue) : notes.ngenius_settled_aed,
    ngenius_declined_reason: isSuccess
      ? undefined
      : details.failureMessage?.replace(/[;=]/g, " ").slice(0, 120) || notes.ngenius_declined_reason,
  })

  if (isSuccess && PAYABLE_STATUSES.has(order.status)) {
    await updateOrderStatus(order.id, "paid")
  } else if (isFailed && details.state !== notes.ngenius_last_status) {
    after(() =>
      notifyCardDeclined(order, details.failureMessage || details.state || "N-Genius failed").catch(
        (err) => {
          console.error("[v0] N-Genius decline notification failed:", err)
        },
      ),
    )
  }

  return (await getOrderById(order.id)) ?? order
}

export async function syncNgeniusOrderStatus(order: OrderWithItems): Promise<OrderWithItems> {
  const notes = parseOrderNotes(order.notes)
  const ref = notes.ngenius_order_ref?.trim()
  if (!ref) return order
  try {
    const payload = await getNgeniusOrderStatus(ref)
    if (!payload) return order
    return await applyNgeniusPaymentUpdate(order, payload)
  } catch (err) {
    console.error("[v0] N-Genius status sync failed:", err)
    return order
  }
}
