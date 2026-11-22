import { NextResponse } from "next/server"
import { getOrderByOrderNumber } from "@/lib/orders/queries"
import { parseOrderNotes } from "@/lib/orders/notes"
import {
  NGENIUS_CHECKOUT_ENABLED,
  applyNgeniusPaymentUpdate,
  getNgeniusOrderStatus,
  ngeniusConfigured,
} from "@/lib/payments/ngenius"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  if (!NGENIUS_CHECKOUT_ENABLED || !ngeniusConfigured()) {
    return NextResponse.json({ ok: false, error: "ngenius_unavailable" }, { status: 503 })
  }

  let body: { orderNumber?: unknown; ngeniusOrderRef?: unknown }
  try {
    body = (await request.json()) as { orderNumber?: unknown; ngeniusOrderRef?: unknown }
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 })
  }

  const orderNumber = typeof body.orderNumber === "string" ? body.orderNumber.trim() : ""
  const passedRef = typeof body.ngeniusOrderRef === "string" ? body.ngeniusOrderRef.trim() : ""
  if (!orderNumber) {
    return NextResponse.json({ ok: false, error: "missing_order" }, { status: 400 })
  }

  const order = await getOrderByOrderNumber(orderNumber)
  if (!order || order.paymentMethod !== "ngenius") {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 })
  }

  const notes = parseOrderNotes(order.notes)
  const ngeniusOrderRef = passedRef || notes.ngenius_order_ref || ""
  if (!ngeniusOrderRef) {
    return NextResponse.json({ ok: true, status: order.status })
  }

  try {
    const remote = await getNgeniusOrderStatus(ngeniusOrderRef)
    if (!remote) {
      return NextResponse.json({ ok: false, error: "status_unavailable" }, { status: 502 })
    }
    const updated = await applyNgeniusPaymentUpdate(order, remote)
    return NextResponse.json({ ok: true, status: updated.status })
  } catch (err) {
    console.error("[v0] N-Genius verify failed:", err)
    return NextResponse.json({ ok: false, error: "verify_failed" }, { status: 502 })
  }
}
