"use server"

import { db } from "@/lib/db"
import { contactMessages } from "@/lib/db/schema"
import { issueContactCaptcha, verifyContactCaptcha, type ContactCaptcha } from "@/lib/contact/captcha"
import { sendEmail } from "@/lib/email/send"

export type ContactInput = {
  name: string
  email: string
  subject?: string
  orderRef?: string
  message: string
  locale: string
  captchaToken: string
  captchaAnswer: string
}

export async function refreshContactCaptcha(): Promise<ContactCaptcha> {
  return issueContactCaptcha()
}

export type ContactResult = { ok: true } | { ok: false; error: string }

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function generateId(): string {
  return `msg_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;",
    }
    return entities[character]
  })
}

/**
 * Persists a contact form submission to the admin inbox and sends a
 * notification through the configured Zoho SMTP account. Persistence remains the source of truth
 * if SMTP is temporarily unavailable.
 */
export async function submitContactMessage(input: ContactInput): Promise<ContactResult> {
  const name = input.name?.trim()
  const email = input.email?.trim()
  const message = input.message?.trim()

  if (!name || !email || !message) return { ok: false, error: "Missing required fields" }
  if (!isValidEmail(email)) return { ok: false, error: "Invalid email" }
  if (message.length > 5000) return { ok: false, error: "Message too long" }
  if (!verifyContactCaptcha(input.captchaToken ?? "", input.captchaAnswer ?? "")) {
    return { ok: false, error: "captcha" }
  }

  // Fold the optional order reference into the subject so it reaches the inbox.
  const subjectParts = [input.subject?.trim(), input.orderRef?.trim() ? `Order: ${input.orderRef.trim()}` : ""].filter(
    Boolean,
  )

  const normalizedSubject = subjectParts.join(" · ") || "Contact form message"
  const storedName = name.slice(0, 200)
  const storedEmail = email.slice(0, 200)
  const storedMessage = message.slice(0, 5000)

  await db.insert(contactMessages).values({
    id: generateId(),
    name: storedName,
    email: storedEmail,
    subject: normalizedSubject,
    message: storedMessage,
    locale: input.locale || "en",
    status: "new",
  })

  await sendEmail({
    to: "info@3djools.com",
    replyTo: storedEmail,
    subject: `[DnD3D] ${normalizedSubject}`,
    text: `New contact form message\n\nFrom: ${storedName} <${storedEmail}>\nSubject: ${normalizedSubject}\n\n${storedMessage}`,
    html: `<h1>New contact form message</h1><p><strong>From:</strong> ${escapeHtml(storedName)} &lt;${escapeHtml(storedEmail)}&gt;</p><p><strong>Subject:</strong> ${escapeHtml(normalizedSubject)}</p><p>${escapeHtml(storedMessage).replace(/\n/g, "<br>")}</p>`,
  })

  return { ok: true }
}
