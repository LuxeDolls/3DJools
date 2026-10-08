"use client"

import { useRouter } from "next/navigation"
import { useI18n } from "@/components/i18n-provider"
import { getInstallmentDict } from "@/lib/i18n/installments"
import { formatPrice } from "@/lib/format"
import { markInstallmentPaymentSubmitted } from "@/lib/actions/installments"
import { PaymentInstructionsDialog } from "@/components/checkout/payment-instructions-dialog"
import { BANK_TRANSFER_ACCOUNT } from "@/lib/payments/bank-transfer"
import type { ScheduleEntry, ApplicationCartItem } from "@/lib/db/schema"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Clock, XCircle } from "lucide-react"

type StatusData = {
  applicationRef: string
  status: string
  firstName: string
  currency: string
  totalAmountCents: number
  downPaymentCents: number
  remainingCents: number
  schedule: ScheduleEntry[]
  cartItems: ApplicationCartItem[]
  createdAt: Date | string
}

type PaymentDialogDict = {
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

export function StatusView({ data, paymentDict }: { data: StatusData; paymentDict: PaymentDialogDict }) {
  const router = useRouter()
  const { locale } = useI18n()
  const t = getInstallmentDict(locale)

  const statusMeta: Record<string, { label: string; body: string; tone: string; icon: React.ReactNode }> = {
    pending: {
      label: t.statusPending,
      body: t.statusPendingBody,
      tone: "text-amber-500",
      icon: <Clock className="h-5 w-5" />,
    },
    approved: {
      label: t.statusApproved,
      body: t.statusApprovedBody,
      tone: "text-primary",
      icon: <CheckCircle2 className="h-5 w-5" />,
    },
    rejected: {
      label: t.statusRejected,
      body: t.statusRejectedBody,
      tone: "text-destructive",
      icon: <XCircle className="h-5 w-5" />,
    },
    cancelled: {
      label: t.statusCancelled,
      body: t.statusRejectedBody,
      tone: "text-muted-foreground",
      icon: <XCircle className="h-5 w-5" />,
    },
  }

  const meta = statusMeta[data.status] ?? statusMeta.pending
  const payable = data.schedule.find((entry, index) => {
    const entryStatus = entry.status ?? (entry.paid ? "paid" : "unpaid")
    const previousPaid = index === 0 || (data.schedule[index - 1]?.status ?? "unpaid") === "paid"
    return data.status === "approved" && previousPaid && (entryStatus === "unpaid" || entryStatus === "reviewing")
  })

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{t.yourRef}</p>
            <p className="font-mono text-lg font-semibold">{data.applicationRef}</p>
          </div>
          <span className={`flex items-center gap-2 font-medium ${meta.tone}`}>
            {meta.icon}
            {meta.label}
          </span>
        </div>
        <p className="mt-4 text-pretty text-muted-foreground">{meta.body}</p>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-3 font-sans font-semibold">{t.paymentSchedule}</h3>
        <ol className="space-y-2">
          {data.schedule.map((s, i) => {
            const entryStatus = s.status ?? (s.paid ? "paid" : "unpaid")
            const previousPaid = i === 0 || (data.schedule[i - 1]?.status ?? "unpaid") === "paid"
            const canPay = data.status === "approved" && entryStatus === "unpaid" && previousPaid

            return (
              <li
                key={s.index}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-muted/30 px-4 py-3 text-sm"
              >
                <span className="flex items-center gap-3">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                      entryStatus === "paid" ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                    }`}
                  >
                    {entryStatus === "paid" ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                  </span>
                  <span>
                    <span className="font-medium">
                      {s.label === "down_payment" ? t.downPaymentLabel : t.installmentLabel}
                    </span>
                    <span className="ml-2 text-muted-foreground">
                      {s.label === "down_payment"
                        ? t.dueNow
                        : `${t.dueOn} ${new Date(s.dueDate).toLocaleDateString(locale, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}`}
                    </span>
                  </span>
                </span>
                <span className="flex items-center gap-3">
                  <span className="font-semibold">{formatPrice(s.amountCents, locale)}</span>
                  {entryStatus === "reviewing" ? (
                    <span className="flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                      <Clock className="h-3.5 w-3.5" />
                      {t.statusPending}
                    </span>
                  ) : canPay ? (
                    <PaymentInstructionsDialog
                      method="bank_transfer"
                      amountCents={s.amountCents}
                      reference={data.applicationRef}
                      locale={locale}
                      dict={paymentDict}
                      trigger={
                        <Button size="sm">{s.label === "down_payment" ? t.payDownPayment : t.payInstallment}</Button>
                      }
                      onConfirm={async () => {
                        const res = await markInstallmentPaymentSubmitted(data.applicationRef, s.index)
                        if (res.ok) router.refresh()
                        return res
                      }}
                    />
                  ) : null}
                </span>
              </li>
            )
          })}
        </ol>
        {payable ? (
          <div className="mt-4 rounded-md border border-border bg-background p-4 text-sm">
            <p className="font-medium">{t.paymentDetails}</p>
            <p className="mt-1 text-pretty text-muted-foreground">{t.paymentDetailsHint}</p>
            {(payable.status ?? "unpaid") === "reviewing" ? (
              <p className="mt-2 text-pretty text-muted-foreground">{t.transferWaiting}</p>
            ) : null}
            <dl className="mt-3 space-y-1.5">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">{t.amountLabel}</dt>
                <dd className="font-mono font-semibold">{formatPrice(payable.amountCents, locale)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">{t.accountName}</dt>
                <dd className="text-right font-mono">{BANK_TRANSFER_ACCOUNT.accountName}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">IBAN</dt>
                <dd className="text-right font-mono">{BANK_TRANSFER_ACCOUNT.iban}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">BIC</dt>
                <dd className="font-mono">{BANK_TRANSFER_ACCOUNT.bic}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">{t.paymentReference}</dt>
                <dd className="font-mono">{data.applicationRef}</dd>
              </div>
            </dl>
          </div>
        ) : null}
        <div className="mt-4 flex justify-between border-t border-border pt-3 text-sm">
          <span className="text-muted-foreground">{t.orderTotal}</span>
          <span className="font-semibold">{formatPrice(data.totalAmountCents, locale)}</span>
        </div>
      </div>
    </div>
  )
}
