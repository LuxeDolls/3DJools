"use client"

import { useId, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useCart } from "@/components/cart/cart-provider"
import { useI18n, useLocalizedPath } from "@/components/i18n-provider"
import { getInstallmentDict } from "@/lib/i18n/installments"
import { buildSchedule, computeInstallmentAmounts } from "@/lib/installments"
import { formatPrice } from "@/lib/format"
import { createInstallmentApplication } from "@/lib/actions/installments"
import { InstallmentContract } from "@/components/installments/contract"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Check, Loader2, ShieldCheck, Upload } from "lucide-react"
import { toast } from "sonner"
import { locales } from "@/lib/i18n/config"

const STEPS = 4

type FormState = {
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  nationality: string
  addressLine1: string
  addressLine2: string
  city: string
  postalCode: string
  country: string
  employmentStatus: string
  monthlyIncome: string
  idDocumentType: string
  idDocumentNumber: string
}

const EMPTY: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  nationality: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  postalCode: "",
  country: "",
  employmentStatus: "",
  monthlyIncome: "",
  idDocumentType: "",
  idDocumentNumber: "",
}

export function ApplicationForm() {
  const { locale } = useI18n()
  const t = getInstallmentDict(locale)
  const lp = useLocalizedPath()
  const router = useRouter()
  const { lines, subtotalCents, clear } = useCart()

  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [idPathname, setIdPathname] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [dataConsent, setDataConsent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [successRef, setSuccessRef] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const totalCents = subtotalCents
  const { downPaymentCents, remainingCents } = useMemo(
    () => computeInstallmentAmounts(totalCents),
    [totalCents],
  )
  const schedule = useMemo(() => buildSchedule(totalCents), [totalCents])

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function personalValid() {
    return (
      form.firstName &&
      form.lastName &&
      form.email &&
      form.phone &&
      form.dateOfBirth &&
      form.nationality &&
      form.addressLine1 &&
      form.city &&
      form.postalCode &&
      form.country &&
      form.employmentStatus
    )
  }

  function identityValid() {
    return form.idDocumentType && form.idDocumentNumber && idPathname
  }

  async function handleUpload(file: File) {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/installments/upload-id", { method: "POST", body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Upload failed")
      setIdPathname(data.pathname)
      toast.success(t.idUploaded)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  function next() {
    if (step === 0 && !personalValid()) {
      toast.error(t.errRequired)
      return
    }
    if (step === 1 && !identityValid()) {
      toast.error(idPathname ? t.errRequired : t.errUpload)
      return
    }
    setStep((s) => Math.min(STEPS - 1, s + 1))
  }

  async function submit() {
    if (!termsAccepted || !dataConsent) {
      toast.error(t.errConsent)
      return
    }
    setSubmitting(true)
    try {
      const result = await createInstallmentApplication({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        dateOfBirth: form.dateOfBirth,
        nationality: form.nationality,
        idDocumentType: form.idDocumentType,
        idDocumentNumber: form.idDocumentNumber,
        addressLine1: form.addressLine1,
        addressLine2: form.addressLine2,
        city: form.city,
        postalCode: form.postalCode,
        country: form.country,
        employmentStatus: form.employmentStatus,
        monthlyIncomeCents: Math.round((Number(form.monthlyIncome) || 0) * 100),
        idDocumentPathname: idPathname!,
        locale,
        termsAccepted,
        dataConsent,
        items: lines.map((l) => ({ slug: l.slug, quantity: l.quantity })),
      })
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      clear()
      setSuccessRef(result.ref)
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  // Success screen
  if (successRef) {
    return (
      <div className="mx-auto max-w-xl rounded-lg border border-border bg-card p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Check className="h-6 w-6 text-primary" />
        </div>
        <h2 className="font-sans text-2xl font-semibold">{t.successTitle}</h2>
        <p className="mt-2 text-pretty text-muted-foreground">{t.successBody}</p>
        <div className="mt-5 rounded-md border border-border bg-muted/40 p-4">
          <p className="text-sm text-muted-foreground">{t.yourRef}</p>
          <p className="font-mono text-xl font-semibold tracking-wide">{successRef}</p>
        </div>
        <Button className="mt-6 w-full" render={<Link href={lp(`/installments/${successRef}`)}>{t.trackCta}</Link>} />
      </div>
    )
  }

  // Empty cart guard
  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-xl rounded-lg border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">{t.applySubtitle}</p>
        <Button className="mt-4" render={<Link href={lp("/catalog")}>{t.back}</Link>} />
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="rounded-lg border border-border bg-card p-6">
        {/* Stepper */}
        <ol className="mb-6 flex items-center gap-2 text-xs">
          {[t.stepPersonal, t.stepIdentity, t.stepReview, t.stepContract].map((label, i) => (
            <li key={label} className="flex flex-1 items-center gap-2">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                  i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <span className={`hidden truncate sm:block ${i === step ? "font-medium" : "text-muted-foreground"}`}>
                {label}
              </span>
            </li>
          ))}
        </ol>

        {/* Step 0 — personal */}
        {step === 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.firstName} value={form.firstName} onChange={(v) => set("firstName", v)} />
            <Field label={t.lastName} value={form.lastName} onChange={(v) => set("lastName", v)} />
            <Field label={t.email} type="email" value={form.email} onChange={(v) => set("email", v)} />
            <Field label={t.phone} type="tel" value={form.phone} onChange={(v) => set("phone", v)} />
            <Field label={t.dateOfBirth} type="date" value={form.dateOfBirth} onChange={(v) => set("dateOfBirth", v)} />
            <Field label={t.nationality} value={form.nationality} onChange={(v) => set("nationality", v)} />
            <div className="sm:col-span-2">
              <Field label={t.addressLine1} value={form.addressLine1} onChange={(v) => set("addressLine1", v)} />
            </div>
            <div className="sm:col-span-2">
              <Field label={t.addressLine2} value={form.addressLine2} onChange={(v) => set("addressLine2", v)} optional />
            </div>
            <Field label={t.city} value={form.city} onChange={(v) => set("city", v)} />
            <Field label={t.postalCode} value={form.postalCode} onChange={(v) => set("postalCode", v)} />
            <Field label={t.country} value={form.country} onChange={(v) => set("country", v)} />
            <div className="grid gap-1.5">
              <Label htmlFor="employment-status">{t.employmentStatus}</Label>
              <Select value={form.employmentStatus} onValueChange={(v) => set("employmentStatus", v ?? "")}>
                <SelectTrigger id="employment-status">
                  <SelectValue placeholder="—" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employed">{t.employmentOptions.employed}</SelectItem>
                  <SelectItem value="self_employed">{t.employmentOptions.selfEmployed}</SelectItem>
                  <SelectItem value="student">{t.employmentOptions.student}</SelectItem>
                  <SelectItem value="retired">{t.employmentOptions.retired}</SelectItem>
                  <SelectItem value="other">{t.employmentOptions.other}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Field
                label={t.monthlyIncome}
                type="number"
                value={form.monthlyIncome}
                onChange={(v) => set("monthlyIncome", v)}
              />
            </div>
          </div>
        )}

        {/* Step 1 — identity */}
        {step === 1 && (
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="id-doc-type">{t.idType}</Label>
              <Select value={form.idDocumentType} onValueChange={(v) => set("idDocumentType", v ?? "")}>
                <SelectTrigger id="id-doc-type">
                  <SelectValue placeholder="—" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="passport">{t.idTypeOptions.passport}</SelectItem>
                  <SelectItem value="national_id">{t.idTypeOptions.national_id}</SelectItem>
                  <SelectItem value="drivers_license">{t.idTypeOptions.drivers_license}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Field label={t.idNumber} value={form.idDocumentNumber} onChange={(v) => set("idDocumentNumber", v)} />

            <div className="grid gap-1.5">
              <Label>{t.idUpload}</Label>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleUpload(file)
                }}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/30 px-4 py-8 text-sm text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground disabled:opacity-60"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> {t.uploading}
                  </>
                ) : idPathname ? (
                  <>
                    <Check className="h-4 w-4 text-primary" /> {t.idUploaded}
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" /> {t.idUploadCta}
                  </>
                )}
              </button>
              <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                {t.idUploadHint}
              </p>
            </div>
          </div>
        )}

        {/* Step 2 — payment plan */}
        {step === 2 && (
          <div className="grid gap-4">
            <PlanBreakdown
              t={t}
              locale={locale}
              totalCents={totalCents}
              downPaymentCents={downPaymentCents}
              remainingCents={remainingCents}
              schedule={schedule}
            />
          </div>
        )}

        {/* Step 3 — contract */}
        {step === 3 && (
          <div className="grid gap-4">
            <InstallmentContract
              locale={locale}
              totalCents={totalCents}
              downPaymentCents={downPaymentCents}
              remainingCents={remainingCents}
              schedule={schedule}
              borrower={{
                name: `${form.firstName} ${form.lastName}`.trim(),
                address: `${form.addressLine1}, ${form.postalCode} ${form.city}, ${form.country}`,
                email: form.email,
              }}
              goods={lines.map((l) => ({ name: l.name, quantity: l.quantity }))}
            />
            <label className="flex cursor-pointer items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[var(--primary)]"
              />
              <span>{t.contractAccept}</span>
            </label>
            <label className="flex cursor-pointer items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={dataConsent}
                onChange={(e) => setDataConsent(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[var(--primary)]"
              />
              <span>{t.dataConsent}</span>
            </label>
          </div>
        )}

        <Separator className="my-6" />

        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0 || submitting}
          >
            {t.back}
          </Button>
          {step < STEPS - 1 ? (
            <Button onClick={next}>{t.next}</Button>
          ) : (
            <Button onClick={submit} disabled={submitting || !termsAccepted || !dataConsent}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t.submitting}
                </>
              ) : (
                t.submit
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Sticky plan summary */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="font-sans font-semibold">{t.planName}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{t.planTagline}</p>
          <Separator className="my-4" />
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{t.orderTotal}</dt>
              <dd className="font-medium">{formatPrice(totalCents, locale)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{t.downPaymentNow}</dt>
              <dd className="font-semibold text-primary">{formatPrice(downPaymentCents, locale)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{t.remaining}</dt>
              <dd className="font-medium">{formatPrice(remainingCents, locale)}</dd>
            </div>
          </dl>
        </div>
      </aside>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  optional,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  optional?: boolean
}) {
  const id = useId()
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>
        {label}
        {optional ? "" : <span className="text-primary"> *</span>}
      </Label>
      <Input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

function PlanBreakdown({
  t,
  locale,
  totalCents,
  downPaymentCents,
  remainingCents,
  schedule,
}: {
  t: ReturnType<typeof getInstallmentDict>
    locale: (typeof locales)[number]
  totalCents: number
  downPaymentCents: number
  remainingCents: number
  schedule: ReturnType<typeof buildSchedule>
}) {
  return (
    <>
      <div className="grid grid-cols-3 gap-3">
        <Stat label={t.orderTotal} value={formatPrice(totalCents, locale)} />
        <Stat label={t.downPaymentNow} value={formatPrice(downPaymentCents, locale)} highlight />
        <Stat label={t.remaining} value={formatPrice(remainingCents, locale)} />
      </div>
      <div className="mt-2">
        <h4 className="mb-2 text-sm font-semibold">{t.paymentSchedule}</h4>
        <ol className="space-y-2">
          {schedule.map((s, i) => (
            <li
              key={s.index}
              className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-4 py-3 text-sm"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {i + 1}
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
                        })}`}
                  </span>
                </span>
              </span>
              <span className="font-semibold">{formatPrice(s.amountCents, locale)}</span>
            </li>
          ))}
        </ol>
      </div>
    </>
  )
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-md border p-3 ${highlight ? "border-primary/40 bg-primary/5" : "border-border bg-muted/30"}`}>
      <p className="text-[11px] leading-tight text-muted-foreground">{label}</p>
      <p className={`mt-1 font-semibold ${highlight ? "text-primary" : ""}`}>{value}</p>
    </div>
  )
}
