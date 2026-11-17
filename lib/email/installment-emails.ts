import "server-only"

import { COMPANY } from "@/lib/company"
import {
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
  const rows = app.schedule
    .map((entry, idx) => {
      const label =
        entry.label === "down_payment"
          ? "1/3 Down payment (activates order)"
          : `Installment #${idx} (${idx * 2} weeks)`
      const statusBadge =
        entry.status === "paid"
          ? `<span style="display:inline-block;padding:3px 9px;border-radius:999px;background:#ECFDF5;border:1px solid #A7F3D0;color:#065F46;font-size:11px;font-weight:800;">PAID</span>`
          : entry.status === "reviewing"
            ? `<span style="display:inline-block;padding:3px 9px;border-radius:999px;background:#EFF6FF;border:1px solid #BFDBFE;color:#1E40D8;font-size:11px;font-weight:800;">UNDER REVIEW</span>`
            : `<span style="display:inline-block;padding:3px 9px;border-radius:999px;background:#FFFBEB;border:1px solid #FDE68A;color:#92400E;font-size:11px;font-weight:800;">DUE / UPCOMING</span>`
      const rowBg = idx === highlightIndex ? "#EFF6FF" : "#FFFFFF"

      return `<tr style="background:${rowBg};">
        <td style="padding:10px 12px;border-bottom:1px solid #E2E8F0;font-size:13px;font-weight:${idx === highlightIndex ? "700" : "500"};color:#0F172A;">
          ${escapeEmailHtml(label)}
        </td>
        <td align="center" style="padding:10px 8px;border-bottom:1px solid #E2E8F0;">
          ${statusBadge}
        </td>
        <td align="right" style="padding:10px 12px;border-bottom:1px solid #E2E8F0;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:13px;font-weight:700;color:#0F172A;">
          ${euros(entry.amountCents)}
        </td>
      </tr>`
    })
    .join("")

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 22px;border:1px solid #CBD5E1;border-radius:12px;overflow:hidden;background:#FFFFFF;">
    <thead>
      <tr style="background:#F1F5F9;">
        <th align="left" style="padding:9px 12px;font-size:10px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#475569;border-bottom:1px solid #CBD5E1;">Payment Tranche (0% APR)</th>
        <th align="center" style="padding:9px 8px;font-size:10px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#475569;border-bottom:1px solid #CBD5E1;">Status</th>
        <th align="right" style="padding:9px 12px;font-size:10px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#475569;border-bottom:1px solid #CBD5E1;">Amount</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`
}

/**
 * Form 7: KYC & 3× 0% Installment Application Dossier ("passport" layout)
 */
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
    eyebrow: "3× 0% APR FINANCING APPLICATION DOSSIER",
    badgeText: "KYC UNDER REVIEW",
    badgeTone: "cobalt",
    headerTitle: "We've received your application",
    headerSubtitle: `Submitted by ${app.firstName} ${app.lastName} · 3 equal bi-weekly payments at 0% interest`,
    referenceLabel: "APPLICATION REF",
    referenceValue: app.applicationRef,
    body: `
      ${renderStepTracker(["Application Submitted", "KYC & VAT Verification", "Down Payment (1/3)", "Order Dispatched"], 1)}

      <p style="margin:0 0 18px;color:#334155;font-size:14px;line-height:1.65;">
        Thanks, <strong style="color:#0F172A;">${escapeEmailHtml(app.firstName)}</strong> &mdash; we have received your 3&times; 0% installment application and identity documents. Our verification team is reviewing your file and will email you as soon as a decision is recorded.
      </p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 22px;">
        <tr>
          <td width="33%" valign="top" style="padding-right:6px;">
            <div style="background:#F8FAFC;border:1px solid #CBD5E1;border-radius:12px;padding:12px;">
              <div style="font-size:10px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#64748B;">Order Total</div>
              <div style="margin-top:4px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:17px;font-weight:800;color:#0F172A;">${euros(app.totalAmountCents)}</div>
              <div style="margin-top:2px;font-size:11px;color:#64748B;">0% APR &middot; No fees</div>
            </div>
          </td>
          <td width="34%" valign="top" style="padding:0 3px;">
            <div style="background:#EFF6FF;border:1px solid #BFDBFE;border-radius:12px;padding:12px;">
              <div style="font-size:10px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#1E40D8;">Down Payment (1/3)</div>
              <div style="margin-top:4px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:17px;font-weight:800;color:#1E40D8;">${euros(app.downPaymentCents)}</div>
              <div style="margin-top:2px;font-size:11px;color:#1E3A8A;">Due after approval</div>
            </div>
          </td>
          <td width="33%" valign="top" style="padding-left:6px;">
            <div style="background:#F8FAFC;border:1px solid #CBD5E1;border-radius:12px;padding:12px;">
              <div style="font-size:10px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#64748B;">Remaining (2/3)</div>
              <div style="margin-top:4px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:17px;font-weight:800;color:#0F172A;">${euros(app.remainingCents)}</div>
              <div style="margin-top:2px;font-size:11px;color:#64748B;">2 bi-weekly tranches</div>
            </div>
          </td>
        </tr>
      </table>

      ${renderScheduleTable(app)}

      ${link ? renderEmailButton("Track your application", link, "cobalt") : ""}
    `,
  })

  return sendEmail({ to: app.email, subject, html, text })
}

/**
 * Form 8: Approved 3× 0% Financing Contract & Down-Payment Invoice ("certificate" layout)
 */
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
    preheader: `Application ${app.applicationRef} approved — pay ${euros(app.downPaymentCents)} down payment to activate dispatch`,
    eyebrow: "APPROVED 3× 0% INSTALLMENT AGREEMENT",
    badgeText: "APPROVED · 0% APR",
    badgeTone: "emerald",
    headerTitle: "Your application was approved",
    headerSubtitle: `Good news, ${app.firstName} — your 3× 0% installment plan is approved and ready to activate.`,
    referenceLabel: "CONTRACT REF",
    referenceValue: app.applicationRef,
    body: `
      ${renderStepTracker(["Application Approved", "Pay 1/3 Down Payment", "Order Dispatched", "2 Bi-Weekly Tranches"], 1, "#059669")}

      <p style="margin:0 0 18px;color:#334155;font-size:14px;line-height:1.65;">
        Good news, <strong style="color:#0F172A;">${escapeEmailHtml(app.firstName)}</strong> &mdash; your installment application <strong style="color:#0F172A;">${escapeEmailHtml(app.applicationRef)}</strong> has been approved. Please transfer your 1/3 down payment of <strong>${euros(app.downPaymentCents)}</strong> using the SEPA details below and put <strong>${escapeEmailHtml(app.applicationRef)}</strong> in the payment description to release your order for dispatch.
      </p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 22px;background:#ECFDF5;border:2px solid #10B981;border-radius:14px;overflow:hidden;">
        <tr>
          <td style="background:#065F46;padding:10px 16px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="font-size:11px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#D1FAE5;">
                  DOWN PAYMENT SEPA TRANSFER INSTRUCTIONS
                </td>
                <td align="right" style="font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:13px;font-weight:800;color:#FACC15;">
                  DUE NOW: ${euros(app.downPaymentCents)}
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:14px 16px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#FFFFFF;border:1px solid #A7F3D0;border-radius:10px;font-size:13px;">
              <tr>
                <td style="padding:8px 12px;border-bottom:1px solid #ECFDF5;color:#64748B;width:36%;">Account name</td>
                <td style="padding:8px 12px;border-bottom:1px solid #ECFDF5;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-weight:700;color:#0F172A;">${escapeEmailHtml(BANK_TRANSFER_ACCOUNT.accountName)}</td>
              </tr>
              <tr>
                <td style="padding:8px 12px;border-bottom:1px solid #ECFDF5;color:#64748B;">IBAN</td>
                <td style="padding:8px 12px;border-bottom:1px solid #ECFDF5;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-weight:700;color:#1E40D8;">${escapeEmailHtml(BANK_TRANSFER_ACCOUNT.iban)}</td>
              </tr>
              <tr>
                <td style="padding:8px 12px;border-bottom:1px solid #ECFDF5;color:#64748B;">BIC</td>
                <td style="padding:8px 12px;border-bottom:1px solid #ECFDF5;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-weight:700;color:#0F172A;">${escapeEmailHtml(BANK_TRANSFER_ACCOUNT.bic)}</td>
              </tr>
              <tr>
                <td style="padding:8px 12px;border-bottom:1px solid #ECFDF5;color:#64748B;">Amount</td>
                <td style="padding:8px 12px;border-bottom:1px solid #ECFDF5;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-weight:800;color:#065F46;">${euros(app.downPaymentCents)}</td>
              </tr>
              <tr>
                <td style="padding:8px 12px;color:#64748B;">Reference</td>
                <td style="padding:8px 12px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-weight:800;color:#0F172A;">${escapeEmailHtml(app.applicationRef)}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      ${renderScheduleTable(app, 0)}

      ${link ? renderEmailButton("Pay your down payment", link, "emerald") : ""}
    `,
  })

  return sendEmail({ to: app.email, subject, html, text })
}

/**
 * Form 9: Installment Payment Ledger & Schedule Statement ("verification" layout)
 */
export async function sendInstallmentPaymentStatusEmail(
  app: InstallmentApplication,
  scheduleIndex: number,
  orderStatus: string,
): Promise<SendResult> {
  const entry = app.schedule[scheduleIndex]
  if (!entry) return { sent: false, error: "Installment schedule entry not found" }

  const link = statusLink(app)
  const paymentLabel = entry.label === "down_payment" ? "down payment" : `installment ${scheduleIndex}`
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
    eyebrow: "INSTALLMENT SCHEDULE STATEMENT",
    badgeText: statusLabel.toUpperCase(),
    badgeTone: entry.status === "paid" ? "emerald" : "cobalt",
    headerTitle: "Payment status update",
    headerSubtitle: `Reference ${app.applicationRef} · Linked order status: ${orderStatus}`,
    referenceLabel: "PLAN REF",
    referenceValue: app.applicationRef,
    body: `
      <p style="margin:0 0 18px;color:#334155;font-size:14px;line-height:1.65;">
        Hi <strong style="color:#0F172A;">${escapeEmailHtml(app.firstName)}</strong>, your <strong>${escapeEmailHtml(paymentLabel)}</strong> of <strong>${euros(entry.amountCents)}</strong> is now <strong>${escapeEmailHtml(statusLabel)}</strong>. Your overall order status is <strong>${escapeEmailHtml(orderStatus)}</strong>.
      </p>

      ${renderScheduleTable(app, scheduleIndex)}

      ${link ? renderEmailButton("View your installment plan", link, "cobalt") : ""}
    `,
  })

  return sendEmail({ to: app.email, subject, html, text })
}

/**
 * Form 10: Formal Credit Decision Notice ("passport" layout)
 */
export async function sendInstallmentApplicationRejectedEmail(
  app: InstallmentApplication,
): Promise<SendResult> {
  const catalogUrl = `${siteUrl()}/en/checkout`
  const subject = `Update on your installment application — ${app.applicationRef}`

  const text = `Hi ${app.firstName}, unfortunately we're unable to approve your installment application ${app.applicationRef} at this time. If you have questions, please contact our support team.`

  const html = renderEmail({
    variant: "passport",
    preheader: `Decision update for installment application ${app.applicationRef}`,
    eyebrow: "CREDIT & KYC DECISION NOTICE",
    badgeText: "NOT APPROVED",
    badgeTone: "rose",
    headerTitle: "Update on your application",
    headerSubtitle: `Application reference ${app.applicationRef}`,
    referenceLabel: "APPLICATION REF",
    referenceValue: app.applicationRef,
    body: `
      <div style="background:#FFF1F2;border:1px solid #FECDD3;border-radius:12px;padding:16px;margin-bottom:20px;">
        <p style="margin:0;color:#881337;font-size:14px;line-height:1.65;">
          Hi <strong>${escapeEmailHtml(app.firstName)}</strong>, unfortunately we&apos;re unable to approve your installment application <strong>${escapeEmailHtml(app.applicationRef)}</strong> at this time.
        </p>
      </div>

      <p style="margin:0 0 20px;color:#475569;font-size:14px;line-height:1.6;">
        You can still place your order directly at checkout using Visa / Mastercard, instant Open Banking, or standard SEPA bank transfer. If you have questions about your application or would like assistance from our team, simply reply to this email.
      </p>

      ${renderEmailButton("Return to 3DEureka checkout", catalogUrl, "ink")}
    `,
  })

  return sendEmail({ to: app.email, subject, html, text })
}
