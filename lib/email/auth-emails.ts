import "server-only"

import { COMPANY } from "@/lib/company"
import {
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

export async function sendWelcomeEmail(user: NewCustomer): Promise<SendResult> {
  const signInUrl = `${siteUrl()}/en/sign-in`
  const catalogUrl = `${siteUrl()}/en/catalog/printers`
  const rawName = user.name?.trim() || "there"
  const safeName = escapeEmailHtml(rawName)
  const safeEmail = escapeEmailHtml(user.email)
  const subject = "Welcome to 3DEureka — Your client account is active"

  const text = [
    `Welcome to 3DEureka, ${rawName}!`,
    "",
    "Your client account has been created and activated.",
    `Login email: ${user.email}`,
    "Supported sign-in methods: Email & Password, Google, Facebook, or LinkedIn.",
    "",
    "Account benefits:",
    "- Real-time order & courier telemetry in one dashboard",
    "- Automatic member discount on qualifying hardware & consumables",
    "- Access to 3x 0% APR installment plans on orders from €1,000",
    "",
    `Sign in to your account: ${signInUrl}`,
    `Browse 3D printers & lasers: ${catalogUrl}`,
    "",
    `If you did not create this account, please contact us immediately at ${COMPANY.email}.`,
  ].join("\n")

  const html = renderEmail({
    variant: "passport",
    preheader: "Your 3DEureka account is active and ready for orders.",
    eyebrow: "CLIENT ACCOUNT PASSPORT",
    badgeText: "ACCOUNT ACTIVE",
    badgeTone: "emerald",
    headerTitle: `Welcome to 3DEureka, ${rawName}!`,
    headerSubtitle:
      "Your client profile is ready for industrial & desktop 3D printers, scanners, laser systems, and materials.",
    referenceLabel: "CLIENT ID",
    referenceValue: user.email,
    footerNote: `Security notice: if you did not register this account on 3DEureka, contact ${COMPANY.email} immediately.`,
    body: `
      <p style="margin:0 0 18px;color:#334155;font-size:15px;line-height:1.65;">
        Hello <strong style="color:#0F172A;">${safeName}</strong>, thank you for registering with <strong style="color:#0F172A;">3DEureka</strong>. Your account gives you unified access to order invoices, live parcel telemetry, and member pricing across our European catalog.
      </p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 22px;background:#0C1530;border:1px solid #1E293B;border-radius:14px;overflow:hidden;">
        <tr>
          <td style="padding:14px 18px;background:#132042;border-bottom:1px solid #1E293B;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#FACC15;">
                  CREDENTIALS &amp; ACCESS PASS
                </td>
                <td align="right" style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;font-weight:700;color:#34D399;">
                  &#9679; VERIFIED PROFILE
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:18px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:13px;line-height:1.6;">
              <tr>
                <td style="padding:4px 0;color:#94A3B8;width:38%;">Registered Email</td>
                <td style="padding:4px 0;color:#FFFFFF;font-weight:700;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;">${safeEmail}</td>
              </tr>
              <tr>
                <td style="padding:4px 0;color:#94A3B8;">Single Sign-On</td>
                <td style="padding:4px 0;color:#E2E8F0;">Email &amp; Password &middot; Google &middot; Facebook &middot; LinkedIn</td>
              </tr>
              <tr>
                <td style="padding:4px 0;color:#94A3B8;">Dispatch Hub</td>
                <td style="padding:4px 0;color:#E2E8F0;">Antwerpen, Belgium (EU-wide delivery in 3&ndash;7 business days)</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
        <tr>
          <td width="33%" valign="top" style="padding-right:6px;">
            <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:12px;">
              <div style="font-size:11px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:#1E40D8;margin-bottom:4px;">Live Telemetry</div>
              <div style="font-size:12px;line-height:1.45;color:#475569;">Follow every shipment checkpoint from warehouse QC to doorstep delivery.</div>
            </div>
          </td>
          <td width="34%" valign="top" style="padding:0 3px;">
            <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:12px;">
              <div style="font-size:11px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:#1E40D8;margin-bottom:4px;">3&times; 0% Financing</div>
              <div style="font-size:12px;line-height:1.45;color:#475569;">Split orders from &euro;1,000 into 3 equal interest-free payments every 2 weeks.</div>
            </div>
          </td>
          <td width="33%" valign="top" style="padding-left:6px;">
            <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:12px;">
              <div style="font-size:11px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:#1E40D8;margin-bottom:4px;">30-Day Returns</div>
              <div style="font-size:12px;line-height:1.45;color:#475569;">Free return label included &amp; full refund within 7 business days of inspection.</div>
            </div>
          </td>
        </tr>
      </table>

      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="padding-right:12px;">
            ${renderEmailButton("Sign in to your account", signInUrl, "cobalt")}
          </td>
          <td valign="middle">
            <a href="${escapeEmailHtml(catalogUrl)}" style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;font-weight:700;color:#1E40D8;text-decoration:none;">
              Explore catalog &rarr;
            </a>
          </td>
        </tr>
      </table>
    `,
  })

  return sendEmail({ to: user.email, subject, html, text })
}
