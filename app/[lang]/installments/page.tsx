import type { Locale } from "@/lib/i18n/config"
import { getInstallmentDict } from "@/lib/i18n/installments"
import { ApplicationLookup } from "@/components/installments/application-lookup"

export default async function InstallmentLookupPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params
  const t = getInstallmentDict(lang)

  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-balance font-sans text-3xl font-semibold tracking-tight">{t.lookupTitle}</h1>
      <p className="mt-2 text-pretty text-muted-foreground">{t.planTagline}</p>
      <div className="mt-6">
        <ApplicationLookup />
      </div>
    </div>
  )
}
