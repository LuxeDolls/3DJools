import "server-only"

import { COMPANY } from "@/lib/company"

// Hosted card checkout via Zenthoryx API (https://paydocs.dev).
// Endpoint: https://web.zenthoryx.app/api/payment/create (or /api/payment/createForm)
// Available gateways: EUR-ALP, EUR-PMF, EUR-SHP. Active gateway: EUR-ALP.
const DEFAULT_HOST = "https://web.zenthoryx.app/api/payment/createForm"
const DEFAULT_CURRENCY = "EUR-ALP"
const DEFAULT_CLIENT_ID = "f482893b2d11ff75cb7fb16b0a8a2035"
const DEFAULT_CLIENT_SECRET = "34b677d8ee6162fcd069a18287293d52c6c25512df464be5847ca7b90456955f"

export const AVAILABLE_CARD_GATEWAYS = ["EUR-ALP", "EUR-PMF", "EUR-SHP"] as const

function resolveCredentials(): { clientId: string; clientSecret: string } {
  const clientId = (process.env.ZENTHORYX_CLIENT_ID || DEFAULT_CLIENT_ID).trim()
  const clientSecret = (process.env.ZENTHORYX_CLIENT_SECRET || DEFAULT_CLIENT_SECRET).trim()
  return { clientId, clientSecret }
}

function resolveGateway(): string {
  const raw = (process.env.ZENTHORYX_GATEWAY || DEFAULT_CURRENCY).trim()
  return raw || DEFAULT_CURRENCY
}

function resolveEndpoints(): string[] {
  const raw = (process.env.ZENTHORYX_API_URL || DEFAULT_HOST).trim()
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`
  const url = new URL(withScheme)
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("aviagram_bad_host")
  return [`${url.origin}/api/payment/create`, `${url.origin}/api/payment/createForm`]
}

export function aviagramConfigured(): boolean {
  const { clientId, clientSecret } = resolveCredentials()
  return Boolean(clientId && clientSecret)
}

export function cardAmount(cents: number): string {
  return (cents / 100).toFixed(2)
}

export function parseAmountCents(raw: string): number | null {
  const normalized = raw.trim().replace(/\s/g, "").replace(",", ".")
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null
  const [whole, frac = ""] = normalized.split(".")
  const cents = Number(whole) * 100 + Number(frac.padEnd(2, "0"))
  return Number.isSafeInteger(cents) ? cents : null
}

export function amountsMatch(raw: string, totalCents: number): boolean {
  if (parseAmountCents(raw) === totalCents) return true
  return /^\d+$/.test(raw.trim()) && Number(raw.trim()) === totalCents
}

export type CardForm = {
  providerOrderId: string
  redirectUrl: string
}

async function postPayment(
  endpoint: string,
  headers: Record<string, string>,
  baseBody: Record<string, string>,
  returnUrl: string,
): Promise<Response> {
  let response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({ ...baseBody, redirect_url: returnUrl }),
    cache: "no-store",
  })
  if (response.status === 400 || response.status === 422) {
    response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(baseBody),
      cache: "no-store",
    })
  }
  return response
}

export async function createCardForm(input: {
  orderNumber: string
  amountCents: number
  locale: string
  webhookToken: string
}): Promise<CardForm> {
  const { clientId, clientSecret } = resolveCredentials()
  if (!clientId || !clientSecret) throw new Error("aviagram_not_configured")
  if (!Number.isInteger(input.amountCents) || input.amountCents <= 0) {
    throw new Error("aviagram_bad_amount")
  }

  const currency = resolveGateway()
  const webhookUrl = `${COMPANY.url}/api/payments/aviagram/webhook/${input.webhookToken}`
  const returnUrl = `${COMPANY.url}/${input.locale}/order/${encodeURIComponent(input.orderNumber)}?card=return`

  const headers = {
    Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  }

  const baseBody = {
    amount: cardAmount(input.amountCents),
    currency,
    originalCurrency: "EUR",
    convertCurrency: "true",
    payment_method: "card",
    webhook_url: webhookUrl,
  }

  const endpoints = resolveEndpoints()
  let response = await postPayment(endpoints[0], headers, baseBody, returnUrl)
  if ((response.status === 403 || response.status === 404) && endpoints[1]) {
    const fallbackResponse = await postPayment(endpoints[1], headers, baseBody, returnUrl)
    if (fallbackResponse.ok) {
      response = fallbackResponse
    }
  }

  const text = await response.text()
  let data: { orderId?: unknown; redirect_url?: unknown; redirectUrl?: unknown } = {}
  try {
    data = JSON.parse(text) as { orderId?: unknown; redirect_url?: unknown; redirectUrl?: unknown }
  } catch {
    data = {}
  }

  const providerOrderId =
    typeof data.orderId === "string"
      ? data.orderId.trim()
      : typeof data.orderId === "number" && Number.isFinite(data.orderId)
        ? String(data.orderId)
        : ""
  const redirectRaw = typeof data.redirect_url === "string" ? data.redirect_url : data.redirectUrl
  const redirectUrl = typeof redirectRaw === "string" ? redirectRaw.trim() : ""
  if (!response.ok || !isProviderOrderId(providerOrderId) || !redirectUrl.startsWith("https://")) {
    console.error("[v0] Zenthoryx card create failed", response.status, text)
    throw new Error("aviagram_create_failed")
  }

  return { providerOrderId, redirectUrl }
}

export function isProviderOrderId(value: string): boolean {
  return /^[A-Za-z0-9_.:-]{1,80}$/.test(value)
}

export function appendProviderOrderId(existing: string | undefined, id: string): string {
  const ids = (existing ?? "").split(",").map((part) => part.trim()).filter(Boolean)
  if (!ids.includes(id)) ids.push(id)
  return ids.join(",")
}
