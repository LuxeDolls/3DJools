"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Search } from "lucide-react"
import { trackOrder } from "@/lib/actions/orders"
import { useI18n, useLocalizedPath } from "@/components/i18n-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function TrackOrderForm() {
  const router = useRouter()
  const { dict } = useI18n()
  const lp = useLocalizedPath()
  const t = dict.trackOrder

  const [orderNumber, setOrderNumber] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!orderNumber.trim() || !email.trim()) {
      setError(t.missingFields)
      return
    }

    setError(null)
    setLoading(true)
    const result = await trackOrder({ orderNumber: orderNumber.trim(), email: email.trim() })
    setLoading(false)

    if (result.ok) {
      router.push(lp(`/order/${result.orderNumber}`))
      return
    }

    setError(result.error === "invalid_email" ? t.invalidEmail : t.notFoundText)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="track-order-number">{t.orderNumberLabel}</Label>
        <Input
          id="track-order-number"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          placeholder={t.orderNumberPlaceholder}
          autoComplete="off"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="track-order-email">{t.emailLabel}</Label>
        <Input
          id="track-order-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t.emailPlaceholder}
          autoComplete="email"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            {t.submitting}
          </>
        ) : (
          <>
            <Search className="size-4" />
            {t.submit}
          </>
        )}
      </Button>
    </form>
  )
}
