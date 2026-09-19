import "server-only"

import { getToken } from "@vercel/connect"
import { sendEmail } from "@/lib/email/send"

const telegramConnector = "api.telegram.org/3djools-live-chat-alerts"
const telegramChatId = process.env.TELEGRAM_CHAT_ID

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }
    return entities[character]
  })
}

export async function notifyNewLiveChatVisitor(input: {
  conversationId: string
  visitorId: string
  locale: string
  message: string
}): Promise<void> {
  const subject = "New Live Chat visitor — 3DJools"
  const text = [
    "New Live Chat visitor on 3DJools",
    `Visitor: ${input.visitorId}`,
    `Locale: ${input.locale}`,
    `Conversation: ${input.conversationId}`,
    "",
    input.message,
  ].join("\n")
  const html = `<h1>New Live Chat visitor</h1><p><strong>Visitor:</strong> ${escapeHtml(input.visitorId)}</p><p><strong>Locale:</strong> ${escapeHtml(input.locale)}</p><p><strong>Conversation:</strong> ${escapeHtml(input.conversationId)}</p><p>${escapeHtml(input.message).replace(/\n/g, "<br>")}</p>`

  await Promise.allSettled([
    sendEmail({ to: "info@3djools.com", subject, text, html }),
    sendTelegramNotification(text),
  ])
}

async function sendTelegramNotification(text: string): Promise<void> {
  if (!telegramChatId) {
    console.warn("[v0] Telegram notification skipped: TELEGRAM_CHAT_ID is not configured")
    return
  }

  try {
    const token = await getToken(telegramConnector, { subject: { type: "app" } })
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: telegramChatId, text }),
    })

    if (!response.ok) {
      console.error("[v0] Telegram notification failed:", response.status, await response.text())
    }
  } catch (error) {
    console.error("[v0] Telegram notification error:", error)
  }
}
