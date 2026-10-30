"use client"

import { useEffect, useRef, useState } from "react"
import { MessageCircle, X, Send, Headphones } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { cn } from "@/lib/utils"
import { getChatMessages, initChat, sendChatMessage } from "@/lib/actions/chat"
import type { ChatMessageRow } from "@/lib/db/schema"

const VISITOR_ID_KEY = "dnd3d-chat-visitor-id"
const LEGACY_VISITOR_ID_KEY = "voltika-chat-visitor-id"
const POLL_INTERVAL_MS = 4000

type ChatIdentity = { name: string; email: string }

function getVisitorId(): string {
  if (typeof window === "undefined") return ""
  let id = window.localStorage.getItem(VISITOR_ID_KEY)
  if (!id) {
    id = window.localStorage.getItem(LEGACY_VISITOR_ID_KEY)
    if (id) window.localStorage.removeItem(LEGACY_VISITOR_ID_KEY)
  }
  if (!id) id = crypto.randomUUID()
  window.localStorage.setItem(VISITOR_ID_KEY, id)
  return id
}

function isValidIdentity(name: string, email: string): boolean {
  return name.trim().length >= 2 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

function blockComposingEnter(event: React.KeyboardEvent<HTMLInputElement>) {
  if (event.key === "Enter" && (event.nativeEvent.isComposing || event.keyCode === 229)) {
    event.preventDefault()
  }
}

export function ChatWidget() {
  const { dict, locale } = useI18n()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<ChatMessageRow[]>([])
  const [sending, setSending] = useState(false)
  const [ready, setReady] = useState(false)
  const [needsIdentity, setNeedsIdentity] = useState(true)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [identity, setIdentity] = useState<ChatIdentity | null>(null)
  const [identityError, setIdentityError] = useState("")
  const visitorIdRef = useRef<string>("")
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    visitorIdRef.current = getVisitorId()
    initChat(visitorIdRef.current, locale).then((result) => {
      setMessages(result.messages)
      setNeedsIdentity(!result.hasConversation)
      setReady(true)
    })
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

  function startChat(event: React.FormEvent) {
    event.preventDefault()
    const nextName = name.trim()
    const nextEmail = email.trim()
    if (nextName.length < 2) {
      setIdentityError(dict.chat.nameRequired)
      return
    }
    if (!isValidIdentity(nextName, nextEmail)) {
      setIdentityError(dict.chat.emailRequired)
      return
    }
    setIdentity({ name: nextName, email: nextEmail })
    setIdentityError("")
    setNeedsIdentity(false)
  }

  async function send(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || sending || !visitorIdRef.current || needsIdentity) return
    setInput("")
    setSending(true)
    const result = await sendChatMessage(visitorIdRef.current, text, locale, identity ?? undefined)
    if (result.ok) setMessages(result.messages)
    setSending(false)
  }

  const [stickyBarActive, setStickyBarActive] = useState(false)

  useEffect(() => {
    const syncStickyState = () => {
      setStickyBarActive(document.body.getAttribute("data-sticky-cta") === "true")
    }
    syncStickyState()
    const observer = new MutationObserver(syncStickyState)
    observer.observe(document.body, { attributes: true, attributeFilter: ["data-sticky-cta"] })
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "fixed right-3.5 z-40 flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:right-5 sm:size-13",
          stickyBarActive ? "bottom-19 sm:bottom-22" : "bottom-3.5 sm:bottom-5",
        )}
        aria-label={dict.chat.open}
      >
        {open ? <X className="size-5 sm:size-6" /> : <MessageCircle className="size-5 sm:size-6" />}
      </button>

      <div
        className={cn(
          "fixed inset-x-3 z-50 flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl transition-all duration-200 sm:left-auto sm:right-5 sm:w-88",
          stickyBarActive ? "bottom-32 sm:bottom-38" : "bottom-16 sm:bottom-21",
          open
            ? "pointer-events-auto h-[min(26rem,calc(100dvh-6rem))] translate-y-0 opacity-100"
            : "pointer-events-none h-0 translate-y-4 opacity-0",
        )}
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

        {!ready ? (
          <div className="flex-1 bg-background" />
        ) : needsIdentity ? (
          <form onSubmit={startChat} className="flex flex-1 flex-col gap-3 bg-background p-4">
            <p className="text-sm leading-relaxed text-muted-foreground">{dict.chat.identityHint}</p>
            <label className="grid gap-1 text-xs font-medium text-foreground">
              {dict.chat.name}
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                onKeyDown={blockComposingEnter}
                autoComplete="name"
                required
                className="h-10 rounded-md border border-input bg-card px-3 text-sm font-normal outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
              />
            </label>
            <label className="grid gap-1 text-xs font-medium text-foreground">
              {dict.chat.email}
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                onKeyDown={blockComposingEnter}
                type="email"
                autoComplete="email"
                required
                className="h-10 rounded-md border border-input bg-card px-3 text-sm font-normal outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
              />
            </label>
            {identityError ? <p className="text-xs text-destructive">{identityError}</p> : null}
            <button
              type="submit"
              className="mt-auto h-10 rounded-full bg-primary text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              {dict.chat.start}
            </button>
          </form>
        ) : (
        <>
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
            onKeyDown={blockComposingEnter}
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
        </>
        )}
      </div>
    </>
  )
}
