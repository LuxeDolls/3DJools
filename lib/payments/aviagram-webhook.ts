import { after, NextResponse, type NextRequest } from "next/server"
import { like } from "drizzle-orm"
import { db } from "@/lib/db"
import { orders } from "@/lib/db/schema"
import { notifyCardDeclined } from "@/lib/notifications/admin"
import { parseOrderNotes } from "@/lib/orders/notes"
import { getOrderById, mergeOrderNotes, updateOrderStatus, type OrderWithItems } from "@/lib/orders/queries"
import { isProviderOrderId } from "@/lib/payments/aviagram"

const PAID_STATUSES = new Set(["paid", "processing", "shipped", "delivered", "partially_paid"])
const PAYABLE_STATUSES = new Set(["awaiting_payment", "reviewing_payment"])
const SUCCESS_STATUSES = new Set(["received", "paid", "completed", "success", "succeeded", "approved"])
const FAILED_STATUSES = new Set(["canceled", "cancelled", "declined", "failed", "timeout", "expired", "rejected", "error"])

function readField(body: Record<string, unknown>, ...keys: string[]): string {
  const wanted = new Set(keys.map((key) => key.toLowerCase()))
  for (const [key, value] of Object.entries(body)) {
    if (!wanted.has(key.toLowerCase())) continue
    if (typeof value === "string") return value.trim()
    if (typeof value === "number" && Number.isFinite(value)) return String(value)
  }
  return ""
}

function noteSafe(value: string): string {
  return value.replace(/[;\r\n=]/g, " ").replace(/\s+/g, " ").trim().slice(0, 160)
}

async function readBody(request: NextRequest): Promise<Record<string, unknown> | null> {
  const contentType = request.headers.get("content-type") ?? ""
  if (contentType.includes("application/x-www-form-urlencoded")) {
    const form = await request.formData()
    const body: Record<string, unknown> = {}
    for (const [key, value] of form.entries()) {
      if (typeof value === "string") body[key] = value
    }
    return body
  }
  const parsed = await request.json()
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null
  return parsed as Record<string, unknown>
}

async function findOrderForWebhook(token: string, providerOrderId: string): Promise<OrderWithItems | null> {
  if (/^[a-f0-9]{64}$/.test(token)) {
    const [match] = await db
      .select({ id: orders.id })
      .from(orders)
      .where(like(orders.notes, `%aviagram_webhook_token=${token}%`))
      .limit(1)
    if (!match) return null
    const order = await getOrderById(match.id)
    const notes = parseOrderNotes(order?.notes)
    if (!order || order.paymentMethod !== "card" || notes.aviagram_webhook_token !== token) {
      return null
    }
    return order
  }

  if (providerOrderId && isProviderOrderId(providerOrderId)) {
    const [match] = await db
      .select({ id: orders.id })
      .from(orders)
      .where(like(orders.notes, `%${providerOrderId}%`))
      .limit(1)
    if (!match) return null
    const order = await getOrderById(match.id)
    const notes = parseOrderNotes(order?.notes)
    const knownIds = (notes.aviagram_order_ids ?? "").split(",").filter(Boolean)
    if (!order || order.paymentMethod !== "card" || !knownIds.includes(providerOrderId)) {
      return null
    }
    return order
  }

  return null
}

/** Zenthoryx counts 200–204 as a received callback. */
export async function handleAviagramWebhook(request: NextRequest, token: string): Promise<NextResponse> {
  let body: Record<string, unknown>
  try {
    const parsed = await readBody(request)
    if (!parsed) return NextResponse.json({ ok: false }, { status: 400 })
    body = parsed
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const providerOrderId = readField(body, "orderId", "order_id", "id")
  if (token && !/^[a-f0-9]{64}$/.test(token)) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const order = await findOrderForWebhook(token, providerOrderId)
  if (!order) return NextResponse.json({ ok: false }, { status: 404 })

  const notes = parseOrderNotes(order.notes)
  const knownIds = (notes.aviagram_order_ids ?? "").split(",").filter(Boolean)
  const status = readField(body, "status").toLowerCase()
  if (providerOrderId && knownIds.length > 0 && !knownIds.includes(providerOrderId)) {
    console.error("[v0] Zenthoryx webhook order id was not stored yet", order.orderNumber)
  }
  if (PAID_STATUSES.has(order.status) && !SUCCESS_STATUSES.has(status)) {
    return new NextResponse(null, { status: 200 })
  }

  const amount = readField(body, "amount")
  const currency = readField(body, "currency").toUpperCase()
  const decline = noteSafe(
    readField(body, "DeclinedReaction", "declinedReason", "declined_reason", "declinedReaction", "error", "message"),
  )
  const audit = {
    aviagram_last_status: status || notes.aviagram_last_status,
    aviagram_settled_amount: amount ? noteSafe(amount) : notes.aviagram_settled_amount,
    aviagram_settled_currency: currency || notes.aviagram_settled_currency,
    aviagram_declined_reason: SUCCESS_STATUSES.has(status) ? undefined : decline || notes.aviagram_declined_reason,
  }

  const nextIds =
    providerOrderId && isProviderOrderId(providerOrderId) && !knownIds.includes(providerOrderId)
      ? [...knownIds, providerOrderId].join(",")
      : notes.aviagram_order_ids

  if (nextIds || status || amount || decline || currency) {
    await mergeOrderNotes(order.id, {
      ...audit,
      aviagram_order_ids: nextIds,
    })
  }

  if (SUCCESS_STATUSES.has(status) && PAYABLE_STATUSES.has(order.status)) {
    await updateOrderStatus(order.id, "paid")
  } else if (FAILED_STATUSES.has(status) && status !== notes.aviagram_last_status) {
    after(() =>
      notifyCardDeclined(order, decline || status).catch((err) => {
        console.error("[v0] Card decline notification failed:", err)
      }),
    )
  }

  return new NextResponse(null, { status: 200 })
}
