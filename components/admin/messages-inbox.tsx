"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { setMessageStatus } from "@/lib/actions/admin"
import { Button } from "@/components/ui/button"
import type { ContactMessageRow, ContactStatus } from "@/lib/db/schema"

const STATUS_STYLE: Record<ContactStatus, string> = {
  new: "bg-primary/15 text-primary",
  read: "bg-muted text-muted-foreground",
  resolved: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
}

function formatMessageDate(value: Date | string): string {
  const date = new Date(value)
  const pad = (part: number) => String(part).padStart(2, "0")

  return `${pad(date.getUTCDate())}.${pad(date.getUTCMonth() + 1)}.${date.getUTCFullYear()}, ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`
}

export function MessagesInbox({ messages }: { messages: ContactMessageRow[] }) {
  const router = useRouter()
  const [open, setOpen] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
  }, [])

  async function mark(id: string, status: ContactStatus) {
    setBusy(id)
    await setMessageStatus(id, status)
    setBusy(null)
    router.refresh()
  }

  if (messages.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-12 text-center">
        <p className="text-sm font-medium">Inbox empty</p>
        <p className="mt-1 text-sm text-muted-foreground">Messages from the contact form will show up here.</p>
      </div>
    )
  }

  return (
    <ul className="space-y-3">
      {messages.map((m) => {
        const isOpen = open === m.id
        return (
          <li key={m.id} className="rounded-lg border border-border bg-card">
            <button
              type="button"
              onClick={() => {
                setOpen(isOpen ? null : m.id)
                if (!isOpen && m.status === "new") mark(m.id, "read")
              }}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[m.status]}`}>
                    {m.status}
                  </span>
                  <p className="truncate font-medium">{m.subject || "(no subject)"}</p>
                </div>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {m.name} · {m.email} · <span>{hydrated ? formatMessageDate(m.createdAt) : "—"}</span>
                </p>
              </div>
            </button>
            {isOpen ? (
              <div className="border-t border-border px-4 py-3">
                <p className="whitespace-pre-wrap text-sm text-foreground">{m.message}</p>
                <div className="mt-3 flex items-center gap-2">
                  <a
                    href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject || "Your enquiry")}`}
                    className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted"
                  >
                    Reply by email
                  </a>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={busy === m.id}
                    onClick={() => mark(m.id, m.status === "resolved" ? "read" : "resolved")}
                  >
                    {m.status === "resolved" ? "Reopen" : "Mark resolved"}
                  </Button>
                </div>
              </div>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}
