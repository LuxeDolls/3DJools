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
  needsPhone = false,
  phoneLabel = "Phone",
}: {
  orderNumber: string
  locale: string
  label: string
  errorLabel: string
  holdLabel?: string
  method?: "card" | "alppay" | "square"
  needsPhone?: boolean
  phoneLabel?: string
}) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [phone, setPhone] = useState("")

  async function pay() {
    if (pending) return
    if (needsPhone && phone.trim().length < 6) {
      setError(phoneLabel)
      return
    }
    setPending(true)
    setError(null)
    try {
      const result = method === "alppay"
        ? await startAlppayPayment(orderNumber, locale, phone)
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
      {needsPhone ? (
        <label className="flex w-full max-w-xs flex-col gap-1 text-sm text-foreground">
          <span>{phoneLabel}</span>
          <input
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            autoComplete="tel"
            required
            className="h-10 rounded-md border border-border bg-background px-3"
          />
        </label>
      ) : null}
      <Button type="button" onClick={pay} disabled={pending}>
        {label}
      </Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  )
}
