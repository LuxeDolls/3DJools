import "server-only"

import { parseOrderNotes } from "@/lib/orders/notes"
import {
  getOrderByZenTransactionId,
  mergeOrderNotes,
  updateOrderStatus,
  type OrderWithItems,
} from "@/lib/orders/queries"
import { parseEuroAmountCents } from "@/lib/payments/skrill-verification"
import {
  fetchZenTransactionByMerchantId,
  isZenTransactionId,
  verifyZenIpnHash,
  zenIpnSecret,
} from "@/lib/payments/zen"
import { ZEN_CURRENCY } from "@/lib/payments/zen-availability"

const PAID_STATUSES = new Set(["paid", "processing", "shipped", "delivered", "partially_paid"])
const PAYABLE_STATUSES = new Set(["awaiting_payment", "reviewing_payment"])

export type ZenWebhookResult = {
  ok: boolean
  httpStatus: 200 | 400 | 401 | 409 | 503
  reason?: string
}

export async function confirmZenNotification(rawBody: string): Promise<ZenWebhookResult> {
  const ipnSecret = zenIpnSecret()
  if (!ipnSecret) {
    return { ok: false, httpStatus: 503, reason: "missing_secret" }
  }

  let data: Record<string, unknown>
  try {
    const parsed = JSON.parse(rawBody) as unknown
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { ok: false, httpStatus: 400, reason: "invalid_json" }
    }
    data = parsed as Record<string, unknown>
  } catch {
    return { ok: false, httpStatus: 400, reason: "invalid_json" }
  }

  const merchantTransactionId =
    typeof data.merchantTransactionId === "string" ? data.merchantTransactionId.trim() : ""
  const transactionId = typeof data.transactionId === "string" ? data.transactionId.trim() : ""
  const currency = typeof data.currency === "string" ? data.currency.trim() : ""
  const amount =
    typeof data.amount === "string"
      ? data.amount.trim()
      : typeof data.amount === "number"
        ? String(data.amount)
        : ""
  const status = typeof data.status === "string" ? data.status.trim().toUpperCase() : ""
  const hash = typeof data.hash === "string" ? data.hash.trim() : ""
  const txType = typeof data.type === "string" ? data.type.trim().toUpperCase() : "TRT_PURCHASE"

  if (!merchantTransactionId || !currency || !amount || !status || !hash) {
    return { ok: false, httpStatus: 400, reason: "missing_fields" }
  }

  if (
    !verifyZenIpnHash(
      {
        merchantTransactionId,
        currency,
        amount,
        status,
        hash,
      },
      ipnSecret,
    )
  ) {
    return { ok: false, httpStatus: 401, reason: "invalid_signature" }
  }

  // Non-purchase notifications (e.g. refunds) are acknowledged so ZEN does not retry.
  if (txType && txType !== "TRT_PURCHASE") {
    return { ok: true, httpStatus: 200 }
  }

  const order = await getOrderByZenTransactionId(merchantTransactionId)
  if (!order || order.paymentMethod !== "zen") {
    return { ok: false, httpStatus: 409, reason: "order_not_found" }
  }

  const notes = parseOrderNotes(order.notes)
  const storedIds = (notes.zen_transaction_ids ?? notes.zen_transaction_id ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)

  if (!storedIds.includes(merchantTransactionId)) {
    return { ok: false, httpStatus: 409, reason: "transaction_mismatch" }
  }

  if (currency.toUpperCase() !== ZEN_CURRENCY) {
    return { ok: false, httpStatus: 409, reason: "currency_mismatch" }
  }

  const amountCents = parseEuroAmountCents(amount)
  if (!Number.isFinite(order.totalCents) || order.totalCents <= 0 || amountCents !== order.totalCents) {
    return { ok: false, httpStatus: 409, reason: "amount_mismatch" }
  }

  if (status === "ACCEPTED") {
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
      ...(transactionId ? { zen_payment_id: transactionId } : {}),
      zen_transaction_id: merchantTransactionId,
      zen_last_status: "ACCEPTED",
    })
    await updateOrderStatus(order.id, "paid")
    return { ok: true, httpStatus: 200 }
  }

  if (status === "PENDING") {
    if (order.status === "awaiting_payment") {
      await mergeOrderNotes(order.id, {
        ...(transactionId ? { zen_payment_id: transactionId } : {}),
        zen_last_status: "PENDING",
      })
    }
    return { ok: true, httpStatus: 200 }
  }

  if (status === "REJECTED" || status === "CANCELED" || status === "CANCELLED" || status === "WRITTEN_OFF") {
    if (order.status === "awaiting_payment") {
      await mergeOrderNotes(order.id, {
        ...(transactionId ? { zen_payment_id: transactionId } : {}),
        zen_last_status: status === "CANCELED" || status === "CANCELLED" ? "CANCELLED" : "REJECTED",
      })
    }
    return { ok: true, httpStatus: 200 }
  }

  return { ok: true, httpStatus: 200 }
}

/**
 * Queries ZEN's REST API (`GET /v1/transactions/merchant/{merchantTransactionId}`)
 * when a customer returns from checkout so an ACCEPTED transaction is reflected
 * immediately even if the IPN webhook is still in flight.
 */
export async function syncZenOrderStatus(order: OrderWithItems): Promise<"paid" | "pending" | "failed" | "cancelled"> {
  if (PAID_STATUSES.has(order.status)) return "paid"
  if (order.paymentMethod !== "zen" || !PAYABLE_STATUSES.has(order.status)) return "pending"

  const notes = parseOrderNotes(order.notes)
  const storedIds = (notes.zen_transaction_ids ?? notes.zen_transaction_id ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(isZenTransactionId)

  const latestId = notes.zen_transaction_id && isZenTransactionId(notes.zen_transaction_id)
    ? notes.zen_transaction_id
    : storedIds[storedIds.length - 1]

  if (!latestId) return "pending"

  const remote = await fetchZenTransactionByMerchantId(latestId)
  if (!remote) return "pending"

  const remoteStatus = remote.status.trim().toUpperCase()
  const amountCents = parseEuroAmountCents(remote.amount)
  if (
    remoteStatus === "ACCEPTED" &&
    remote.currency.toUpperCase() === ZEN_CURRENCY &&
    amountCents === order.totalCents &&
    (!remote.type || remote.type === "TRT_PURCHASE")
  ) {
    await mergeOrderNotes(order.id, {
      zen_payment_id: remote.id,
      zen_transaction_id: remote.merchantTransactionId,
      zen_last_status: "ACCEPTED",
    })
    await updateOrderStatus(order.id, "paid")
    return "paid"
  }

  if (remoteStatus === "CANCELED" || remoteStatus === "CANCELLED") {
    await mergeOrderNotes(order.id, {
      zen_payment_id: remote.id,
      zen_last_status: "CANCELLED",
    })
    return "cancelled"
  }

  if (remoteStatus === "REJECTED" || remoteStatus === "WRITTEN_OFF") {
    await mergeOrderNotes(order.id, {
      zen_payment_id: remote.id,
      zen_last_status: "REJECTED",
    })
    return "failed"
  }

  return "pending"
}
