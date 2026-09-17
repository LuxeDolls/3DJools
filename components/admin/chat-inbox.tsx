"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getChatThread, listChatConversations, sendAdminReply, setChatMode } from "@/lib/actions/admin"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ChatMessageRow } from "@/lib/db/schema"

type ConversationWithLastMessage = Awaited<ReturnType<typeof listChatConversations>>[number]

const POLL_INTERVAL_MS = 5000

export function ChatInbox({ initialConversations }: { initialConversations: ConversationWithLastMessage[] }) {
  const router = useRouter()
  const [conversations, setConversations] = useState(initialConversations)
  const [activeId, setActiveId] = useState<string | null>(initialConversations[0]?.id ?? null)
  const [thread, setThread] = useState<ChatMessageRow[]>([])
  const [reply, setReply] = useState("")
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      listChatConversations().then(setConversations)
    }, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!activeId) {
      setThread([])
      return
    }
    let cancelled = false
    function load() {
      getChatThread(activeId!).then((messages) => {
        if (!cancelled) setThread(messages)
      })
    }
    load()
    const interval = setInterval(load, POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [activeId])

  const active = conversations.find((c) => c.id === activeId) ?? null

  async function submitReply(e: React.FormEvent) {
    e.preventDefault()
    if (!activeId || !reply.trim() || busy) return
    setBusy(true)
    const result = await sendAdminReply(activeId, reply)
    if (result.ok) {
      setReply("")
      const [messages, list] = await Promise.all([getChatThread(activeId), listChatConversations()])
      setThread(messages)
      setConversations(list)
    }
    setBusy(false)
  }

  async function returnToAi() {
    if (!activeId || busy) return
    setBusy(true)
    await setChatMode(activeId, "ai")
    setConversations(await listChatConversations())
    setBusy(false)
    router.refresh()
  }

  if (conversations.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-12 text-center">
        <p className="text-sm font-medium">No conversations yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Messages from the storefront chat widget will show up here.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-[18rem_1fr]">
      <ul className="space-y-2 md:max-h-[36rem] md:overflow-y-auto">
        {conversations.map((c) => {
          const isActive = c.id === activeId
          return (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => setActiveId(c.id)}
                className={cn(
                  "flex w-full flex-col gap-1 rounded-lg border px-3 py-2.5 text-left transition-colors",
                  isActive ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-muted",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium">Visitor {c.visitorId.slice(0, 8)}</span>
                  {c.unreadForAdmin ? (
                    <span className="size-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />
                  ) : null}
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {c.lastMessage?.content ?? "No messages yet"}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 font-medium",
                      c.mode === "human" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-muted",
                    )}
                  >
                    {c.mode === "human" ? "Human" : "AI"}
                  </span>
                  <span>{c.locale.toUpperCase()}</span>
                  <span>{new Date(c.lastMessageAt).toLocaleString()}</span>
                </div>
              </button>
            </li>
          )
        })}
      </ul>

      <div className="flex flex-col rounded-lg border border-border bg-card">
        {active ? (
          <>
            <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
              <div>
                <p className="text-sm font-medium">Visitor {active.visitorId.slice(0, 8)}</p>
                <p className="text-xs text-muted-foreground">Locale: {active.locale.toUpperCase()}</p>
              </div>
              {active.mode === "human" ? (
                <Button variant="ghost" size="sm" disabled={busy} onClick={returnToAi}>
                  Return to AI
                </Button>
              ) : null}
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4" style={{ maxHeight: "24rem" }}>
              {thread.map((m) => (
                <div key={m.id} className={cn("flex", m.role === "admin" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[80%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm",
                      m.role === "admin"
                        ? "rounded-br-sm bg-primary text-primary-foreground"
                        : m.role === "assistant"
                          ? "rounded-bl-sm bg-secondary text-secondary-foreground"
                          : "rounded-bl-sm bg-muted text-foreground",
                    )}
                  >
                    <p className="mb-0.5 text-[10px] uppercase tracking-wide opacity-70">{m.role}</p>
                    {m.content}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={submitReply} className="flex items-center gap-2 border-t border-border p-3">
              <input
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Reply as support…"
                aria-label="Reply as support"
                className="h-10 flex-1 rounded-full border border-input bg-background px-4 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
              />
              <Button type="submit" size="sm" disabled={!reply.trim() || busy}>
                Send
              </Button>
            </form>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center p-12 text-sm text-muted-foreground">
            Select a conversation
          </div>
        )}
      </div>
    </div>
  )
}
