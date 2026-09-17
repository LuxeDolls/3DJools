import "server-only"

import { desc, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { contactMessages, type ContactMessageRow, type ContactStatus } from "@/lib/db/schema"

/* -------------------------- admin reads/writes -------------------------- */

export async function getAllContactMessages(): Promise<ContactMessageRow[]> {
  return db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt))
}

export async function getUnreadMessageCount(): Promise<number> {
  const rows = await db.select().from(contactMessages).where(eq(contactMessages.status, "new"))
  return rows.length
}

export async function updateMessageStatus(id: string, status: ContactStatus): Promise<void> {
  await db.update(contactMessages).set({ status }).where(eq(contactMessages.id, id))
}
