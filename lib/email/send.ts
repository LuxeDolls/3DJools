import "server-only"

import nodemailer from "nodemailer"
import { renderEmail } from "@/lib/email/layout"

type SendEmailInput = {
  to: string
  subject: string
  html: string
  text: string
  replyTo?: string
}

export type SendResult = { sent: boolean; skipped?: boolean; error?: string }

function withStoreLayout(html: string): string {
  if (html.includes("data-dnd-email")) return html
  return renderEmail({ preheader: "DnD3D", body: html })
}

const mailbox = "info@dnd3d.com"
const configuredUser = process.env.ZOHO_SMTP_USER?.trim()
const smtpUser = configuredUser?.toLowerCase().endsWith("@dnd3d.com") ? configuredUser : mailbox
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
      html: withStoreLayout(html),
      text,
    })

    return { sent: true }
  } catch (err) {
    console.error("[v0] Zoho SMTP send failed:", err)
    return { sent: false, error: err instanceof Error ? err.message : "Unknown error" }
  }
}
