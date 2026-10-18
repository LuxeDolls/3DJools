import "server-only"

import { and, asc, desc, eq, isNull } from "drizzle-orm"
import { db, pool } from "@/lib/db"
import {
  chatConversations,
  chatMessages,
  type ChatConversationRow,
  type ChatMessageRow,
  type ChatMode,
  type ChatRole,
} from "@/lib/db/schema"

let identityColumnsReady: Promise<void> | null = null

function ensureIdentityColumns(): Promise<void> {
  if (!identityColumnsReady) {
    identityColumnsReady = pool
      .query(
        `ALTER TABLE chat_conversations
           ADD COLUMN IF NOT EXISTS visitor_name text,
           ADD COLUMN IF NOT EXISTS visitor_email text`,
      )
      .then(() => undefined)
      .catch((error) => {
        identityColumnsReady = null
        throw error
      })
  }
  return identityColumnsReady
}

/** Find an existing conversation for this visitor, or create a fresh one. */
export async function findConversation(visitorId: string): Promise<ChatConversationRow | null> {
  await ensureIdentityColumns()
  const existing = await db
    .select()
    .from(chatConversations)
    .where(and(eq(chatConversations.visitorId, visitorId), isNull(chatConversations.archivedAt)))
    .orderBy(desc(chatConversations.createdAt))
    .limit(1)

  return existing[0] ?? null
}

export async function getOrCreateConversation(
  visitorId: string,
  locale: string,
  identity?: { name: string; email: string },
): Promise<ChatConversationRow> {
  await ensureIdentityColumns()
  const existing = await db
    .select()
    .from(chatConversations)
    .where(and(eq(chatConversations.visitorId, visitorId), isNull(chatConversations.archivedAt)))
    .orderBy(desc(chatConversations.createdAt))
    .limit(1)

  if (existing[0]) {
    if (identity && (!existing[0].visitorName || !existing[0].visitorEmail)) {
      const [updated] = await db
        .update(chatConversations)
        .set({ visitorName: identity.name, visitorEmail: identity.email })
        .where(eq(chatConversations.id, existing[0].id))
        .returning()
      return updated
    }
    return existing[0]
  }

  const [created] = await db
    .insert(chatConversations)
    .values({
      id: crypto.randomUUID(),
      visitorId,
      visitorName: identity?.name,
      visitorEmail: identity?.email,
      locale,
    })
    .returning()

  return created
}

export async function getConversationById(id: string): Promise<ChatConversationRow | null> {
  await ensureIdentityColumns()
  const rows = await db.select().from(chatConversations).where(eq(chatConversations.id, id)).limit(1)
  return rows[0] ?? null
}

export async function getMessagesForConversation(conversationId: string): Promise<ChatMessageRow[]> {
  return db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.conversationId, conversationId))
    .orderBy(asc(chatMessages.createdAt))
}

export async function insertMessage(conversationId: string, role: ChatRole, content: string): Promise<ChatMessageRow> {
  const [row] = await db
    .insert(chatMessages)
    .values({ id: crypto.randomUUID(), conversationId, role, content })
    .returning()
  return row
}

export async function touchConversation(
  conversationId: string,
  patch: { unreadForAdmin?: boolean; mode?: ChatMode },
): Promise<void> {
  await db
    .update(chatConversations)
    .set({ lastMessageAt: new Date(), ...patch })
    .where(eq(chatConversations.id, conversationId))
}

/* -------------------------------- admin --------------------------------- */

export async function listConversationsForAdmin() {
  await ensureIdentityColumns()
  const conversations = await db
    .select()
    .from(chatConversations)
    .where(isNull(chatConversations.archivedAt))
    .orderBy(desc(chatConversations.lastMessageAt))

  const withLastMessage = await Promise.all(
    conversations.map(async (c) => {
      const last = await db
        .select()
        .from(chatMessages)
        .where(and(eq(chatMessages.conversationId, c.id)))
        .orderBy(desc(chatMessages.createdAt))
        .limit(1)
      const userMessages = await db
        .select({ id: chatMessages.id })
        .from(chatMessages)
        .where(and(eq(chatMessages.conversationId, c.id), eq(chatMessages.role, "user")))
        .limit(1)

      return {
        ...c,
        lastMessage: last[0] ?? null,
        hasUserMessage: userMessages.length > 0,
      }
    }),
  )

  return withLastMessage.filter((conversation) => conversation.hasUserMessage)
}

export async function getUnreadConversationCount(): Promise<number> {
  const rows = await db
    .select({ conversationId: chatConversations.id })
    .from(chatConversations)
    .innerJoin(chatMessages, eq(chatMessages.conversationId, chatConversations.id))
    .where(and(eq(chatConversations.unreadForAdmin, true), isNull(chatConversations.archivedAt)))

  return new Set(rows.map((row) => row.conversationId)).size
}

export async function setConversationMode(conversationId: string, mode: ChatMode): Promise<void> {
  await db.update(chatConversations).set({ mode }).where(eq(chatConversations.id, conversationId))
}

export async function markReadForAdmin(conversationId: string): Promise<void> {
  await db.update(chatConversations).set({ unreadForAdmin: false }).where(eq(chatConversations.id, conversationId))
}
