"use server"

import { db } from "@/lib/db"
import { contactMessages } from "@/lib/db/schema"

export type ContactInput = {
  name: string
  email: string
  subject?: string
  orderRef?: string
  message: string
  locale: string
}

export type ContactResult = { ok: true } | { ok: false; error: string }

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function generateId(): string {
  return `msg_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`
}

/**
 * Persists a contact form submission to the admin inbox. Email
 * notifications (Resend) will be layered on once a domain/mailbox exists.
 */
export async function submitContactMessage(input: ContactInput): Promise<ContactResult> {
  const name = input.name?.trim()
  const email = input.email?.trim()
  const message = input.message?.trim()

  if (!name || !email || !message) return { ok: false, error: "Missing required fields" }
  if (!isValidEmail(email)) return { ok: false, error: "Invalid email" }
  if (message.length > 5000) return { ok: false, error: "Message too long" }

  // Fold the optional order reference into the subject so it reaches the inbox.
  const subjectParts = [input.subject?.trim(), input.orderRef?.trim() ? `Order: ${input.orderRef.trim()}` : ""].filter(
    Boolean,
  )

  await db.insert(contactMessages).values({
    id: generateId(),
    name: name.slice(0, 200),
    email: email.slice(0, 200),
    subject: subjectParts.join(" · ") || null,
    message: message.slice(0, 5000),
    locale: input.locale || "en",
    status: "new",
  })

  return { ok: true }
}
