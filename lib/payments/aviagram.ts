import "server-only"

import { COMPANY } from "@/lib/company"

// Hosted card checkout. Docs: https://aviagram.gitbook.io/docsavialooo
// POST {host}/api/payment/createForm with Authorization: Basic base64(clientId:clientSecret).
// The public example credentials on that page are not this store's keys.

// Docs write the host as <HOST_URL>. Set AVIAGRAM_API_URL to the host from Aviagram.
const DEFAULT_HOST = "https://aviagram.app"
const DEFAULT_CURRENCY = "EUR-GT"

export function aviagramConfigured(): boolean {
  return Boolean(process.env.AVIAGRAM_CLIENT_ID && process.env.AVIAGRAM_CLIENT_SECRET)
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

export async function createCardForm(input: {
  orderNumber: string
  amountCents: number
  locale: string
  webhookToken: string
}): Promise<CardForm> {
  const clientId = process.env.AVIAGRAM_CLIENT_ID?.trim()
  const clientSecret = process.env.AVIAGRAM_CLIENT_SECRET?.trim()
  if (!clientId || !clientSecret) throw new Error("aviagram_not_configured")
  if (!Number.isInteger(input.amountCents) || input.amountCents <= 0) {
    throw new Error("aviagram_bad_amount")
  }

  const host = (process.env.AVIAGRAM_API_URL || DEFAULT_HOST).replace(/\/$/, "")
  const currency = process.env.AVIAGRAM_CURRENCY || DEFAULT_CURRENCY
  const webhookUrl = `${COMPANY.url}/api/payments/aviagram/webhook?token=${input.webhookToken}`
  const returnUrl = `${COMPANY.url}/${input.locale}/order/${encodeURIComponent(input.orderNumber)}?card=return`

  const headers = {
    Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  }
  // Shop prices are EUR. currency is the gateway code (EUR-GT). With
  // convertCurrency the gateway converts amount from originalCurrency into
  // that code; the settled charge comes back on the webhook as EUR.
  const baseBody = {
    amount: cardAmount(input.amountCents),
    currency,
    originalCurrency: "EUR",
    convertCurrency: "true",
    payment_method: "card",
    webhook_url: webhookUrl,
  }
  let response = await fetch(`${host}/api/payment/createForm`, {
    method: "POST",
    headers,
    body: JSON.stringify({ ...baseBody, redirect_url: returnUrl }),
    cache: "no-store",
  })
  // redirect_url is used by working clients but is not in the public field list.
  // If the gateway rejects the extra field, retry with the documented body only.
  if (response.status === 400 || response.status === 422) {
    response = await fetch(`${host}/api/payment/createForm`, {
      method: "POST",
      headers,
      body: JSON.stringify(baseBody),
      cache: "no-store",
    })
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
    console.error("[v0] Aviagram createForm failed", response.status)
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
