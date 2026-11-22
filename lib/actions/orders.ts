"use server"

import { randomBytes } from "node:crypto"
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
import { memberDiscountCents } from "@/lib/discount"
import { computeShippingCents } from "@/lib/shipping"
import { buildOrderNotes, parseOrderNotes } from "@/lib/orders/notes"
import { CRYPTO_CHECKOUT_ENABLED, isCryptoCoinId } from "@/lib/payments/crypto"
import {
  ZENTHORYX_CHECKOUT_ENABLED,
  appendProviderOrderId as appendZenthoryxOrderId,
  aviagramConfigured,
  createZenthoryxCardForm,
} from "@/lib/payments/aviagram"
import {
  OPEN_BANKING_CHECKOUT_ENABLED,
  appendProviderOrderId as appendTrapayOrderId,
  createCardForm as createTrapayCardForm,
  trapayConfigured,
} from "@/lib/payments/trapay"
import {
  NGENIUS_CHECKOUT_ENABLED,
  createNgeniusHostedOrder,
  ngeniusConfigured,
} from "@/lib/payments/ngenius"
import { appendPaypalOrderId, createPaypalCheckout, paypalConfigured } from "@/lib/payments/paypal"
import { isBankTransferCheckoutEnabled } from "@/lib/payments/bank-transfer"
import { INSTALLMENTS_CHECKOUT_ENABLED } from "@/lib/installments"
import { noteSafeName } from "@/lib/payments/cardholder"
import {
  blockIpAddress,
  checkCustomerBlock,
  extractClientRequestMeta,
} from "@/lib/security/blocked-customers"
import type { NewOrderItemRow, OrderStatus, PaymentMethod } from "@/lib/db/schema"

const MAX_QTY = 20

type CheckoutShipping = "standard"
type CheckoutPayment =
  | "card"
  | "ngenius"
  | "open_banking"
  | "paypal"
  | "sepa"
  | "crypto"
  | "installments"

const PAYMENT_METHOD: Record<CheckoutPayment, PaymentMethod> = {
  card: "card",
  ngenius: "ngenius",
  open_banking: "open_banking",
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
  region?: string
  cardholderName?: string
  dateOfBirth?: string
  shipping?: CheckoutShipping
  payment: CheckoutPayment
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
  const clientMeta = extractClientRequestMeta(await headers())
  const blockCheck = await checkCustomerBlock({
    email: input.email,
    ip: clientMeta.ip,
    firstName: input.firstName,
    lastName: input.lastName,
    address: input.address,
    city: input.city,
    postalCode: input.postalCode,
    country: input.country,
  })
  if (blockCheck.blocked) return { ok: false, error: "account_blocked" }
  if (input.termsAccepted !== true) return { ok: false, error: "terms_required" }
  if (!input.items?.length) return { ok: false, error: "empty_cart" }
  const cardConfigured = ZENTHORYX_CHECKOUT_ENABLED && aviagramConfigured()
  const ngeniusReady = NGENIUS_CHECKOUT_ENABLED && ngeniusConfigured()
  const openBankingConfigured = OPEN_BANKING_CHECKOUT_ENABLED && trapayConfigured()
  if (input.payment === "card" && !cardConfigured) return { ok: false, error: "card_unavailable" }
  if (input.payment === "ngenius" && !ngeniusReady) return { ok: false, error: "ngenius_unavailable" }
  if (input.payment === "open_banking" && !openBankingConfigured) {
    return { ok: false, error: "open_banking_unavailable" }
  }
  if (input.payment === "paypal" && !paypalConfigured()) return { ok: false, error: "paypal_unavailable" }

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

  const session = await auth.api.getSession({ headers: await headers() })
  const userId = session?.user?.id ?? null
  if (input.payment === "crypto" && !CRYPTO_CHECKOUT_ENABLED) {
    return { ok: false, error: "order_failed" }
  }
  if (input.payment === "installments" && !INSTALLMENTS_CHECKOUT_ENABLED) {
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
  const shippingCents = computeShippingCents(subtotalCents, input.country)
  const totalCents = subtotalCents - discountCents + shippingCents

  const paymentMethod = PAYMENT_METHOD[input.payment] ?? "card"
  const status: OrderStatus =
    paymentMethod === "bank_transfer" ||
    paymentMethod === "crypto" ||
    paymentMethod === "card" ||
    paymentMethod === "ngenius" ||
    paymentMethod === "open_banking" ||
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
      phone: input.phone?.trim() ? noteSafeName(input.phone) : undefined,
      client_ip: clientMeta.ip ?? undefined,
      client_ip_country: clientMeta.ipCountry ?? undefined,
    }),
    items,
  })

  let paymentUrl: string | undefined
  if (paymentMethod === "card") {
    const locale = input.locale && isLocale(input.locale) ? input.locale : "en"
    try {
      const webhookToken = randomBytes(32).toString("hex")
      await mergeOrderNotes(order.id, {
        aviagram_webhook_token: webhookToken,
        checkout_locale: locale,
      })
      const form = await createZenthoryxCardForm({
        orderNumber: order.orderNumber,
        amountCents: totalCents,
        locale,
        webhookToken,
      })
      await mergeOrderNotes(order.id, { aviagram_order_ids: form.providerOrderId })
      paymentUrl = form.redirectUrl
    } catch (err) {
      console.error("[v0] Card payment could not start:", err)
      await abandonUnpaidOrder(order.id)
      return { ok: false, error: "card_start_failed" }
    }
  }

  if (paymentMethod === "ngenius") {
    const locale = input.locale && isLocale(input.locale) ? input.locale : "en"
    const customerName = `${input.firstName.trim()} ${input.lastName.trim()}`.trim()
    try {
      const hosted = await createNgeniusHostedOrder({
        orderNumber: order.orderNumber,
        amountCents: totalCents,
        locale,
        email: input.email.trim(),
        shippingName: customerName || undefined,
        address1: input.address.trim(),
        city: input.city.trim(),
      })
      await mergeOrderNotes(order.id, {
        checkout_locale: locale,
        ngenius_order_ref: hosted.ngeniusOrderRef,
        ngenius_aed_minor_units: String(hosted.aedMinorUnits),
      })
      paymentUrl = hosted.paymentUrl
    } catch (err) {
      console.error("[v0] N-Genius payment could not start:", err)
      await abandonUnpaidOrder(order.id)
      return { ok: false, error: "ngenius_start_failed" }
    }
  }

  if (paymentMethod === "open_banking") {
    const locale = input.locale && isLocale(input.locale) ? input.locale : "en"
    const customerName = `${input.firstName.trim()} ${input.lastName.trim()}`.trim()
    try {
      await mergeOrderNotes(order.id, {
        checkout_locale: locale,
      })
      const form = await createTrapayCardForm({
        orderNumber: order.orderNumber,
        amountCents: totalCents,
        locale,
        customerEmail: input.email.trim(),
        customerName: customerName || undefined,
      })
      await mergeOrderNotes(order.id, { trapay_payment_ids: form.providerOrderId })
      paymentUrl = form.redirectUrl
    } catch (err) {
      console.error("[v0] Open Banking payment could not start:", err)
      await abandonUnpaidOrder(order.id)
      return { ok: false, error: "open_banking_start_failed" }
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

  try {
    await sendOrderConfirmationEmail(order)
  } catch (err) {
    console.error("[v0] Order confirmation email failed:", err)
  }

  return { ok: true, orderNumber: order.orderNumber, paymentUrl }
}

export type StartCardPaymentResult = { ok: true; paymentUrl: string } | { ok: false; error: string }

/** Opens a new hosted N-Genius payment page for an order awaiting payment. */
export async function startNgeniusPayment(
  orderNumber: string,
  locale: string,
): Promise<StartCardPaymentResult> {
  if (!NGENIUS_CHECKOUT_ENABLED || !ngeniusConfigured()) {
    return { ok: false, error: "ngenius_unavailable" }
  }
  const order = await getOrderByOrderNumber(orderNumber)
  if (!order || order.paymentMethod !== "ngenius") return { ok: false, error: "not_found" }
  if (order.status !== "awaiting_payment") return { ok: false, error: "invalid_status" }

  const notes = parseOrderNotes(order.notes)
  const safeLocale = isLocale(locale)
    ? locale
    : notes.checkout_locale && isLocale(notes.checkout_locale)
      ? notes.checkout_locale
      : "en"

  try {
    const hosted = await createNgeniusHostedOrder({
      orderNumber: order.orderNumber,
      amountCents: order.totalCents,
      locale: safeLocale,
      email: order.email,
      shippingName: order.shippingName,
      address1: order.shippingAddress1,
      city: order.shippingCity,
    })
    await mergeOrderNotes(order.id, {
      checkout_locale: safeLocale,
      ngenius_order_ref: hosted.ngeniusOrderRef,
      ngenius_aed_minor_units: String(hosted.aedMinorUnits),
      ngenius_last_status: undefined,
      ngenius_declined_reason: undefined,
    })
    return { ok: true, paymentUrl: hosted.paymentUrl }
  } catch (err) {
    console.error("[v0] N-Genius payment retry failed:", err)
    return { ok: false, error: "ngenius_start_failed" }
  }
}

/** Opens a new hosted card form (Zenthoryx) for an order that is still awaiting payment. */
export async function startCardPayment(orderNumber: string, locale: string): Promise<StartCardPaymentResult> {
  if (!ZENTHORYX_CHECKOUT_ENABLED || !aviagramConfigured()) {
    return { ok: false, error: "card_unavailable" }
  }
  const order = await getOrderByOrderNumber(orderNumber)
  if (!order || order.paymentMethod !== "card") return { ok: false, error: "not_found" }
  if (order.status !== "awaiting_payment") return { ok: false, error: "invalid_status" }

  const notes = parseOrderNotes(order.notes)
  const safeLocale = isLocale(locale)
    ? locale
    : notes.checkout_locale && isLocale(notes.checkout_locale)
      ? notes.checkout_locale
      : "en"

  try {
    const existingToken = notes.aviagram_webhook_token ?? ""
    const webhookToken = /^[a-f0-9]{64}$/.test(existingToken) ? existingToken : randomBytes(32).toString("hex")
    if (webhookToken !== notes.aviagram_webhook_token) {
      await mergeOrderNotes(order.id, { aviagram_webhook_token: webhookToken, checkout_locale: safeLocale })
    }
    const form = await createZenthoryxCardForm({
      orderNumber: order.orderNumber,
      amountCents: order.totalCents,
      locale: safeLocale,
      webhookToken,
    })
    await mergeOrderNotes(order.id, {
      aviagram_order_ids: appendZenthoryxOrderId(notes.aviagram_order_ids, form.providerOrderId),
      aviagram_last_status: undefined,
      aviagram_declined_reason: undefined,
      checkout_locale: safeLocale,
    })
    return { ok: true, paymentUrl: form.redirectUrl }
  } catch (err) {
    console.error("[v0] Card payment retry failed:", err)
    return { ok: false, error: "card_start_failed" }
  }
}

export type StartOpenBankingPaymentResult = { ok: true; paymentUrl: string } | { ok: false; error: string }

/** Opens a new hosted Open Banking (Trapay) session for an order awaiting payment. */
export async function startOpenBankingPayment(
  orderNumber: string,
  locale: string,
): Promise<StartOpenBankingPaymentResult> {
  if (!OPEN_BANKING_CHECKOUT_ENABLED || !trapayConfigured()) {
    return { ok: false, error: "open_banking_unavailable" }
  }
  const order = await getOrderByOrderNumber(orderNumber)
  if (!order || order.paymentMethod !== "open_banking") return { ok: false, error: "not_found" }
  if (order.status !== "awaiting_payment") return { ok: false, error: "invalid_status" }

  const notes = parseOrderNotes(order.notes)
  const safeLocale = isLocale(locale)
    ? locale
    : notes.checkout_locale && isLocale(notes.checkout_locale)
      ? notes.checkout_locale
      : "en"

  try {
    const form = await createTrapayCardForm({
      orderNumber: order.orderNumber,
      amountCents: order.totalCents,
      locale: safeLocale,
      customerEmail: order.email,
      customerName: order.shippingName ?? undefined,
    })
    await mergeOrderNotes(order.id, {
      trapay_payment_ids: appendTrapayOrderId(notes.trapay_payment_ids, form.providerOrderId),
      trapay_last_status: undefined,
      trapay_declined_reason: undefined,
      checkout_locale: safeLocale,
    })
    return { ok: true, paymentUrl: form.redirectUrl }
  } catch (err) {
    console.error("[v0] Open Banking payment retry failed:", err)
    return { ok: false, error: "open_banking_start_failed" }
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

const SWITCHABLE_METHODS: Partial<Record<PaymentMethod, boolean>> = {
  card: true,
  ngenius: true,
  open_banking: true,
  paypal: true,
  bank_transfer: true,
}

function isMethodAvailable(method: PaymentMethod, email: string): boolean {
  if (method === "card") return ZENTHORYX_CHECKOUT_ENABLED && aviagramConfigured()
  if (method === "ngenius") return NGENIUS_CHECKOUT_ENABLED && ngeniusConfigured()
  if (method === "open_banking") return OPEN_BANKING_CHECKOUT_ENABLED && trapayConfigured()
  if (method === "paypal") return paypalConfigured()
  if (method === "bank_transfer") return isBankTransferCheckoutEnabled(email)
  return false
}

export async function switchOrderPaymentMethod(orderNumber: string, method: PaymentMethod): Promise<SwitchPaymentMethodResult> {
  if (!SWITCHABLE_METHODS[method]) return { ok: false, error: "invalid_method" }
  const order = await getOrderByOrderNumber(orderNumber)
  if (!order) return { ok: false, error: "not_found" }
  const clientMeta = extractClientRequestMeta(await headers())
  const existingNotes = parseOrderNotes(order.notes)
  if (clientMeta.ip && !existingNotes.client_ip) {
    await mergeOrderNotes(order.id, {
      client_ip: clientMeta.ip,
      client_ip_country: clientMeta.ipCountry ?? undefined,
    })
  }
  const blockCheck = await checkCustomerBlock({
    email: order.email,
    ip: clientMeta.ip,
    fullName: order.shippingName,
    address: order.shippingAddress1,
    city: order.shippingCity,
    postalCode: order.shippingPostalCode,
    country: order.shippingCountry,
    orderNumber: order.orderNumber,
  })
  if (existingNotes.blocked_reason || blockCheck.blocked) {
    if (clientMeta.ip) {
      await blockIpAddress(clientMeta.ip, {
        reason: existingNotes.blocked_reason || blockCheck.reason || "Blocked order activity",
        orderNumber: order.orderNumber,
        email: order.email,
      })
    }
    return { ok: false, error: "account_blocked" }
  }
  if (order.status !== "awaiting_payment" && order.status !== "reviewing_payment") {
    return { ok: false, error: "invalid_status" }
  }
  if (method === order.paymentMethod) return { ok: true }
  if (!isMethodAvailable(method, order.email)) {
    return { ok: false, error: "method_unavailable" }
  }

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

export async function markOrderPaidByCustomer(orderNumber: string): Promise<MarkOrderPaidResult> {
  const trimmed = orderNumber?.trim()
  if (!trimmed) return { ok: false, error: "missing_order" }

  const order = await getOrderByOrderNumber(trimmed)
  if (!order) return { ok: false, error: "not_found" }

  const clientMeta = extractClientRequestMeta(await headers())
  const existingNotes = parseOrderNotes(order.notes)
  if (clientMeta.ip && !existingNotes.client_ip) {
    await mergeOrderNotes(order.id, {
      client_ip: clientMeta.ip,
      client_ip_country: clientMeta.ipCountry ?? undefined,
    })
  }
  const blockCheck = await checkCustomerBlock({
    email: order.email,
    ip: clientMeta.ip,
    fullName: order.shippingName,
    address: order.shippingAddress1,
    city: order.shippingCity,
    postalCode: order.shippingPostalCode,
    country: order.shippingCountry,
    orderNumber: order.orderNumber,
  })
  if (existingNotes.blocked_reason || blockCheck.blocked) {
    if (clientMeta.ip) {
      await blockIpAddress(clientMeta.ip, {
        reason: existingNotes.blocked_reason || blockCheck.reason || "Blocked order activity",
        orderNumber: order.orderNumber,
        email: order.email,
      })
    }
    return { ok: false, error: "account_blocked" }
  }

  if (order.paymentMethod !== "bank_transfer" && order.paymentMethod !== "crypto") {
    return { ok: false, error: "invalid_method" }
  }
  if (order.status === "reviewing_payment" || order.status === "paid" || order.status === "processing" || order.status === "shipped" || order.status === "delivered") {
    return { ok: true }
  }
  if (order.status !== "awaiting_payment" && order.status !== "pending") {
    return { ok: false, error: "invalid_status" }
  }

  await updateOrderStatus(order.id, "reviewing_payment")
  after(() =>
    notifyPaymentSubmitted({ ...order, status: "reviewing_payment" }).catch((error) => {
      console.error("[v0] Payment-submitted admin notification failed:", error)
    }),
  )
  return { ok: true }
}
