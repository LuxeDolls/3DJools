"use server"

import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getProductBySlug } from "@/lib/catalog"
import { createOrder, getOrderByOrderNumber, updateOrderStatus } from "@/lib/orders/queries"
import { sendOrderConfirmationEmail, sendPaymentUnderReviewEmail } from "@/lib/email/order-emails"
import { notifyPaymentSubmitted } from "@/lib/notifications/admin"
import { memberDiscountCents } from "@/lib/discount"
import { computeShippingCents } from "@/lib/shipping"
import type { NewOrderItemRow, OrderStatus, PaymentMethod } from "@/lib/db/schema"

// Prices are authoritative here, never taken from the client — the cart only
// supplies slugs + quantities. Shipping cost is recomputed from lib/shipping
// (single EU/UK shipping method, 5–10 working days) using the destination
// country submitted at checkout; it becomes free automatically once the
// subtotal reaches the threshold.
const MAX_QTY = 20

type CheckoutShipping = "standard"
type CheckoutPayment = "card" | "sepa" | "crypto" | "installments"

// Maps the checkout selector id onto the persisted PaymentMethod enum.
const PAYMENT_METHOD: Record<CheckoutPayment, PaymentMethod> = {
  card: "card",
  sepa: "bank_transfer",
  crypto: "crypto",
  installments: "installments",
}

export type PlaceOrderInput = {
  email: string
  firstName: string
  lastName: string
  address: string
  address2?: string
  city: string
  postalCode: string
  country: string
  phone?: string
  shipping?: CheckoutShipping
  payment: CheckoutPayment
  items: { slug: string; quantity: number; brand?: string; image?: string }[]
}

export type PlaceOrderResult = { ok: true; orderNumber: string } | { ok: false; error: string }

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/**
 * Creates a real order (header + line items) from a checkout submission.
 * Every monetary value is recomputed server-side from the catalog, and the
 * member discount is applied only when there is a valid signed-in session —
 * the client cannot grant itself a discount or set its own prices.
 */
export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const required: [string, string | undefined][] = [
    ["email", input.email],
    ["firstName", input.firstName],
    ["lastName", input.lastName],
    ["address", input.address],
    ["city", input.city],
    ["postalCode", input.postalCode],
    ["country", input.country],
  ]
  for (const [, value] of required) {
    if (!value || !value.trim()) return { ok: false, error: "missing_fields" }
  }
  if (!isValidEmail(input.email)) return { ok: false, error: "invalid_email" }
  if (!input.items?.length) return { ok: false, error: "empty_cart" }
  // Card payment is temporarily unavailable; the checkout UI already disables
  // the option, but guard here too in case the action is called directly.
  if (input.payment === "card") return { ok: false, error: "card_unavailable" }

  // Recompute the cart from the catalog (source of truth for prices).
  const items: Array<Omit<NewOrderItemRow, "id" | "orderId">> = []
  let subtotalCents = 0
  for (const line of input.items) {
    const product = await getProductBySlug(line.slug)
    if (!product) return { ok: false, error: "unknown_product" }
    const qty = Math.max(1, Math.min(MAX_QTY, Math.floor(line.quantity)))
    const lineTotalCents = product.priceCents * qty
    subtotalCents += lineTotalCents
    items.push({
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      brandName: line.brand ?? null,
      image: line.image ?? product.images?.[0] ?? null,
      unitPriceCents: product.priceCents,
      quantity: qty,
      lineTotalCents,
    })
  }
  if (subtotalCents <= 0) return { ok: false, error: "invalid_total" }

  // Member discount depends on a verified server-side session, not the client.
  const session = await auth.api.getSession({ headers: await headers() })
  const userId = session?.user?.id ?? null
  const discountCents = userId ? memberDiscountCents(subtotalCents) : 0

  // Shipping is recomputed too: Belgium gets the domestic rate, every other
  // destination pays the international rate, and both are waived above the
  // free-shipping threshold.
  const shippingCents = computeShippingCents(subtotalCents, input.country)

  const totalCents = subtotalCents - discountCents + shippingCents

  const paymentMethod = PAYMENT_METHOD[input.payment] ?? "card"
  // Card is treated as settled in this preview; offline methods await funds.
  const status: OrderStatus =
    paymentMethod === "bank_transfer" || paymentMethod === "crypto" ? "awaiting_payment" : "paid"

  const order = await createOrder({
    userId,
    email: input.email.trim(),
    status,
    paymentMethod,
    subtotalCents,
    shippingCents,
    totalCents,
    shipping: {
      name: `${input.firstName.trim()} ${input.lastName.trim()}`.trim(),
      address1: input.address.trim(),
      address2: input.address2?.trim() || undefined,
      city: input.city.trim(),
      postalCode: input.postalCode.trim(),
      country: input.country.trim(),
    },
    notes: discountCents > 0 ? `member_discount_cents=${discountCents}` : undefined,
    items,
  })

  // Send the receipt. Never let an email failure break checkout — the order
  // is already committed, so we log and move on (a safe no-op without Resend).
  try {
    await sendOrderConfirmationEmail(order)
  } catch (err) {
    console.error("[v0] Order confirmation email failed:", err)
  }

  return { ok: true, orderNumber: order.orderNumber }
}

export type TrackOrderInput = { orderNumber: string; email: string }
export type TrackOrderResult = { ok: true; orderNumber: string } | { ok: false; error: string }

/**
 * Looks up an order for guests who never created an account. Requiring both
 * the order number and the checkout email (rather than the order number
 * alone) prevents anyone from browsing arbitrary orders by guessing or
 * incrementing order numbers.
 */
export async function trackOrder(input: TrackOrderInput): Promise<TrackOrderResult> {
  const orderNumber = input.orderNumber?.trim()
  const email = input.email?.trim()
  if (!orderNumber || !email) return { ok: false, error: "missing_fields" }
  if (!isValidEmail(email)) return { ok: false, error: "invalid_email" }

  const order = await getOrderByOrderNumber(orderNumber)
  if (!order || order.email.toLowerCase() !== email.toLowerCase()) {
    return { ok: false, error: "not_found" }
  }
  return { ok: true, orderNumber: order.orderNumber }
}

export type MarkOrderPaidResult = { ok: true } | { ok: false; error: string }

/**
 * Called when the customer clicks "I've paid" after seeing the bank/crypto
 * payment instructions. Moves the order into `reviewing_payment` so the
 * customer sees a "we're checking your payment" state and the admin sees it
 * in the queue — this never marks an order as actually paid by itself.
 */
export async function markOrderPaidByCustomer(orderNumber: string): Promise<MarkOrderPaidResult> {
  const order = await getOrderByOrderNumber(orderNumber)
  if (!order) return { ok: false, error: "not_found" }
  if (order.paymentMethod !== "bank_transfer" && order.paymentMethod !== "crypto") {
    return { ok: false, error: "invalid_method" }
  }
  if (order.status !== "awaiting_payment") {
    return { ok: false, error: "invalid_status" }
  }
  await updateOrderStatus(order.id, "reviewing_payment")
  void notifyPaymentSubmitted({ ...order, status: "reviewing_payment" }).catch((err) => {
    console.error("[v0] Payment-submitted admin notification failed:", err)
  })
  try {
    await sendPaymentUnderReviewEmail(order)
  } catch (err) {
    console.error("[v0] Payment-under-review email failed:", err)
  }
  return { ok: true }
}
