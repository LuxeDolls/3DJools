import { isAdmin } from "@/lib/admin-auth"
import { listChatConversations } from "@/lib/actions/admin"
import { ChatInbox } from "@/components/admin/chat-inbox"

export const dynamic = "force-dynamic"

export default async function AdminChatPage() {
  if (!(await isAdmin())) return null
  const conversations = await listChatConversations()
  const unread = conversations.filter((c) => c.unreadForAdmin).length

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-sans text-2xl font-semibold tracking-tight">Live chat</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {conversations.length} conversation{conversations.length === 1 ? "" : "s"} · {unread} unread
        </p>
      </div>
      <ChatInbox initialConversations={conversations} />
    </div>
  )
}
