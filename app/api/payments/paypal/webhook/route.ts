import { NextResponse, type NextRequest } from "next/server"
import { like } from "drizzle-orm"
import { db } from "@/lib/db"
import { orders } from "@/lib/db/schema"
import { paypalOrderIdFromEvent, verifyPaypalWebhook } from "@/lib/payments/paypal"
import { settleStoredPaypalOrder } from "@/lib/payments/paypal-order"

export const dynamic = "force-dynamic"

const HANDLED = new Set(["CHECKOUT.ORDER.APPROVED", "CHECKOUT.ORDER.COMPLETED", "PAYMENT.CAPTURE.COMPLETED"])

/** Backup confirmation if the buyer closes PayPal before the return redirect. */
export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  if (!(await verifyPaypalWebhook(rawBody, request.headers))) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  let event: {
    event_type?: string
    resource?: {
      id?: string
      custom_id?: string
      supplementary_data?: { related_ids?: { order_id?: string } }
      purchase_units?: Array<{ custom_id?: string }>
    }
  }
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
  if (!event.event_type || !HANDLED.has(event.event_type)) {
    return NextResponse.json({ ok: true })
  }

  const paypalOrderId = paypalOrderIdFromEvent(event)
  const orderNumber =
    event.resource?.purchase_units?.[0]?.custom_id || event.resource?.custom_id || ""
  if (!paypalOrderId || !orderNumber) return NextResponse.json({ ok: true })

  const [match] = await db
    .select({ id: orders.id })
    .from(orders)
    .where(like(orders.notes, `%paypal_order_ids=%${paypalOrderId}%`))
    .limit(1)
  if (!match) return NextResponse.json({ ok: true })

  try {
    await settleStoredPaypalOrder(orderNumber, paypalOrderId)
  } catch (err) {
    console.error("[v0] PayPal webhook settlement failed:", err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
