import "server-only"

import { COMPANY } from "@/lib/company"
import {
  EMAIL_FONT,
  EMAIL_PALETTE as P,
  emailDetails,
  emailLink,
  emailNotice,
  emailParagraph,
  emailSectionTitle,
  escapeEmailHtml,
  renderEmail,
  renderEmailButton,
  renderStepTracker,
} from "@/lib/email/layout"
import { sendEmail, type SendResult } from "@/lib/email/send"
import {
  localeForCountry,
  shipmentEmailCopy,
  shipmentStatusLabel,
  type ShipmentStatus,
} from "@/lib/shipping/tracking"
import { BANK_TRANSFER_ACCOUNT } from "@/lib/payments/bank-transfer"
import { isPaypalCheckoutEnabled } from "@/lib/payments/paypal-availability"
import { getCryptoCoinOption } from "@/lib/payments/crypto"
import { parseOrderNotes } from "@/lib/orders/notes"
import type { OrderWithItems } from "@/lib/orders/queries"

function euros(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`
}

function paypalAwaitingText(totalCents: number): string {
  return isPaypalCheckoutEnabled()
    ? `PayPal payment of ${euros(totalCents)} is not confirmed yet. Complete it from your order page. If you have already paid, wait for the status to update and do not pay twice.`
    : `PayPal is temporarily unavailable, so the payment of ${euros(totalCents)} cannot be completed that way right now. If you have already paid, wait for the status to update and do not pay twice.`
}

function paypalReminderText(totalCents: number): string {
  return isPaypalCheckoutEnabled()
    ? `If you haven't approved the PayPal payment of ${euros(totalCents)} yet, open your order page and continue to PayPal. If you have already paid, wait for the status to update and do not pay twice.`
    : `PayPal is temporarily unavailable, so this order cannot be paid that way right now. If you have already paid ${euros(totalCents)}, wait for the status to update and do not pay twice.`
}

function siteUrl(): string {
  return COMPANY.url
}

function orderUrl(order: OrderWithItems): string {
  const base = siteUrl()
  return base ? `${base}/en/order/${order.orderNumber}` : ""
}

const PAYMENT_LABELS: Record<string, string> = {
  card: "Visa / Mastercard",
  open_banking: "Pay by bank account (Open Banking)",
  paypal: "PayPal",
  bank_transfer: "Bank transfer (SEPA)",
  crypto: "Cryptocurrency",
  installments: "3× 0% Installments",
}

function parseMemberDiscountCents(notes: string | null): number {
  if (!notes) return 0
  const match = notes.match(/member_discount_cents=(\d+)/)
  return match ? Number.parseInt(match[1], 10) : 0
}

function renderOrderItems(order: OrderWithItems, discountCents = 0): string {
  const cell = `font-family:${EMAIL_FONT};font-size:14px;line-height:1.45;`
  const rows = order.items
    .map(
      (item) => `<tr>
        <td valign="top" style="padding:12px 0;border-bottom:1px solid ${P.border};${cell}color:${P.text};text-align:left;">
          <span style="font-weight:600;">${escapeEmailHtml(item.productName)}</span><br>
          <span style="font-size:13px;color:${P.textSubtle};">Qty ${item.quantity}</span>
        </td>
        <td valign="top" align="right" style="padding:12px 0 12px 12px;border-bottom:1px solid ${P.border};${cell}font-weight:600;color:${P.text};white-space:nowrap;">
          ${euros(item.lineTotalCents)}
        </td>
      </tr>`,
    )
    .join("")

  const totalRow = (label: string, value: string, color: string = P.textMuted) => `<tr>
      <td style="padding:6px 0;${cell}color:${color};text-align:left;">${label}</td>
      <td align="right" style="padding:6px 0 6px 12px;${cell}color:${color};white-space:nowrap;">${value}</td>
    </tr>`

  return `${emailSectionTitle("Order summary")}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;border-top:1px solid ${P.border};">
    ${rows}
    <tr><td colspan="2" style="height:8px;line-height:8px;font-size:0;">&nbsp;</td></tr>
    ${totalRow("Subtotal", euros(order.subtotalCents))}
    ${discountCents > 0 ? totalRow("Member discount", `-${euros(discountCents)}`, P.success) : ""}
    ${totalRow("Shipping", order.shippingCents === 0 ? "Free" : euros(order.shippingCents))}
    <tr>
      <td style="padding:12px 0 0;border-top:1px solid ${P.border};${cell}font-size:16px;font-weight:700;color:${P.text};text-align:left;">Total <span style="font-size:13px;font-weight:400;color:${P.textSubtle};">incl. VAT</span></td>
      <td align="right" style="padding:12px 0 0 12px;border-top:1px solid ${P.border};${cell}font-size:16px;font-weight:700;color:${P.text};white-space:nowrap;">${euros(order.totalCents)}</td>
    </tr>
  </table>`
}

function renderBankTransferDetails(reference: string, amountCents: number, intro: string, title = "Bank transfer details"): string {
  return `${emailSectionTitle(title)}
  ${emailParagraph(escapeEmailHtml(intro), { muted: true, size: 14 })}
  ${emailDetails([
    { label: "Beneficiary", value: escapeEmailHtml(BANK_TRANSFER_ACCOUNT.accountName) },
    { label: "IBAN", value: escapeEmailHtml(BANK_TRANSFER_ACCOUNT.iban), mono: true },
    { label: "BIC / SWIFT", value: escapeEmailHtml(BANK_TRANSFER_ACCOUNT.bic), mono: true },
    { label: "Amount", value: euros(amountCents), strong: true },
    { label: "Payment reference", value: escapeEmailHtml(reference), mono: true, strong: true },
  ])}`
}

function renderCryptoDetails(order: OrderWithItems, intro: string): string {
  const coin = getCryptoCoinOption(parseOrderNotes(order.notes).crypto_coin)
  return `${emailSectionTitle("Crypto payment details")}
  ${emailParagraph(escapeEmailHtml(intro), { muted: true, size: 14 })}
  ${emailDetails([
    { label: "Amount", value: euros(order.totalCents), strong: true },
    { label: "Network", value: `${escapeEmailHtml(coin.coinLabel)} &middot; ${escapeEmailHtml(coin.network)}` },
    { label: "Wallet address", value: escapeEmailHtml(coin.address), mono: true, wrap: true },
  ])}`
}

function renderTrackingDetails(carrier: string, trackingNumber: string, labels = { carrier: "Carrier", tracking: "Tracking number" }): string {
  return emailDetails([
    { label: labels.carrier, value: escapeEmailHtml(carrier) },
    { label: labels.tracking, value: escapeEmailHtml(trackingNumber), mono: true, strong: true },
  ])
}

/**
 * Order confirmation (sent right after checkout).
 */
export async function sendOrderConfirmationEmail(order: OrderWithItems): Promise<SendResult> {
  const orderLink = orderUrl(order)
  const discountCents = parseMemberDiscountCents(order.notes)
  const paymentLabel = PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod
  const awaitingPayment = order.status === "awaiting_payment"
  const isSepa = order.paymentMethod === "bank_transfer"
  const isCrypto = order.paymentMethod === "crypto"
  const isCard = order.paymentMethod === "card"
  const isOpenBanking = order.paymentMethod === "open_banking"
  const isPaypal = order.paymentMethod === "paypal"
  const cryptoCoin = getCryptoCoinOption(parseOrderNotes(order.notes).crypto_coin)
  const orderDate = new Date(order.createdAt).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })

  const addressLines = [
    order.shippingName,
    order.shippingAddress1,
    order.shippingAddress2,
    [order.shippingPostalCode, order.shippingCity].filter(Boolean).join(" "),
    order.shippingCountry,
  ].filter((line): line is string => Boolean(line && line.trim()))

  const subject = `Your 3DEureka order confirmation — ${order.orderNumber}`

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
    `Order ${order.orderNumber} — ${orderDate}`,
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
    awaitingPayment && isOpenBanking
      ? `\nOpen Banking payment of ${euros(order.totalCents)} is not confirmed yet. Complete it from your order page. If you have already paid, wait for the status to update and do not pay twice.`
      : null,
    awaitingPayment && isPaypal ? `\n${paypalAwaitingText(order.totalCents)}` : null,
    addressLines.length ? `\nShipping to:\n${addressLines.join("\n")}` : null,
    orderLink ? `\nView your order: ${orderLink}` : null,
  ]
    .filter((line) => line !== null)
    .join("\n")

  const paymentHtml =
    awaitingPayment && isSepa
      ? renderBankTransferDetails(
          order.orderNumber,
          order.totalCents,
          `Please transfer ${euros(order.totalCents)} and use your order number ${order.orderNumber} as the payment reference, so we can match your payment straight away.`,
        )
      : awaitingPayment && isCrypto
        ? renderCryptoDetails(order, `Please send the equivalent of ${euros(order.totalCents)} and keep your order number ${order.orderNumber} for your records.`)
        : awaitingPayment && (isCard || isOpenBanking || isPaypal)
          ? emailNotice({
              tone: "cobalt",
              title: "Payment not confirmed yet",
              html: isPaypal
                ? escapeEmailHtml(paypalAwaitingText(order.totalCents))
                : `${isOpenBanking ? "Open Banking" : "Card"} payment of <strong>${euros(order.totalCents)}</strong> is not confirmed yet. Complete it from your order page. If you have already paid, wait for the status to update and do not pay twice.`,
            })
          : ""

  const html = renderEmail({
    variant: "invoice",
    preheader: `Order ${order.orderNumber} is confirmed — ${euros(order.totalCents)}`,
    badgeText: awaitingPayment ? "Awaiting payment" : "Order confirmed",
    badgeTone: awaitingPayment ? "amber" : "emerald",
    headerTitle: "Thank you for your order",
    headerSubtitle: `Placed on ${orderDate}. We'll email you again as soon as it ships.`,
    referenceLabel: "Order number",
    referenceValue: order.orderNumber,
    body: `
      ${renderStepTracker(
        ["Order placed", awaitingPayment ? "Payment confirmation" : "Payment verified", "Packing & dispatch", "Delivery"],
        awaitingPayment ? 1 : 2,
      )}
      ${paymentHtml}
      ${renderOrderItems(order, discountCents)}
      ${emailDetails(
        [
          { label: "Payment method", value: escapeEmailHtml(paymentLabel) },
          {
            label: "Shipping to",
            value: addressLines.length ? addressLines.map((l) => escapeEmailHtml(l)).join("<br>") : "Provided at checkout",
          },
          { label: "Delivery time", value: "3&ndash;7 business days" },
        ],
        { title: "Delivery & payment" },
      )}
      ${renderEmailButton("View your order", orderLink)}
    `,
  })

  return sendEmail({ to: order.email, subject, html, text })
}

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  awaiting_payment: "Awaiting payment",
  reviewing_payment: "Payment under review",
  partially_paid: "Partially paid",
  paid: "Paid",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
}

/**
 * Status-specific emails for every order lifecycle transition.
 */
export async function sendOrderStatusUpdateEmail(
  order: OrderWithItems,
  previousStatus: string,
): Promise<SendResult> {
  const orderLink = orderUrl(order)
  const previousLabel = ORDER_STATUS_LABELS[previousStatus] ?? previousStatus
  const statusLabel = ORDER_STATUS_LABELS[order.status] ?? order.status
  const paymentLabel = PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod
  const orderNo = escapeEmailHtml(order.orderNumber)
  const subject = `Your 3DEureka order ${order.orderNumber} is now ${statusLabel}`

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

  if (order.status === "paid" || order.status === "partially_paid") {
    const html = renderEmail({
      variant: "certificate",
      preheader: `Payment confirmed for order ${order.orderNumber} (${euros(order.totalCents)})`,
      badgeText: order.status === "paid" ? "Paid" : "Partially paid",
      badgeTone: "emerald",
      headerTitle: "Payment received, thank you",
      headerSubtitle: "Your order is now being prepared for dispatch.",
      referenceLabel: "Order number",
      referenceValue: order.orderNumber,
      body: `
        ${renderStepTracker(["Order placed", "Payment confirmed", "Packing & dispatch", "Delivery"], 1, P.success)}
        ${emailParagraph(`We have received your ${escapeEmailHtml(paymentLabel)} payment of <strong>${euros(order.totalCents)}</strong> for order <strong>${orderNo}</strong>. Our team will pack it within 0&ndash;2 business days and send you the tracking details once it ships.`)}
        ${renderOrderItems(order, parseMemberDiscountCents(order.notes))}
        ${renderEmailButton("View your order", orderLink, "emerald")}
      `,
    })
    return sendEmail({ to: order.email, subject, html, text })
  }

  if (order.status === "processing") {
    const html = renderEmail({
      variant: "verification",
      preheader: `Order ${order.orderNumber} is being prepared for dispatch`,
      badgeText: "Preparing",
      badgeTone: "cobalt",
      headerTitle: "We're preparing your order",
      headerSubtitle: "It will be handed to the courier within 0–2 business days.",
      referenceLabel: "Order number",
      referenceValue: order.orderNumber,
      body: `
        ${renderStepTracker(["Order placed", "Payment confirmed", "Packing & dispatch", "Delivery"], 2)}
        ${emailParagraph(`Our team in Antwerpen is packing order <strong>${orderNo}</strong>. As soon as the courier picks it up, you'll receive an email with your tracking number.`)}
        ${renderOrderItems(order, parseMemberDiscountCents(order.notes))}
        ${renderEmailButton("View your order", orderLink)}
      `,
    })
    return sendEmail({ to: order.email, subject, html, text })
  }

  if (order.status === "delivered") {
    const html = renderEmail({
      variant: "certificate",
      preheader: `Order ${order.orderNumber} has been delivered`,
      badgeText: "Delivered",
      badgeTone: "emerald",
      headerTitle: "Your order has been delivered",
      headerSubtitle: "We hope you enjoy your new equipment.",
      referenceLabel: "Order number",
      referenceValue: order.orderNumber,
      body: `
        ${renderStepTracker(["Order placed", "Shipped", "In transit", "Delivered"], 3, P.success)}
        ${emailParagraph(`Order <strong>${orderNo}</strong> has been marked as delivered. If anything is missing or damaged, just reply to this email and we'll sort it out.`)}
        ${emailNotice({
          tone: "slate",
          title: "30-day free returns",
          html: "You can return your order within 30 days of delivery with a free return label. Refunds are issued within 7 business days after we receive and check the return.",
        })}
        ${renderEmailButton("View your order", orderLink, "emerald")}
      `,
    })
    return sendEmail({ to: order.email, subject, html, text })
  }

  if (order.status === "cancelled" || order.status === "refunded") {
    const isRefund = order.status === "refunded"
    const html = renderEmail({
      variant: "passport",
      preheader: `Order ${order.orderNumber} is now ${statusLabel}`,
      badgeText: statusLabel,
      badgeTone: "rose",
      headerTitle: isRefund ? "Your order has been refunded" : "Your order has been cancelled",
      headerSubtitle: `Order ${order.orderNumber} · ${euros(order.totalCents)}`,
      referenceLabel: "Order number",
      referenceValue: order.orderNumber,
      body: `
        ${emailParagraph(
          isRefund
            ? `We have refunded order <strong>${orderNo}</strong>. Depending on your bank or payment provider, the money should appear on your account within 7 business days.`
            : `Order <strong>${orderNo}</strong> has been cancelled. If you had already paid for it, the refund is processed within 7 business days.`,
        )}
        ${emailParagraph("If you didn't expect this or have any questions, just reply to this email.", { muted: true, size: 14 })}
        ${renderEmailButton("View your order", orderLink, "ink")}
      `,
    })
    return sendEmail({ to: order.email, subject, html, text })
  }

  const trackingNumber = order.trackingNumber?.trim() ?? ""
  const html = renderEmail({
    variant: "verification",
    preheader: `Order ${order.orderNumber} is now ${statusLabel}`,
    badgeText: statusLabel,
    badgeTone: "cobalt",
    headerTitle: "Your order status has changed",
    headerSubtitle: `Order ${order.orderNumber} is now: ${statusLabel}.`,
    referenceLabel: "Order number",
    referenceValue: order.orderNumber,
    body: `
      ${emailDetails([
        { label: "Previous status", value: escapeEmailHtml(previousLabel) },
        { label: "Current status", value: escapeEmailHtml(statusLabel), strong: true },
        { label: "Order total", value: euros(order.totalCents) },
        { label: "Tracking number", value: escapeEmailHtml(trackingNumber), mono: true },
      ])}
      ${order.trackingUrl ? renderEmailButton("Track your parcel", order.trackingUrl) : ""}
      ${order.trackingUrl ? emailLink("View your order", orderLink) : renderEmailButton("View your order", orderLink)}
    `,
  })

  return sendEmail({ to: order.email, subject, html, text })
}

/**
 * Shipping confirmation.
 */
export async function sendOrderShippedEmail(order: OrderWithItems): Promise<SendResult> {
  const orderLink = orderUrl(order)
  const carrier = order.carrier?.trim() || "3DEureka Courier"
  const trackingNumber = order.trackingNumber?.trim() ?? ""
  const trackingUrl = order.trackingUrl?.trim()

  const subject = `Your 3DEureka order ${order.orderNumber} has shipped`

  const itemsText = order.items
    .map((i) => `- ${i.productName} × ${i.quantity} — ${euros(i.lineTotalCents)}`)
    .join("\n")

  const text = [
    `Good news — your order ${order.orderNumber} is on its way.`,
    "",
    `Carrier: ${carrier}`,
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

  const html = renderEmail({
    variant: "waybill",
    preheader: `Order ${order.orderNumber} has shipped${trackingNumber ? ` · Tracking ${trackingNumber}` : ""}`,
    badgeText: "Shipped",
    badgeTone: "cobalt",
    headerTitle: "Your order is on its way",
    headerSubtitle: "Delivery usually takes 3–5 business days.",
    referenceLabel: "Order number",
    referenceValue: order.orderNumber,
    body: `
      ${renderStepTracker(["Order placed", "Shipped", "In transit", "Delivered"], 1)}
      ${renderTrackingDetails(carrier, trackingNumber)}
      ${trackingUrl ? renderEmailButton("Track your parcel", trackingUrl) : ""}
      ${renderOrderItems(order, parseMemberDiscountCents(order.notes))}
      ${emailLink("View order details", orderLink)}
    `,
  })

  return sendEmail({ to: order.email, subject, html, text })
}

const EXCEPTION_SHIPMENT_STATUSES: ReadonlySet<ShipmentStatus> = new Set([
  "delivery_attempted",
  "failed_handed_to_dhl",
  "address_issue",
  "delayed",
  "returning",
  "returned",
])

function shipmentStageIndex(status: ShipmentStatus): number {
  if (status === "delivered") return 3
  if (status === "out_for_delivery" || status === "at_delivery_point" || status === "awaiting_pickup") return 2
  if (status === "label_created" || status === "collected" || status === "at_warehouse") return 0
  return 1
}

/**
 * Courier checkpoint update (localized across 6 languages).
 */
export async function sendShipmentEventEmail(
  order: OrderWithItems,
  event: { status: ShipmentStatus; location: string | null; comment: string | null; carrier: string | null },
): Promise<SendResult> {
  const locale = localeForCountry(order.shippingCountry)
  const copy = shipmentEmailCopy(locale)
  const statusLabel = shipmentStatusLabel(event.status, locale)
  const trackingNumber = order.trackingNumber?.trim() ?? ""
  const trackingUrl =
    order.trackingUrl?.trim() ||
    (trackingNumber ? `${siteUrl()}/${locale}/track/${encodeURIComponent(trackingNumber)}` : "")
  const carrier = event.carrier?.trim() || order.carrier?.trim() || ""
  const location = event.location?.trim() ?? ""
  const comment = event.comment?.trim() ?? ""
  const subject = copy.subject(order.orderNumber, statusLabel)

  const isDelivered = event.status === "delivered"
  const isException = EXCEPTION_SHIPMENT_STATUSES.has(event.status)
  const stageIdx = shipmentStageIndex(event.status)
  const tone = isDelivered ? "emerald" : isException ? "amber" : "cobalt"
  const accent = isDelivered ? P.success : isException ? P.warning : P.primary

  const text = [
    copy.body(order.orderNumber, statusLabel),
    location ? `${copy.location}: ${location}` : null,
    comment ? `${copy.comment}: ${comment}` : null,
    carrier ? `${copy.carrier}: ${carrier}` : null,
    trackingNumber ? `${copy.tracking}: ${trackingNumber}` : null,
    trackingUrl ? trackingUrl : null,
  ]
    .filter((line) => line !== null)
    .join("\n")

  const segments = [0, 1, 2, 3]
    .map((idx) => {
      const color = idx <= stageIdx ? accent : P.border
      const gap = idx === 3 ? "" : "padding-right:4px;"
      return `<td width="25%" style="${gap}"><div style="height:6px;line-height:6px;font-size:0;border-radius:3px;background:${color};">&nbsp;</div></td>`
    })
    .join("")

  const html = renderEmail({
    variant: isDelivered ? "certificate" : isException ? "remittance" : "waybill",
    preheader: copy.body(order.orderNumber, statusLabel),
    badgeText: statusLabel,
    badgeTone: tone,
    headerTitle: copy.heading,
    headerSubtitle: copy.body(order.orderNumber, statusLabel),
    body: `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;"><tr>${segments}</tr></table>
      ${comment ? emailNotice({ tone, title: copy.comment, html: escapeEmailHtml(comment) }) : ""}
      ${emailDetails([
        { label: copy.location, value: escapeEmailHtml(location) },
        { label: copy.carrier, value: escapeEmailHtml(carrier) },
        { label: copy.tracking, value: escapeEmailHtml(trackingNumber), mono: true, strong: true },
      ])}
      ${renderEmailButton(copy.button, trackingUrl)}
    `,
  })

  return sendEmail({ to: order.email, subject, html, text })
}

/**
 * Friendly reminder for orders still awaiting payment.
 */
export async function sendPaymentReminderEmail(order: OrderWithItems): Promise<SendResult> {
  const orderLink = orderUrl(order)
  const paymentLabel = PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod
  const isSepa = order.paymentMethod === "bank_transfer"
  const isCrypto = order.paymentMethod === "crypto"
  const isPaypal = order.paymentMethod === "paypal"
  const isCard = order.paymentMethod === "card"
  const isOpenBanking = order.paymentMethod === "open_banking"
  const cryptoCoin = getCryptoCoinOption(parseOrderNotes(order.notes).crypto_coin)
  const firstName = order.shippingName?.trim().split(/\s+/)[0] ?? ""

  const subject = `Have you completed payment for your order ${order.orderNumber}?`

  const itemsText = order.items
    .map((i) => `- ${i.productName} × ${i.quantity} — ${euros(i.lineTotalCents)}`)
    .join("\n")

  const text = [
    `Hi ${firstName || "there"},`,
    "",
    `Thank you for your order with 3DEureka.`,
    `Your order ${order.orderNumber} is still marked as awaiting payment, so we wanted to check that everything is on track.`,
    "",
    "Your order:",
    itemsText,
    `Total: ${euros(order.totalCents)}`,
    `Payment method: ${paymentLabel}`,
    "",
    isSepa
      ? `If you haven't sent the bank transfer yet, here are the details again:\nAmount: ${euros(order.totalCents)}\nReference: ${order.orderNumber} (please include this so we can match your payment)\nName: ${BANK_TRANSFER_ACCOUNT.accountName}\nIBAN: ${BANK_TRANSFER_ACCOUNT.iban}\nBIC: ${BANK_TRANSFER_ACCOUNT.bic}\n\nOnce you've made the transfer, click "I've paid" on your order page so our team can start verifying it.`
      : null,
    isCrypto
      ? `If you haven't sent the payment yet, here are the details again:\nAmount: ${euros(order.totalCents)}\nNetwork: ${cryptoCoin.coinLabel} · ${cryptoCoin.network}\nAddress: ${cryptoCoin.address}\n\nOnce you've sent it, click "I've paid" on your order page so our team can start verifying it.`
      : null,
    isPaypal ? paypalReminderText(order.totalCents) : null,
    isCard
      ? `Card payment of ${euros(order.totalCents)} is still open. Open your order page to complete payment by Visa or Mastercard. If you have already paid, wait for the status to update and do not pay twice.`
      : null,
    isOpenBanking
      ? `Open Banking payment of ${euros(order.totalCents)} is still open. Open your order page to complete payment from your bank app or via IBAN. If you have already paid, wait for the status to update and do not pay twice.`
      : null,
    "",
    "If you've already paid, open your order page and let us know. If you've changed your mind or run into any trouble, just reply to this email.",
    orderLink ? `\nView your order: ${orderLink}` : null,
  ]
    .filter((line) => line !== null)
    .join("\n")

  const methodHtml = isSepa
    ? renderBankTransferDetails(
        order.orderNumber,
        order.totalCents,
        "If you haven't sent the transfer yet, please use these details and your order number as the payment reference.",
      )
    : isCrypto
      ? renderCryptoDetails(order, "If you haven't sent the payment yet, here are the wallet details again.")
      : emailNotice({
          tone: "amber",
          title: `Payment method: ${paymentLabel}`,
          html: isPaypal
            ? escapeEmailHtml(paypalReminderText(order.totalCents))
            : isOpenBanking
              ? `Open Banking payment of <strong>${euros(order.totalCents)}</strong> is still open. Open your order page to pay from your bank app, or choose another payment method.`
              : `Card payment of <strong>${euros(order.totalCents)}</strong> is still open. Open your order page to pay by Visa or Mastercard.`,
        })

  const html = renderEmail({
    variant: "remittance",
    preheader: `Order ${order.orderNumber} (${euros(order.totalCents)}) is still awaiting payment`,
    badgeText: "Awaiting payment",
    badgeTone: "amber",
    headerTitle: `${firstName ? `Hi ${firstName}, your` : "Your"} order is waiting for payment`,
    headerSubtitle: "We're holding your items. Here's everything you need to complete the payment.",
    referenceLabel: "Order number",
    referenceValue: order.orderNumber,
    body: `
      ${methodHtml}
      ${renderOrderItems(order, parseMemberDiscountCents(order.notes))}
      ${emailNotice({
        tone: "slate",
        title: "Already paid?",
        html: "Open your order page and press <strong>&ldquo;I&apos;ve paid&rdquo;</strong> so we can verify it right away. Need help? Just reply to this email.",
      })}
      ${renderEmailButton("Complete payment", orderLink)}
    `,
  })

  return sendEmail({ to: order.email, subject, html, text })
}

/**
 * Sent when the customer reports a payment and it is waiting for manual verification.
 */
export async function sendPaymentUnderReviewEmail(order: OrderWithItems): Promise<SendResult> {
  const orderLink = orderUrl(order)
  const paymentLabel = PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod
  const subject = `We're verifying your payment — order ${order.orderNumber}`

  const text = [
    `Thanks — we've received your payment confirmation for order ${order.orderNumber}.`,
    "Our team is now verifying the payment. We'll update your order status as soon as it's confirmed.",
    orderLink ? `\nView your order: ${orderLink}` : null,
  ]
    .filter((line) => line !== null)
    .join("\n")

  const html = renderEmail({
    variant: "verification",
    preheader: `We're verifying payment for order ${order.orderNumber}`,
    badgeText: "Under review",
    badgeTone: "cobalt",
    headerTitle: "We're verifying your payment",
    headerSubtitle: "You don't need to do anything else. We'll email you once it's confirmed.",
    referenceLabel: "Order number",
    referenceValue: order.orderNumber,
    body: `
      ${renderStepTracker(["Payment reported", "Verification", "Packing & dispatch"], 1)}
      ${emailParagraph(`Thank you. We've received your payment confirmation for order <strong>${escapeEmailHtml(order.orderNumber)}</strong> and are now matching the incoming payment. As soon as it clears, your order moves to packing.`)}
      ${emailDetails([
        { label: "Payment method", value: escapeEmailHtml(paymentLabel) },
        { label: "Amount", value: euros(order.totalCents), strong: true },
      ])}
      ${renderEmailButton("View your order", orderLink)}
    `,
  })

  return sendEmail({ to: order.email, subject, html, text })
}
