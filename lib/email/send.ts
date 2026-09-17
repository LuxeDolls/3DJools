import "server-only"

/**
 * Email delivery is intentionally decoupled from a provider. When
 * `RESEND_API_KEY` (and `EMAIL_FROM`) are configured, emails are sent through
 * Resend's HTTP API. Until then, every call is a safe no-op that logs what
 * *would* have been sent, so the ordering flow works end-to-end without a
 * provider and starts delivering the moment the key is added — no code change.
 */

type SendEmailInput = {
  to: string
  subject: string
  html: string
  text: string
}

export type SendResult = { sent: boolean; skipped?: boolean; error?: string }

export async function sendEmail({ to, subject, html, text }: SendEmailInput): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM ?? "3DJools <onboarding@resend.dev>"

  if (!apiKey) {
    console.log(`[v0] Email skipped (no RESEND_API_KEY). Would send "${subject}" to ${to}`)
    return { sent: false, skipped: true }
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html, text }),
    })

    if (!res.ok) {
      const detail = await res.text()
      console.error(`[v0] Resend send failed (${res.status}): ${detail}`)
      return { sent: false, error: `Resend responded ${res.status}` }
    }

    return { sent: true }
  } catch (err) {
    console.error("[v0] Resend send threw:", err)
    return { sent: false, error: err instanceof Error ? err.message : "Unknown error" }
  }
}
