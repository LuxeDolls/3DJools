"use client"

import { useCallback, useEffect, useId, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { CreditCard, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { NgeniusCopy } from "@/lib/i18n/ngenius"

type NIValidity = {
  isCVVValid?: boolean
  isExpiryValid?: boolean
  isNameValid?: boolean
  isPanValid?: boolean
}

type NINamespace = {
  mountCardInput: (
    mountId: string,
    config: {
      style?: Record<string, unknown>
      hostedSessionApiKey: string
      language?: string
      outletRef: string
      onSuccess?: () => void
      onFail?: (err?: unknown) => void
      onChangeValidStatus?: (status: NIValidity) => void
    },
  ) => void
  unMountCardInputs?: () => void
  generateSessionId: () => Promise<{ session_id?: string }>
  handlePaymentResponse: (
    paymentResponse: Record<string, unknown>,
    options?: { mountId?: string; style?: Record<string, unknown> },
  ) => Promise<{ status?: string; error?: unknown }>
  paymentStates: {
    AUTHORISED: string
    CAPTURED: string
    PURCHASED: string
    FAILED: string
    THREE_DS_FAILURE: string
  }
}

declare global {
  interface Window {
    NI?: NINamespace
  }
}

function loadNgeniusSdk(sdkUrl: string): Promise<NINamespace> {
  if (typeof window === "undefined") return Promise.reject(new Error("no_window"))
  if (window.NI) return Promise.resolve(window.NI)

  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${sdkUrl}"]`)
    if (existing) {
      if (window.NI) {
        resolve(window.NI)
        return
      }
      existing.addEventListener("load", () => {
        if (window.NI) resolve(window.NI)
        else reject(new Error("sdk_missing_ni"))
      })
      existing.addEventListener("error", () => reject(new Error("sdk_load_failed")))
      return
    }

    const script = document.createElement("script")
    script.src = sdkUrl
    script.async = true
    script.onload = () => {
      if (window.NI) resolve(window.NI)
      else reject(new Error("sdk_missing_ni"))
    }
    script.onerror = () => reject(new Error("sdk_load_failed"))
    document.head.appendChild(script)
  })
}

export function NgeniusPayForm({
  orderNumber,
  locale: _locale,
  hostedSessionApiKey,
  outletRef,
  sdkUrl,
  eurFormatted,
  copy,
}: {
  orderNumber: string
  locale: string
  hostedSessionApiKey: string
  outletRef: string
  sdkUrl: string
  eurFormatted: string
  copy: NgeniusCopy
}) {
  const router = useRouter()
  const rawId = useId().replace(/:/g, "")
  const cardMountId = `ngenius-card-${rawId}`
  const threeDsMountId = `ngenius-3ds-${rawId}`

  const [ready, setReady] = useState(false)
  const [mountError, setMountError] = useState(false)
  const [valid, setValid] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [threeDsActive, setThreeDsActive] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [mountGeneration, setMountGeneration] = useState(0)
  const mountedRef = useRef(false)

  const mountForm = useCallback(async () => {
    setReady(false)
    setMountError(false)
    setValid(false)
    setErrorMsg(null)

    try {
      const ni = await loadNgeniusSdk(sdkUrl)
      if (mountedRef.current) {
        try {
          ni.unMountCardInputs?.()
        } catch {
          // Ignore unmount errors
        }
      }
      mountedRef.current = true
      ni.mountCardInput(cardMountId, {
        hostedSessionApiKey,
        outletRef,
        language: "en",
        style: {
          main: {
            borderRadius: "8px",
            borderColor: "#d4d4d8",
            borderWidth: "1px",
            borderStyle: "solid",
            backgroundColor: "#ffffff",
            padding: "12px",
          },
          base: {
            fontSize: "15px",
            color: "#111827",
          },
          input: {
            borderColor: "#d4d4d8",
            borderRadius: "6px",
            padding: "8px 10px",
          },
          invalid: {
            color: "#dc2626",
            borderColor: "#dc2626",
          },
        },
        onSuccess: () => {
          setReady(true)
          setMountError(false)
        },
        onFail: () => {
          setReady(false)
          setMountError(true)
        },
        onChangeValidStatus: (status) => {
          setValid(
            Boolean(status.isPanValid && status.isExpiryValid && status.isCVVValid && status.isNameValid),
          )
        },
      })
    } catch {
      setMountError(true)
    }
  }, [cardMountId, hostedSessionApiKey, outletRef, sdkUrl])

  useEffect(() => {
    void mountForm()
    return () => {
      if (mountedRef.current) {
        try {
          window.NI?.unMountCardInputs?.()
        } catch {
          // Ignore cleanup errors
        }
        mountedRef.current = false
      }
    }
  }, [mountForm, mountGeneration])

  async function handlePay() {
    if (submitting || !ready || !window.NI) return
    if (!valid) {
      setErrorMsg(copy.cardInvalid)
      return
    }
    setSubmitting(true)
    setErrorMsg(null)

    try {
      const sessionRes = await window.NI.generateSessionId()
      const sessionId = sessionRes?.session_id
      if (!sessionId) {
        setErrorMsg(copy.paymentFailed)
        setSubmitting(false)
        return
      }

      const chargeRes = await fetch("/api/payments/ngenius/charge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber, sessionId }),
      })
      const chargeData = (await chargeRes.json().catch(() => null)) as {
        ok?: boolean
        paymentResponse?: Record<string, unknown>
        ngeniusOrderRef?: string | null
      } | null

      if (!chargeRes.ok || !chargeData?.ok || !chargeData.paymentResponse) {
        setErrorMsg(copy.paymentFailed)
        setSubmitting(false)
        return
      }

      setThreeDsActive(true)
      const outcome = await window.NI.handlePaymentResponse(chargeData.paymentResponse, {
        mountId: threeDsMountId,
        style: { width: 460, height: 480 },
      })
      setThreeDsActive(false)

      await fetch("/api/payments/ngenius/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber,
          ngeniusOrderRef: chargeData.ngeniusOrderRef ?? undefined,
        }),
      }).catch(() => undefined)

      const states = window.NI.paymentStates
      const ok =
        outcome.status === states.AUTHORISED ||
        outcome.status === states.CAPTURED ||
        outcome.status === states.PURCHASED

      if (ok) {
        router.refresh()
        return
      }

      setErrorMsg(copy.paymentFailed)
      setSubmitting(false)
      setMountGeneration((g) => g + 1)
    } catch {
      setThreeDsActive(false)
      setErrorMsg(copy.paymentFailed)
      setSubmitting(false)
    }
  }

  const payLabel = copy.payNow.replace("{eur}", eurFormatted)

  return (
    <div className="mt-4 space-y-4">
      {!ready && !mountError && (
        <p className="text-sm text-muted-foreground">{copy.loadingForm}</p>
      )}

      {mountError && (
        <div className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-card p-3">
          <p className="text-sm text-destructive">{copy.unavailable}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setMountGeneration((g) => g + 1)}
          >
            <RefreshCw className="size-3.5" />
            {copy.reloadForm}
          </Button>
        </div>
      )}

      <div id={cardMountId} className={threeDsActive ? "hidden" : "min-h-40 w-full"} />

      {threeDsActive && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">{copy.threeDsHint}</p>
        </div>
      )}
      <div
        id={threeDsMountId}
        className={threeDsActive ? "flex justify-center overflow-x-auto rounded-md border border-border bg-card p-2" : "hidden"}
      />

      {errorMsg && <p className="text-sm font-medium text-destructive">{errorMsg}</p>}

      {!threeDsActive && (
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" onClick={handlePay} disabled={!ready || submitting}>
            <CreditCard className="size-4" />
            {submitting ? copy.processing : payLabel}
          </Button>
          {ready && !submitting && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setMountGeneration((g) => g + 1)}
            >
              <RefreshCw className="size-3.5" />
              {copy.reloadForm}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
