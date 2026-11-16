import { after, NextResponse, type NextRequest } from "next/server"
import { like } from "drizzle-orm"
import { db } from "@/lib/db"
import { orders } from "@/lib/db/schema"
import { notifyCardDeclined } from "@/lib/notifications/admin"
import { parseOrderNotes } from "@/lib/orders/notes"
import {
  getOrderById,
  getOrderByOrderNumber,
  mergeOrderNotes,
  updateOrderStatus,
  type OrderWithItems,
} from "@/lib/orders/queries"
import {
  appendProviderOrderId,
  getTrapayPaymentStatus,
  isProviderOrderId,
  verifyTrapayWebhookSignature,
} from "@/lib/payments/trapay"

const PAID_STATUSES = new Set(["paid", "processing", "shipped", "delivered", "partially_paid"])
const PAYABLE_STATUSES = new Set(["awaiting_payment", "reviewing_payment"])
const SUCCESS_STATUSES = new Set(["paid", "completed", "success", "succeeded"])
const FAILED_STATUSES = new Set(["failed", "expired", "blocked", "canceled", "cancelled", "declined", "error"])

function noteSafe(value: string): string {
  return value.replace(/[;\r\n=]/g, " ").replace(/\s+/g, " ").trim().slice(0, 160)
}

function readString(value: unknown): string {
  if (typeof value === "string") return value.trim()
  if (typeof value === "number" && Number.isFinite(value)) return String(value)
  return ""
}

function isTrapayMethod(method: string): boolean {
  return method === "open_banking" || method === "card"
}

async function findOrderForTrapay(orderRef: string, providerPaymentId: string): Promise<OrderWithItems | null> {
  if (orderRef) {
    const byNumber = await getOrderByOrderNumber(orderRef)
    if (byNumber && isTrapayMethod(byNumber.paymentMethod)) {
      return byNumber
    }
  }

  if (providerPaymentId && isProviderOrderId(providerPaymentId)) {
    const [match] = await db
      .select({ id: orders.id })
      .from(orders)
      .where(like(orders.notes, `%${providerPaymentId}%`))
      .limit(1)
    if (!match) return null
    const order = await getOrderById(match.id)
    const notes = parseOrderNotes(order?.notes)
    const knownIds = (notes.trapay_payment_ids ?? "").split(",").filter(Boolean)
    if (order && isTrapayMethod(order.paymentMethod) && knownIds.includes(providerPaymentId)) {
      return order
    }
  }

  return null
}

export async function applyTrapayPaymentUpdate(
  order: OrderWithItems,
  update: {
    providerPaymentId?: string
    status: string
    amount?: string
    currency?: string
    failureMessage?: string
  },
): Promise<OrderWithItems> {
  const notes = parseOrderNotes(order.notes)
  const normalizedStatus = update.status.trim().toLowerCase()
  const isSuccess = SUCCESS_STATUSES.has(normalizedStatus)
  const isFailed = FAILED_STATUSES.has(normalizedStatus)

  if (PAID_STATUSES.has(order.status) && !isSuccess) {
    return order
  }

  let declineReason = update.failureMessage ? noteSafe(update.failureMessage) : ""
  if (isFailed && !declineReason) {
    const remote = await getTrapayPaymentStatus({
      id: update.providerPaymentId || undefined,
      orderId: order.orderNumber,
    })
    if (remote?.failureMessage) {
      declineReason = noteSafe(remote.failureMessage)
    }
  }

  const nextIds =
    update.providerPaymentId && isProviderOrderId(update.providerPaymentId)
      ? appendProviderOrderId(notes.trapay_payment_ids, update.providerPaymentId)
      : notes.trapay_payment_ids

  await mergeOrderNotes(order.id, {
    trapay_payment_ids: nextIds,
    trapay_last_status: normalizedStatus || notes.trapay_last_status,
    trapay_settled_amount: update.amount ? noteSafe(update.amount) : notes.trapay_settled_amount,
    trapay_settled_currency: update.currency ? noteSafe(update.currency.toUpperCase()) : notes.trapay_settled_currency,
    trapay_declined_reason: isSuccess ? undefined : declineReason || notes.trapay_declined_reason,
  })

  if (isSuccess && PAYABLE_STATUSES.has(order.status)) {
    await updateOrderStatus(order.id, "paid")
  } else if (isFailed && normalizedStatus !== (notes.trapay_last_status ?? "").toLowerCase()) {
    after(() =>
      notifyCardDeclined(order, declineReason || update.status).catch((err) => {
        console.error("[v0] Trapay card decline notification failed:", err)
      }),
    )
  }

  return (await getOrderById(order.id)) ?? order
}

export async function syncTrapayOrderStatus(order: OrderWithItems): Promise<OrderWithItems> {
  if (!isTrapayMethod(order.paymentMethod) || !PAYABLE_STATUSES.has(order.status)) {
    return order
  }
  const notes = parseOrderNotes(order.notes)
  const ids = (notes.trapay_payment_ids ?? "").split(",").map((s) => s.trim()).filter(Boolean)
  const latestId = ids[ids.length - 1]
  const remote = await getTrapayPaymentStatus({
    id: latestId,
    orderId: order.orderNumber,
  })
  if (!remote || !remote.status) return order

  const normalized = remote.status.toLowerCase()
  if (
    normalized === (notes.trapay_last_status ?? "").toLowerCase() &&
    !SUCCESS_STATUSES.has(normalized) &&
    (!remote.failureMessage || remote.failureMessage === notes.trapay_declined_reason)
  ) {
    return order
  }

  return applyTrapayPaymentUpdate(order, {
    providerPaymentId: remote.id || latestId,
    status: remote.status,
    amount: remote.amount !== null ? remote.amount.toFixed(2) : undefined,
    currency: remote.currency ?? undefined,
    failureMessage: remote.failureMessage ?? undefined,
  })
}

/**
 * Handles Trapay HTTP POST webhooks (https://doc.trapay.uk/#webhooks).
 * Verifies X-Webhook-Signature using HMAC-SHA256 over the raw request body,
 * with a fallback to direct server-to-server status verification via Trapay API.
 */
export async function handleTrapayWebhook(request: NextRequest): Promise<NextResponse> {
  const rawBody = await request.text()
  if (!rawBody.trim()) {
    return NextResponse.json({ received: true, test: true }, { status: 200 })
  }

  let parsed: Record<string, unknown>
  try {
    const json = JSON.parse(rawBody) as unknown
    if (!json || typeof json !== "object" || Array.isArray(json)) {
      return NextResponse.json({ received: true }, { status: 200 })
    }
    parsed = json as Record<string, unknown>
  } catch {
    return NextResponse.json({ received: true }, { status: 200 })
  }

  const event = readString(parsed.event || parsed.type).toLowerCase()
  const paymentObj =
    parsed.payment && typeof parsed.payment === "object" && !Array.isArray(parsed.payment)
      ? (parsed.payment as Record<string, unknown>)
      : parsed

  const providerPaymentId = readString(paymentObj.id)
  const orderRef = readString(paymentObj.orderId || paymentObj.order_id)

  // Trapay Dashboard "Test" webhook sends event: "test" or orderId: "test_order_123"
  if (
    event === "test" ||
    event.startsWith("test") ||
    parsed.test === true ||
    orderRef === "test_order_123" ||
    orderRef.startsWith("test_") ||
    providerPaymentId === "test_payment_123" ||
    providerPaymentId.startsWith("test_") ||
    (!orderRef && !providerPaymentId)
  ) {
    return NextResponse.json({ received: true, test: true }, { status: 200 })
  }

  const order = await findOrderForTrapay(orderRef, providerPaymentId)
  if (!order) {
    return NextResponse.json({ received: true, ignored: "order_not_found" }, { status: 200 })
  }

  const signature =
    request.headers.get("x-webhook-signature") ??
    request.headers.get("x-trapay-signature") ??
    request.headers.get("x-signature")

  const signatureValid = verifyTrapayWebhookSignature(rawBody, signature)

  if (!signatureValid) {
    // Fallback: verify directly against Trapay API so legitimate callbacks still update the order
    const synced = await syncTrapayOrderStatus(order)
    return NextResponse.json({ received: true, synced: synced.status }, { status: 200 })
  }

  const rawStatus = readString(paymentObj.status)
  const status =
    rawStatus ||
    (event === "payment.success" ? "PAID" : event === "payment.failed" ? "FAILED" : event === "payment.pending" ? "PENDING" : "")
  const amount = readString(paymentObj.amount)
  const currency = readString(paymentObj.currency)
  const failureMessage = readString(
    paymentObj.failureMessage || paymentObj.failure_message || paymentObj.error || paymentObj.message,
  )

  await applyTrapayPaymentUpdate(order, {
    providerPaymentId,
    status,
    amount,
    currency,
    failureMessage,
  })

  return NextResponse.json({ received: true }, { status: 200 })
}
