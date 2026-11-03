import "server-only"

import { createHash, timingSafeEqual } from "node:crypto"
import { SKRILL_MERCHANT_ID, SKRILL_RECEIVING_EMAIL } from "@/lib/payments/skrill-availability"
import { isSkrillTransactionId } from "@/lib/payments/skrill"

const MAX_BODY_CHARS = 16_000
const SUPPORTED_STATUSES = new Set(["2", "0", "-1", "-2", "-3"])
const CRITICAL_FIELDS = new Set([
  "merchant_id",
  "transaction_id",
  "mb_transaction_id",
  "mb_amount",
  "mb_currency",
  "status",
  "md5sig",
  "pay_to_email",
  "amount",
  "currency",
  "payment_type",
])

export type SkrillStatusValue = "2" | "0" | "-1" | "-2" | "-3"

export type SkrillNotificationPayload = {
  merchant_id: string
  transaction_id: string
  mb_transaction_id: string
  mb_amount: string
  mb_currency: string
  status: SkrillStatusValue
  md5sig: string
  pay_to_email: string
  amount?: string
  currency?: string
  payment_type?: string
}

export type ParseSkrillFormResult =
  | { ok: true; payload: SkrillNotificationPayload }
  | { ok: false; httpStatus: 400 | 413; reason: string }

export function parseEuroAmountCents(raw: string | undefined): number | null {
  const trimmed = raw?.trim() ?? ""
  if (!/^\d+(?:\.\d{1,4})?$/.test(trimmed)) return null
  const num = Number(trimmed)
  if (!Number.isFinite(num) || num <= 0) return null
  const exactCents = num * 100
  const cents = Math.round(exactCents)
  if (Math.abs(exactCents - cents) > 1e-6) return null
  return cents > 0 ? cents : null
}

export function parseSkrillStatusForm(rawBody: string): ParseSkrillFormResult {
  if (rawBody.length > MAX_BODY_CHARS) {
    return { ok: false, httpStatus: 413, reason: "oversized_body" }
  }

  const params = new URLSearchParams(rawBody)
  const seen = new Set<string>()
  for (const [key] of params.entries()) {
    if (!CRITICAL_FIELDS.has(key)) continue
    if (seen.has(key)) {
      return { ok: false, httpStatus: 400, reason: "duplicate_fields" }
    }
    seen.add(key)
  }

  const get = (key: string) => params.get(key)?.trim() ?? ""
  const merchant_id = get("merchant_id")
  const transaction_id = get("transaction_id")
  const mb_transaction_id = get("mb_transaction_id")
  const mb_amount = get("mb_amount")
  const mb_currency = get("mb_currency").toUpperCase()
  const status = get("status")
  const md5sig = get("md5sig").toUpperCase()
  const pay_to_email = get("pay_to_email")
  const amount = get("amount") || undefined
  const currency = get("currency") ? get("currency").toUpperCase() : undefined
  const payment_type = get("payment_type") ? get("payment_type").toUpperCase() : undefined

  if (
    !merchant_id ||
    !transaction_id ||
    !mb_amount ||
    !mb_currency ||
    !status ||
    !md5sig ||
    !pay_to_email
  ) {
    return { ok: false, httpStatus: 400, reason: "missing_fields" }
  }

  if (!SUPPORTED_STATUSES.has(status)) {
    return { ok: false, httpStatus: 400, reason: "unsupported_status" }
  }

  if (status === "2" && !mb_transaction_id) {
    return { ok: false, httpStatus: 400, reason: "missing_mb_transaction_id" }
  }

  if (!isSkrillTransactionId(transaction_id)) {
    return { ok: false, httpStatus: 400, reason: "invalid_transaction_id" }
  }

  if (!/^[0-9A-F]{32}$/.test(md5sig)) {
    return { ok: false, httpStatus: 400, reason: "invalid_md5sig_format" }
  }

  if (parseEuroAmountCents(mb_amount) === null) {
    return { ok: false, httpStatus: 400, reason: "invalid_mb_amount" }
  }

  if (amount !== undefined && parseEuroAmountCents(amount) === null) {
    return { ok: false, httpStatus: 400, reason: "invalid_amount" }
  }

  return {
    ok: true,
    payload: {
      merchant_id,
      transaction_id,
      mb_transaction_id,
      mb_amount,
      mb_currency,
      status: status as SkrillStatusValue,
      md5sig,
      pay_to_email,
      amount,
      currency,
      payment_type,
    },
  }
}

function md5Upper(input: string): string {
  return createHash("md5").update(input, "utf8").digest("hex").toUpperCase()
}

export function computeSkrillSignature(
  payload: Pick<
    SkrillNotificationPayload,
    "merchant_id" | "transaction_id" | "mb_amount" | "mb_currency" | "status"
  >,
  secretWord: string,
): string {
  const secretHash = md5Upper(secretWord)
  const material = `${payload.merchant_id}${payload.transaction_id}${secretHash}${payload.mb_amount}${payload.mb_currency}${payload.status}`
  return md5Upper(material)
}

export function verifySkrillSignature(
  payload: SkrillNotificationPayload,
  secretWord: string,
): boolean {
  if (!secretWord) return false
  const expected = computeSkrillSignature(payload, secretWord)
  const left = Buffer.from(expected, "utf8")
  const right = Buffer.from(payload.md5sig.toUpperCase(), "utf8")
  if (left.length !== right.length) return false
  return timingSafeEqual(left, right)
}

export function matchesConfiguredSkrillMerchant(payload: SkrillNotificationPayload): boolean {
  return (
    payload.merchant_id === SKRILL_MERCHANT_ID &&
    payload.pay_to_email.toLowerCase() === SKRILL_RECEIVING_EMAIL.toLowerCase()
  )
}
