import "server-only"

import { db } from "@/lib/db"
import { chatTelegramLinks } from "@/lib/db/schema"

const TELEGRAM_API = "https://api.telegram.org"

function chatBot() {
  const token = process.env.TELEGRAM_CHAT_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_CHAT_ID
  if (!token || !chatId) return null
  return { token, chatId }
}

/** Sends a visitor message to the second Telegram bot and remembers the message for replies. */
export async function notifyChatOnTelegram(input: {
  conversationId: string
  visitorName?: string | null
  visitorEmail?: string | null
  body: string
}): Promise<void> {
  const bot = chatBot()
  if (!bot) return

  const who = [input.visitorName, input.visitorEmail].filter(Boolean).join(" · ") || "Visitor"
  const text = [`Live chat`, who, "", input.body.slice(0, 3500), "", "Reply to this message to answer in the shop chat."].join("\n")

  const response = await fetch(`${TELEGRAM_API}/bot${bot.token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: bot.chatId, text }),
  })
  const payload = (await response.json()) as { ok?: boolean; result?: { message_id?: number } }
  const messageId = payload.result?.message_id
  if (!response.ok || !payload.ok || !messageId) return

  await db
    .insert(chatTelegramLinks)
    .values({ telegramMessageId: String(messageId), conversationId: input.conversationId })
    .onConflictDoNothing()
}
