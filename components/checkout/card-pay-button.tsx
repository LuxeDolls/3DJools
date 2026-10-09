"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { startAlppayPayment, startCardPayment, startSquarePayment } from "@/lib/actions/orders"

export function CardPayButton({
  orderNumber,
  locale,
  label,
  errorLabel,
  holdLabel,
  method = "card",
}: {
  orderNumber: string
  locale: string
  label: string
  errorLabel: string
  holdLabel?: string
  method?: "card" | "alppay" | "square"
}) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function pay() {
    if (pending) return
    setPending(true)
    setError(null)
    try {
      const result = method === "alppay"
        ? await startAlppayPayment(orderNumber, locale)
        : method === "square"
          ? await startSquarePayment(orderNumber, locale)
          : await startCardPayment(orderNumber, locale)
      if (!result.ok) {
        setError(result.error === "alppay_hold" && holdLabel ? holdLabel : errorLabel)
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
      setError(errorLabel)
      setPending(false)
    }
  }

  return (
    <div className="mt-3 flex flex-col items-start gap-2">
      <Button type="button" onClick={pay} disabled={pending}>
        {label}
      </Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  )
}
