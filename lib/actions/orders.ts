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
  updateOrderPaymentMethod,
  updateOrderStatus,
} from "@/lib/orders/queries"
import { sendOrderConfirmationEmail } from "@/lib/email/order-emails"
import { notifyPaymentMethodChanged, notifyPaymentSubmitted } from "@/lib/notifications/admin"
import { blackFridayDiscountCents, memberDiscountCents } from "@/lib/discount"
import { computeShippingCents } from "@/lib/shipping"
import { buildOrderNotes, parseOrderNotes } from "@/lib/orders/notes"
import { CRYPTO_CHECKOUT_ENABLED, isCryptoCoinId } from "@/lib/payments/crypto"
import { toE164Phone } from "@/lib/payments/phone-country"
import { appendStripeSessionId, createStripeCheckout, stripeConfigured } from "@/lib/payments/stripe"
import { appendPaypalOrderId, createPaypalCheckout, paypalConfigured } from "@/lib/payments/paypal"
import { ALPPAY_CHECKOUT_ENABLED } from "@/lib/payments/alppay-availability"
import { isBankTransferCheckoutEnabled } from "@/lib/payments/bank-transfer"
import { squareConfigured } from "@/lib/payments/square"
import { openSquareCheckout } from "@/lib/payments/square-order"
import { sumupConfigured } from "@/lib/payments/sumup"
import { appendSumupCheckoutIds, openSumupCheckout } from "@/lib/payments/sumup-order"
import { alppayConfigured, appendAlppayPaymentId, createAlppayCheckout, formatAlppayIp, formatAlppayPhone } from "@/lib/payments/alppay"
import { alppayHoldUntil } from "@/lib/payments/alppay-limit"
import { isAdultDateOfBirth, isCardPayment, noteSafeName, splitFullName, toIsoDate } from "@/lib/payments/cardholder"
import { isCustomerBlocked } from "@/lib/security/blocked-customers"
import type { NewOrderItemRow, OrderStatus, PaymentMethod } from "@/lib/db/schema"

// Prices are authoritative here, never taken from the client — the cart only
// supplies slugs + quantities. Shipping cost is recomputed from lib/shipping
// (single EU/UK shipping method, 3–7 working days) using the destination
// country submitted at checkout; it becomes free automatically once the
// subtotal reaches the threshold.
const MAX_QTY = 20

type CheckoutShipping = "standard"
type CheckoutPayment = "card" | "alppay" | "paypal" | "square" | "sumup" | "sepa" | "crypto" | "installments"

// Maps the checkout selector id onto the persisted PaymentMethod enum.
const PAYMENT_METHOD: Record<CheckoutPayment, PaymentMethod> = {
  card: "card",
  alppay: "alppay",
  paypal: "paypal",
  square: "square",
  sumup: "sumup",
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
  /** Billing region or state. Required for Visa / Mastercard. */
  region?: string
  /** Cardholder full name. Required for card payments. */
  cardholderName?: string
  /** Cardholder date of birth, YYYY-MM-DD. Required for card payments. */
  dateOfBirth?: string
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

async function requestIp(): Promise<string | null> {
  const h = await headers()
  return formatAlppayIp(h.get("x-forwarded-for") ?? h.get("x-real-ip") ?? "")
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
  if (await isCustomerBlocked(input.email)) return { ok: false, error: "account_blocked" }
  if (input.termsAccepted !== true) return { ok: false, error: "terms_required" }
  if (!input.items?.length) return { ok: false, error: "empty_cart" }
  if (isCardPayment(input.payment)) {
    if (!splitFullName(input.cardholderName ?? "")) return { ok: false, error: "cardholder_required" }
    if (!input.dateOfBirth || !isAdultDateOfBirth(input.dateOfBirth)) return { ok: false, error: "dob_invalid" }
  }
  if (input.payment === "card" && !stripeConfigured()) return { ok: false, error: "card_unavailable" }
  const cardPhone = input.payment === "card" ? toE164Phone(input.phone, input.country.trim()) : null
  if (input.payment === "card" && !cardPhone) return { ok: false, error: "phone_required" }
  if (input.payment === "alppay" && (!ALPPAY_CHECKOUT_ENABLED || !alppayConfigured())) {
    return { ok: false, error: "alppay_unavailable" }
  }
  if (input.payment === "alppay" && !formatAlppayPhone(input.phone, input.country.trim())) {
    return { ok: false, error: "phone_required" }
  }
  if (input.payment === "alppay" && !input.region?.trim()) return { ok: false, error: "region_required" }
  if (input.payment === "alppay" && !(await requestIp())) return { ok: false, error: "ip_required" }
  if (input.payment === "alppay" && (await alppayHoldUntil(input.email))) return { ok: false, error: "alppay_hold" }
  if (input.payment === "paypal" && !paypalConfigured()) return { ok: false, error: "paypal_unavailable" }
  if (input.payment === "square" && !squareConfigured()) return { ok: false, error: "square_unavailable" }
  if (input.payment === "sumup" && !sumupConfigured()) return { ok: false, error: "sumup_unavailable" }

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
  if (input.payment === "crypto" && !CRYPTO_CHECKOUT_ENABLED) {
    return { ok: false, error: "order_failed" }
  }
  if (
    input.payment === "sepa" &&
    !isBankTransferCheckoutEnabled(input.email) &&
    !isBankTransferCheckoutEnabled(session?.user?.email)
  ) {
    return { ok: false, error: "order_failed" }
  }
  const discountCents = userId ? memberDiscountCents(subtotalCents) : 0
  // Black Friday promo applies automatically to every order, member or not.
  const blackFridayCents = blackFridayDiscountCents(subtotalCents)

  // Shipping is recomputed too: the Netherlands gets the domestic rate, every other
  // destination pays the international rate, and both are waived above the
  // free-shipping threshold.
  const shippingCents = computeShippingCents(subtotalCents, input.country)

  const totalCents = subtotalCents - discountCents - blackFridayCents + shippingCents

  const paymentMethod = PAYMENT_METHOD[input.payment] ?? "card"
  // Card, bank transfer and crypto stay unpaid until funds are confirmed.
  const status: OrderStatus =
    paymentMethod === "bank_transfer" ||
    paymentMethod === "crypto" ||
    paymentMethod === "card" ||
    paymentMethod === "alppay" ||
    paymentMethod === "paypal" ||
    paymentMethod === "square" ||
    paymentMethod === "sumup"
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
      black_friday_discount_cents: blackFridayCents > 0 ? String(blackFridayCents) : undefined,
      crypto_coin:
        paymentMethod === "crypto" && input.cryptoCoin && isCryptoCoinId(input.cryptoCoin)
          ? input.cryptoCoin
          : undefined,
      cardholder_name: isCardPayment(input.payment) ? noteSafeName(input.cardholderName ?? "") : undefined,
      date_of_birth: isCardPayment(input.payment) ? toIsoDate(input.dateOfBirth ?? "") ?? undefined : undefined,
      phone: input.payment === "card" ? cardPhone ?? undefined : input.payment === "alppay" ? noteSafeName(input.phone ?? "") : undefined,
      billing_state: input.payment === "alppay" ? noteSafeName(input.region ?? "") : undefined,
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
        phone: cardPhone ?? undefined,
        name: `${input.firstName.trim()} ${input.lastName.trim()}`.trim(),
        address: input.address.trim(),
        city: input.city.trim(),
        postalCode: input.postalCode.trim(),
        country: input.country.trim(),
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
    const holder = splitFullName(input.cardholderName ?? "")
    if (!holder || !input.dateOfBirth) {
      await abandonUnpaidOrder(order.id)
      return { ok: false, error: "cardholder_required" }
    }
    try {
      const checkout = await createAlppayCheckout({
        orderNumber: order.orderNumber,
        amountCents: totalCents,
        locale,
        email: input.email.trim(),
        firstName: holder.firstName,
        lastName: holder.lastName,
      dateOfBirth: input.dateOfBirth ?? "",
      phone: input.phone ?? "",
      ip: (await requestIp()) ?? "",
      address: input.address.trim(),
      city: input.city.trim(),
      postalCode: input.postalCode.trim(),
      country: input.country.trim(),
      state: input.region?.trim() ?? "",
    })
      await mergeOrderNotes(order.id, { alppay_payment_ids: checkout.paymentId })
      paymentUrl = checkout.redirectUrl
    } catch (err) {
      console.error("[v0] AlpPay payment could not start:", err)
      await abandonUnpaidOrder(order.id)
      return { ok: false, error: "alppay_start_failed" }
    }
  }

  if (paymentMethod === "square") {
    const locale = input.locale && isLocale(input.locale) ? input.locale : "en"
    await mergeOrderNotes(order.id, { checkout_locale: locale })
    try {
      const created = await getOrderByOrderNumber(order.orderNumber)
      if (!created) throw new Error("square_missing_order")
      paymentUrl = await openSquareCheckout(created, locale)
    } catch (err) {
      console.error("[v0] Square payment could not start:", err)
      await abandonUnpaidOrder(order.id)
      return { ok: false, error: "square_start_failed" }
    }
  }

  if (paymentMethod === "sumup") {
    const locale = input.locale && isLocale(input.locale) ? input.locale : "en"
    await mergeOrderNotes(order.id, { checkout_locale: locale })
    try {
      const checkout = await openSumupCheckout({
        orderNumber: order.orderNumber,
        amountCents: totalCents,
        locale,
      })
      await mergeOrderNotes(order.id, { sumup_checkout_ids: checkout.checkoutId })
      paymentUrl = checkout.url
    } catch (err) {
      console.error("[v0] SumUp payment could not start:", err)
      await abandonUnpaidOrder(order.id)
      return { ok: false, error: "sumup_start_failed" }
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

export type StartSquarePaymentResult = { ok: true; paymentUrl: string } | { ok: false; error: string }

/** Opens Square's hosted card page for an order that is still awaiting payment. */
export async function startSquarePayment(orderNumber: string, locale: string): Promise<StartSquarePaymentResult> {
  if (!squareConfigured()) return { ok: false, error: "square_unavailable" }
  const order = await getOrderByOrderNumber(orderNumber)
  if (!order || order.paymentMethod !== "square") return { ok: false, error: "not_found" }
  if (order.status !== "awaiting_payment") return { ok: false, error: "invalid_status" }
  const notes = parseOrderNotes(order.notes)
  const safeLocale = isLocale(locale) ? locale : notes.checkout_locale && isLocale(notes.checkout_locale) ? notes.checkout_locale : "en"
  try {
    const paymentUrl = await openSquareCheckout(order, safeLocale)
    await mergeOrderNotes(order.id, { checkout_locale: safeLocale })
    return { ok: true, paymentUrl }
  } catch (err) {
    console.error("[v0] Square payment retry failed:", err)
    return { ok: false, error: "square_start_failed" }
  }
}

export type StartSumupPaymentResult = { ok: true; paymentUrl: string } | { ok: false; error: string }

/** Opens a new SumUp Hosted Checkout page for an order that is still awaiting payment. */
export async function startSumupPayment(orderNumber: string, locale: string): Promise<StartSumupPaymentResult> {
  if (!sumupConfigured()) return { ok: false, error: "sumup_unavailable" }
  const order = await getOrderByOrderNumber(orderNumber)
  if (!order || order.paymentMethod !== "sumup") return { ok: false, error: "not_found" }
  if (order.status !== "awaiting_payment") return { ok: false, error: "invalid_status" }

  const notes = parseOrderNotes(order.notes)
  const safeLocale = isLocale(locale) ? locale : notes.checkout_locale && isLocale(notes.checkout_locale) ? notes.checkout_locale : "en"
  try {
    const checkout = await openSumupCheckout({
      orderNumber: order.orderNumber,
      amountCents: order.totalCents,
      locale: safeLocale,
    })
    await mergeOrderNotes(order.id, {
      sumup_checkout_ids: appendSumupCheckoutIds(notes.sumup_checkout_ids, checkout.checkoutId),
      checkout_locale: safeLocale,
    })
    return { ok: true, paymentUrl: checkout.url }
  } catch (err) {
    console.error("[v0] SumUp payment retry failed:", err)
    return { ok: false, error: "sumup_start_failed" }
  }
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
      phone: toE164Phone(notes.phone, order.shippingCountry ?? "") ?? undefined,
      name: order.shippingName ?? undefined,
      address: order.shippingAddress1 ?? undefined,
      city: order.shippingCity ?? undefined,
      postalCode: order.shippingPostalCode ?? undefined,
      country: order.shippingCountry ?? undefined,
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
export async function startAlppayPayment(
  orderNumber: string,
  locale: string,
  phone?: string,
): Promise<StartAlppayPaymentResult> {
  if (!ALPPAY_CHECKOUT_ENABLED || !alppayConfigured()) return { ok: false, error: "alppay_unavailable" }
  const order = await getOrderByOrderNumber(orderNumber)
  if (!order || order.paymentMethod !== "alppay") return { ok: false, error: "not_found" }
  if (order.status !== "awaiting_payment") return { ok: false, error: "invalid_status" }
  if (await alppayHoldUntil(order.email)) return { ok: false, error: "alppay_hold" }

  const notes = parseOrderNotes(order.notes)
  const safeLocale = isLocale(locale) ? locale : notes.checkout_locale && isLocale(notes.checkout_locale) ? notes.checkout_locale : "en"
  const holder = splitFullName(notes.cardholder_name || order.shippingName || "")
  const firstName = holder?.firstName || "Customer"
  const lastName = holder?.lastName || firstName
  const country = order.shippingCountry ?? ""
  const suppliedPhone = formatAlppayPhone(phone, country) ? phone?.trim() : ""
  const phoneValue = suppliedPhone || notes.phone || ""
  const state = notes.billing_state || order.shippingCity || ""

  try {
    const checkout = await createAlppayCheckout({
      orderNumber: order.orderNumber,
      amountCents: order.totalCents,
      locale: safeLocale,
      email: order.email,
      firstName,
      lastName,
      dateOfBirth: notes.date_of_birth && isAdultDateOfBirth(notes.date_of_birth) ? notes.date_of_birth : "",
      phone: phoneValue,
      ip: (await requestIp()) ?? "",
      address: order.shippingAddress1 ?? "",
      city: order.shippingCity ?? "",
      postalCode: order.shippingPostalCode ?? "",
      country,
      state,
    })
    await mergeOrderNotes(order.id, {
      alppay_payment_ids: appendAlppayPaymentId(notes.alppay_payment_ids, checkout.paymentId),
      checkout_locale: safeLocale,
      phone: formatAlppayPhone(phoneValue, country) ? noteSafeName(phoneValue) : undefined,
      billing_state: state ? noteSafeName(state) : undefined,
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

export type SwitchPaymentMethodResult = { ok: true } | { ok: false; error: string }

// Methods a customer can self-serve switch to from the order page, e.g. after a
// card decline. Crypto and instalments are excluded: crypto is disabled and
// instalments need a separate credit application, not a one-click switch.
const SWITCHABLE_METHODS: Record<PaymentMethod, boolean> = {
  card: true,
  alppay: true,
  paypal: true,
  square: true,
  sumup: true,
  bank_transfer: true,
  crypto: false,
  installments: false,
}

function isMethodAvailable(method: PaymentMethod, email: string): boolean {
  if (method === "card") return stripeConfigured()
  if (method === "alppay") return ALPPAY_CHECKOUT_ENABLED && alppayConfigured()
  if (method === "paypal") return paypalConfigured()
  if (method === "square") return squareConfigured()
  if (method === "sumup") return sumupConfigured()
  if (method === "bank_transfer") return isBankTransferCheckoutEnabled(email)
  return false
}

/**
 * Lets a customer switch an unpaid order to a different payment method, e.g.
 * after a card decline. Only allowed while the order is still unpaid, and only
 * onto a method that is actually available right now.
 */
export async function switchOrderPaymentMethod(orderNumber: string, method: PaymentMethod): Promise<SwitchPaymentMethodResult> {
  if (!SWITCHABLE_METHODS[method]) return { ok: false, error: "invalid_method" }
  const order = await getOrderByOrderNumber(orderNumber)
  if (!order) return { ok: false, error: "not_found" }
  if (order.status !== "awaiting_payment" && order.status !== "reviewing_payment") {
    return { ok: false, error: "invalid_status" }
  }
  if (method === order.paymentMethod) return { ok: true }
  if (!isMethodAvailable(method, order.email)) return { ok: false, error: "method_unavailable" }

  const previousMethod = order.paymentMethod
  const updated = await updateOrderPaymentMethod(order.id, method)
  if (updated) {
    after(() =>
      notifyPaymentMethodChanged(updated, previousMethod).catch((error) => {
        console.error("[v0] Payment-method-change admin notification failed:", error)
      }),
    )
  }
  return { ok: true }
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
