import type { Locale } from "@/lib/i18n/config"
import { getInstallmentDict } from "@/lib/i18n/installments"
import { ApplicationForm } from "@/components/installments/application-form"

export default async function InstallmentApplyPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params
  const t = getInstallmentDict(lang)

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-balance font-sans text-3xl font-semibold tracking-tight">{t.applyTitle}</h1>
        <p className="mt-2 text-pretty text-muted-foreground">{t.applySubtitle}</p>
      </div>
      <ApplicationForm />
    </div>
  )
}
