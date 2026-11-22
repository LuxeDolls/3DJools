import { NextResponse } from "next/server"
import { getOrderByOrderNumber, mergeOrderNotes } from "@/lib/orders/queries"
import { parseOrderNotes } from "@/lib/orders/notes"
import {
  NGENIUS_CHECKOUT_ENABLED,
  applyNgeniusPaymentUpdate,
  chargeNgeniusHostedSession,
  convertEurCentsToAed,
  extractNgeniusPaymentDetails,
  ngeniusConfigured,
} from "@/lib/payments/ngenius"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  if (!NGENIUS_CHECKOUT_ENABLED || !ngeniusConfigured()) {
    return NextResponse.json({ ok: false, error: "ngenius_unavailable" }, { status: 503 })
  }

  let body: { orderNumber?: unknown; sessionId?: unknown }
  try {
    body = (await request.json()) as { orderNumber?: unknown; sessionId?: unknown }
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 })
  }

  const orderNumber = typeof body.orderNumber === "string" ? body.orderNumber.trim() : ""
  const sessionId = typeof body.sessionId === "string" ? body.sessionId.trim() : ""
  if (!orderNumber || !sessionId) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 })
  }

  const order = await getOrderByOrderNumber(orderNumber)
  if (!order || order.paymentMethod !== "ngenius") {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 })
  }
  if (order.status !== "awaiting_payment" && order.status !== "reviewing_payment") {
    return NextResponse.json({ ok: false, error: "invalid_status" }, { status: 409 })
  }

  try {
    const notes = parseOrderNotes(order.notes)
    const quoted = await convertEurCentsToAed(order.totalCents)
    const aedMinorUnits = quoted.aedMinorUnits

    await mergeOrderNotes(order.id, {
      ngenius_aed_minor_units: String(aedMinorUnits),
      ngenius_eur_aed_rate: String(quoted.rate),
    })

    const paymentResponse = await chargeNgeniusHostedSession({
      sessionId,
      orderNumber: order.orderNumber,
      aedMinorUnits,
      email: order.email,
      shippingName: order.shippingName,
      address1: order.shippingAddress1,
      city: order.shippingCity,
    })

    const details = extractNgeniusPaymentDetails(paymentResponse)
    if (details.orderRef) {
      await mergeOrderNotes(order.id, {
        ngenius_order_ref: details.orderRef,
        ngenius_last_status: details.state || notes.ngenius_last_status,
      })
    }

    if (details.state && ["PURCHASED", "CAPTURED", "AUTHORISED", "FAILED", "DECLINED"].includes(details.state)) {
      await applyNgeniusPaymentUpdate(order, paymentResponse)
    }

    return NextResponse.json({
      ok: true,
      paymentResponse,
      ngeniusOrderRef: details.orderRef,
    })
  } catch (err) {
    console.error("[v0] N-Genius charge failed:", err)
    return NextResponse.json({ ok: false, error: "charge_failed" }, { status: 502 })
  }
}
