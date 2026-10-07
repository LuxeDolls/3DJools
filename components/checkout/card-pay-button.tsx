"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { startAlppayPayment, startCardPayment } from "@/lib/actions/orders"

export function CardPayButton({
  orderNumber,
  locale,
  label,
  errorLabel,
  method = "card",
}: {
  orderNumber: string
  locale: string
  label: string
  errorLabel: string
  method?: "card" | "alppay"
}) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState(false)

  async function pay() {
    if (pending) return
    setPending(true)
    setError(false)
    try {
      const result = method === "alppay"
        ? await startAlppayPayment(orderNumber, locale)
        : await startCardPayment(orderNumber, locale)
      if (!result.ok) {
        setError(true)
        setPending(false)
        return
      }
      try {
        if (window.top && window.top !== window.self) {
          window.top.location.href = result.paymentUrl
          return
        }
      } catch {
        window.open(result.paymentUrl, "_blank", "noopener,noreferrer")
        setPending(false)
        return
      }
      window.location.href = result.paymentUrl
    } catch {
      setError(true)
      setPending(false)
    }
  }

  return (
    <div className="mt-3 flex flex-col items-start gap-2">
      <Button type="button" onClick={pay} disabled={pending}>
        {label}
      </Button>
      {error ? <p className="text-sm text-destructive">{errorLabel}</p> : null}
    </div>
  )
}
