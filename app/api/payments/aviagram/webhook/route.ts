import { NextResponse, type NextRequest } from "next/server"
import { like } from "drizzle-orm"
import { db } from "@/lib/db"
import { orders } from "@/lib/db/schema"
import { parseOrderNotes } from "@/lib/orders/notes"
import { getOrderById, mergeOrderNotes, updateOrderStatus } from "@/lib/orders/queries"
import { amountsMatch, isProviderOrderId } from "@/lib/payments/aviagram"

export const dynamic = "force-dynamic"

const PAID_STATUSES = new Set(["paid", "processing", "shipped", "delivered", "partially_paid"])
const PAYABLE_STATUSES = new Set(["awaiting_payment", "reviewing_payment"])

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

export async function POST(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? ""
  if (!/^[a-f0-9]{64}$/.test(token)) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    const contentType = request.headers.get("content-type") ?? ""
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const form = await request.formData()
      body = {}
      for (const [key, value] of form.entries()) {
        if (typeof value === "string") body[key] = value
      }
    } else {
      const parsed = await request.json()
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        return NextResponse.json({ ok: false }, { status: 400 })
      }
      body = parsed as Record<string, unknown>
    }
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const [match] = await db
    .select({ id: orders.id })
    .from(orders)
    .where(like(orders.notes, `%aviagram_webhook_token=${token}%`))
    .limit(1)
  if (!match) return NextResponse.json({ ok: false }, { status: 404 })

  const order = await getOrderById(match.id)
  const notes = parseOrderNotes(order?.notes)
  if (!order || order.paymentMethod !== "card" || notes.aviagram_webhook_token !== token) {
    return NextResponse.json({ ok: false }, { status: 404 })
  }

  const providerOrderId = readField(body, "orderId")
  const knownIds = (notes.aviagram_order_ids ?? "").split(",").filter(Boolean)
  if (providerOrderId && knownIds.length > 0 && !knownIds.includes(providerOrderId)) {
    console.error("[v0] Aviagram webhook order id does not match", order.orderNumber)
    return new NextResponse(null, { status: 200 })
  }

  const status = readField(body, "status").toLowerCase()
  if (PAID_STATUSES.has(order.status) && status !== "received") {
    return new NextResponse(null, { status: 200 })
  }

  const amount = readField(body, "amount")
  const currency = readField(body, "currency").toUpperCase()
  // convertCurrency settles EUR-GT back as EUR. That settled amount can differ
  // from the shop total, so a mismatch is recorded, not rejected.
  const settledCurrency = currency.startsWith("EUR") ? "EUR" : currency
  const decline = noteSafe(
    readField(body, "declinedReason", "DeclinedReaction", "declined_reason", "declinedReaction"),
  )
  const converted = Boolean(amount) && !amountsMatch(amount, order.totalCents)
  const audit = {
    aviagram_last_status: status || undefined,
    aviagram_settled_amount: amount ? noteSafe(amount) : undefined,
    aviagram_settled_currency: settledCurrency || undefined,
    aviagram_declined_reason: decline || undefined,
    aviagram_amount_converted: converted ? "1" : undefined,
  }

  if (currency && !currency.startsWith("EUR")) {
    console.error("[v0] Aviagram webhook currency rejected", order.orderNumber)
    await mergeOrderNotes(order.id, audit)
    return new NextResponse(null, { status: 200 })
  }

  if (providerOrderId && isProviderOrderId(providerOrderId) && !knownIds.includes(providerOrderId)) {
    await mergeOrderNotes(order.id, {
      ...audit,
      aviagram_order_ids: [...knownIds, providerOrderId].join(","),
    })
  } else if (status || amount || decline) {
    await mergeOrderNotes(order.id, audit)
  }

  if (status === "received" && PAYABLE_STATUSES.has(order.status)) {
    await updateOrderStatus(order.id, "paid")
  }

  return new NextResponse(null, { status: 200 })
}
