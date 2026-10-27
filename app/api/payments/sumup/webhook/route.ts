import { NextResponse, type NextRequest } from "next/server"
import { getOrderNumberBySumupCheckoutId } from "@/lib/orders/queries"
import { settleSumupCheckout } from "@/lib/payments/sumup-order"

export const dynamic = "force-dynamic"

type SumupEvent = { event_type?: string; payload?: { checkout_id?: string; reference?: string } }

/**
 * SumUp signs nothing on this callback, so it only tells us which checkout to
 * re-check — settleSumupCheckout always re-fetches the checkout from SumUp's
 * own API before marking anything paid.
 */
export async function POST(request: NextRequest) {
  let event: SumupEvent
  try {
    event = (await request.json()) as SumupEvent
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const checkoutId = event.payload?.checkout_id ?? ""
  if (!checkoutId) return NextResponse.json({ ok: true })

  const orderNumber = await getOrderNumberBySumupCheckoutId(checkoutId)
  if (!orderNumber) return NextResponse.json({ ok: true })

  const settled = await settleSumupCheckout(orderNumber, checkoutId)
  if (!settled.ok && settled.reason !== "not_found" && settled.reason !== "not_completed") {
    console.error("[v0] SumUp payment was not settled", orderNumber, settled.reason)
  }
  return NextResponse.json({ ok: true })
}
