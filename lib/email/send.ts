import "server-only"
import nodemailer from "nodemailer"

/**
 * Sends transactional email through Zoho Mail SMTP. Configure the mailbox with
 * ZOHO_SMTP_USER and a Zoho app password in ZOHO_SMTP_PASSWORD. The EU SMTP
 * endpoint is the default; override ZOHO_SMTP_HOST or ZOHO_SMTP_PORT only if
 * Zoho provides different settings for the mailbox.
 */

type SendEmailInput = {
  to: string
  subject: string
  html: string
  text: string
}

export type SendResult = { sent: boolean; skipped?: boolean; error?: string }

function getSmtpConfig() {
  const user = process.env.ZOHO_SMTP_USER
  const pass = process.env.ZOHO_SMTP_PASSWORD

  if (!user || !pass) return null

  const port = Number(process.env.ZOHO_SMTP_PORT ?? "465")
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("ZOHO_SMTP_PORT must be a valid TCP port")
  }

  return {
    host: process.env.ZOHO_SMTP_HOST ?? "smtp.zoho.eu",
    port,
    secure: port === 465,
    auth: { user, pass },
  }
}

export async function sendEmail({ to, subject, html, text }: SendEmailInput): Promise<SendResult> {
  let smtp
  try {
    smtp = getSmtpConfig()
  } catch (err) {
    console.error("[email] Invalid Zoho SMTP configuration:", err)
    return { sent: false, error: err instanceof Error ? err.message : "Invalid SMTP configuration" }
  }

  if (!smtp) {
    console.log(`[email] Email skipped (Zoho SMTP is not configured). Would send "${subject}" to ${to}`)
    return { sent: false, skipped: true }
  }

  const from = process.env.EMAIL_FROM ?? smtp.auth.user

  try {
    await nodemailer.createTransport(smtp).sendMail({ from, to, subject, html, text })
    return { sent: true }
  } catch (err) {
    console.error("[email] Zoho SMTP send failed:", err)
    return { sent: false, error: err instanceof Error ? err.message : "Unknown error" }
  }
}
