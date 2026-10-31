"use client"

import { useState } from "react"
import { AlertTriangle, X } from "lucide-react"
import type { Locale } from "@/lib/i18n/config"
import type { Dictionary } from "@/lib/i18n/dictionaries/en"
import { STRIPE_CHECKOUT_ENABLED } from "@/lib/payments/stripe-availability"
import { SQUARE_CHECKOUT_ENABLED } from "@/lib/payments/square-availability"
import { SUMUP_CHECKOUT_ENABLED } from "@/lib/payments/sumup-availability"
import { ALPPAY_CHECKOUT_ENABLED } from "@/lib/payments/alppay-availability"

const NOTICE_TITLE: Record<Locale, string> = {
  en: "Payment gateway notice",
  de: "Hinweis zum Zahlungsgateway",
  fr: "Information passerelle de paiement",
  it: "Avviso gateway di pagamento",
  es: "Aviso de pasarela de pago",
  nl: "Melding betaalgateway",
}

const CLOSE_LABEL: Record<Locale, string> = {
  en: "Dismiss notice",
  de: "Hinweis schließen",
  fr: "Fermer l'avis",
  it: "Chiudi avviso",
  es: "Cerrar aviso",
  nl: "Melding sluiten",
}

export function GatewayNotice({
  locale,
  dict,
}: {
  locale: Locale
  dict: Dictionary
}) {
  const [dismissed, setDismissed] = useState(false)

  const cardsDisabled =
    !STRIPE_CHECKOUT_ENABLED &&
    !SQUARE_CHECKOUT_ENABLED &&
    !SUMUP_CHECKOUT_ENABLED &&
    !ALPPAY_CHECKOUT_ENABLED

  if (!cardsDisabled || dismissed) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-3 left-1/2 z-50 w-[calc(100%-1.5rem)] max-w-xl -translate-x-1/2 animate-in fade-in slide-in-from-top-5 duration-300"
    >
      <div className="flex items-start gap-3 rounded-xl border border-destructive/40 bg-card/95 px-4 py-3 text-card-foreground shadow-[0_12px_32px_-8px_rgba(0,0,0,0.55)] backdrop-blur-md">
        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-destructive/15 text-destructive">
          <AlertTriangle className="size-4" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-heading text-xs font-bold uppercase tracking-wide text-destructive sm:text-sm">
            {NOTICE_TITLE[locale]}
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-foreground/90 sm:text-sm">
            {dict.checkout.payCardGatewayNotice}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label={CLOSE_LABEL[locale]}
          className=" -mr-1 -mt-1 flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  )
}
