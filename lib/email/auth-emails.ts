import "server-only"

import { COMPANY } from "@/lib/company"
import { renderEmail } from "@/lib/email/layout"
import { sendEmail, type SendResult } from "@/lib/email/send"

type NewCustomer = {
  name?: string | null
  email: string
}

function siteUrl(): string {
  return COMPANY.url
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

export async function sendWelcomeEmail(user: NewCustomer): Promise<SendResult> {
  const signInUrl = `${siteUrl()}/en/sign-in`
  const safeName = escapeHtml(user.name?.trim() || "there")
  const safeEmail = escapeHtml(user.email)
  const subject = "Welcome to DnD3D"
  const text = [
    `Welcome to DnD3D, ${user.name?.trim() || "there"}!`,
    "",
    "Your account has been created successfully.",
    `Login email: ${user.email}`,
    "Sign in with Google, Facebook or LinkedIn.",
    "",
    `Sign in: ${signInUrl}`,
    "",
    "If you did not create this account, please contact us at info@dnd3d.com.",
  ].join("\n")
  const html = renderEmail({
    preheader: "Your DnD3D account is ready",
    body: `<h1 style="margin:0 0 12px;font-size:26px;line-height:1.2;color:#111">Welcome to DnD3D, ${safeName}!</h1>
      <p style="margin:0 0 20px;color:#555;font-size:15px;line-height:1.6">Your account has been created successfully.</p>
      <div style="margin:0 0 24px;padding:16px;background:#f6f1ec;border-radius:12px;font-size:14px;line-height:1.7">
        <strong>Login email:</strong> ${safeEmail}<br>
        <strong>Sign in with:</strong> Google, Facebook or LinkedIn
      </div>
      <a href="${escapeHtml(signInUrl)}" style="display:inline-block;background:#f97316;color:#111111;padding:13px 22px;border-radius:999px;text-decoration:none;font-weight:700;font-size:14px">Sign in to your account</a>
      <p style="margin:24px 0 0;color:#777;font-size:12px;line-height:1.5">If you did not create this account, contact us at info@dnd3d.com.</p>`,
  })

  return sendEmail({ to: user.email, subject, html, text })
}
