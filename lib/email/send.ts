import "server-only"

import nodemailer from "nodemailer"

type SendEmailInput = {
  to: string
  subject: string
  html: string
  text: string
  replyTo?: string
}

export type SendResult = { sent: boolean; skipped?: boolean; error?: string }

function addStoreBranding(html: string): string {
  const header = `<div style="padding:0 0 20px;text-align:center;font-family:Arial,Helvetica,sans-serif">
    <div style="display:inline-flex;align-items:center;gap:8px;font-size:24px;font-weight:700;letter-spacing:-0.5px;color:#111">
      <span style="display:inline-flex;width:32px;height:32px;align-items:center;justify-content:center;border-radius:7px;background:#f97316;color:#fff;font-size:13px;font-weight:800;letter-spacing:-1px">3D</span>
      <span><span style="color:#f97316">3D</span>Jools</span>
    </div>
  </div>`

  if (/<body(?:\s[^>]*)?>/i.test(html)) {
    return html.replace(/(<body(?:\s[^>]*)?>)/i, `$1${header}`)
  }

  return `${header}${html}`
}

const smtpUser = process.env.ZOHO_SMTP_USER ?? "info@dnd3d.com"
const smtpHost = process.env.ZOHO_SMTP_HOST ?? "smtp.zoho.eu"
const smtpPort = Number(process.env.ZOHO_SMTP_PORT ?? "465")
const smtpPassword = process.env.ZOHO_SMTP_PASSWORD

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: smtpUser,
    pass: smtpPassword,
  },
  connectionTimeout: 10_000,
  socketTimeout: 20_000,
})

export async function sendEmail({ to, subject, html, text, replyTo }: SendEmailInput): Promise<SendResult> {
  if (!smtpPassword) {
    console.error("[v0] Email skipped because ZOHO_SMTP_PASSWORD is not configured")
    return { sent: false, skipped: true }
  }

  try {
    await transporter.sendMail({
      from: `DnD3D <${smtpUser}>`,
      to,
      replyTo,
      subject,
      html: addStoreBranding(html),
      text,
    })

    return { sent: true }
  } catch (err) {
    console.error("[v0] Zoho SMTP send failed:", err)
    return { sent: false, error: err instanceof Error ? err.message : "Unknown error" }
  }
}
