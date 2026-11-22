import { timingSafeEqual } from "crypto"
import { NextResponse, type NextRequest } from "next/server"
import { parseOrderNotes } from "@/lib/orders/notes"
import { getOrderByNgeniusRef, getOrderByOrderNumber } from "@/lib/orders/queries"
import {
  NGENIUS_CHECKOUT_ENABLED,
  applyNgeniusPaymentUpdate,
  getNgeniusOrderStatus,
  ngeniusConfigured,
} from "@/lib/payments/ngenius"

export const dynamic = "force-dynamic"

function verifyOptionalSecret(request: NextRequest): boolean {
  const expected = process.env.NGENIUS_WEBHOOK_SECRET?.trim()
  if (!expected) return true

  const headerSecret = request.headers.get("x-webhook-secret")?.trim() ?? ""
  const authHeader = request.headers.get("authorization")?.trim() ?? ""
  const bearer = authHeader.toLowerCase().startsWith("bearer ")
    ? authHeader.slice(7).trim()
    : authHeader

  const candidate = headerSecret || bearer
  if (!candidate) return false

  const a = Buffer.from(candidate, "utf8")
  const b = Buffer.from(expected, "utf8")
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

function str(val: unknown): string {
  return typeof val === "string" ? val.trim() : ""
}

export async function GET() {
  return NextResponse.json({ ok: true, received: true, provider: "ngenius" }, { status: 200 })
}

export async function HEAD() {
  return new NextResponse(null, { status: 200 })
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      Allow: "GET, HEAD, POST, OPTIONS",
    },
  })
}

export async function POST(request: NextRequest) {
  if (!NGENIUS_CHECKOUT_ENABLED || !ngeniusConfigured()) {
    return NextResponse.json({ ok: false, error: "ngenius_unavailable" }, { status: 503 })
  }

  if (!verifyOptionalSecret(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    const parsed = await request.json()
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 })
    }
    body = parsed as Record<string, unknown>
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 })
  }

  const orderObj =
    body.order && typeof body.order === "object" && !Array.isArray(body.order)
      ? (body.order as Record<string, unknown>)
      : null

  const merchantOrderReference =
    str(orderObj?.merchantOrderReference) || str(body.merchantOrderReference)
  const ngeniusOrderRef =
    str(orderObj?.reference) || str(body.orderReference) || str(body.reference)

  if (!merchantOrderReference && !ngeniusOrderRef) {
    return NextResponse.json({ ok: true, ignored: true }, { status: 200 })
  }

  let order = merchantOrderReference ? await getOrderByOrderNumber(merchantOrderReference) : null
  if (!order && ngeniusOrderRef) {
    order = await getOrderByNgeniusRef(ngeniusOrderRef)
  }

  if (!order || order.paymentMethod !== "ngenius") {
    return NextResponse.json({ ok: true, ignored: true }, { status: 200 })
  }

  const ref = ngeniusOrderRef || parseOrderNotes(order.notes).ngenius_order_ref || ""
  if (!ref) {
    return NextResponse.json({ ok: true, status: order.status }, { status: 200 })
  }

  try {
    const remote = await getNgeniusOrderStatus(ref)
    if (!remote) {
      return NextResponse.json({ ok: false, error: "status_unavailable" }, { status: 502 })
    }
    const updated = await applyNgeniusPaymentUpdate(order, remote)
    return NextResponse.json({ ok: true, status: updated.status }, { status: 200 })
  } catch (err) {
    console.error("[v0] N-Genius webhook verification failed:", err)
    return NextResponse.json({ ok: false, error: "verify_failed" }, { status: 502 })
  }
}
