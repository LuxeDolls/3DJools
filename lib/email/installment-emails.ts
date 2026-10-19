import "server-only"

import { COMPANY } from "@/lib/company"
import { renderEmail } from "@/lib/email/layout"
import { sendEmail, type SendResult } from "@/lib/email/send"
import type { InstallmentApplication } from "@/lib/db/schema"
import { BANK_TRANSFER_ACCOUNT } from "@/lib/payments/bank-transfer"

function euros(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`
}

function siteUrl(): string {
  return COMPANY.url
}

function statusLink(app: InstallmentApplication): string {
  const base = siteUrl()
  return base ? `${base}/en/installments/${app.applicationRef}` : ""
}

function wrapHtml(title: string, bodyHtml: string): string {
  return renderEmail({
    preheader: title,
    body: `<h1 style="margin:0 0 8px;font-size:26px;line-height:1.2;color:#111">${title}</h1>${bodyHtml}`,
  })
}

/**
 * Sent immediately after a customer submits an installment application,
 * confirming we received it and are reviewing their KYC details.
 */
export async function sendInstallmentApplicationReceivedEmail(app: InstallmentApplication): Promise<SendResult> {
  const link = statusLink(app)
  const subject = `We've received your installment application — ${app.applicationRef}`

  const text = [
    `Thanks, ${app.firstName} — we've received your installment application.`,
    `Reference: ${app.applicationRef}`,
    "",
    `Order total: ${euros(app.totalAmountCents)}`,
    `Down payment (due once approved): ${euros(app.downPaymentCents)}`,
    `Remaining balance: ${euros(app.remainingCents)}`,
    "",
    "We're reviewing your details and will notify you as soon as a decision is made.",
    link ? `\nTrack your application: ${link}` : null,
  ]
    .filter((line) => line !== null)
    .join("\n")

  const html = wrapHtml(
    "We've received your application",
    `<p style="margin:0 0 4px;color:#555;font-size:14px">Reference <strong>${app.applicationRef}</strong></p>
    <p style="margin:16px 0;color:#111;font-size:14px;line-height:1.6">Thanks, ${app.firstName} — we're reviewing your installment application and KYC details. We'll email you as soon as a decision is made.</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin:16px 0">
      <tr><td style="padding:4px 0;color:#555">Order total</td><td style="padding:4px 0;text-align:right;color:#111">${euros(app.totalAmountCents)}</td></tr>
      <tr><td style="padding:4px 0;color:#555">Down payment</td><td style="padding:4px 0;text-align:right;color:#111">${euros(app.downPaymentCents)}</td></tr>
      <tr><td style="padding:4px 0;color:#555">Remaining balance</td><td style="padding:4px 0;text-align:right;color:#111">${euros(app.remainingCents)}</td></tr>
    </table>
    ${link ? `<p style="margin:20px 0 0"><a href="${link}" style="display:inline-block;background:#f97316;color:#111111;padding:13px 22px;border-radius:999px;text-decoration:none;font-weight:700;font-size:14px">Track your application</a></p>` : ""}`,
  )

  return sendEmail({ to: app.email, subject, html, text })
}

/**
 * Sent when an admin approves the application — the down payment is now due.
 */
export async function sendInstallmentApplicationApprovedEmail(app: InstallmentApplication): Promise<SendResult> {
  const link = statusLink(app)
  const subject = `Your installment application was approved — ${app.applicationRef}`

  const text = [
    `Good news, ${app.firstName} — your installment application ${app.applicationRef} has been approved.`,
    `Please pay your down payment of ${euros(app.downPaymentCents)} to activate your order.`,
    "",
    `Account name: ${BANK_TRANSFER_ACCOUNT.accountName}`,
    `IBAN: ${BANK_TRANSFER_ACCOUNT.iban}`,
    `BIC: ${BANK_TRANSFER_ACCOUNT.bic}`,
    `Amount: ${euros(app.downPaymentCents)}`,
    `Reference: ${app.applicationRef}`,
    "Put the reference in the payment description.",
    link ? `\nPay your down payment: ${link}` : null,
  ]
    .filter((line) => line !== null)
    .join("\n")

  const html = wrapHtml(
    "Your application was approved",
    `<p style="margin:0 0 4px;color:#555;font-size:14px">Reference <strong>${app.applicationRef}</strong></p>
    <p style="margin:16px 0;color:#111;font-size:14px;line-height:1.6">Good news, ${app.firstName} — your installment application has been approved. Please pay your down payment of <strong>${euros(app.downPaymentCents)}</strong> to activate your order. Put <strong>${app.applicationRef}</strong> in the payment description.</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin:16px 0">
      <tr><td style="padding:4px 0;color:#555">Account name</td><td style="padding:4px 0;text-align:right;color:#111">${BANK_TRANSFER_ACCOUNT.accountName}</td></tr>
      <tr><td style="padding:4px 0;color:#555">IBAN</td><td style="padding:4px 0;text-align:right;color:#111">${BANK_TRANSFER_ACCOUNT.iban}</td></tr>
      <tr><td style="padding:4px 0;color:#555">BIC</td><td style="padding:4px 0;text-align:right;color:#111">${BANK_TRANSFER_ACCOUNT.bic}</td></tr>
      <tr><td style="padding:4px 0;color:#555">Amount</td><td style="padding:4px 0;text-align:right;color:#111">${euros(app.downPaymentCents)}</td></tr>
      <tr><td style="padding:4px 0;color:#555">Reference</td><td style="padding:4px 0;text-align:right;color:#111">${app.applicationRef}</td></tr>
    </table>
    ${link ? `<p style="margin:20px 0 0"><a href="${link}" style="display:inline-block;background:#f97316;color:#111111;padding:13px 22px;border-radius:999px;text-decoration:none;font-weight:700;font-size:14px">Pay your down payment</a></p>` : ""}`,
  )

  return sendEmail({ to: app.email, subject, html, text })
}

/** Sent when an admin rejects the application. */
export async function sendInstallmentPaymentStatusEmail(
  app: InstallmentApplication,
  scheduleIndex: number,
  orderStatus: string,
): Promise<SendResult> {
  const entry = app.schedule[scheduleIndex]
  if (!entry) return { sent: false, error: "Installment schedule entry not found" }

  const link = statusLink(app)
  const paymentLabel = entry.label === "down_payment" ? "down payment" : `installment ${scheduleIndex}`
  const statusLabel = entry.status === "paid" ? "Paid" : entry.status === "reviewing" ? "Payment under review" : "Unpaid"
  const subject = `Payment update for your installment order — ${app.applicationRef}`
  const text = [
    `Hi ${app.firstName},`,
    `Your ${paymentLabel} of ${euros(entry.amountCents)} is now: ${statusLabel}.`,
    `Order status: ${orderStatus}.`,
    link ? `\nView your installment plan: ${link}` : null,
  ].filter((line) => line !== null).join("\n")

  const html = wrapHtml(
    "Payment status update",
    `<p style="margin:0 0 4px;color:#555;font-size:14px">Reference <strong>${app.applicationRef}</strong></p>
    <p style="margin:16px 0;color:#111;font-size:14px;line-height:1.6">Hi ${app.firstName}, your <strong>${paymentLabel}</strong> of <strong>${euros(entry.amountCents)}</strong> is now <strong>${statusLabel}</strong>.</p>
    <p style="margin:0;color:#111;font-size:14px;line-height:1.6">Your order status is <strong>${orderStatus}</strong>.</p>
    ${link ? `<p style="margin:20px 0 0"><a href="${link}" style="display:inline-block;background:#f97316;color:#111111;padding:13px 22px;border-radius:999px;text-decoration:none;font-weight:700;font-size:14px">View your installment plan</a></p>` : ""}`,
  )

  return sendEmail({ to: app.email, subject, html, text })
}

export async function sendInstallmentApplicationRejectedEmail(app: InstallmentApplication): Promise<SendResult> {
  const subject = `Update on your installment application — ${app.applicationRef}`

  const text = `Hi ${app.firstName}, unfortunately we're unable to approve your installment application ${app.applicationRef} at this time. If you have questions, please contact our support team.`

  const html = wrapHtml(
    "Update on your application",
    `<p style="margin:0 0 4px;color:#555;font-size:14px">Reference <strong>${app.applicationRef}</strong></p>
    <p style="margin:16px 0;color:#111;font-size:14px;line-height:1.6">Hi ${app.firstName}, unfortunately we're unable to approve your installment application at this time. If you have questions, please contact our support team.</p>`,
  )

  return sendEmail({ to: app.email, subject, html, text })
}
