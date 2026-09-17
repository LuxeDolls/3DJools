"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { formatPrice } from "@/lib/format"
import { confirmInstallmentPayment, decideApplication } from "@/lib/actions/admin"
import type { InstallmentApplication } from "@/lib/db/schema"
import type { OrderWithItems } from "@/lib/orders/queries"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Check, Loader2, X, FileText, Clock, CircleDollarSign } from "lucide-react"
import { toast } from "sonner"

const STATUS_TONE: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  approved: "bg-primary/15 text-primary",
  rejected: "bg-destructive/15 text-destructive",
  cancelled: "bg-muted text-muted-foreground",
}

const SCHEDULE_STATUS_TONE: Record<string, string> = {
  unpaid: "bg-muted text-muted-foreground",
  reviewing: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  paid: "bg-primary/15 text-primary",
}

export function ApplicationDetail({ app }: { app: InstallmentApplication & { order?: OrderWithItems | null } }) {
  const router = useRouter()
  const [notes, setNotes] = useState(app.adminNotes ?? "")
  const [pending, setPending] = useState<"approved" | "rejected" | null>(null)
  const [confirmingIndex, setConfirmingIndex] = useState<number | null>(null)

  const idUrl = `/api/admin/id-document?pathname=${encodeURIComponent(app.idDocumentPathname)}`
  const isPdf = app.idDocumentPathname.toLowerCase().endsWith(".pdf")

  async function decide(decision: "approved" | "rejected") {
    setPending(decision)
    try {
      const res = await decideApplication(app.id, decision, notes)
      if (!res.ok) {
        toast.error(res.error || "Failed")
        return
      }
      toast.success(`Application ${decision}`)
      router.refresh()
    } finally {
      setPending(null)
    }
  }

  async function confirmPayment(index: number) {
    setConfirmingIndex(index)
    try {
      const res = await confirmInstallmentPayment(app.id, index)
      if (!res.ok) {
        toast.error(res.error || "Failed")
        return
      }
      toast.success("Payment confirmed")
      router.refresh()
    } finally {
      setConfirmingIndex(null)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        {/* KYC */}
        <Card title="Applicant (KYC)">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <Item label="First name" value={app.firstName} />
            <Item label="Last name" value={app.lastName} />
            <Item label="Email" value={app.email} />
            <Item label="Phone" value={app.phone} />
            <Item label="Date of birth" value={app.dateOfBirth} />
            <Item label="Nationality" value={app.nationality} />
            <Item label="Employment" value={app.employmentStatus} />
            <Item label="Monthly income" value={formatPrice(app.monthlyIncomeCents, "en")} />
            <div className="col-span-2">
              <Item
                label="Address"
                value={`${app.addressLine1}${app.addressLine2 ? `, ${app.addressLine2}` : ""}, ${app.postalCode} ${app.city}, ${app.country}`}
              />
            </div>
            <Item label="ID type" value={app.idDocumentType} />
            <Item label="ID number" value={app.idDocumentNumber} />
          </dl>
        </Card>

        {/* ID document */}
        <Card title="ID document">
          <div className="overflow-hidden rounded-md border border-border bg-muted/30">
            {isPdf ? (
              <a
                href={idUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 text-sm text-primary hover:underline"
              >
                <FileText className="h-5 w-5" />
                Open PDF document
              </a>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={idUrl || "/placeholder.svg"} alt="Uploaded ID document" className="max-h-[420px] w-full object-contain" />
            )}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Stored in private encrypted storage. Access is logged to the admin session only.
          </p>
        </Card>

        {/* Order */}
        <Card title="Order">
          <ul className="space-y-2 text-sm">
            {app.cartItems.map((item, i) => (
              <li key={i} className="flex justify-between border-b border-border/60 pb-2 last:border-0">
                <span>
                  {item.quantity} × {item.name}
                </span>
                <span className="font-medium tabular-nums">{formatPrice(item.unitPriceCents * item.quantity, "en")}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Decision panel */}
      <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
        <Card title="Status">
          <div className="flex items-center justify-between">
            <span className="font-mono text-lg font-semibold">{app.applicationRef}</span>
            <Badge className={`${STATUS_TONE[app.status] ?? ""} border-0`}>{app.status}</Badge>
          </div>
          <Separator className="my-4" />
          <dl className="space-y-2 text-sm">
            <Row label="Order total" value={formatPrice(app.totalAmountCents, "en")} />
            <Row label="Down payment (25%)" value={formatPrice(app.downPaymentCents, "en")} highlight />
            <Row label="Remaining (75%)" value={formatPrice(app.remainingCents, "en")} />
          </dl>
          {app.order && (
            <>
              <Separator className="my-4" />
              <Row label="Linked order" value={app.order.orderNumber} />
              <Row label="Order status" value={app.order.status} />
            </>
          )}
          <Separator className="my-4" />
          <h4 className="mb-2 text-sm font-medium">Payment schedule</h4>
          <ol className="space-y-2 text-sm">
            {app.schedule.map((s) => {
              const entryStatus = s.status ?? (s.paid ? "paid" : "unpaid")
              return (
                <li key={s.index} className="flex items-center justify-between gap-2 rounded-md border border-border/60 px-3 py-2">
                  <span className="text-muted-foreground">
                    {s.index + 1}.{" "}
                    {s.label === "down_payment"
                      ? "Down payment"
                      : new Date(s.dueDate).toLocaleDateString("en", { month: "short", day: "numeric" })}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{formatPrice(s.amountCents, "en")}</span>
                    <Badge className={`${SCHEDULE_STATUS_TONE[entryStatus] ?? ""} gap-1 border-0 text-[11px]`}>
                      {entryStatus === "paid" ? (
                        <Check className="h-3 w-3" />
                      ) : entryStatus === "reviewing" ? (
                        <Clock className="h-3 w-3" />
                      ) : null}
                      {entryStatus}
                    </Badge>
                    {entryStatus !== "paid" && app.status === "approved" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-xs"
                        onClick={() => confirmPayment(s.index)}
                        disabled={confirmingIndex !== null}
                      >
                        {confirmingIndex === s.index ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <CircleDollarSign className="h-3 w-3" />
                        )}
                        Confirm received
                      </Button>
                    )}
                  </span>
                </li>
              )
            })}
          </ol>
        </Card>

        <Card title="Decision">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Internal notes (optional)"
            rows={3}
          />
          <div className="mt-3 flex gap-2">
            <Button className="flex-1" onClick={() => decide("approved")} disabled={pending !== null}>
              {pending === "approved" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Approve
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => decide("rejected")}
              disabled={pending !== null}
            >
              {pending === "rejected" ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
              Reject
            </Button>
          </div>
          {app.reviewedAt && (
            <p className="mt-3 text-xs text-muted-foreground">
              Last reviewed {new Date(app.reviewedAt).toLocaleString("en")}
            </p>
          )}
        </Card>
      </aside>
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <h3 className="mb-4 font-sans font-semibold">{title}</h3>
      {children}
    </section>
  )
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  )
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={`font-medium tabular-nums ${highlight ? "text-primary" : ""}`}>{value}</dd>
    </div>
  )
}
