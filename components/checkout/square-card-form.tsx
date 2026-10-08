"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { chargeSquareOrder } from "@/lib/actions/square-payment"
import { SQUARE_APPLICATION_ID, SQUARE_LOCATION_ID, SQUARE_WEB_SDK } from "@/lib/payments/square-availability"

type SquareCard = {
  attach: (selector: string) => Promise<void>
  tokenize: () => Promise<{ status: string; token?: string }>
  destroy: () => Promise<void>
}

type SquarePayments = {
  card: (options?: { style?: Record<string, Record<string, string>> }) => Promise<SquareCard>
  verifyBuyer: (
    token: string,
    details: {
      amount: string
      currencyCode: string
      intent: "CHARGE"
      billingContact: Record<string, string | string[]>
    },
  ) => Promise<{ token?: string }>
}

type SquareGlobal = { payments: (applicationId: string, locationId: string) => SquarePayments }

function squareGlobal(): SquareGlobal | undefined {
  return (window as Window & { Square?: SquareGlobal }).Square
}

function loadSquare(): Promise<void> {
  if (squareGlobal()) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>("script[data-square-sdk]")
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true })
      existing.addEventListener("error", () => reject(new Error("script")), { once: true })
      if (squareGlobal()) resolve()
      return
    }
    const script = document.createElement("script")
    script.src = SQUARE_WEB_SDK
    script.async = true
    script.dataset.squareSdk = "true"
    script.onload = () => resolve()
    script.onerror = () => reject(new Error("script"))
    document.head.appendChild(script)
  })
}

export function SquareCardForm({
  orderNumber,
  usdCents,
  givenName,
  familyName,
  email,
  address,
  city,
  postalCode,
  countryCode,
  payLabel,
  payingLabel,
  fxNote,
  failedLabel,
  unavailableLabel,
  pendingLabel,
  refreshLabel,
}: {
  orderNumber: string
  usdCents: number
  givenName: string
  familyName: string
  email: string
  address: string
  city: string
  postalCode: string
  countryCode: string
  payLabel: string
  payingLabel: string
  fxNote: string
  failedLabel: string
  unavailableLabel: string
  pendingLabel: string
  refreshLabel: string
}) {
  const router = useRouter()
  const paymentsRef = useRef<SquarePayments | null>(null)
  const cardRef = useRef<SquareCard | null>(null)
  const [ready, setReady] = useState(false)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paid, setPaid] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function mount() {
      await loadSquare()
      const square = squareGlobal()
      if (!square || cancelled) return
      const color = getComputedStyle(document.body).color || "#111111"
      const payments = square.payments(SQUARE_APPLICATION_ID, SQUARE_LOCATION_ID)
      const card = await payments.card({ style: { input: { fontSize: "16px", color } } })
      if (cancelled) {
        await card.destroy()
        return
      }
      paymentsRef.current = payments
      cardRef.current = card
      await card.attach("#square-card")
      setReady(true)
    }

    mount().catch(() => {
      if (!cancelled) setError(unavailableLabel)
    })

    return () => {
      cancelled = true
      const card = cardRef.current
      cardRef.current = null
      paymentsRef.current = null
      void card?.destroy()
    }
  }, [unavailableLabel])

  async function pay() {
    if (paying || !ready) return
    const payments = paymentsRef.current
    const card = cardRef.current
    if (!payments || !card) {
      setError(unavailableLabel)
      return
    }
    setPaying(true)
    setError(null)
    try {
      const tokenResult = await card.tokenize()
      if (tokenResult.status !== "OK" || !tokenResult.token) {
        setError(failedLabel)
        setPaying(false)
        return
      }
      const verification = await payments.verifyBuyer(tokenResult.token, {
        amount: (usdCents / 100).toFixed(2),
        currencyCode: "USD",
        intent: "CHARGE",
        billingContact: {
          givenName,
          familyName,
          email,
          addressLines: [address],
          city,
          postalCode,
          countryCode,
        },
      })
      const result = await chargeSquareOrder({
        orderNumber,
        sourceId: tokenResult.token,
        verificationToken: verification.token,
        expectedUsdCents: usdCents,
      })
      if (result.ok) {
        setPaid(true)
        router.refresh()
        return
      }
      setError(
        result.error === "quote_changed"
          ? refreshLabel
          : result.error === "pending" || result.error === "in_progress"
            ? pendingLabel
            : result.error === "unavailable" || result.error === "quote_unavailable"
              ? unavailableLabel
              : failedLabel,
      )
      setPaying(false)
    } catch {
      setError(failedLabel)
      setPaying(false)
    }
  }

  if (paid) return null

  return (
    <div className="mt-4 space-y-3">
      <div id="square-card" className="min-h-12 rounded-md border border-border bg-background px-3 py-2" />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="button" disabled={!ready || paying} onClick={pay}>
        {paying ? payingLabel : payLabel}
      </Button>
      <p className="text-sm leading-relaxed text-muted-foreground">{fxNote}</p>
    </div>
  )
}
