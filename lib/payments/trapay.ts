import "server-only"

import { createHmac, timingSafeEqual } from "crypto"
import { COMPANY } from "@/lib/company"

import { OPEN_BANKING_CHECKOUT_ENABLED } from "@/lib/payments/cardholder"

// Hosted Open Banking (Pay by bank app / IBAN) checkout via Trapay API v2 (https://doc.trapay.uk).
// Create payment: POST https://api.trapay.uk/api/payments/create
// Get status:     POST https://api.trapay.uk/api/payments/status
export { OPEN_BANKING_CHECKOUT_ENABLED }

const DEFAULT_API_BASE = "https://api.trapay.uk"
const DEFAULT_GATEWAY = "3018"

function resolveCredentials(): { publicKey: string; secretKey: string } {
  const publicKey = (process.env.TRAPAY_PUBLIC_KEY || process.env.key_4 || "").trim()
  const secretKey = (process.env.TRAPAY_SECRET_KEY || process.env.API_KEY_3 || "").trim()
  return { publicKey, secretKey }
}

function resolveGateway(): string {
  const raw = (process.env.TRAPAY_GATEWAY || DEFAULT_GATEWAY).trim()
  return raw || DEFAULT_GATEWAY
}

function resolveApiBase(): string {
  const raw = (process.env.TRAPAY_API_URL || DEFAULT_API_BASE).trim().replace(/\/+$/, "")
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`
  const url = new URL(withScheme)
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("trapay_bad_host")
  }
  return url.origin
}

export function trapayConfigured(): boolean {
  const { publicKey, secretKey } = resolveCredentials()
  return Boolean(publicKey && secretKey)
}

export function cardAmountNumber(cents: number): number {
  return Number((cents / 100).toFixed(2))
}

export function verifyTrapayWebhookSignature(rawBody: string, signatureHeader: string | null | undefined): boolean {
  const { secretKey } = resolveCredentials()
  const signature = (signatureHeader ?? "")
    .trim()
    .replace(/^sha256=/i, "")
    .toLowerCase()
  if (!secretKey || !signature) return false

  const expectedSignature = createHmac("sha256", secretKey).update(rawBody).digest("hex").toLowerCase()
  const sigBuf = Buffer.from(signature, "utf8")
  const expBuf = Buffer.from(expectedSignature, "utf8")
  if (sigBuf.length !== expBuf.length) return false
  return timingSafeEqual(sigBuf, expBuf)
}

export type CardForm = {
  providerOrderId: string
  redirectUrl: string
}

type TrapayCreateResponse = {
  success?: unknown
  message?: unknown
  details?: unknown
  result?: {
    id?: unknown
    order_id?: unknown
    proxy_url?: unknown
    status?: unknown
  }
}

async function postCreatePayment(
  endpoint: string,
  payload: Record<string, unknown>,
): Promise<{ response: Response; text: string; data: TrapayCreateResponse }> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  })
  const text = await response.text()
  let data: TrapayCreateResponse = {}
  try {
    data = JSON.parse(text) as TrapayCreateResponse
  } catch {
    data = {}
  }
  return { response, text, data }
}

export async function createCardForm(input: {
  orderNumber: string
  amountCents: number
  locale: string
  customerEmail?: string
  customerName?: string
}): Promise<CardForm> {
  const { publicKey } = resolveCredentials()
  if (!publicKey) throw new Error("trapay_not_configured")
  if (!Number.isInteger(input.amountCents) || input.amountCents <= 0) {
    throw new Error("trapay_bad_amount")
  }

  const endpoint = `${resolveApiBase()}/api/payments/create`
  const encodedOrder = encodeURIComponent(input.orderNumber)
  const baseOrderUrl = `${COMPANY.url}/${input.locale}/order/${encodedOrder}`

  const basePayload: Record<string, unknown> = {
    public_key: publicKey,
    gateway: resolveGateway(),
    amount: cardAmountNumber(input.amountCents),
    currency: "EUR",
    order_id: input.orderNumber,
    success_url: `${baseOrderUrl}?card=return`,
    fail_url: `${baseOrderUrl}?card=failed`,
    pending_url: `${baseOrderUrl}?card=pending`,
  }
  if (input.customerEmail?.trim()) {
    basePayload.customer_email = input.customerEmail.trim()
  }
  if (input.customerName?.trim()) {
    basePayload.customer_name = input.customerName.trim()
  }

  let { response, text, data } = await postCreatePayment(endpoint, basePayload)

  // If the configured gateway ID changed in Trapay dashboard, Trapay responds with
  // 'Gateway "..." is not enabled for your shop. Enabled gateways: XXXX.'
  if (!response.ok && typeof data.message === "string") {
    const enabledMatch = data.message.match(/Enabled gateways:\s*([A-Za-z0-9_-]+)/i)
    const fallbackGateway = enabledMatch?.[1]?.trim()
    if (fallbackGateway && fallbackGateway !== basePayload.gateway) {
      ;({ response, text, data } = await postCreatePayment(endpoint, {
        ...basePayload,
        gateway: fallbackGateway,
      }))
    }
  }

  const providerOrderId = typeof data.result?.id === "string" ? data.result.id.trim() : ""
  const redirectUrl = typeof data.result?.proxy_url === "string" ? data.result.proxy_url.trim() : ""

  if (!response.ok || data.success !== true || !isProviderOrderId(providerOrderId) || !redirectUrl.startsWith("https://")) {
    console.error("[v0] Trapay card create failed", response.status, text)
    throw new Error("trapay_create_failed")
  }

  return { providerOrderId, redirectUrl }
}

export type TrapayPaymentStatus = {
  id: string
  orderId: string | null
  status: string
  amount: number | null
  currency: string | null
  paidAt: string | null
  failureMessage: string | null
}

export async function getTrapayPaymentStatus(input: {
  id?: string
  orderId?: string
}): Promise<TrapayPaymentStatus | null> {
  const { publicKey } = resolveCredentials()
  if (!publicKey) return null
  if (!input.id && !input.orderId) return null

  const endpoint = `${resolveApiBase()}/api/payments/status`
  const payload: Record<string, string> = { public_key: publicKey }
  if (input.id) payload.id = input.id
  else if (input.orderId) payload.order_id = input.orderId

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    })
    if (!response.ok) return null
    const data = (await response.json()) as {
      success?: unknown
      result?: {
        id?: unknown
        order_id?: unknown
        status?: unknown
        amount?: unknown
        currency?: unknown
        paid_at?: unknown
        failure_message?: unknown
      }
    }
    if (data.success !== true || !data.result || typeof data.result.status !== "string") {
      return null
    }
    return {
      id: typeof data.result.id === "string" ? data.result.id : "",
      orderId: typeof data.result.order_id === "string" ? data.result.order_id : null,
      status: data.result.status.trim().toUpperCase(),
      amount: typeof data.result.amount === "number" && Number.isFinite(data.result.amount) ? data.result.amount : null,
      currency: typeof data.result.currency === "string" ? data.result.currency.trim().toUpperCase() : null,
      paidAt: typeof data.result.paid_at === "string" ? data.result.paid_at : null,
      failureMessage: typeof data.result.failure_message === "string" ? data.result.failure_message.trim() : null,
    }
  } catch (err) {
    console.error("[v0] Trapay status lookup failed:", err)
    return null
  }
}

export function isProviderOrderId(value: string): boolean {
  return /^[A-Za-z0-9_.:-]{1,80}$/.test(value)
}

export function appendProviderOrderId(existing: string | undefined, id: string): string {
  const ids = (existing ?? "").split(",").map((part) => part.trim()).filter(Boolean)
  if (!ids.includes(id)) ids.push(id)
  return ids.join(",")
}
