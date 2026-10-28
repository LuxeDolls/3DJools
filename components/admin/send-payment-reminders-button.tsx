"use client"

import { useState, useTransition } from "react"
import { Mail } from "lucide-react"
import { sendPaymentRemindersToUnpaidOrders } from "@/lib/actions/admin"

/**
 * Lets an admin email every order still unpaid (pending / awaiting_payment /
 * reviewing_payment) a check-in asking whether they ran into trouble
 * completing payment and offering help, with their payment details repeated.
 */
export function SendPaymentRemindersButton() {
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)

  function run() {
    setMessage(null)
    startTransition(async () => {
      const result = await sendPaymentRemindersToUnpaidOrders()
      setMessage(`Sent: ${result.sent.length}${result.skipped.length ? ` · Skipped: ${result.skipped.length}` : ""}`)
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
        <Mail className="size-4" aria-hidden="true" />
        {pending ? "Sending…" : "Email unpaid orders"}
      </button>
      {message ? <span className="text-xs text-muted-foreground">{message}</span> : null}
    </div>
  )
}
