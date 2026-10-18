import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { chatConversations, chatMessages, chatTelegramLinks } from "@/lib/db/schema"

export const dynamic = "force-dynamic"

type TelegramUpdate = {
  message?: {
    text?: string
    reply_to_message?: { message_id?: number }
  }
}

/** Telegram calls this when you reply to a live-chat alert in the second bot. */
export async function POST(request: Request) {
  const secret = process.env.TELEGRAM_CHAT_WEBHOOK_SECRET
  if (!secret || request.headers.get("x-telegram-bot-api-secret-token") !== secret) {
    return new Response("Unauthorized", { status: 401 })
  }

  const update = (await request.json()) as TelegramUpdate
  const text = update.message?.text?.trim()
  const repliedTo = update.message?.reply_to_message?.message_id
  if (!text || !repliedTo) return Response.json({ ok: true })

  const [link] = await db
    .select({ conversationId: chatTelegramLinks.conversationId })
    .from(chatTelegramLinks)
    .where(eq(chatTelegramLinks.telegramMessageId, String(repliedTo)))
    .limit(1)
  if (!link) return Response.json({ ok: true })

  await db.insert(chatMessages).values({
    id: crypto.randomUUID(),
    conversationId: link.conversationId,
    role: "admin",
    content: text.slice(0, 4000),
  })
  await db
    .update(chatConversations)
    .set({ lastMessageAt: new Date(), unreadForAdmin: false })
    .where(eq(chatConversations.id, link.conversationId))

  return Response.json({ ok: true })
}
