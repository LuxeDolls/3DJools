"use client"

import { useState } from "react"
import { Landmark, Bitcoin, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/format"
import { getCryptoCoinOption } from "@/lib/payments/crypto"
import type { Locale } from "@/lib/i18n/config"

type Method = "bank_transfer" | "crypto"

export function PaymentInstructionsDialog({
  method,
  amountCents,
  reference,
  locale,
  dict,
  trigger,
  onConfirm,
  cryptoCoin,
}: {
  method: Method
  amountCents: number
  /** Shown as the payment reference the customer must include (order number). */
  reference: string
  locale: Locale
  dict: {
    paymentInstructions: string
    iPaidButton: string
    payCard: string
    paySepa: string
    payCrypto: string
    payCryptoNoteText: string
    payCryptoNetwork: string
    payCryptoAddress: string
    orderNumber: string
  }
  /** Visible trigger element/label; defaults to a "Show payment details" button. */
  trigger?: React.ReactNode
  onConfirm: () => Promise<{ ok: boolean; error?: string }>
  /** Coin/network id chosen at checkout (see lib/payments/crypto.ts); defaults to USDT · TRC20. */
  cryptoCoin?: string
}) {
  const coin = getCryptoCoinOption(cryptoCoin)
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConfirm() {
    setSubmitting(true)
    setError(null)
    const res = await onConfirm()
    setSubmitting(false)
    if (res.ok) {
      setDone(true)
    } else {
      setError(res.error ?? "error")
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) {
          setDone(false)
          setError(null)
        }
      }}
    >
      <DialogTrigger render={trigger as any} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dict.paymentInstructions}</DialogTitle>
          <DialogDescription>
            {method === "bank_transfer" ? dict.paySepa : dict.payCrypto}
          </DialogDescription>
        </DialogHeader>

        {done ? (
          <p className="text-sm text-foreground">{dict.iPaidButton} ✓</p>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg border border-border bg-secondary/40 p-4 text-sm">
              {method === "bank_transfer" ? (
                <Landmark className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
              ) : (
                <Bitcoin className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
              )}
              <div className="min-w-0 flex-1">
                {method === "crypto" && <p className="text-muted-foreground">{dict.payCryptoNoteText}</p>}
                <dl className="mt-2 space-y-1.5">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Amount</dt>
                    <dd className="font-mono font-semibold text-foreground">{formatPrice(amountCents, locale)}</dd>
                  </div>
                  {method === "bank_transfer" ? (
                    <>
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">IBAN</dt>
                        <dd className="font-mono text-foreground">DE00 0000 0000 0000 0000 00</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">BIC</dt>
                        <dd className="font-mono text-foreground">XXXXDEXXXXX</dd>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">{dict.payCryptoNetwork}</dt>
                        <dd className="font-mono text-foreground">
                          {coin.coinLabel} · {coin.network}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">{dict.payCryptoAddress}</dt>
                        <dd className="break-all font-mono text-foreground">{coin.address}</dd>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">{dict.orderNumber}</dt>
                    <dd className="font-mono text-foreground">{reference}</dd>
                  </div>
                </dl>
              </div>
            </div>
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
          </div>
        )}

        {!done && (
          <DialogFooter>
            <Button onClick={handleConfirm} disabled={submitting}>
              {submitting && <Loader2 className="size-4 animate-spin" />}
              {dict.iPaidButton}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
