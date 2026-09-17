"use server"

import { generateAssistantReply } from "@/lib/chat/assistant"
import {
  getMessagesForConversation,
  getOrCreateConversation,
  insertMessage,
  touchConversation,
} from "@/lib/chat/queries"
import type { ChatMessageRow } from "@/lib/db/schema"

function isSafeVisitorId(visitorId: string): boolean {
  return typeof visitorId === "string" && /^[a-zA-Z0-9-]{8,64}$/.test(visitorId)
}

export async function initChat(visitorId: string, locale: string): Promise<ChatMessageRow[]> {
  if (!isSafeVisitorId(visitorId)) return []
  const conversation = await getOrCreateConversation(visitorId, locale)
  return getMessagesForConversation(conversation.id)
}

export async function getChatMessages(visitorId: string): Promise<ChatMessageRow[]> {
  if (!isSafeVisitorId(visitorId)) return []
  const conversation = await getOrCreateConversation(visitorId, "en")
  return getMessagesForConversation(conversation.id)
}

export async function sendChatMessage(
  visitorId: string,
  text: string,
  locale: string,
): Promise<{ ok: boolean; messages: ChatMessageRow[] }> {
  const content = text.trim().slice(0, 2000)
  if (!isSafeVisitorId(visitorId) || !content) {
    return { ok: false, messages: [] }
  }

  const conversation = await getOrCreateConversation(visitorId, locale)
  await insertMessage(conversation.id, "user", content)
  await touchConversation(conversation.id, { unreadForAdmin: true })

  if (conversation.mode === "ai") {
    try {
      const history = await getMessagesForConversation(conversation.id)
      const reply = await generateAssistantReply(history, locale)
      await insertMessage(conversation.id, "assistant", reply)
      await touchConversation(conversation.id, {})
    } catch (error) {
      console.error("[v0] chat assistant error:", error)
      await insertMessage(
        conversation.id,
        "assistant",
        "Sorry, I'm having trouble replying right now. A teammate will follow up here shortly.",
      )
    }
  }

  const messages = await getMessagesForConversation(conversation.id)
  return { ok: true, messages }
}
