import "server-only"

import { COMPANY } from "@/lib/company"
import { isLocale } from "@/lib/i18n/config"
import { SUMUP_CHARGE_CURRENCY, SUMUP_CHECKOUT_ENABLED } from "@/lib/payments/sumup-availability"

const SUMUP_API = "https://api.sumup.com"

function accessToken(): string {
  const token = process.env.API_3?.trim()
  if (!token) throw new Error("sumup_unconfigured")
  return token
}

export function sumupConfigured(): boolean {
  return SUMUP_CHECKOUT_ENABLED && Boolean(process.env.API_3?.trim())
}

export function sumupWebhookUrl(): string {
  return `${COMPANY.url}/api/payments/sumup/webhook`
}

const ORDER_NUMBER = /^(?:V3|DND)-\d{8}-[A-Z0-9]{4,10}$/

export function isSumupCheckoutUrl(value: string): boolean {
  try {
    return new URL(value).hostname === "checkout.sumup.com"
  } catch {
    return false
  }
}

export function appendSumupCheckoutId(stored: string | undefined, id: string): string {
  const ids = (stored ?? "").split(",").map((part) => part.trim()).filter(Boolean)
  if (!ids.includes(id)) ids.push(id)
  return ids.join(",")
}

/** Recovers the order number DnD3D embedded in a SumUp checkout_reference (`<order>-<suffix>`). */
export function sumupOrderNumber(reference: string): string {
  return reference.match(ORDER_NUMBER)?.[0] ?? ""
}

let cachedMerchantCode: string | null = null

/** The SumUp merchant_code identifies the account that should receive the payment. */
async function merchantCode(): Promise<string> {
  if (cachedMerchantCode) return cachedMerchantCode
  const response = await fetch(`${SUMUP_API}/v0.1/me`, {
    headers: { Authorization: `Bearer ${accessToken()}` },
    cache: "no-store",
  })
  if (!response.ok) throw new Error("sumup_me_failed")
  const body = (await response.json()) as { merchant_profile?: { merchant_code?: string } }
  const code = body.merchant_profile?.merchant_code
  if (!code) throw new Error("sumup_no_merchant_code")
  cachedMerchantCode = code
  return code
}

type SumupErrorBody = { error_code?: string; message?: string }
type SumupCheckoutBody = SumupErrorBody & {
  id?: string
  status?: string
  checkout_reference?: string
  amount?: number
  currency?: string
  hosted_checkout_url?: string
}

export type SumupCheckout = {
  id: string
  reference: string
  url: string
  status: string
}

function safeCode(value: string | undefined): string {
  return (value ?? "unknown").replace(/[^A-Za-z0-9_]/g, "").slice(0, 40) || "unknown"
}

/** Opens SumUp's Hosted Checkout page for the exact euro amount stored on the order. */
export async function createSumupCheckout(input: {
  orderNumber: string
  amountCents: number
  locale: string
  orderPath: string
}): Promise<SumupCheckout> {
  if (!SUMUP_CHECKOUT_ENABLED) throw new Error("sumup_unavailable")
  if (!ORDER_NUMBER.test(input.orderNumber)) throw new Error("sumup_bad_order")
  if (!Number.isInteger(input.amountCents) || input.amountCents < 1) throw new Error("sumup_bad_amount")

  const locale = isLocale(input.locale) ? input.locale : "en"
  // A fresh reference per attempt: SumUp rejects a reused checkout_reference with 409.
  const reference = `${input.orderNumber}-${Date.now().toString(36)}`.slice(0, 64)
  const code = await merchantCode()

  const response = await fetch(`${SUMUP_API}/v0.1/checkouts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      checkout_reference: reference,
      amount: Math.round(input.amountCents) / 100,
      currency: SUMUP_CHARGE_CURRENCY,
      merchant_code: code,
      description: `DnD3D ${input.orderNumber}`.slice(0, 250),
      return_url: sumupWebhookUrl(),
      redirect_url: `${COMPANY.url}${input.orderPath}`,
      hosted_checkout: { enabled: true },
    }),
  })
  const body = (await response.json()) as SumupCheckoutBody
  const url = body.hosted_checkout_url ?? ""
  if (!response.ok || !body.id || !isSumupCheckoutUrl(url)) {
    throw new Error(`sumup_${safeCode(body.error_code)}`)
  }
  return { id: body.id, reference, url, status: body.status ?? "PENDING" }
}

export type SumupCheckoutState = {
  id: string
  reference: string
  status: string
  amountCents: number
  currency: string
}

/** Reads the checkout back from SumUp — the only source of truth for payment status. */
export async function getSumupCheckout(checkoutId: string): Promise<SumupCheckoutState | null> {
  if (!/^[A-Za-z0-9-]{8,80}$/.test(checkoutId)) return null
  const response = await fetch(`${SUMUP_API}/v0.1/checkouts/${encodeURIComponent(checkoutId)}`, {
    headers: { Authorization: `Bearer ${accessToken()}`, Accept: "application/json" },
    cache: "no-store",
  })
  if (!response.ok) return null
  const body = (await response.json()) as SumupCheckoutBody
  if (!body.id) return null
  return {
    id: body.id,
    reference: body.checkout_reference ?? "",
    status: body.status ?? "UNKNOWN",
    amountCents: Math.round((body.amount ?? 0) * 100),
    currency: body.currency ?? "",
  }
}
