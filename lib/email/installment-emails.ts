import "server-only"

import { COMPANY } from "@/lib/company"
import {
  EMAIL_FONT,
  EMAIL_PALETTE as P,
  emailDetails,
  emailNotice,
  emailParagraph,
  emailSectionTitle,
  emailTone,
  escapeEmailHtml,
  renderEmail,
  renderEmailButton,
  renderStepTracker,
} from "@/lib/email/layout"
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

function renderScheduleTable(app: InstallmentApplication, highlightIndex?: number): string {
  if (!app.schedule?.length) return ""
  const cell = `font-family:${EMAIL_FONT};font-size:14px;line-height:1.45;`
  const rows = app.schedule
    .map((entry, idx) => {
      const label = entry.label === "down_payment" ? "Down payment (1/3)" : `Payment ${idx + 1} of 3`
      const when = entry.label === "down_payment" ? "After approval" : `${idx * 2} weeks later`
      const status =
        entry.status === "paid"
          ? { text: "Paid", tone: emailTone("emerald") }
          : entry.status === "reviewing"
            ? { text: "Under review", tone: emailTone("cobalt") }
            : { text: "Upcoming", tone: emailTone("slate") }
      const highlighted = idx === highlightIndex
      const border = idx === app.schedule.length - 1 ? "" : `border-bottom:1px solid ${P.border};`
      return `<tr>
        <td valign="top" style="padding:12px 0;${border}${cell}color:${P.text};text-align:left;">
          <span style="font-weight:${highlighted ? "700" : "600"};">${escapeEmailHtml(label)}</span><br>
          <span style="font-size:13px;color:${P.textSubtle};">${escapeEmailHtml(when)}</span>
          <span style="display:inline-block;margin-left:6px;padding:2px 8px;border-radius:999px;background:${status.tone.bg};color:${status.tone.fg};font-size:12px;font-weight:700;">${status.text}</span>
        </td>
        <td valign="top" align="right" style="padding:12px 0 12px 12px;${border}${cell}font-weight:${highlighted ? "700" : "600"};color:${P.text};white-space:nowrap;">${euros(entry.amountCents)}</td>
      </tr>`
    })
    .join("")

  return `${emailSectionTitle("Payment schedule · 0% interest")}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;border-top:1px solid ${P.border};border-bottom:1px solid ${P.border};">${rows}</table>`
}

function renderPlanSummary(app: InstallmentApplication): string {
  return emailDetails([
    { label: "Order total", value: euros(app.totalAmountCents), strong: true },
    { label: "Down payment (1/3)", value: euros(app.downPaymentCents) },
    { label: "Remaining (2 payments)", value: euros(app.remainingCents) },
    { label: "Interest & fees", value: "None" },
  ])
}

export async function sendInstallmentApplicationReceivedEmail(
  app: InstallmentApplication,
): Promise<SendResult> {
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

  const html = renderEmail({
    variant: "passport",
    preheader: `We've received your 3× 0% installment application ${app.applicationRef}`,
    badgeText: "Under review",
    badgeTone: "cobalt",
    headerTitle: "We've received your application",
    headerSubtitle: "3 equal payments every 2 weeks, with no interest or fees.",
    referenceLabel: "Application",
    referenceValue: app.applicationRef,
    body: `
      ${renderStepTracker(["Application sent", "Review", "Down payment", "Dispatch"], 1)}
      ${emailParagraph(`Thanks, <strong>${escapeEmailHtml(app.firstName)}</strong>. We've received your application and documents. Our team is reviewing them and will email you as soon as there's a decision.`)}
      ${renderPlanSummary(app)}
      ${renderScheduleTable(app)}
      ${renderEmailButton("Track your application", link)}
    `,
  })

  return sendEmail({ to: app.email, subject, html, text })
}

export async function sendInstallmentApplicationApprovedEmail(
  app: InstallmentApplication,
): Promise<SendResult> {
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

  const html = renderEmail({
    variant: "certificate",
    preheader: `Application ${app.applicationRef} approved — pay the ${euros(app.downPaymentCents)} down payment to start your order`,
    badgeText: "Approved",
    badgeTone: "emerald",
    headerTitle: "Your application was approved",
    headerSubtitle: `Good news, ${app.firstName}. Pay the down payment and we'll ship your order.`,
    referenceLabel: "Application",
    referenceValue: app.applicationRef,
    body: `
      ${renderStepTracker(["Approved", "Down payment", "Dispatch", "Remaining payments"], 1, P.success)}
      ${emailParagraph(`Please transfer the down payment of <strong>${euros(app.downPaymentCents)}</strong> using the details below. Put <strong>${escapeEmailHtml(app.applicationRef)}</strong> in the payment description so we can match it to your order.`)}
      ${emailDetails(
        [
          { label: "Beneficiary", value: escapeEmailHtml(BANK_TRANSFER_ACCOUNT.accountName) },
          { label: "IBAN", value: escapeEmailHtml(BANK_TRANSFER_ACCOUNT.iban), mono: true },
          { label: "BIC / SWIFT", value: escapeEmailHtml(BANK_TRANSFER_ACCOUNT.bic), mono: true },
          { label: "Amount", value: euros(app.downPaymentCents), strong: true },
          { label: "Payment reference", value: escapeEmailHtml(app.applicationRef), mono: true, strong: true },
        ],
        { title: "Bank transfer details" },
      )}
      ${renderScheduleTable(app, 0)}
      ${renderEmailButton("Pay your down payment", link, "emerald")}
    `,
  })

  return sendEmail({ to: app.email, subject, html, text })
}

export async function sendInstallmentPaymentStatusEmail(
  app: InstallmentApplication,
  scheduleIndex: number,
  orderStatus: string,
): Promise<SendResult> {
  const entry = app.schedule[scheduleIndex]
  if (!entry) return { sent: false, error: "Installment schedule entry not found" }

  const link = statusLink(app)
  const paymentLabel = entry.label === "down_payment" ? "down payment" : `payment ${scheduleIndex + 1} of 3`
  const statusLabel =
    entry.status === "paid" ? "Paid" : entry.status === "reviewing" ? "Payment under review" : "Unpaid"
  const subject = `Payment update for your installment order — ${app.applicationRef}`

  const text = [
    `Hi ${app.firstName},`,
    `Your ${paymentLabel} of ${euros(entry.amountCents)} is now: ${statusLabel}.`,
    `Order status: ${orderStatus}.`,
    link ? `\nView your installment plan: ${link}` : null,
  ]
    .filter((line) => line !== null)
    .join("\n")

  const html = renderEmail({
    variant: entry.status === "paid" ? "certificate" : "verification",
    preheader: `Your ${paymentLabel} (${euros(entry.amountCents)}) is now ${statusLabel}`,
    badgeText: statusLabel,
    badgeTone: entry.status === "paid" ? "emerald" : "cobalt",
    headerTitle: "Payment status update",
    headerSubtitle: `Your ${paymentLabel} of ${euros(entry.amountCents)} is now: ${statusLabel}.`,
    referenceLabel: "Application",
    referenceValue: app.applicationRef,
    body: `
      ${emailParagraph(`Hi <strong>${escapeEmailHtml(app.firstName)}</strong>, here's the latest on your installment plan. Your order status is <strong>${escapeEmailHtml(orderStatus)}</strong>.`)}
      ${renderScheduleTable(app, scheduleIndex)}
      ${renderEmailButton("View your installment plan", link)}
    `,
  })

  return sendEmail({ to: app.email, subject, html, text })
}

export async function sendInstallmentApplicationRejectedEmail(
  app: InstallmentApplication,
): Promise<SendResult> {
  const checkoutUrl = `${siteUrl()}/en/checkout`
  const subject = `Update on your installment application — ${app.applicationRef}`

  const text = `Hi ${app.firstName}, unfortunately we're unable to approve your installment application ${app.applicationRef} at this time. You can still pay for your order by card, Open Banking or SEPA bank transfer. If you have questions, reply to this email.`

  const html = renderEmail({
    variant: "passport",
    preheader: `Decision on your installment application ${app.applicationRef}`,
    badgeText: "Not approved",
    badgeTone: "rose",
    headerTitle: "Update on your application",
    referenceLabel: "Application",
    referenceValue: app.applicationRef,
    body: `
      ${emailParagraph(`Hi <strong>${escapeEmailHtml(app.firstName)}</strong>, unfortunately we&apos;re unable to approve your installment application at this time.`)}
      ${emailNotice({
        tone: "slate",
        title: "You can still place your order",
        html: "Pay at checkout by Visa / Mastercard, instant Open Banking, or SEPA bank transfer. If you have questions about the decision, just reply to this email.",
      })}
      ${renderEmailButton("Go to checkout", checkoutUrl, "ink")}
    `,
  })

  return sendEmail({ to: app.email, subject, html, text })
}
