import "server-only"

import { createHash, randomUUID, timingSafeEqual } from "node:crypto"
import { COMPANY } from "@/lib/company"
import {
  ZEN_API_BASE_URL,
  ZEN_CHECKOUT_ENABLED,
  ZEN_CHECKOUT_URL,
  ZEN_CURRENCY,
} from "@/lib/payments/zen-availability"

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function zenTerminalUuid(): string {
  return process.env.ZEN_TERMINAL_UUID?.trim() ?? ""
}

export function zenPaywallSecret(): string {
  return process.env.ZEN_PAYWALL_SECRET?.trim() ?? ""
}

export function zenIpnSecret(): string {
  return process.env.ZEN_IPN_SECRET?.trim() ?? ""
}

export function zenTerminalApiKey(): string {
  const raw = process.env.ZEN_TERMINAL_API_KEY?.trim() ?? ""
  if (!raw) return ""
  return raw.toLowerCase().startsWith("bearer ") ? raw : `Bearer ${raw}`
}

export function zenConfigured(): boolean {
  return (
    ZEN_CHECKOUT_ENABLED &&
    Boolean(zenTerminalUuid()) &&
    Boolean(zenPaywallSecret()) &&
    Boolean(zenIpnSecret())
  )
}

export function isZenTransactionId(value: string | null | undefined): boolean {
  return UUID_REGEX.test(value?.trim() ?? "")
}

export function appendZenTransactionId(stored: string | undefined, id: string): string {
  const ids = (stored ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
  if (!ids.includes(id)) ids.push(id)
  return ids.join(",")
}

export function zenLanguage(locale: string | null | undefined): string {
  const code = locale?.trim().slice(0, 2).toLowerCase() ?? "en"
  if (["en", "de", "fr", "it", "es", "nl"].includes(code)) {
    return code
  }
  return "en"
}

function flattenForSignature(obj: unknown, prefix = "", out: string[] = []): string[] {
  if (obj === null || obj === undefined) return out
  if (typeof obj !== "object") return out
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    if (v === null || v === undefined) continue
    const path = prefix
      ? Array.isArray(obj)
        ? `${prefix}[${k}]`
        : `${prefix}.${k}`
      : k
    if (typeof v === "object") {
      flattenForSignature(v, path, out)
    } else {
      out.push(`${path.toLowerCase()}=${String(v).toLowerCase()}`)
    }
  }
  return out
}

/**
 * Generates the ZEN Checkout signature per https://docs.zen.com/payments/checkout-integration/signature
 * 1. Flatten non-null fields into `key=value` (arrays `items[0].name`, nested `customer.email`)
 * 2. Lowercase every `key=value` pair
 * 3. Sort alphabetically
 * 4. Join with `&`, append `paywallSecret`, hash with SHA-256, and suffix `;sha256`
 */
export function signZenCheckoutPayload(payload: Record<string, unknown>, paywallSecret: string): string {
  const flat = flattenForSignature(payload).sort()
  const base = `${flat.join("&")}${paywallSecret}`
  const hash = createHash("sha256").update(base, "utf8").digest("hex")
  return `${hash};sha256`
}

/**
 * Verifies an incoming ZEN IPN `hash` field:
 * `UPPERCASE(SHA256(merchantTransactionId + currency + amount + status + ipnSecret))`
 */
export function verifyZenIpnHash(
  params: {
    merchantTransactionId: string
    currency: string
    amount: string
    status: string
    hash: string
  },
  ipnSecret: string,
): boolean {
  const provided = params.hash.trim().toUpperCase()
  if (!/^[0-9A-F]{64}$/.test(provided)) return false
  const expected = createHash("sha256")
    .update(
      `${params.merchantTransactionId}${params.currency}${params.amount}${params.status}${ipnSecret}`,
      "utf8",
    )
    .digest("hex")
    .toUpperCase()
  const a = Buffer.from(provided, "utf8")
  const b = Buffer.from(expected, "utf8")
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

export type CreateZenPaymentInput = {
  orderNumber: string
  transactionId: string
  amountCents: number
  locale: string
  email: string
  firstName: string
  lastName: string
}

export async function createZenPayment(
  input: CreateZenPaymentInput,
): Promise<{ transactionId: string; redirectUrl: string }> {
  if (!zenConfigured()) throw new Error("zen_not_configured")
  if (!isZenTransactionId(input.transactionId)) throw new Error("zen_bad_transaction_id")
  if (!Number.isFinite(input.amountCents) || !Number.isInteger(input.amountCents) || input.amountCents <= 0) {
    throw new Error("invalid_total")
  }

  const orderNumber = input.orderNumber.trim()
  const amount = (input.amountCents / 100).toFixed(2)
  const firstName = input.firstName.trim().slice(0, 128) || "Customer"
  const lastName = input.lastName.trim().slice(0, 128) || "Customer"

  const body: Record<string, unknown> = {
    terminalUuid: zenTerminalUuid(),
    amount,
    currency: ZEN_CURRENCY,
    merchantTransactionId: input.transactionId.trim(),
    specifiedPaymentChannel: "PCL_CARD",
    customer: {
      firstName,
      lastName,
      email: input.email.trim().slice(0, 256),
    },
    items: [
      {
        code: orderNumber.slice(0, 64),
        name: `${COMPANY.tradingName} ${orderNumber}`.slice(0, 128),
        price: amount,
        quantity: 1,
        lineAmountTotal: amount,
      },
    ],
    urlSuccess: `${COMPANY.url}/api/payments/zen/return?order=${encodeURIComponent(orderNumber)}`,
    urlFailure: `${COMPANY.url}/api/payments/zen/return?order=${encodeURIComponent(orderNumber)}&cancelled=1`,
    urlRedirect: `${COMPANY.url}/api/payments/zen/return?order=${encodeURIComponent(orderNumber)}`,
    customIpnUrl: `${COMPANY.url}/api/payments/zen/webhook`,
    language: zenLanguage(input.locale),
  }

  body.signature = signZenCheckoutPayload(body, zenPaywallSecret())

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "request-id": randomUUID(),
  }
  const apiKey = zenTerminalApiKey()
  if (apiKey) {
    headers.Authorization = apiKey
  }

  const response = await fetch(ZEN_CHECKOUT_URL, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  })

  const rawText = await response.text()
  let parsed: { redirectUrl?: unknown } | null = null
  try {
    parsed = JSON.parse(rawText) as { redirectUrl?: unknown }
  } catch {
    parsed = null
  }

  const redirectUrl = typeof parsed?.redirectUrl === "string" ? parsed.redirectUrl.trim() : ""
  if (!response.ok || !redirectUrl.startsWith("https://")) {
    console.error("[v0] ZEN checkout create failed:", response.status, rawText.slice(0, 500))
    throw new Error("zen_prepare_failed")
  }

  return {
    transactionId: input.transactionId.trim(),
    redirectUrl,
  }
}

export type ZenRemoteTransaction = {
  id: string
  merchantTransactionId: string
  amount: string
  currency: string
  status: string
  type?: string
}

export async function fetchZenTransactionByMerchantId(
  merchantTransactionId: string,
): Promise<ZenRemoteTransaction | null> {
  const apiKey = zenTerminalApiKey()
  if (!apiKey || !isZenTransactionId(merchantTransactionId)) return null

  try {
    const response = await fetch(
      `${ZEN_API_BASE_URL}/transactions/merchant/${encodeURIComponent(merchantTransactionId.trim())}`,
      {
        method: "GET",
        headers: {
          Authorization: apiKey,
          "request-id": randomUUID(),
        },
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      },
    )
    if (!response.ok) return null
    const data = (await response.json()) as Record<string, unknown>
    if (
      typeof data.id !== "string" ||
      typeof data.merchantTransactionId !== "string" ||
      typeof data.amount !== "string" ||
      typeof data.currency !== "string" ||
      typeof data.status !== "string"
    ) {
      return null
    }
    return {
      id: data.id,
      merchantTransactionId: data.merchantTransactionId,
      amount: data.amount,
      currency: data.currency,
      status: data.status,
      type: typeof data.type === "string" ? data.type : undefined,
    }
  } catch (err) {
    console.error("[v0] ZEN fetch transaction failed:", err instanceof Error ? err.message : "unknown")
    return null
  }
}
