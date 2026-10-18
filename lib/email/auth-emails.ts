import "server-only"

import { COMPANY } from "@/lib/company"
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

function brandHeader(): string {
  return `<div style="display:flex;align-items:center;gap:10px;margin-bottom:28px">
    <span style="display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:8px;background:#e86f2a;color:#fff;font-weight:700;font-size:12px;letter-spacing:-0.5px">3D</span>
    <span style="font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:700;letter-spacing:-0.5px;color:#171717"><span style="color:#e86f2a">3D</span>Jools</span>
  </div>`
}

export async function sendWelcomeEmail(user: NewCustomer): Promise<SendResult> {
  const base = siteUrl()
  const signInUrl = `${base}/en/sign-in`
  const safeName = escapeHtml(user.name?.trim() || "there")
  const safeEmail = escapeHtml(user.email)
  const subject = "Welcome to DnD3D"
  const text = [
    `Welcome to DnD3D, ${user.name?.trim() || "there"}!`,
    "",
    "Your account has been created successfully.",
    `Login email: ${user.email}`,
    "Use the password you chose during registration.",
    "",
    `Sign in: ${signInUrl}`,
    "",
    "If you did not create this account, please contact us at info@dnd3d.com.",
  ].join("\n")
  const html = `<!doctype html>
<html><body style="margin:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;color:#171717">
  <div style="max-width:560px;margin:0 auto;padding:24px 16px">
    <div style="background:#fff;border:1px solid #e5e5e5;border-radius:14px;padding:32px">
      ${brandHeader()}
      <h1 style="margin:0 0 12px;font-size:24px;line-height:1.25">Welcome to DnD3D, ${safeName}!</h1>
      <p style="margin:0 0 20px;color:#555;font-size:15px;line-height:1.6">Your account has been created successfully.</p>
      <div style="margin:0 0 24px;padding:16px;background:#f7f7f7;border-radius:10px;font-size:14px;line-height:1.7">
        <strong>Login email:</strong> ${safeEmail}<br>
        <strong>Password:</strong> Use the password you chose during registration.
      </div>
      <a href="${escapeHtml(signInUrl)}" style="display:inline-block;background:#171717;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">Sign in to your account</a>
      <p style="margin:24px 0 0;color:#777;font-size:12px;line-height:1.5">If you did not create this account, contact us at info@dnd3d.com.</p>
    </div>
    <p style="margin:16px 0 0;text-align:center;color:#999;font-size:12px">DnD3D · Serious 3D tools. Honest prices.</p>
  </div>
</body></html>`

  return sendEmail({ to: user.email, subject, html, text })
}
