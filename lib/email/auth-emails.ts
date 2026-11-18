import "server-only"

import { COMPANY } from "@/lib/company"
import {
  EMAIL_FONT,
  EMAIL_PALETTE as P,
  emailLink,
  emailParagraph,
  emailSectionTitle,
  escapeEmailHtml,
  renderEmail,
  renderEmailButton,
} from "@/lib/email/layout"
import { sendEmail, type SendResult } from "@/lib/email/send"

type NewCustomer = {
  name?: string | null
  email: string
}

function siteUrl(): string {
  return COMPANY.url
}

const BENEFITS = [
  ["Track every order", "See payment, packing and courier updates in one place."],
  ["Member discount", "Automatic savings on qualifying printers and materials."],
  ["3× 0% installments", "Split orders from €1,000 into 3 interest-free payments."],
  ["30-day free returns", "Free return label and a refund within 7 business days."],
] as const

export async function sendWelcomeEmail(user: NewCustomer): Promise<SendResult> {
  const signInUrl = `${siteUrl()}/en/sign-in`
  const catalogUrl = `${siteUrl()}/en/catalog/printers`
  const rawName = user.name?.trim() || "there"
  const safeName = escapeEmailHtml(rawName)
  const subject = "Welcome to 3DEureka — your account is ready"

  const text = [
    `Welcome to 3DEureka, ${rawName}!`,
    "",
    "Your account has been created.",
    `Sign-in email: ${user.email}`,
    "",
    "With your account you get:",
    ...BENEFITS.map(([title, body]) => `- ${title}: ${body}`),
    "",
    `Sign in: ${signInUrl}`,
    `Browse 3D printers: ${catalogUrl}`,
    "",
    `If you did not create this account, please contact us at ${COMPANY.email}.`,
  ].join("\n")

  const benefitsHtml = BENEFITS.map(
    ([title, body], idx) => `<tr>
      <td valign="top" width="20" style="padding:${idx === 0 ? "7px" : "19px"} 0 0;"><div style="width:8px;height:8px;line-height:8px;font-size:0;border-radius:4px;background:${P.primary};">&nbsp;</div></td>
      <td valign="top" style="padding:${idx === 0 ? "0" : "12px"} 0 0;font-family:${EMAIL_FONT};font-size:14px;line-height:1.5;color:${P.textMuted};text-align:left;">
        <strong style="color:${P.text};">${escapeEmailHtml(title)}</strong><br>${escapeEmailHtml(body)}
      </td>
    </tr>`,
  ).join("")

  const html = renderEmail({
    variant: "passport",
    preheader: "Your 3DEureka account is ready.",
    headerTitle: `Welcome to 3DEureka, ${rawName}!`,
    headerSubtitle: "Your account is ready. Here's what it gives you.",
    footerNote: `Didn't create this account? Let us know at ${COMPANY.email}.`,
    body: `
      ${emailParagraph(`Hi <strong>${safeName}</strong>, thanks for signing up. You can now sign in with <strong>${escapeEmailHtml(user.email)}</strong>.`)}
      ${emailSectionTitle("With your account")}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">${benefitsHtml}</table>
      ${renderEmailButton("Sign in to your account", signInUrl)}
      ${emailLink("Browse 3D printers", catalogUrl)}
    `,
  })

  return sendEmail({ to: user.email, subject, html, text })
}
