"use client"

import { useEffect, useRef, useState } from "react"
import { MessageCircle, X, Send, Headphones } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { cn } from "@/lib/utils"
import { getChatMessages, initChat, sendChatMessage } from "@/lib/actions/chat"
import type { ChatMessageRow } from "@/lib/db/schema"

const VISITOR_ID_KEY = "voltika-chat-visitor-id"
const POLL_INTERVAL_MS = 4000

function getVisitorId(): string {
  if (typeof window === "undefined") return ""
  let id = window.localStorage.getItem(VISITOR_ID_KEY)
  if (!id) {
    id = crypto.randomUUID()
    window.localStorage.setItem(VISITOR_ID_KEY, id)
  }
  return id
}

export function ChatWidget() {
  const { dict, locale } = useI18n()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<ChatMessageRow[]>([])
  const [sending, setSending] = useState(false)
  const visitorIdRef = useRef<string>("")
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    visitorIdRef.current = getVisitorId()
    initChat(visitorIdRef.current, locale).then(setMessages)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!open) return
    const interval = setInterval(() => {
      if (!visitorIdRef.current) return
      getChatMessages(visitorIdRef.current).then(setMessages)
    }, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [open])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, sending])

  async function send(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || sending || !visitorIdRef.current) return
    setInput("")
    setSending(true)
    const result = await sendChatMessage(visitorIdRef.current, text, locale)
    if (result.ok) setMessages(result.messages)
    setSending(false)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-50 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label={dict.chat.open}
      >
        {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
      </button>

      <div
        className={cn(
          "fixed bottom-24 right-5 z-50 flex w-[min(92vw,22rem)] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl transition-all duration-200",
          open ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
        )}
        style={{ height: open ? "28rem" : 0 }}
        role="dialog"
        aria-label={dict.chat.title}
        aria-hidden={!open}
      >
        {/* Header */}
        <div className="flex items-center gap-3 bg-primary px-4 py-3 text-primary-foreground">
          <div className="flex size-9 items-center justify-center rounded-full bg-primary-foreground/15">
            <Headphones className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="font-heading text-sm font-semibold leading-tight">{dict.chat.title}</p>
            <p className="truncate text-xs text-primary-foreground/80">{dict.chat.subtitle}</p>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-background p-4">
          <p className="rounded-md bg-secondary px-3 py-2 text-center text-[11px] text-muted-foreground">
            {dict.chat.aiDisclaimer}
          </p>
          {messages.length === 0 ? (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-secondary px-3.5 py-2 text-sm text-secondary-foreground">
                {dict.chat.greeting}
              </div>
            </div>
          ) : null}
          {messages.map((m) => (
            <div key={m.id} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[80%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm",
                  m.role === "user"
                    ? "rounded-br-sm bg-primary text-primary-foreground"
                    : "rounded-bl-sm bg-secondary text-secondary-foreground",
                )}
              >
                {m.content}
              </div>
            </div>
          ))}
          {sending ? (
            <div className="flex justify-start">
              <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-secondary px-3.5 py-2.5">
                <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.2s]" />
                <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.1s]" />
                <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground" />
              </div>
            </div>
          ) : null}
        </div>

        {/* Input */}
        <form onSubmit={send} className="flex items-center gap-2 border-t border-border bg-card p-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={dict.chat.placeholder}
            aria-label={dict.chat.placeholder}
            disabled={sending}
            className="h-10 flex-1 rounded-full border border-input bg-background px-4 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-60"
          />
          <button
            type="submit"
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            disabled={!input.trim() || sending}
            aria-label={dict.chat.send}
          >
            <Send className="size-4" />
          </button>
        </form>
      </div>
    </>
  )
}
