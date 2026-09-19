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

const smtpUser = "info@3djools.com"

const transporter = nodemailer.createTransport({
  host: "smtp.titan.email",
  port: 465,
  secure: true,
  auth: {
    user: smtpUser,
    pass: process.env.TITAN_SMTP_PASSWORD,
  },
  connectionTimeout: 10_000,
  socketTimeout: 20_000,
})

export async function sendEmail({ to, subject, html, text, replyTo }: SendEmailInput): Promise<SendResult> {
  if (!process.env.TITAN_SMTP_PASSWORD) {
    console.error("[v0] Email skipped because TITAN_SMTP_PASSWORD is not configured")
    return { sent: false, skipped: true }
  }

  try {
    await transporter.sendMail({
      from: `3DJools <${smtpUser}>`,
      to,
      replyTo,
      subject,
      html,
      text,
    })

    return { sent: true }
  } catch (err) {
    console.error("[v0] Titan SMTP send failed:", err)
    return { sent: false, error: err instanceof Error ? err.message : "Unknown error" }
  }
}
