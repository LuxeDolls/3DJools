"use server"

import { liveChatAutoReply } from "@/lib/chat/assistant"
import { notifyChatOnTelegram } from "@/lib/notifications/chat-telegram"
import { notifyNewLiveChatVisitor } from "@/lib/notifications/live-chat"
import {
  findConversation,
  getMessagesForConversation,
  getOrCreateConversation,
  insertMessage,
  touchConversation,
} from "@/lib/chat/queries"
import type { ChatMessageRow } from "@/lib/db/schema"

function isSafeVisitorId(visitorId: string): boolean {
  return typeof visitorId === "string" && /^[a-zA-Z0-9-]{8,64}$/.test(visitorId)
}

function cleanName(value: string | undefined): string | null {
  const name = (value ?? "").trim().replace(/\s+/g, " ").slice(0, 80)
  return name.length >= 2 ? name : null
}

function cleanEmail(value: string | undefined): string | null {
  const email = (value ?? "").trim().toLowerCase().slice(0, 120)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null
}

export async function initChat(
  visitorId: string,
  locale: string,
): Promise<{ messages: ChatMessageRow[]; hasConversation: boolean }> {
  if (!isSafeVisitorId(visitorId)) return { messages: [], hasConversation: false }
  const conversation = await findConversation(visitorId)
  if (!conversation) return { messages: [], hasConversation: false }
  return { messages: await getMessagesForConversation(conversation.id), hasConversation: true }
}

export async function getChatMessages(visitorId: string): Promise<ChatMessageRow[]> {
  if (!isSafeVisitorId(visitorId)) return []
  const conversation = await findConversation(visitorId)
  return conversation ? getMessagesForConversation(conversation.id) : []
}

export async function sendChatMessage(
  visitorId: string,
  text: string,
  locale: string,
  identity?: { name?: string; email?: string },
): Promise<{ ok: boolean; messages: ChatMessageRow[] }> {
  const content = text.trim().slice(0, 2000)
  if (!isSafeVisitorId(visitorId) || !content) {
    return { ok: false, messages: [] }
  }

  const name = cleanName(identity?.name)
  const email = cleanEmail(identity?.email)
  const existing = await findConversation(visitorId)
  if (!existing && (!name || !email)) return { ok: false, messages: [] }

  const conversation = await getOrCreateConversation(
    visitorId,
    locale,
    name && email ? { name, email } : undefined,
  )
  const existingMessages = await getMessagesForConversation(conversation.id)
  const isNewVisitor = !existingMessages.some((message) => message.role === "user")

  await insertMessage(conversation.id, "user", content)
  await touchConversation(conversation.id, { unreadForAdmin: true })
  await notifyChatOnTelegram({
    conversationId: conversation.id,
    visitorName: conversation.visitorName,
    visitorEmail: conversation.visitorEmail,
    body: content,
  }).catch((error) => {
    console.error("[v0] Telegram chat alert failed:", error)
  })

  if (isNewVisitor) {
    await notifyNewLiveChatVisitor({
      conversationId: conversation.id,
      visitorId,
      visitorName: conversation.visitorName,
      visitorEmail: conversation.visitorEmail,
      locale,
      message: content,
    })
  }

  if (conversation.mode === "ai") {
    const reply = liveChatAutoReply(locale)
    const history = await getMessagesForConversation(conversation.id)
    const lastAssistant = [...history].reverse().find((message) => message.role === "assistant")
    if (lastAssistant?.content !== reply) {
      await insertMessage(conversation.id, "assistant", reply)
      await touchConversation(conversation.id, {})
    }
  }

  const messages = await getMessagesForConversation(conversation.id)
  return { ok: true, messages }
}
