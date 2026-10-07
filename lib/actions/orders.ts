"use server"

import { headers } from "next/headers"
import { after } from "next/server"
import { auth } from "@/lib/auth"
import { getProductBySlug } from "@/lib/catalog"
import { isLocale } from "@/lib/i18n/config"
import {
  abandonUnpaidOrder,
  createOrder,
  getOrderByOrderNumber,
  mergeOrderNotes,
  updateOrderStatus,
} from "@/lib/orders/queries"
import { sendOrderConfirmationEmail } from "@/lib/email/order-emails"
import { notifyPaymentSubmitted } from "@/lib/notifications/admin"
import { memberDiscountCents } from "@/lib/discount"
import { computeShippingCents } from "@/lib/shipping"
import { buildOrderNotes, parseOrderNotes } from "@/lib/orders/notes"
import { isCryptoCoinId } from "@/lib/payments/crypto"
import { appendStripeSessionId, createStripeCheckout, stripeConfigured } from "@/lib/payments/stripe"
import { appendPaypalOrderId, createPaypalCheckout, paypalConfigured } from "@/lib/payments/paypal"
import { alppayConfigured, appendAlppayPaymentId, createAlppayCheckout } from "@/lib/payments/alppay"
import type { NewOrderItemRow, OrderStatus, PaymentMethod } from "@/lib/db/schema"

// Prices are authoritative here, never taken from the client — the cart only
// supplies slugs + quantities. Shipping cost is recomputed from lib/shipping
// (single EU/UK shipping method, 3–6 working days) using the destination
// country submitted at checkout; it becomes free automatically once the
// subtotal reaches the threshold.
const MAX_QTY = 20

type CheckoutShipping = "standard"
type CheckoutPayment = "card" | "alppay" | "paypal" | "sepa" | "crypto" | "installments"

// Maps the checkout selector id onto the persisted PaymentMethod enum.
const PAYMENT_METHOD: Record<CheckoutPayment, PaymentMethod> = {
  card: "card",
  alppay: "alppay",
  paypal: "paypal",
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
  /** Selected coin/network id when payment is "crypto" (see lib/payments/crypto.ts). */
  cryptoCoin?: string
  termsAccepted?: boolean
  locale?: string
  items: { slug: string; quantity: number; brand?: string; image?: string }[]
}

export type PlaceOrderResult =
  | { ok: true; orderNumber: string; paymentUrl?: string }
  | { ok: false; error: string }

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
  if (input.termsAccepted !== true) return { ok: false, error: "terms_required" }
  if (!input.items?.length) return { ok: false, error: "empty_cart" }
  if (input.payment === "card" && !stripeConfigured()) return { ok: false, error: "card_unavailable" }
  if (input.payment === "alppay" && !alppayConfigured()) return { ok: false, error: "alppay_unavailable" }
  if (input.payment === "paypal" && !paypalConfigured()) return { ok: false, error: "paypal_unavailable" }

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
  // Card, bank transfer and crypto stay unpaid until funds are confirmed.
  const status: OrderStatus =
    paymentMethod === "bank_transfer" ||
    paymentMethod === "crypto" ||
    paymentMethod === "card" ||
    paymentMethod === "alppay" ||
    paymentMethod === "paypal"
      ? "awaiting_payment"
      : "paid"

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
    notes: buildOrderNotes({
      member_discount_cents: discountCents > 0 ? String(discountCents) : undefined,
      crypto_coin:
        paymentMethod === "crypto" && input.cryptoCoin && isCryptoCoinId(input.cryptoCoin)
          ? input.cryptoCoin
          : undefined,
    }),
    items,
  })

  let paymentUrl: string | undefined
  if (paymentMethod === "card") {
    const locale = input.locale && isLocale(input.locale) ? input.locale : "en"
    await mergeOrderNotes(order.id, { checkout_locale: locale })
    try {
      const checkout = await createStripeCheckout({
        orderNumber: order.orderNumber,
        amountCents: totalCents,
        locale,
        email: input.email.trim(),
      })
      await mergeOrderNotes(order.id, { stripe_session_ids: checkout.sessionId })
      paymentUrl = checkout.url
    } catch (err) {
      console.error("[v0] Card payment could not start:", err)
      await abandonUnpaidOrder(order.id)
      return { ok: false, error: "card_start_failed" }
    }
  }

  if (paymentMethod === "alppay") {
    const locale = input.locale && isLocale(input.locale) ? input.locale : "en"
    await mergeOrderNotes(order.id, { checkout_locale: locale })
    try {
      const checkout = await createAlppayCheckout({
        orderNumber: order.orderNumber,
        amountCents: totalCents,
        locale,
        email: input.email.trim(),
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        phone: input.phone,
        address: input.address.trim(),
        city: input.city.trim(),
        postalCode: input.postalCode.trim(),
        country: input.country.trim(),
      })
      await mergeOrderNotes(order.id, { alppay_payment_ids: checkout.paymentId })
      paymentUrl = checkout.redirectUrl
    } catch (err) {
      console.error("[v0] AlpPay payment could not start:", err)
      await abandonUnpaidOrder(order.id)
      return { ok: false, error: "alppay_start_failed" }
    }
  }

  if (paymentMethod === "paypal") {
    const locale = input.locale && isLocale(input.locale) ? input.locale : "en"
    await mergeOrderNotes(order.id, { checkout_locale: locale })
    try {
      const checkout = await createPaypalCheckout({
        orderNumber: order.orderNumber,
        amountCents: totalCents,
        locale,
      })
      await mergeOrderNotes(order.id, { paypal_order_ids: checkout.paypalOrderId })
      paymentUrl = checkout.approveUrl
    } catch (err) {
      console.error("[v0] PayPal payment could not start:", err)
      await abandonUnpaidOrder(order.id)
      return { ok: false, error: "paypal_start_failed" }
    }
  }

  // Send the receipt. Never let an email failure break checkout — the order
  // is already committed, so we log and move on (a safe no-op without Resend).
  try {
    await sendOrderConfirmationEmail(order)
  } catch (err) {
    console.error("[v0] Order confirmation email failed:", err)
  }

  return { ok: true, orderNumber: order.orderNumber, paymentUrl }
}

export type StartCardPaymentResult = { ok: true; paymentUrl: string } | { ok: false; error: string }

/** Opens a new hosted card form for an order that is still awaiting payment. */
export async function startCardPayment(orderNumber: string, locale: string): Promise<StartCardPaymentResult> {
  if (!stripeConfigured()) return { ok: false, error: "card_unavailable" }
  const order = await getOrderByOrderNumber(orderNumber)
  if (!order || order.paymentMethod !== "card") return { ok: false, error: "not_found" }
  if (order.status !== "awaiting_payment") return { ok: false, error: "invalid_status" }

  const notes = parseOrderNotes(order.notes)
  const safeLocale = isLocale(locale) ? locale : notes.checkout_locale && isLocale(notes.checkout_locale) ? notes.checkout_locale : "en"

  try {
    const checkout = await createStripeCheckout({
      orderNumber: order.orderNumber,
      amountCents: order.totalCents,
      locale: safeLocale,
      email: order.email,
    })
    await mergeOrderNotes(order.id, {
      stripe_session_ids: appendStripeSessionId(notes.stripe_session_ids, checkout.sessionId),
      checkout_locale: safeLocale,
    })
    return { ok: true, paymentUrl: checkout.url }
  } catch (err) {
    console.error("[v0] Card payment retry failed:", err)
    return { ok: false, error: "card_start_failed" }
  }
}

export type StartAlppayPaymentResult = { ok: true; paymentUrl: string } | { ok: false; error: string }

/** Opens a new hosted Visa/Mastercard page for an order that is still awaiting payment. */
export async function startAlppayPayment(orderNumber: string, locale: string): Promise<StartAlppayPaymentResult> {
  if (!alppayConfigured()) return { ok: false, error: "alppay_unavailable" }
  const order = await getOrderByOrderNumber(orderNumber)
  if (!order || order.paymentMethod !== "alppay") return { ok: false, error: "not_found" }
  if (order.status !== "awaiting_payment") return { ok: false, error: "invalid_status" }

  const notes = parseOrderNotes(order.notes)
  const safeLocale = isLocale(locale) ? locale : notes.checkout_locale && isLocale(notes.checkout_locale) ? notes.checkout_locale : "en"
  const name = (order.shippingName ?? "").trim().split(/\s+/)
  const firstName = name[0] || "Customer"
  const lastName = name.slice(1).join(" ") || firstName

  try {
    const checkout = await createAlppayCheckout({
      orderNumber: order.orderNumber,
      amountCents: order.totalCents,
      locale: safeLocale,
      email: order.email,
      firstName,
      lastName,
      address: order.shippingAddress1 ?? "",
      city: order.shippingCity ?? "",
      postalCode: order.shippingPostalCode ?? "",
      country: order.shippingCountry ?? "",
    })
    await mergeOrderNotes(order.id, {
      alppay_payment_ids: appendAlppayPaymentId(notes.alppay_payment_ids, checkout.paymentId),
      checkout_locale: safeLocale,
    })
    return { ok: true, paymentUrl: checkout.redirectUrl }
  } catch (err) {
    console.error("[v0] AlpPay payment retry failed:", err)
    return { ok: false, error: "alppay_start_failed" }
  }
}

export type StartPaypalPaymentResult = { ok: true; paymentUrl: string } | { ok: false; error: string }

/** Opens a new PayPal approval for an order that is still awaiting payment. */
export async function startPaypalPayment(orderNumber: string, locale: string): Promise<StartPaypalPaymentResult> {
  if (!paypalConfigured()) return { ok: false, error: "paypal_unavailable" }
  const order = await getOrderByOrderNumber(orderNumber)
  if (!order || order.paymentMethod !== "paypal") return { ok: false, error: "not_found" }
  if (order.status !== "awaiting_payment" && order.status !== "reviewing_payment") {
    return { ok: false, error: "invalid_status" }
  }

  const notes = parseOrderNotes(order.notes)
  const safeLocale = isLocale(locale) ? locale : notes.checkout_locale && isLocale(notes.checkout_locale) ? notes.checkout_locale : "en"
  try {
    const checkout = await createPaypalCheckout({
      orderNumber: order.orderNumber,
      amountCents: order.totalCents,
      locale: safeLocale,
    })
    await mergeOrderNotes(order.id, {
      paypal_order_ids: appendPaypalOrderId(notes.paypal_order_ids, checkout.paypalOrderId),
      checkout_locale: safeLocale,
    })
    return { ok: true, paymentUrl: checkout.approveUrl }
  } catch (err) {
    console.error("[v0] PayPal payment retry failed:", err)
    return { ok: false, error: "paypal_start_failed" }
  }
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
  // Scheduled via after(): a bare fire-and-forget promise can get dropped the
  // moment the response is sent on Vercel's serverless runtime, which caused
  // this notification (and its Telegram alert) to only arrive intermittently.
  after(() =>
    notifyPaymentSubmitted({ ...order, status: "reviewing_payment" }).catch((err) => {
      console.error("[v0] Payment-submitted admin notification failed:", err)
    }),
  )
  return { ok: true }
}
