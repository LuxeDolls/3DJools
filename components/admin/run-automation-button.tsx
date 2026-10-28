"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { RefreshCw } from "lucide-react"
import { runOrderAutomationNow } from "@/lib/actions/admin"

/**
 * Lets an admin trigger the paid→processing→shipped automation immediately,
 * instead of waiting for the hourly cron job (which does not run inside the
 * v0 preview — only on a real Vercel deployment).
 */
export function RunAutomationButton() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)

  function run() {
    setMessage(null)
    startTransition(async () => {
      const result = await runOrderAutomationNow()
      setMessage(`Processing: +${result.movedToProcessing} · Shipped: +${result.movedToShipped}`)
      router.refresh()
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={run}
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
      >
        <RefreshCw className={`size-4 ${pending ? "animate-spin" : ""}`} aria-hidden="true" />
        {pending ? "Running…" : "Run status automation now"}
      </button>
      {message ? <span className="text-xs text-muted-foreground">{message}</span> : null}
    </div>
  )
}
