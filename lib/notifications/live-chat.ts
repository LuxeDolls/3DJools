import "server-only"

import { sendEmail } from "@/lib/email/send"

type NewLiveChatVisitor = {
  conversationId: string
  visitorId: string
  locale: string
  message: string
}

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

export async function notifyNewLiveChatVisitor(input: NewLiveChatVisitor): Promise<void> {
  const subject = "New 3DJools live chat visitor"
  const text = [
    "A new visitor started a live chat on 3DJools.",
    `Conversation: ${input.conversationId}`,
    `Visitor: ${input.visitorId}`,
    `Locale: ${input.locale}`,
    "",
    "First message:",
    input.message,
  ].join("\n")
  const html = `<h1 style="font-family:Arial,sans-serif">New live chat visitor</h1><div style="font-family:Arial,sans-serif;line-height:1.5"><p>Conversation: ${escapeHtml(input.conversationId)}</p><p>Visitor: ${escapeHtml(input.visitorId)}</p><p>Locale: ${escapeHtml(input.locale)}</p><p><strong>First message:</strong></p><p style="white-space:pre-wrap">${escapeHtml(input.message)}</p></div>`

  await sendEmail({ to: "info@3djools.com", subject, text, html })
}
