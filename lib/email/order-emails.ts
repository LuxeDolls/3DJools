import "server-only"

import { COMPANY } from "@/lib/company"
import {
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

function renderOrderItemsLedger(order: OrderWithItems, discountCents = 0): string {
  const rows = order.items
    .map(
      (item, idx) => `<tr>
        <td style="padding:11px 12px;border-bottom:1px solid #E2E8F0;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:12px;color:#64748B;width:28px;">
          ${String(idx + 1).padStart(2, "0")}
        </td>
        <td style="padding:11px 8px;border-bottom:1px solid #E2E8F0;font-size:14px;font-weight:600;color:#0F172A;">
          ${escapeEmailHtml(item.productName)}
        </td>
        <td align="center" style="padding:11px 8px;border-bottom:1px solid #E2E8F0;white-space:nowrap;">
          <span style="display:inline-block;padding:2px 8px;border-radius:999px;background:#EEF2FF;color:#1E40D8;font-size:12px;font-weight:700;">
            &times;${item.quantity}
          </span>
        </td>
        <td align="right" style="padding:11px 12px;border-bottom:1px solid #E2E8F0;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:13px;font-weight:700;color:#0F172A;white-space:nowrap;">
          ${euros(item.lineTotalCents)}
        </td>
      </tr>`,
    )
    .join("")

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;border:1px solid #CBD5E1;border-radius:12px;overflow:hidden;background:#FFFFFF;">
    <thead>
      <tr style="background:#F1F5F9;">
        <th align="left" style="padding:9px 12px;font-size:10px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#475569;border-bottom:1px solid #CBD5E1;">#</th>
        <th align="left" style="padding:9px 8px;font-size:10px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#475569;border-bottom:1px solid #CBD5E1;">Item Description</th>
        <th align="center" style="padding:9px 8px;font-size:10px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#475569;border-bottom:1px solid #CBD5E1;">Qty</th>
        <th align="right" style="padding:9px 12px;font-size:10px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#475569;border-bottom:1px solid #CBD5E1;">Line Total</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
    <tfoot>
      <tr style="background:#F8FAFC;">
        <td colspan="3" align="right" style="padding:8px 12px 4px;font-size:13px;color:#475569;">Subtotal</td>
        <td align="right" style="padding:8px 12px 4px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:13px;color:#0F172A;">${euros(order.subtotalCents)}</td>
      </tr>
      ${
        discountCents > 0
          ? `<tr style="background:#F8FAFC;">
              <td colspan="3" align="right" style="padding:4px 12px;font-size:13px;color:#059669;font-weight:600;">Member discount</td>
              <td align="right" style="padding:4px 12px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:13px;font-weight:700;color:#059669;">-${euros(discountCents)}</td>
            </tr>`
          : ""
      }
      <tr style="background:#F8FAFC;">
        <td colspan="3" align="right" style="padding:4px 12px 10px;font-size:13px;color:#475569;">Shipping &amp; Handling</td>
        <td align="right" style="padding:4px 12px 10px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:13px;font-weight:600;color:#0F172A;">${order.shippingCents === 0 ? "Free" : euros(order.shippingCents)}</td>
      </tr>
      <tr style="background:#0C1530;">
        <td colspan="3" align="right" style="padding:12px;font-size:13px;font-weight:800;letter-spacing:0.05em;text-transform:uppercase;color:#CBD5E1;">Total (incl. VAT)</td>
        <td align="right" style="padding:12px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:16px;font-weight:800;color:#FACC15;">${euros(order.totalCents)}</td>
      </tr>
    </tfoot>
  </table>`
}

function renderSepaVoucherHtml(orderNumber: string, totalCents: number, headingText: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 22px;background:#FFFBEB;border:2px dashed #F59E0B;border-radius:14px;overflow:hidden;">
    <tr>
      <td style="background:#FEF3C7;padding:10px 16px;border-bottom:1px solid #FDE68A;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="font-size:11px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#92400E;">
              SEPA BANK TRANSFER REMITTANCE SLIP
            </td>
            <td align="right" style="font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:12px;font-weight:800;color:#B45309;">
              AMOUNT DUE: ${euros(totalCents)}
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:16px;">
        <p style="margin:0 0 12px;font-size:13px;line-height:1.55;color:#78350F;">
          ${escapeEmailHtml(headingText)}
        </p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#FFFFFF;border:1px solid #FDE68A;border-radius:10px;font-size:13px;">
          <tr>
            <td style="padding:8px 12px;border-bottom:1px solid #FEF3C7;color:#64748B;width:36%;">Beneficiary Name</td>
            <td style="padding:8px 12px;border-bottom:1px solid #FEF3C7;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-weight:700;color:#0F172A;">${escapeEmailHtml(BANK_TRANSFER_ACCOUNT.accountName)}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px;border-bottom:1px solid #FEF3C7;color:#64748B;">IBAN</td>
            <td style="padding:8px 12px;border-bottom:1px solid #FEF3C7;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-weight:700;color:#1E40D8;">${escapeEmailHtml(BANK_TRANSFER_ACCOUNT.iban)}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px;border-bottom:1px solid #FEF3C7;color:#64748B;">BIC / SWIFT</td>
            <td style="padding:8px 12px;border-bottom:1px solid #FEF3C7;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-weight:700;color:#0F172A;">${escapeEmailHtml(BANK_TRANSFER_ACCOUNT.bic)}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px;border-bottom:1px solid #FEF3C7;color:#64748B;">Transfer Amount</td>
            <td style="padding:8px 12px;border-bottom:1px solid #FEF3C7;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-weight:800;color:#0F172A;">${euros(totalCents)}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px;color:#64748B;">Payment Reference</td>
            <td style="padding:8px 12px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-weight:800;color:#B45309;background:#FFFBEB;">${escapeEmailHtml(orderNumber)} <span style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;font-weight:600;color:#92400E;">(required)</span></td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`
}

/**
 * Form 1: Commercial Invoice & Order Dossier ("invoice" layout)
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

  const paymentVoucherHtml =
    awaitingPayment && isSepa
      ? renderSepaVoucherHtml(
          order.orderNumber,
          order.totalCents,
          `Please transfer ${euros(order.totalCents)} and include your order number ${order.orderNumber} in the payment reference so our accounting team can reconcile your order immediately.`,
        )
      : awaitingPayment && isCrypto
        ? `<div style="background:#FFFBEB;border:2px dashed #F59E0B;border-radius:12px;padding:16px;margin-bottom:20px;">
            <div style="font-size:11px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#92400E;margin-bottom:6px;">CRYPTO PAYMENT DETAILS</div>
            <p style="margin:0 0 8px;font-size:13px;color:#78350F;">Please send the equivalent of <strong>${euros(order.totalCents)}</strong> and keep order reference <strong>${escapeEmailHtml(order.orderNumber)}</strong> for your records.</p>
            <div style="padding:10px;background:#FFFFFF;border:1px solid #FDE68A;border-radius:8px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:12px;color:#0F172A;word-break:break-all;">
              ${escapeEmailHtml(cryptoCoin.coinLabel)} &middot; ${escapeEmailHtml(cryptoCoin.network)}: <strong>${escapeEmailHtml(cryptoCoin.address)}</strong>
            </div>
          </div>`
        : awaitingPayment && (isCard || isOpenBanking || isPaypal)
          ? `<div style="background:#EFF6FF;border:1px solid #BFDBFE;border-left:4px solid #1E40D8;border-radius:12px;padding:15px 16px;margin-bottom:20px;">
              <div style="font-size:11px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#1E40D8;margin-bottom:4px;">PAYMENT CONFIRMATION PENDING</div>
              <p style="margin:0;font-size:13px;line-height:1.55;color:#1E3A8A;">
                ${
                  isPaypal
                    ? escapeEmailHtml(paypalAwaitingText(order.totalCents))
                    : isOpenBanking
                      ? `Open Banking payment of <strong>${euros(order.totalCents)}</strong> is not confirmed yet. Complete it from your order page. If you have already paid, wait for the status to update and do not pay twice.`
                      : `Card payment of <strong>${euros(order.totalCents)}</strong> is not confirmed yet. Complete it from your order page. If you have already paid, wait for the status to update and do not pay twice.`
                }
              </p>
            </div>`
          : ""

  const html = renderEmail({
    variant: "invoice",
    preheader: `Order ${order.orderNumber} is confirmed — ${euros(order.totalCents)}`,
    eyebrow: "ORDER CONFIRMATION & INVOICE SUMMARY",
    badgeText: awaitingPayment ? "AWAITING PAYMENT" : "ORDER CONFIRMED",
    badgeTone: awaitingPayment ? "amber" : "signal",
    headerTitle: "Thank you for your order",
    headerSubtitle: `Placed on ${orderDate} · Payment method: ${paymentLabel}`,
    referenceLabel: "ORDER NUMBER",
    referenceValue: order.orderNumber,
    body: `
      ${renderStepTracker(
        ["Order Placed", awaitingPayment ? "Payment Confirmation" : "Payment Verified", "Warehouse QC & Dispatch", "Delivery"],
        awaitingPayment ? 1 : 2,
      )}

      ${paymentVoucherHtml}

      ${renderOrderItemsLedger(order, discountCents)}

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
        <tr>
          <td width="52%" valign="top" style="padding-right:8px;">
            <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:14px 16px;">
              <div style="font-size:10px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#64748B;margin-bottom:6px;">
                SHIPPING DESTINATION
              </div>
              <div style="font-size:13px;line-height:1.55;color:#0F172A;font-weight:500;">
                ${addressLines.length ? addressLines.map((l) => escapeEmailHtml(l)).join("<br>") : "Provided at checkout"}
              </div>
            </div>
          </td>
          <td width="48%" valign="top" style="padding-left:8px;">
            <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:14px 16px;">
              <div style="font-size:10px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#64748B;margin-bottom:6px;">
                FULFILLMENT SCHEDULE
              </div>
              <div style="font-size:13px;line-height:1.55;color:#0F172A;">
                <strong>Processing:</strong> 0&ndash;2 business days<br>
                <strong>Transit time:</strong> 3&ndash;5 business days<br>
                <strong>Courier:</strong> 3DEureka Courier / DHL / DPD
              </div>
            </div>
          </td>
        </tr>
      </table>

      ${orderLink ? renderEmailButton("View order & invoice status", orderLink, "cobalt") : ""}
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
 * Form 2 (2A–2F): Specialized status-specific email forms for every lifecycle transition.
 */
export async function sendOrderStatusUpdateEmail(
  order: OrderWithItems,
  previousStatus: string,
): Promise<SendResult> {
  const base = siteUrl()
  const orderLink = base ? `${base}/en/order/${order.orderNumber}` : ""
  const previousLabel = ORDER_STATUS_LABELS[previousStatus] ?? previousStatus
  const statusLabel = ORDER_STATUS_LABELS[order.status] ?? order.status
  const paymentLabel = PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod
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

  // Form 2A: Paid / Partially Paid — Official Payment Receipt Certificate
  if (order.status === "paid" || order.status === "partially_paid") {
    const html = renderEmail({
      variant: "certificate",
      preheader: `Payment confirmed for order ${order.orderNumber} (${euros(order.totalCents)})`,
      eyebrow: "PAYMENT SETTLEMENT CERTIFICATE",
      badgeText: order.status === "paid" ? "PAID IN FULL" : "PARTIALLY PAID",
      badgeTone: "emerald",
      headerTitle: "Payment confirmed — thank you",
      headerSubtitle: `Order ${order.orderNumber} has been cleared for warehouse fulfillment.`,
      referenceLabel: "ORDER REF",
      referenceValue: order.orderNumber,
      body: `
        ${renderStepTracker(["Order Placed", "Payment Confirmed", "Warehouse QC & Packing", "Dispatched"], 2, "#059669")}

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;background:#ECFDF5;border:1px solid #A7F3D0;border-radius:14px;padding:18px;">
          <tr>
            <td>
              <div style="font-size:11px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#047857;margin-bottom:4px;">
                STATUS TRANSITION: ${escapeEmailHtml(previousLabel)} &rarr; ${escapeEmailHtml(statusLabel)}
              </div>
              <div style="font-size:15px;font-weight:700;color:#064E3B;">
                We have verified your ${escapeEmailHtml(paymentLabel)} payment for order ${escapeEmailHtml(order.orderNumber)}.
              </div>
            </td>
            <td align="right" style="white-space:nowrap;padding-left:12px;">
              <div style="font-size:11px;color:#047857;font-weight:700;text-transform:uppercase;">Settled Total</div>
              <div style="font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:20px;font-weight:800;color:#065F46;">${euros(order.totalCents)}</div>
            </td>
          </tr>
        </table>

        ${renderOrderItemsLedger(order, parseMemberDiscountCents(order.notes))}

        ${orderLink ? renderEmailButton("Open order & receipt", orderLink, "emerald") : ""}
      `,
    })
    return sendEmail({ to: order.email, subject, html, text })
  }

  // Form 2B: Processing — Warehouse Pick, Pack & QC Work Order
  if (order.status === "processing") {
    const html = renderEmail({
      variant: "verification",
      preheader: `Order ${order.orderNumber} is now in warehouse preparation & QC`,
      eyebrow: "WAREHOUSE FULFILLMENT WORK ORDER",
      badgeText: "IN PREPARATION",
      badgeTone: "cobalt",
      headerTitle: "Your hardware is being prepared for dispatch",
      headerSubtitle: `Status updated: ${previousLabel} → ${statusLabel}`,
      referenceLabel: "WORK ORDER",
      referenceValue: order.orderNumber,
      body: `
        ${renderStepTracker(["Order Placed", "Payment Cleared", "Warehouse QC & Packing", "Courier Handover"], 2)}

        <p style="margin:0 0 18px;font-size:14px;line-height:1.65;color:#334155;">
          Our Antwerpen fulfillment team is currently preparing order <strong style="color:#0F172A;">${escapeEmailHtml(order.orderNumber)}</strong>. As soon as your parcel is sealed and scanned by the courier, you will receive a dedicated dispatch manifest with your live tracking link.
        </p>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 22px;background:#F8FAFC;border:1px solid #CBD5E1;border-radius:12px;padding:14px 16px;font-size:13px;">
          <tr>
            <td style="padding:5px 0;color:#059669;font-weight:700;">&#10003; Stock Unit Allocated</td>
            <td align="right" style="padding:5px 0;color:#64748B;">Antwerpen Hub</td>
          </tr>
          <tr>
            <td style="padding:5px 0;color:#1E40D8;font-weight:700;">&#9679; Packaging &amp; Pre-Dispatch Check</td>
            <td align="right" style="padding:5px 0;color:#1E40D8;font-weight:600;">In progress (0&ndash;2 business days)</td>
          </tr>
          <tr>
            <td style="padding:5px 0;color:#64748B;">&#9675; Courier Handover &amp; Tracking Issue</td>
            <td align="right" style="padding:5px 0;color:#64748B;">Next step</td>
          </tr>
        </table>

        ${renderOrderItemsLedger(order, parseMemberDiscountCents(order.notes))}

        ${orderLink ? renderEmailButton("View order progress", orderLink, "cobalt") : ""}
      `,
    })
    return sendEmail({ to: order.email, subject, html, text })
  }

  // Form 2C: Delivered — Completion & 30-Day Guarantee Certificate
  if (order.status === "delivered") {
    const html = renderEmail({
      variant: "certificate",
      preheader: `Order ${order.orderNumber} has been marked as delivered`,
      eyebrow: "DELIVERY COMPLETION & WARRANTY CERTIFICATE",
      badgeText: "DELIVERED",
      badgeTone: "emerald",
      headerTitle: "Your order has been delivered",
      headerSubtitle: `Status updated: ${previousLabel} → ${statusLabel}`,
      referenceLabel: "ORDER REF",
      referenceValue: order.orderNumber,
      body: `
        ${renderStepTracker(["Order Placed", "Dispatched", "In Transit", "Delivered"], 3, "#059669")}

        <p style="margin:0 0 18px;font-size:15px;line-height:1.65;color:#334155;">
          Your order <strong style="color:#0F172A;">${escapeEmailHtml(order.orderNumber)}</strong> is now marked as <strong>${escapeEmailHtml(statusLabel)}</strong>. Enjoy your new equipment!
        </p>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 22px;background:#F8FAFC;border:1px solid #CBD5E1;border-radius:12px;padding:16px;">
          <tr>
            <td>
              <div style="font-size:11px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#059669;margin-bottom:6px;">
                30-DAY RETURN GUARANTEE &amp; SUPPORT
              </div>
              <p style="margin:0;font-size:13px;line-height:1.55;color:#475569;">
                Every 3DEureka order is covered by our <strong>30-day return window</strong> from the day of delivery, with a free return shipping label and refund within 7 business days after inspection. Need technical advice or setup assistance? Reply directly to this email.
              </p>
            </td>
          </tr>
        </table>

        ${orderLink ? renderEmailButton("View order & warranty record", orderLink, "emerald") : ""}
      `,
    })
    return sendEmail({ to: order.email, subject, html, text })
  }

  // Form 2D: Cancelled / Refunded — Administrative Credit Notice
  if (order.status === "cancelled" || order.status === "refunded") {
    const html = renderEmail({
      variant: "passport",
      preheader: `Order ${order.orderNumber} is now ${statusLabel}`,
      eyebrow: "ADMINISTRATIVE ORDER NOTICE",
      badgeText: statusLabel.toUpperCase(),
      badgeTone: "rose",
      headerTitle: `Order ${order.orderNumber} is now ${statusLabel}`,
      headerSubtitle: `Status transition: ${previousLabel} → ${statusLabel}`,
      referenceLabel: "ORDER REF",
      referenceValue: order.orderNumber,
      body: `
        <div style="background:#FFF1F2;border:1px solid #FECDD3;border-radius:12px;padding:16px;margin-bottom:20px;">
          <div style="font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;color:#9F1239;margin-bottom:4px;">
            Status: ${escapeEmailHtml(previousLabel)} &rarr; ${escapeEmailHtml(statusLabel)}
          </div>
          <p style="margin:0;font-size:14px;line-height:1.55;color:#881337;">
            Order <strong>${escapeEmailHtml(order.orderNumber)}</strong> (${euros(order.totalCents)}) has been updated to <strong>${escapeEmailHtml(statusLabel)}</strong>. If a payment was already settled on this order, any applicable refund is processed within 7 business days.
          </p>
        </div>

        ${orderLink ? renderEmailButton("View order record", orderLink, "ink") : ""}
      `,
    })
    return sendEmail({ to: order.email, subject, html, text })
  }

  // Form 2E: Reviewing Payment or Other Status Transition Bulletin
  const html = renderEmail({
    variant: "verification",
    preheader: `Order ${order.orderNumber} is now ${statusLabel}`,
    eyebrow: "ORDER STATUS UPDATE BULLETIN",
    badgeText: statusLabel.toUpperCase(),
    badgeTone: "cobalt",
    headerTitle: "Your order status has been updated",
    headerSubtitle: `Order ${order.orderNumber} · Total ${euros(order.totalCents)}`,
    referenceLabel: "ORDER REF",
    referenceValue: order.orderNumber,
    body: `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;background:#F8FAFC;border:1px solid #CBD5E1;border-radius:12px;padding:16px;">
        <tr>
          <td width="45%">
            <div style="font-size:10px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#64748B;">Previous Status</div>
            <div style="margin-top:4px;font-size:15px;font-weight:700;color:#475569;">${escapeEmailHtml(previousLabel)}</div>
          </td>
          <td width="10%" align="center" style="font-size:18px;font-weight:800;color:#1E40D8;">&rarr;</td>
          <td width="45%" align="right">
            <div style="font-size:10px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#1E40D8;">Current Status</div>
            <div style="margin-top:4px;font-size:15px;font-weight:800;color:#0F172A;">${escapeEmailHtml(statusLabel)}</div>
          </td>
        </tr>
      </table>

      ${
        order.trackingNumber
          ? `<div style="background:#EFF6FF;border:1px solid #BFDBFE;border-radius:12px;padding:14px 16px;margin-bottom:20px;font-size:14px;color:#1E3A8A;">
              <strong>Tracking number:</strong> <span style="font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-weight:700;">${escapeEmailHtml(order.trackingNumber)}</span>
              ${order.trackingUrl ? `<div style="margin-top:8px;"><a href="${escapeEmailHtml(order.trackingUrl)}" style="color:#1E40D8;font-weight:700;text-decoration:none;">Track your parcel &rarr;</a></div>` : ""}
            </div>`
          : ""
      }

      ${orderLink ? renderEmailButton("View your order", orderLink, "cobalt") : ""}
    `,
  })

  return sendEmail({ to: order.email, subject, html, text })
}

/**
 * Form 3: Courier Waybill & Dispatch Manifest ("waybill" layout)
 */
export async function sendOrderShippedEmail(order: OrderWithItems): Promise<SendResult> {
  const base = siteUrl()
  const orderLink = base ? `${base}/en/order/${order.orderNumber}` : ""
  const carrier = order.carrier?.trim()
  const trackingNumber = order.trackingNumber?.trim()
  const trackingUrl = order.trackingUrl?.trim()

  const subject = `Your 3DEureka order ${order.orderNumber} has shipped`

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

  const html = renderEmail({
    variant: "waybill",
    preheader: `Order ${order.orderNumber} has shipped${trackingNumber ? ` · Tracking ${trackingNumber}` : ""}`,
    eyebrow: "DISPATCH MANIFEST & WAYBILL",
    badgeText: "DISPATCHED",
    badgeTone: "signal",
    headerTitle: "Your order is on its way",
    headerSubtitle: `Order ${order.orderNumber} has left our warehouse and is en route to your destination.`,
    referenceLabel: "ORDER REF",
    referenceValue: order.orderNumber,
    body: `
      ${renderStepTracker(["Order Confirmed", "Dispatched", "In Transit", "Delivered"], 1)}

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 22px;background:#0C1530;border:1px solid #1E293B;border-radius:14px;overflow:hidden;">
        <tr>
          <td style="padding:12px 18px;background:#16244D;border-bottom:1px solid #263B70;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#93C5FD;">
                  PARCEL TELEMETRY PASSPORT
                </td>
                <td align="right" style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;font-weight:700;color:#FACC15;">
                  ${carrier ? escapeEmailHtml(carrier) : "3DEureka Courier"}
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:18px;">
            ${
              carrier
                ? `<div style="margin-bottom:10px;font-size:13px;color:#CBD5E1;">
                    <span style="color:#94A3B8;">Assigned Carrier:</span> <strong style="color:#FFFFFF;">${escapeEmailHtml(carrier)}</strong>
                  </div>`
                : ""
            }
            ${
              trackingNumber
                ? `<div style="margin-bottom:16px;padding:12px 14px;background:#091126;border:1px solid #2D4379;border-radius:10px;">
                    <div style="font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#94A3B8;margin-bottom:4px;">Tracking Number</div>
                    <div style="font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:16px;font-weight:800;letter-spacing:0.04em;color:#FACC15;word-break:break-all;">
                      ${escapeEmailHtml(trackingNumber)}
                    </div>
                  </div>`
                : ""
            }
            ${trackingUrl ? renderEmailButton("Track your parcel", trackingUrl, "signal") : ""}
          </td>
        </tr>
      </table>

      <div style="font-size:11px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#475569;margin:0 0 8px;">
        PACKING LIST
      </div>
      ${renderOrderItemsLedger(order, parseMemberDiscountCents(order.notes))}

      ${
        orderLink
          ? `<p style="margin:0;">
              <a href="${escapeEmailHtml(orderLink)}" style="font-size:14px;font-weight:700;color:#1E40D8;text-decoration:none;">
                View full order details &rarr;
              </a>
            </p>`
          : ""
      }
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
 * Form 4: Live Courier Checkpoint & Telemetry Card (localized across 6 languages)
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

  const statusCardBg = isDelivered ? "#ECFDF5" : isException ? "#FFFBEB" : "#EFF6FF"
  const statusCardBorder = isDelivered ? "#A7F3D0" : isException ? "#FDE68A" : "#BFDBFE"
  const statusAccent = isDelivered ? "#059669" : isException ? "#D97706" : "#1E40D8"
  const statusTitleColor = isDelivered ? "#064E3B" : isException ? "#78350F" : "#1E3A8A"

  const progressCells = [0, 1, 2, 3]
    .map((idx) => {
      const active = idx <= stageIdx
      const barBg = active ? statusAccent : "#E2E8F0"
      return `<td width="25%" style="padding:0 3px;"><div style="height:6px;border-radius:999px;background:${barBg};"></div></td>`
    })
    .join("")

  const html = renderEmail({
    variant: isDelivered ? "certificate" : isException ? "remittance" : "waybill",
    preheader: copy.body(order.orderNumber, statusLabel),
    eyebrow: "COURIER TELEMETRY CHECKPOINT",
    badgeText: statusLabel,
    badgeTone: isDelivered ? "emerald" : isException ? "amber" : "signal",
    headerTitle: copy.heading,
    headerSubtitle: copy.body(order.orderNumber, statusLabel),
    referenceLabel: "ORDER",
    referenceValue: order.orderNumber,
    body: `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 18px;">
        <tr>${progressCells}</tr>
      </table>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;background:${statusCardBg};border:1px solid ${statusCardBorder};border-left:5px solid ${statusAccent};border-radius:14px;padding:18px;">
        <tr>
          <td>
            <div style="font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${statusAccent};margin-bottom:4px;">
              ${escapeEmailHtml(order.orderNumber)}
            </div>
            <div style="font-size:18px;font-weight:800;color:${statusTitleColor};line-height:1.3;">
              ${escapeEmailHtml(statusLabel)}
            </div>
            ${
              location
                ? `<div style="margin-top:10px;font-size:14px;color:#0F172A;">
                    <strong>${escapeEmailHtml(copy.location)}:</strong> ${escapeEmailHtml(location)}
                  </div>`
                : ""
            }
            ${
              comment
                ? `<div style="margin-top:8px;padding:10px 12px;background:#FFFFFF;border-radius:8px;font-size:14px;line-height:1.55;color:#1E293B;">
                    <strong>${escapeEmailHtml(copy.comment)}:</strong> ${escapeEmailHtml(comment)}
                  </div>`
                : ""
            }
          </td>
        </tr>
      </table>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;background:#0C1530;border-radius:14px;padding:18px;color:#FFFFFF;">
        <tr>
          <td>
            ${
              carrier
                ? `<p style="margin:0 0 6px;font-size:14px;color:#CBD5E1;">
                    <strong style="color:#94A3B8;">${escapeEmailHtml(copy.carrier)}:</strong> <span style="color:#FFFFFF;font-weight:700;">${escapeEmailHtml(carrier)}</span>
                  </p>`
                : ""
            }
            ${
              trackingNumber
                ? `<p style="margin:0 0 14px;font-size:14px;color:#CBD5E1;">
                    <strong style="color:#94A3B8;">${escapeEmailHtml(copy.tracking)}:</strong>
                    <span style="font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-weight:800;color:#FACC15;">${escapeEmailHtml(trackingNumber)}</span>
                  </p>`
                : ""
            }
            ${trackingUrl ? renderEmailButton(copy.button, trackingUrl, "signal") : ""}
          </td>
        </tr>
      </table>
    `,
  })

  return sendEmail({ to: order.email, subject, html, text })
}

/**
 * Form 5: Reservation & Payment Remittance Slip ("remittance" layout)
 */
export async function sendPaymentReminderEmail(order: OrderWithItems): Promise<SendResult> {
  const base = siteUrl()
  const orderLink = base ? `${base}/en/order/${order.orderNumber}` : ""
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
    `Welcome to 3DEureka, and thank you for your order — we're delighted to have you with us!`,
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
    isCard
      ? `Card payment of ${euros(order.totalCents)} is still open. Open your order page to complete payment by Visa or Mastercard. If you have already paid, wait for the status to update and do not pay twice.`
      : null,
    isOpenBanking
      ? `Open Banking payment of ${euros(order.totalCents)} is still open. Open your order page to complete payment from your bank app or via IBAN. If you have already paid, wait for the status to update and do not pay twice.`
      : null,
    "",
    "If you've already paid and just haven't clicked the confirmation button yet, no problem — just head to your order page and let us know. And if you've changed your mind or run into any trouble, simply reply to this email; we're happy to help.",
    orderLink ? `\nView your order: ${orderLink}` : null,
    "",
    "Looking forward to getting your order on its way to you soon!",
  ]
    .filter((line) => line !== null)
    .join("\n")

  const methodInstructionsHtml = isSepa
    ? renderSepaVoucherHtml(
        order.orderNumber,
        order.totalCents,
        "If you haven't sent the bank transfer yet, please use the exact SEPA details below and include your order number as the reference.",
      )
    : isCrypto
      ? `<div style="background:#FFFBEB;border:2px dashed #F59E0B;border-radius:12px;padding:16px;margin-bottom:20px;">
          <p style="margin:0 0 8px;font-size:13px;color:#78350F;">If you haven't sent the payment yet, here are the wallet details again:</p>
          <div style="padding:10px;background:#FFFFFF;border:1px solid #FDE68A;border-radius:8px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:12px;color:#0F172A;word-break:break-all;">
            Amount: <strong>${euros(order.totalCents)}</strong> &middot; ${escapeEmailHtml(cryptoCoin.coinLabel)} &middot; ${escapeEmailHtml(cryptoCoin.network)}<br>
            Address: <strong>${escapeEmailHtml(cryptoCoin.address)}</strong>
          </div>
        </div>`
      : `<div style="background:#FFFBEB;border:1px solid #FDE68A;border-left:4px solid #F59E0B;border-radius:12px;padding:16px;margin-bottom:20px;">
          <div style="font-size:11px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#92400E;margin-bottom:4px;">
            PAYMENT METHOD: ${escapeEmailHtml(paymentLabel)}
          </div>
          <p style="margin:0;font-size:14px;line-height:1.55;color:#78350F;">
            ${
              isPaypal
                ? escapeEmailHtml(paypalReminderText(order.totalCents))
                : isOpenBanking
                  ? `Open Banking payment of <strong>${euros(order.totalCents)}</strong> is still open. Open your order page to complete instant payment from your bank app or switch payment method.`
                  : `Card payment of <strong>${euros(order.totalCents)}</strong> is still open. Open your order page to complete payment by Visa or Mastercard.`
            }
          </p>
        </div>`

  const html = renderEmail({
    variant: "remittance",
    preheader: `Order ${order.orderNumber} (${euros(order.totalCents)}) is awaiting payment confirmation`,
    eyebrow: "RESERVATION & PAYMENT REMINDER",
    badgeText: "AWAITING PAYMENT",
    badgeTone: "amber",
    headerTitle: `Welcome to 3DEureka${firstName ? `, ${firstName}` : ""}!`,
    headerSubtitle: `We are holding the items for order ${order.orderNumber} while awaiting payment confirmation.`,
    referenceLabel: "AMOUNT DUE",
    referenceValue: euros(order.totalCents),
    body: `
      <p style="margin:0 0 18px;color:#334155;font-size:14px;line-height:1.65;">
        Thank you for choosing <strong style="color:#0F172A;">3DEureka</strong>. We noticed order <strong style="color:#0F172A;">${escapeEmailHtml(order.orderNumber)}</strong> is still marked as <strong>awaiting payment</strong>, so we wanted to share your payment slip and order link in case you still need to complete it.
      </p>

      ${methodInstructionsHtml}

      ${renderOrderItemsLedger(order, parseMemberDiscountCents(order.notes))}

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 22px;background:#F8FAFC;border:1px solid #CBD5E1;border-radius:12px;padding:14px 16px;">
        <tr>
          <td>
            <div style="font-size:11px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:#1E40D8;margin-bottom:4px;">
              ALREADY SENT YOUR PAYMENT?
            </div>
            <p style="margin:0;font-size:13px;line-height:1.55;color:#475569;">
              If you have already completed the transfer and simply haven&apos;t clicked the confirmation button yet, open your order page and press <strong>&ldquo;I&apos;ve paid&rdquo;</strong> so our accounting team can verify it right away. If you need any help, just reply to this email.
            </p>
          </td>
        </tr>
      </table>

      ${orderLink ? renderEmailButton("Open order & complete payment", orderLink, "cobalt") : ""}
    `,
  })

  return sendEmail({ to: order.email, subject, html, text })
}

/**
 * Form 6: Accounting Verification Ticket ("verification" layout)
 */
export async function sendPaymentUnderReviewEmail(order: OrderWithItems): Promise<SendResult> {
  const base = siteUrl()
  const orderLink = base ? `${base}/en/order/${order.orderNumber}` : ""
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
    eyebrow: "ACCOUNTING RECONCILIATION TICKET",
    badgeText: "UNDER REVIEW",
    badgeTone: "cobalt",
    headerTitle: "We're verifying your payment",
    headerSubtitle: `Your payment confirmation for order ${order.orderNumber} is in our verification queue.`,
    referenceLabel: "ORDER REF",
    referenceValue: order.orderNumber,
    body: `
      ${renderStepTracker(["Notice Received", "Bank / Gateway Verification", "Order Cleared for Dispatch"], 1)}

      <p style="margin:0 0 18px;color:#334155;font-size:14px;line-height:1.65;">
        Thank you &mdash; we have received your payment confirmation for order <strong style="color:#0F172A;">${escapeEmailHtml(order.orderNumber)}</strong>. Our team is now matching the incoming transaction and will move your order to warehouse preparation as soon as it clears.
      </p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 22px;background:#F8FAFC;border:1px solid #CBD5E1;border-radius:12px;font-size:13px;">
        <tr>
          <td style="padding:10px 14px;border-bottom:1px solid #E2E8F0;color:#64748B;">Order Reference</td>
          <td align="right" style="padding:10px 14px;border-bottom:1px solid #E2E8F0;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-weight:700;color:#0F172A;">${escapeEmailHtml(order.orderNumber)}</td>
        </tr>
        <tr>
          <td style="padding:10px 14px;border-bottom:1px solid #E2E8F0;color:#64748B;">Payment Channel</td>
          <td align="right" style="padding:10px 14px;border-bottom:1px solid #E2E8F0;font-weight:600;color:#0F172A;">${escapeEmailHtml(paymentLabel)}</td>
        </tr>
        <tr>
          <td style="padding:10px 14px;color:#64748B;">Declared Amount</td>
          <td align="right" style="padding:10px 14px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-weight:800;color:#1E40D8;">${euros(order.totalCents)}</td>
        </tr>
      </table>

      ${orderLink ? renderEmailButton("View your order status", orderLink, "cobalt") : ""}
    `,
  })

  return sendEmail({ to: order.email, subject, html, text })
}
