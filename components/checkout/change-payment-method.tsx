"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { switchOrderPaymentMethod } from "@/lib/actions/orders"
import { Button } from "@/components/ui/button"
import type { PaymentMethod } from "@/lib/db/schema"

export function ChangePaymentMethod({
  orderNumber,
  options,
  title,
  hint,
  errorLabel,
}: {
  orderNumber: string
  options: { method: PaymentMethod; label: string }[]
  title: string
  hint: string
  errorLabel: string
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [pendingMethod, setPendingMethod] = useState<PaymentMethod | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!options.length) return null

  function switchTo(method: PaymentMethod) {
    if (pending) return
    setError(null)
    setPendingMethod(method)
    startTransition(async () => {
      const result = await switchOrderPaymentMethod(orderNumber, method)
      if (!result.ok) {
        setError(errorLabel)
        setPendingMethod(null)
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="mt-6 rounded-lg border border-border bg-secondary/40 p-4 text-sm text-foreground">
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-muted-foreground">{hint}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => (
          <Button
            key={option.method}
            type="button"
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={() => switchTo(option.method)}
          >
            {pending && pendingMethod === option.method ? "…" : option.label}
          </Button>
        ))}
      </div>
      {error ? <p className="mt-2 text-destructive">{error}</p> : null}
    </div>
  )
}
