import { isAdmin } from "@/lib/admin-auth"
import { getAllContactMessages } from "@/lib/contact/queries"
import { MessagesInbox } from "@/components/admin/messages-inbox"

export const dynamic = "force-dynamic"

export default async function AdminMessagesPage() {
  if (!(await isAdmin())) return null
  const messages = await getAllContactMessages()
  const unread = messages.filter((m) => m.status === "new").length

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-sans text-2xl font-semibold tracking-tight">Messages</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {messages.length} total · {unread} unread
        </p>
      </div>
      <MessagesInbox messages={messages} />
    </div>
  )
}
