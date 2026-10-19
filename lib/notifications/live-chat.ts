import "server-only"

import { sendEmail } from "@/lib/email/send"
import { sendTelegramNotification } from "@/lib/notifications/admin"

type NewLiveChatVisitor = {
  conversationId: string
  visitorId: string
  visitorName?: string | null
  visitorEmail?: string | null
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
  const subject = "New DnD3D live chat visitor"
  const text = [
    "A new visitor started a live chat on DnD3D.",
    `Conversation: ${input.conversationId}`,
    `Name: ${input.visitorName || "—"}`,
    `Email: ${input.visitorEmail || "—"}`,
    `Locale: ${input.locale}`,
    "",
    "First message:",
    input.message,
  ].join("\n")
  const html = `<h1 style="font-family:Arial,sans-serif">New live chat visitor</h1><div style="font-family:Arial,sans-serif;line-height:1.5"><p>Conversation: ${escapeHtml(input.conversationId)}</p><p>Name: ${escapeHtml(input.visitorName || "—")}</p><p>Email: ${escapeHtml(input.visitorEmail || "—")}</p><p>Locale: ${escapeHtml(input.locale)}</p><p><strong>First message:</strong></p><p style="white-space:pre-wrap">${escapeHtml(input.message)}</p></div>`

  await Promise.allSettled([
    sendEmail({ to: "info@dnd3d.com", subject, text, html }),
    sendTelegramNotification(text),
  ])
}
