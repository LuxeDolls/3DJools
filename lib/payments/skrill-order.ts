import "server-only"

import { parseOrderNotes } from "@/lib/orders/notes"
import { getOrderBySkrillTransactionId, mergeOrderNotes, updateOrderStatus } from "@/lib/orders/queries"
import {
  SKRILL_CARD_MAX_CENTS,
  SKRILL_CURRENCY,
  isSkrillPayment,
} from "@/lib/payments/skrill-availability"
import { skrillSecretWord } from "@/lib/payments/skrill"
import {
  matchesConfiguredSkrillMerchant,
  parseEuroAmountCents,
  parseSkrillStatusForm,
  verifySkrillSignature,
} from "@/lib/payments/skrill-verification"

const PAID_STATUSES = new Set(["paid", "processing", "shipped", "delivered", "partially_paid"])
const PAYABLE_STATUSES = new Set(["awaiting_payment", "reviewing_payment"])

export type SkrillWebhookResult = {
  ok: boolean
  httpStatus: 200 | 400 | 401 | 409 | 413 | 415 | 503
  reason?: string
}

export async function confirmSkrillNotification(
  rawBody: string,
  contentType: string | null,
): Promise<SkrillWebhookResult> {
  const secretWord = skrillSecretWord()
  if (!secretWord) {
    return { ok: false, httpStatus: 503, reason: "missing_secret" }
  }

  if (!contentType || !contentType.toLowerCase().includes("application/x-www-form-urlencoded")) {
    return { ok: false, httpStatus: 415, reason: "unsupported_content_type" }
  }

  const parsed = parseSkrillStatusForm(rawBody)
  if (!parsed.ok) {
    return { ok: false, httpStatus: parsed.httpStatus, reason: parsed.reason }
  }

  const { payload } = parsed
  if (!verifySkrillSignature(payload, secretWord)) {
    return { ok: false, httpStatus: 401, reason: "invalid_signature" }
  }

  if (!matchesConfiguredSkrillMerchant(payload)) {
    return { ok: false, httpStatus: 409, reason: "merchant_mismatch" }
  }

  const order = await getOrderBySkrillTransactionId(payload.transaction_id)
  if (!order || !isSkrillPayment(order.paymentMethod)) {
    return { ok: false, httpStatus: 409, reason: "order_not_found" }
  }

  const notes = parseOrderNotes(order.notes)
  const storedIds = (notes.skrill_transaction_ids ?? notes.skrill_transaction_id ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)

  if (!storedIds.includes(payload.transaction_id)) {
    return { ok: false, httpStatus: 409, reason: "transaction_mismatch" }
  }

  if (payload.mb_currency !== SKRILL_CURRENCY || (payload.currency && payload.currency !== SKRILL_CURRENCY)) {
    return { ok: false, httpStatus: 409, reason: "currency_mismatch" }
  }

  const mbAmountCents = parseEuroAmountCents(payload.mb_amount)
  const amountCents = payload.amount ? parseEuroAmountCents(payload.amount) : mbAmountCents
  if (
    !Number.isFinite(order.totalCents) ||
    order.totalCents <= 0 ||
    mbAmountCents !== order.totalCents ||
    amountCents !== order.totalCents
  ) {
    return { ok: false, httpStatus: 409, reason: "amount_mismatch" }
  }

  if (order.paymentMethod === "skrill_card" && order.totalCents > SKRILL_CARD_MAX_CENTS) {
    return { ok: false, httpStatus: 409, reason: "card_limit_exceeded" }
  }

  if (
    notes.skrill_payment_id &&
    payload.mb_transaction_id &&
    notes.skrill_payment_id !== payload.mb_transaction_id
  ) {
    return { ok: false, httpStatus: 409, reason: "payment_id_mismatch" }
  }

  if (payload.status === "2") {
    if (order.status === "cancelled" || order.status === "refunded") {
      return { ok: false, httpStatus: 409, reason: "order_cancelled" }
    }

    if (PAID_STATUSES.has(order.status)) {
      return { ok: true, httpStatus: 200 }
    }

    if (!PAYABLE_STATUSES.has(order.status)) {
      return { ok: false, httpStatus: 409, reason: "invalid_order_status" }
    }

    await mergeOrderNotes(order.id, {
      skrill_payment_id: payload.mb_transaction_id,
      skrill_transaction_id: payload.transaction_id,
      skrill_last_status: "PAID",
    })
    await updateOrderStatus(order.id, "paid")
    return { ok: true, httpStatus: 200 }
  }

  if (payload.status === "0") {
    if (order.status === "awaiting_payment") {
      await mergeOrderNotes(order.id, {
        ...(payload.mb_transaction_id ? { skrill_payment_id: payload.mb_transaction_id } : {}),
        skrill_last_status: "PENDING",
      })
    }
    return { ok: true, httpStatus: 200 }
  }

  if (payload.status === "-1" || payload.status === "-2") {
    if (order.status === "awaiting_payment") {
      await mergeOrderNotes(order.id, {
        ...(payload.mb_transaction_id ? { skrill_payment_id: payload.mb_transaction_id } : {}),
        skrill_last_status: payload.status === "-1" ? "CANCELLED" : "FAILED",
      })
    }
    return { ok: true, httpStatus: 200 }
  }

  return { ok: true, httpStatus: 200 }
}
