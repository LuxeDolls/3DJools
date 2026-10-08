import "server-only"

import { getOrderByOrderNumber, mergeOrderNotes, updateOrderStatus } from "@/lib/orders/queries"
import type { OrderWithItems } from "@/lib/orders/queries"
import { parseOrderNotes } from "@/lib/orders/notes"
import { countryCode } from "@/lib/payments/country-codes"
import { SQUARE_CHARGE_CURRENCY, SQUARE_LOCATION_ID } from "@/lib/payments/square-availability"
import { createSquarePayment, getSquarePayment, squareIdempotencyKey } from "@/lib/payments/square"

const PAID_STATUSES = new Set(["paid", "processing", "shipped", "delivered", "partially_paid"])
const PAYABLE_STATUSES = new Set(["awaiting_payment", "reviewing_payment"])
const INFLIGHT_MS = 25_000

export type SquareQuote = {
  usdCents: number
  rate: string
  date: string
}

type RateResponse = { date?: string; rates?: { USD?: number } }

async function ecbUsdRate(): Promise<{ rate: string; date: string; value: number } | null> {
  const response = await fetch("https://api.frankfurter.app/latest?from=EUR&to=USD", { cache: "no-store" })
  if (!response.ok) return null
  const body = (await response.json()) as RateResponse
  const value = body.rates?.USD
  if (!body.date || !value || !Number.isFinite(value) || value <= 0) return null
  return { rate: String(value), date: body.date, value }
}

function storedQuote(notes: Record<string, string>): SquareQuote | null {
  const usdCents = Number(notes.square_usd_cents)
  if (!Number.isInteger(usdCents) || usdCents < 1 || !notes.square_fx_rate || !notes.square_fx_date) return null
  return { usdCents, rate: notes.square_fx_rate, date: notes.square_fx_date }
}

function inflight(notes: Record<string, string>): boolean {
  const started = Number(notes.square_inflight_at)
  return Boolean(notes.square_inflight) && Number.isFinite(started) && Date.now() - started < INFLIGHT_MS
}

/** Locks the US-dollar charge from the latest European Central Bank euro rate. */
export async function ensureSquareQuote(order: OrderWithItems): Promise<SquareQuote | null> {
  const notes = parseOrderNotes(order.notes)
  const current = storedQuote(notes)
  if (current && inflight(notes)) return current

  const latest = await ecbUsdRate().catch(() => null)
  if (current && latest && current.date === latest.date) return current
  if (!latest) return current

  const quote: SquareQuote = {
    usdCents: Math.round(order.totalCents * latest.value),
    rate: latest.rate,
    date: latest.date,
  }
  if (quote.usdCents < 1) return null
  await mergeOrderNotes(order.id, {
    square_usd_cents: String(quote.usdCents),
    square_fx_rate: quote.rate,
    square_fx_date: quote.date,
  })
  return quote
}

export async function settleSquarePayment(input: {
  orderNumber: string
  paymentId: string
  status: string
  amountCents: number
  currency: string
  locationId?: string
}): Promise<"paid" | "ignored" | "mismatch" | "retry"> {
  const order = await getOrderByOrderNumber(input.orderNumber)
  if (!order || order.paymentMethod !== "square") return "ignored"
  if (PAID_STATUSES.has(order.status)) return "paid"
  if (!PAYABLE_STATUSES.has(order.status)) return "ignored"

  const notes = parseOrderNotes(order.notes)
  const expected = Number(notes.square_usd_cents)
  if (!Number.isInteger(expected) || expected < 1) return "retry"
  if (input.locationId && input.locationId !== SQUARE_LOCATION_ID) return "mismatch"
  if (input.currency !== SQUARE_CHARGE_CURRENCY || input.amountCents !== expected) {
    await mergeOrderNotes(order.id, { square_last_status: "amount_mismatch" })
    return "mismatch"
  }
  if (input.status !== "COMPLETED") {
    await mergeOrderNotes(order.id, {
      square_payment_id: input.paymentId,
      square_last_status: input.status.replace(/[^A-Za-z0-9_]/g, "").slice(0, 40) || "UNKNOWN",
    })
    return "ignored"
  }

  await mergeOrderNotes(order.id, {
    square_payment_id: input.paymentId,
    square_last_status: "COMPLETED",
    square_inflight: undefined,
    square_inflight_at: undefined,
  })
  await updateOrderStatus(order.id, "paid")
  return "paid"
}

export type SquareChargeResult =
  | { ok: true; already: boolean }
  | { ok: false; error: "unavailable" | "not_found" | "invalid_status" | "in_progress" | "quote_unavailable" | "quote_changed" | "pending" | "declined" }

/** Charges the stored dollar amount after the card form returns a one-time token. */
export async function chargeStoredSquareOrder(input: {
  orderNumber: string
  sourceId: string
  verificationToken?: string
  expectedUsdCents: number
}): Promise<SquareChargeResult> {
  const order = await getOrderByOrderNumber(input.orderNumber)
  if (!order || order.paymentMethod !== "square") return { ok: false, error: "not_found" }
  if (PAID_STATUSES.has(order.status)) return { ok: true, already: true }
  if (!PAYABLE_STATUSES.has(order.status)) return { ok: false, error: "invalid_status" }

  const notes = parseOrderNotes(order.notes)
  if (notes.square_payment_id) {
    const existing = await getSquarePayment(notes.square_payment_id).catch(() => null)
    if (existing && existing.referenceId === order.orderNumber) {
      const settled = await settleSquarePayment({
        orderNumber: order.orderNumber,
        paymentId: existing.id,
        status: existing.status,
        amountCents: existing.amountCents,
        currency: existing.currency,
        locationId: SQUARE_LOCATION_ID,
      })
      if (settled === "paid") return { ok: true, already: true }
      if (existing.status === "COMPLETED") return { ok: false, error: "declined" }
      if (existing.status === "APPROVED" || existing.status === "PENDING") return { ok: false, error: "pending" }
    }
  }
  if (inflight(notes)) return { ok: false, error: "in_progress" }

  const quote = await ensureSquareQuote(order)
  if (!quote) return { ok: false, error: "quote_unavailable" }
  if (input.expectedUsdCents !== quote.usdCents) return { ok: false, error: "quote_changed" }

  const idempotencyKey = squareIdempotencyKey(order.orderNumber, input.sourceId)
  await mergeOrderNotes(order.id, { square_inflight: idempotencyKey, square_inflight_at: String(Date.now()) })

  try {
    const payment = await createSquarePayment({
      sourceId: input.sourceId,
      verificationToken: input.verificationToken,
      idempotencyKey,
      amountCents: quote.usdCents,
      orderNumber: order.orderNumber,
      email: order.email,
      countryCode: countryCode(order.shippingCountry),
      address: order.shippingAddress1,
      city: order.shippingCity,
      postalCode: order.shippingPostalCode,
    })
    await mergeOrderNotes(order.id, { square_payment_id: payment.id })
    const settled = await settleSquarePayment({
      orderNumber: order.orderNumber,
      paymentId: payment.id,
      status: payment.status,
      amountCents: payment.amountCents,
      currency: payment.currency,
      locationId: SQUARE_LOCATION_ID,
    })
    if (settled === "paid") return { ok: true, already: false }
    if (payment.status === "APPROVED" || payment.status === "PENDING") return { ok: false, error: "pending" }
    return { ok: false, error: "declined" }
  } catch (error) {
    const code = error instanceof Error ? error.message.replace(/^square_/, "") : "UNKNOWN"
    console.error("[v0] Square charge failed:", code)
    await mergeOrderNotes(order.id, {
      square_last_status: code.replace(/[^A-Za-z0-9_]/g, "").slice(0, 40) || "UNKNOWN",
      square_inflight: undefined,
      square_inflight_at: undefined,
    })
    return { ok: false, error: "declined" }
  }
}
