import "server-only"

import { sendEmail, type SendResult } from "@/lib/email/send"
import { BANK_TRANSFER_ACCOUNT } from "@/lib/payments/bank-transfer"
import { PAYPAL_CHECKOUT_ENABLED } from "@/lib/payments/paypal-availability"
import { getCryptoCoinOption } from "@/lib/payments/crypto"
import { parseOrderNotes } from "@/lib/orders/notes"
import type { OrderWithItems } from "@/lib/orders/queries"

function euros(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`
}

function paypalAwaitingText(totalCents: number): string {
  return PAYPAL_CHECKOUT_ENABLED
    ? `PayPal payment of ${euros(totalCents)} is not confirmed yet. Complete it from your order page. If you have already paid, wait for the status to update and do not pay twice.`
    : `PayPal is temporarily unavailable, so the payment of ${euros(totalCents)} cannot be completed that way right now. If you have already paid, wait for the status to update and do not pay twice.`
}

function paypalReminderText(totalCents: number): string {
  return PAYPAL_CHECKOUT_ENABLED
    ? `If you haven't approved the PayPal payment of ${euros(totalCents)} yet, open your order page and continue to PayPal. If you have already paid, wait for the status to update and do not pay twice.`
    : `PayPal is temporarily unavailable, so this order cannot be paid that way right now. If you have already paid ${euros(totalCents)}, wait for the status to update and do not pay twice.`
}

function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ??
    ""
  )
}

const PAYMENT_LABELS: Record<string, string> = {
  card: "Card",
  paypal: "PayPal",
  bank_transfer: "Bank transfer (SEPA)",
  crypto: "Cryptocurrency",
  installments: "Installments",
}

// The member discount is persisted on the order as `member_discount_cents=NNN`
// in the notes field; parse it back out so the receipt can show the line.
function parseMemberDiscountCents(notes: string | null): number {
  if (!notes) return 0
  const match = notes.match(/member_discount_cents=(\d+)/)
  return match ? Number.parseInt(match[1], 10) : 0
}

/**
 * Send the customer a receipt right after checkout: every line item, the full
 * price breakdown (subtotal, member discount, shipping, total), the shipping
 * address and payment method. For offline payments (SEPA) it repeats the
 * "include your order number" reminder. Safe no-op until Resend is configured.
 */
export async function sendOrderConfirmationEmail(order: OrderWithItems): Promise<SendResult> {
  const base = siteUrl()
  const orderLink = base ? `${base}/en/order/${order.orderNumber}` : ""
  const discountCents = parseMemberDiscountCents(order.notes)
  const paymentLabel = PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod
  const awaitingPayment = order.status === "awaiting_payment"
  const isSepa = order.paymentMethod === "bank_transfer"
  const isCrypto = order.paymentMethod === "crypto"
  const isCard = order.paymentMethod === "card"
  const isPaypal = order.paymentMethod === "paypal"
  // Same coin/network the customer actually selected at checkout (see lib/payments/crypto.ts),
  // persisted on the order as `crypto_coin=<id>` in the notes field.
  const cryptoCoin = getCryptoCoinOption(parseOrderNotes(order.notes).crypto_coin)

  const addressLines = [
    order.shippingName,
    order.shippingAddress1,
    order.shippingAddress2,
    [order.shippingPostalCode, order.shippingCity].filter(Boolean).join(" "),
    order.shippingCountry,
  ].filter((line) => line && line.trim())

  const subject = `Your 3DJools order confirmation — ${order.orderNumber}`

  const itemsText = order.items
    .map((i) => `- ${i.productName} × ${i.quantity} — ${euros(i.lineTotalCents)}`)
    .join("\n")

  const totalsText = [
    `Subtotal: ${euros(order.subtotalCents)}`,
    discountCents > 0 ? `Member discount: -${euros(discountCents)}` : null,
    `Shipping: ${order.shippingCents === 0 ? "Free" : euros(order.shippingCents)}`,
    `Total: ${euros(order.totalCents)}`,
  ]
    .filter((line) => line !== null)
    .join("\n")

  const text = [
    `Thank you for your order, ${order.shippingName ?? ""}!`.trim(),
    `Order ${order.orderNumber} — ${new Date(order.createdAt).toLocaleDateString("en-GB")}`,
    "",
    "Items:",
    itemsText,
    "",
    totalsText,
    "",
    `Payment: ${paymentLabel}`,
    awaitingPayment && isSepa
      ? `\nPlease transfer ${euros(order.totalCents)} and include your order number ${order.orderNumber} as the payment reference.\nName: ${BANK_TRANSFER_ACCOUNT.accountName}\nIBAN: ${BANK_TRANSFER_ACCOUNT.iban}\nBIC: ${BANK_TRANSFER_ACCOUNT.bic}`
      : null,
    awaitingPayment && isCrypto
      ? `\nPlease send the equivalent of ${euros(order.totalCents)} to our wallet and include your order number ${order.orderNumber} in your records.\nNetwork: ${cryptoCoin.coinLabel} · ${cryptoCoin.network}\nAddress: ${cryptoCoin.address}`
      : null,
    awaitingPayment && isCard
      ? `\nCard payment of ${euros(order.totalCents)} is not confirmed yet. Complete it from your order page. If you have already paid, wait for the status to update and do not pay twice.`
      : null,
    awaitingPayment && isPaypal
      ? `\n${paypalAwaitingText(order.totalCents)}`
      : null,
    addressLines.length ? `\nShipping to:\n${addressLines.join("\n")}` : null,
    orderLink ? `\nView your order: ${orderLink}` : null,
  ]
    .filter((line) => line !== null)
    .join("\n")

  const itemsHtml = order.items
    .map(
      (i) =>
        `<tr><td style="padding:8px 0;color:#111">${i.productName} <span style="color:#888">× ${i.quantity}</span></td><td style="padding:8px 0;text-align:right;color:#111">${euros(
          i.lineTotalCents,
        )}</td></tr>`,
    )
    .join("")

  const totalsHtml = [
    `<tr><td style="padding:4px 0;color:#555">Subtotal</td><td style="padding:4px 0;text-align:right;color:#111">${euros(order.subtotalCents)}</td></tr>`,
    discountCents > 0
      ? `<tr><td style="padding:4px 0;color:#555">Member discount</td><td style="padding:4px 0;text-align:right;color:#0a7d33">-${euros(discountCents)}</td></tr>`
      : "",
    `<tr><td style="padding:4px 0;color:#555">Shipping</td><td style="padding:4px 0;text-align:right;color:#111">${order.shippingCents === 0 ? "Free" : euros(order.shippingCents)}</td></tr>`,
    `<tr><td style="padding:12px 0 0;font-weight:700;color:#111;border-top:1px solid #eee">Total</td><td style="padding:12px 0 0;text-align:right;font-weight:700;color:#111;border-top:1px solid #eee">${euros(order.totalCents)}</td></tr>`,
  ].join("")

  const sepaHtml =
    awaitingPayment && isSepa
      ? `<div style="background:#fff7e6;border:1px solid #ffe0a3;border-radius:8px;padding:16px;margin-bottom:20px">
      <p style="margin:0 0 8px;font-size:14px;color:#7a4b00">Please transfer <strong>${euros(order.totalCents)}</strong> and include your order number <strong>${order.orderNumber}</strong> as the payment reference so we can match your payment.</p>
        <p style="margin:0;font-size:13px;color:#7a4b00;font-family:monospace">Name: ${BANK_TRANSFER_ACCOUNT.accountName} · IBAN: ${BANK_TRANSFER_ACCOUNT.iban} · BIC: ${BANK_TRANSFER_ACCOUNT.bic}</p>
    </div>`
      : ""

  const cryptoHtml =
    awaitingPayment && isCrypto
      ? `<div style="background:#fff7e6;border:1px solid #ffe0a3;border-radius:8px;padding:16px;margin-bottom:20px">
      <p style="margin:0 0 8px;font-size:14px;color:#7a4b00">Please send the equivalent of <strong>${euros(order.totalCents)}</strong> and keep your order number <strong>${order.orderNumber}</strong> for your records.</p>
      <p style="margin:0;font-size:13px;color:#7a4b00;font-family:monospace">${cryptoCoin.coinLabel} · ${cryptoCoin.network}: ${cryptoCoin.address}</p>
    </div>`
      : ""

  const cardHtml =
    awaitingPayment && isCard
      ? `<div style="background:#fff7e6;border:1px solid #ffe0a3;border-radius:8px;padding:16px;margin-bottom:20px">
      <p style="margin:0;font-size:14px;color:#7a4b00">Card payment of <strong>${euros(order.totalCents)}</strong> is not confirmed yet. Complete it from your order page. If you have already paid, wait for the status to update and do not pay twice.</p>
    </div>`
      : ""

  const paypalHtml =
    awaitingPayment && isPaypal
      ? `<div style="background:#fff7e6;border:1px solid #ffe0a3;border-radius:8px;padding:16px;margin-bottom:20px">
      <p style="margin:0;font-size:14px;color:#7a4b00">${paypalAwaitingText(order.totalCents)}</p>
    </div>`
      : ""

  const addressHtml = addressLines.length
    ? `<div style="margin-bottom:20px">
      <p style="margin:0 0 6px;font-size:13px;text-transform:uppercase;letter-spacing:.04em;color:#888">Shipping to</p>
      <p style="margin:0;font-size:14px;color:#111;line-height:1.5">${addressLines.map((l) => l).join("<br>")}</p>
    </div>`
    : ""

  const html = `<!doctype html><html><body style="margin:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif">
<div style="max-width:560px;margin:0 auto;padding:24px">
  <div style="background:#fff;border-radius:12px;padding:32px">
    <h1 style="margin:0 0 8px;font-size:20px;color:#111">Thank you for your order</h1>
    <p style="margin:0 0 4px;color:#555;font-size:14px">Order <strong>${order.orderNumber}</strong></p>
    <p style="margin:0 0 20px;color:#888;font-size:13px">${new Date(order.createdAt).toLocaleDateString("en-GB")} · Payment: ${paymentLabel}</p>
    ${sepaHtml}
    ${cryptoHtml}
    ${cardHtml}
    ${paypalHtml}
    <table style="width:100%;border-collapse:collapse;font-size:14px;border-top:1px solid #eee;margin-bottom:8px">${itemsHtml}</table>
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px">${totalsHtml}</table>
    ${addressHtml}
    ${orderLink ? `<p style="margin:0"><a href="${orderLink}" style="display:inline-block;background:#111;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">View your order</a></p>` : ""}
  </div>
  <p style="text-align:center;color:#999;font-size:12px;margin-top:16px">3DJools · This is your order receipt</p>
</div>
</body></html>`

  return sendEmail({ to: order.email, subject, html, text })
}

/**
 * Notify the customer that their order has shipped, including the carrier,
 * tracking number and a tracking link. Safe no-op until Resend is configured.
 */
const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  awaiting_payment: "Awaiting payment",
  reviewing_payment: "Payment under review",
  paid: "Paid",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
}

export async function sendOrderStatusUpdateEmail(
  order: OrderWithItems,
  previousStatus: string,
): Promise<SendResult> {
  const base = siteUrl()
  const orderLink = base ? `${base}/en/order/${order.orderNumber}` : ""
  const previousLabel = ORDER_STATUS_LABELS[previousStatus] ?? previousStatus
  const statusLabel = ORDER_STATUS_LABELS[order.status] ?? order.status
  const subject = `Your 3DJools order ${order.orderNumber} is now ${statusLabel}`
  const text = [
    `Your order ${order.orderNumber} has been updated.`,
    `Status: ${previousLabel} → ${statusLabel}`,
    `Order total: ${euros(order.totalCents)}`,
    order.trackingNumber ? `Tracking number: ${order.trackingNumber}` : null,
    order.trackingUrl ? `Track your parcel: ${order.trackingUrl}` : null,
    orderLink ? `\nView your order: ${orderLink}` : null,
  ]
    .filter((line) => line !== null)
    .join("\n")

  const html = `<!doctype html><html><body style="margin:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif">
<div style="max-width:560px;margin:0 auto;padding:24px"><div style="background:#fff;border-radius:12px;padding:32px">
<h1 style="margin:0 0 8px;font-size:20px;color:#111">Your order has been updated</h1>
<p style="margin:0 0 8px;color:#555;font-size:14px">Order <strong>${order.orderNumber}</strong></p>
<p style="margin:0;color:#111;font-size:15px;line-height:1.6">Status: <strong>${previousLabel}</strong> → <strong>${statusLabel}</strong></p>
${order.trackingNumber ? `<p style="margin:16px 0 0;color:#111;font-size:14px">Tracking number: ${order.trackingNumber}</p>` : ""}
${order.trackingUrl ? `<p style="margin:12px 0 0"><a href="${order.trackingUrl}" style="color:#111">Track your parcel</a></p>` : ""}
${orderLink ? `<p style="margin:20px 0 0"><a href="${orderLink}" style="display:inline-block;background:#111;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">View your order</a></p>` : ""}
</div><p style="text-align:center;color:#999;font-size:12px;margin-top:16px">3DJools</p></div>
</body></html>`

  return sendEmail({ to: order.email, subject, html, text })
}

export async function sendOrderShippedEmail(order: OrderWithItems): Promise<SendResult> {
  const base = siteUrl()
  const orderLink = base ? `${base}/en/order/${order.orderNumber}` : ""
  const carrier = order.carrier?.trim()
  const trackingNumber = order.trackingNumber?.trim()
  const trackingUrl = order.trackingUrl?.trim()

  const subject = `Your 3DJools order ${order.orderNumber} has shipped`

  const itemsText = order.items
    .map((i) => `- ${i.productName} × ${i.quantity} — ${euros(i.lineTotalCents)}`)
    .join("\n")

  const text = [
    `Good news — your order ${order.orderNumber} is on its way.`,
    "",
    carrier ? `Carrier: ${carrier}` : null,
    trackingNumber ? `Tracking number: ${trackingNumber}` : null,
    trackingUrl ? `Track your parcel: ${trackingUrl}` : null,
    "",
    "Items:",
    itemsText,
    "",
    `Order total: ${euros(order.totalCents)}`,
    orderLink ? `View your order: ${orderLink}` : null,
  ]
    .filter((line) => line !== null)
    .join("\n")

  const itemsHtml = order.items
    .map(
      (i) =>
        `<tr><td style="padding:8px 0;color:#111">${i.productName} × ${i.quantity}</td><td style="padding:8px 0;text-align:right;color:#111">${euros(
          i.lineTotalCents,
        )}</td></tr>`,
    )
    .join("")

  const trackBtn = trackingUrl
    ? `<a href="${trackingUrl}" style="display:inline-block;background:#111;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">Track your parcel</a>`
    : ""

  const html = `<!doctype html><html><body style="margin:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif">
<div style="max-width:560px;margin:0 auto;padding:24px">
  <div style="background:#fff;border-radius:12px;padding:32px">
    <h1 style="margin:0 0 8px;font-size:20px;color:#111">Your order is on its way</h1>
    <p style="margin:0 0 20px;color:#555;font-size:14px">Order <strong>${order.orderNumber}</strong> has shipped.</p>
    <div style="background:#f8f8f8;border-radius:8px;padding:16px;margin-bottom:20px">
      ${carrier ? `<p style="margin:0 0 4px;font-size:14px;color:#111"><strong>Carrier:</strong> ${carrier}</p>` : ""}
      ${trackingNumber ? `<p style="margin:0 0 12px;font-size:14px;color:#111"><strong>Tracking number:</strong> ${trackingNumber}</p>` : ""}
      ${trackBtn}
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:14px;border-top:1px solid #eee">${itemsHtml}
      <tr><td style="padding:12px 0 0;font-weight:700;color:#111">Total</td><td style="padding:12px 0 0;text-align:right;font-weight:700;color:#111">${euros(
        order.totalCents,
      )}</td></tr>
    </table>
    ${orderLink ? `<p style="margin:24px 0 0"><a href="${orderLink}" style="color:#111;font-size:14px">View your order details</a></p>` : ""}
  </div>
  <p style="text-align:center;color:#999;font-size:12px;margin-top:16px">3DJools</p>
</div>
</body></html>`

  return sendEmail({ to: order.email, subject, html, text })
}

/**
 * Friendly nudge for an order that's still `awaiting_payment` a while after
 * checkout: welcomes the customer, recaps their order, and asks whether they
 * still need to send payment (repeating the bank transfer / crypto details),
 * since they haven't yet clicked "I've paid".
 */
export async function sendPaymentReminderEmail(order: OrderWithItems): Promise<SendResult> {
  const base = siteUrl()
  const orderLink = base ? `${base}/en/order/${order.orderNumber}` : ""
  const paymentLabel = PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod
  const isSepa = order.paymentMethod === "bank_transfer"
  const isCrypto = order.paymentMethod === "crypto"
  const isPaypal = order.paymentMethod === "paypal"
  const cryptoCoin = getCryptoCoinOption(parseOrderNotes(order.notes).crypto_coin)
  const firstName = order.shippingName?.trim().split(/\s+/)[0] ?? ""

  const subject = `Have you completed payment for your order ${order.orderNumber}?`

  const itemsText = order.items
    .map((i) => `- ${i.productName} × ${i.quantity} — ${euros(i.lineTotalCents)}`)
    .join("\n")

  const text = [
    `Hi ${firstName || "there"},`,
    "",
    `Welcome to 3DJools, and thank you for your order — we're delighted to have you with us!`,
    `We noticed your order ${order.orderNumber} is still marked as awaiting payment, so we wanted to check in and make sure everything is on track.`,
    "",
    "Your order:",
    itemsText,
    `Total: ${euros(order.totalCents)}`,
    `Payment method: ${paymentLabel}`,
    "",
    isSepa
      ? `If you haven't sent the bank transfer yet, here are the details again:\nAmount: ${euros(order.totalCents)}\nReference: ${order.orderNumber} (please include this so we can match your payment)\nName: ${BANK_TRANSFER_ACCOUNT.accountName}\nIBAN: ${BANK_TRANSFER_ACCOUNT.iban}\nBIC: ${BANK_TRANSFER_ACCOUNT.bic}\n\nOnce you've made the transfer, simply click "I've paid" on your order page so our team can start verifying it.`
      : null,
    isCrypto
      ? `If you haven't sent the payment yet, here are the details again:\nAmount: ${euros(order.totalCents)}\nNetwork: ${cryptoCoin.coinLabel} · ${cryptoCoin.network}\nAddress: ${cryptoCoin.address}\n\nOnce you've sent it, simply click "I've paid" on your order page so our team can start verifying it.`
      : null,
    isPaypal ? paypalReminderText(order.totalCents) : null,
    "",
    "If you've already paid and just haven't clicked the confirmation button yet, no problem — just head to your order page and let us know. And if you've changed your mind or run into any trouble, simply reply to this email; we're happy to help.",
    orderLink ? `\nView your order: ${orderLink}` : null,
    "",
    "Looking forward to getting your order on its way to you soon!",
  ]
    .filter((line) => line !== null)
    .join("\n")

  const itemsHtml = order.items
    .map(
      (i) =>
        `<tr><td style="padding:8px 0;color:#111">${i.productName} <span style="color:#888">× ${i.quantity}</span></td><td style="padding:8px 0;text-align:right;color:#111">${euros(
          i.lineTotalCents,
        )}</td></tr>`,
    )
    .join("")

  const sepaHtml = isSepa
    ? `<div style="background:#fff7e6;border:1px solid #ffe0a3;border-radius:8px;padding:16px;margin-bottom:20px">
      <p style="margin:0 0 8px;font-size:14px;color:#7a4b00">If you haven't sent the transfer yet, here are the details again:</p>
      <p style="margin:0;font-size:13px;color:#7a4b00;font-family:monospace">Amount: ${euros(order.totalCents)} · Reference: ${order.orderNumber}<br>Name: ${BANK_TRANSFER_ACCOUNT.accountName} · IBAN: ${BANK_TRANSFER_ACCOUNT.iban} · BIC: ${BANK_TRANSFER_ACCOUNT.bic}</p>
    </div>`
    : ""

  const paypalHtml = isPaypal
    ? `<div style="background:#fff7e6;border:1px solid #ffe0a3;border-radius:8px;padding:16px;margin-bottom:20px">
      <p style="margin:0;font-size:14px;color:#7a4b00">${paypalReminderText(order.totalCents)}</p>
    </div>`
    : ""

  const cryptoHtml = isCrypto
    ? `<div style="background:#fff7e6;border:1px solid #ffe0a3;border-radius:8px;padding:16px;margin-bottom:20px">
      <p style="margin:0 0 8px;font-size:14px;color:#7a4b00">If you haven't sent the payment yet, here are the details again:</p>
      <p style="margin:0;font-size:13px;color:#7a4b00;font-family:monospace">Amount: ${euros(order.totalCents)} · ${cryptoCoin.coinLabel} · ${cryptoCoin.network}<br>Address: ${cryptoCoin.address}</p>
    </div>`
    : ""

  const html = `<!doctype html><html><body style="margin:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif">
<div style="max-width:560px;margin:0 auto;padding:24px">
  <div style="background:#fff;border-radius:12px;padding:32px">
    <h1 style="margin:0 0 8px;font-size:20px;color:#111">Welcome to 3DJools${firstName ? `, ${firstName}` : ""}!</h1>
    <p style="margin:0 0 20px;color:#555;font-size:14px;line-height:1.6">Thank you for your order — we're delighted to have you with us. We noticed order <strong>${order.orderNumber}</strong> is still marked as <strong>awaiting payment</strong>, so we wanted to check in and make sure everything is on track.</p>
    ${sepaHtml}
    ${cryptoHtml}
    ${paypalHtml}
    <table style="width:100%;border-collapse:collapse;font-size:14px;border-top:1px solid #eee;margin-bottom:8px">${itemsHtml}</table>
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px">
      <tr><td style="padding:12px 0 0;font-weight:700;color:#111;border-top:1px solid #eee">Total</td><td style="padding:12px 0 0;text-align:right;font-weight:700;color:#111;border-top:1px solid #eee">${euros(order.totalCents)}</td></tr>
    </table>
    <p style="margin:0 0 20px;color:#111;font-size:14px;line-height:1.6">If you've already paid and just haven't clicked the confirmation button yet, no problem — just head to your order page and let us know. And if you've run into any trouble or changed your mind, simply reply to this email; we're happy to help.</p>
    ${orderLink ? `<p style="margin:0"><a href="${orderLink}" style="display:inline-block;background:#111;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">View your order</a></p>` : ""}
  </div>
  <p style="text-align:center;color:#999;font-size:12px;margin-top:16px">3DJools · We're looking forward to getting your order on its way</p>
</div>
</body></html>`

  return sendEmail({ to: order.email, subject, html, text })
}

/**
 * Sent after the customer clicks "I've paid" on a bank transfer or crypto
 * order, confirming we received their notice and are now checking the
 * payment before moving the order forward.
 */
export async function sendPaymentUnderReviewEmail(order: OrderWithItems): Promise<SendResult> {
  const base = siteUrl()
  const orderLink = base ? `${base}/en/order/${order.orderNumber}` : ""
  const subject = `We're verifying your payment — order ${order.orderNumber}`

  const text = [
    `Thanks — we've received your payment confirmation for order ${order.orderNumber}.`,
    "Our team is now verifying the payment. We'll update your order status as soon as it's confirmed.",
    orderLink ? `\nView your order: ${orderLink}` : null,
  ]
    .filter((line) => line !== null)
    .join("\n")

  const html = `<!doctype html><html><body style="margin:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif">
<div style="max-width:560px;margin:0 auto;padding:24px">
  <div style="background:#fff;border-radius:12px;padding:32px">
    <h1 style="margin:0 0 8px;font-size:20px;color:#111">We're verifying your payment</h1>
    <p style="margin:0 0 4px;color:#555;font-size:14px">Order <strong>${order.orderNumber}</strong></p>
    <p style="margin:16px 0 0;color:#111;font-size:14px;line-height:1.6">Thanks — we've received your confirmation and our team is checking your payment. We'll update your order status shortly.</p>
    ${orderLink ? `<p style="margin:20px 0 0"><a href="${orderLink}" style="display:inline-block;background:#111;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">View your order</a></p>` : ""}
  </div>
  <p style="text-align:center;color:#999;font-size:12px;margin-top:16px">3DJools</p>
</div>
</body></html>`

  return sendEmail({ to: order.email, subject, html, text })
}
