import { isLocale, type Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { Breadcrumb } from "@/components/breadcrumb"
import { TrackingLookup } from "@/components/orders/tracking-lookup"
import { trackingPageCopy } from "@/lib/shipping/tracking"

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : "en"
  const copy = trackingPageCopy(locale)
  return { title: copy.title, description: copy.subtitle }
}

export default async function TrackPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : "en"
  const dict = await getDictionary(locale)
  const copy = trackingPageCopy(locale)

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <Breadcrumb locale={locale} items={[{ label: dict.common.home, href: "/" }, { label: copy.title }]} />
      <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight text-balance text-foreground sm:text-4xl">
        {copy.title}
      </h1>
      <p className="mt-2 text-pretty leading-relaxed text-muted-foreground">{copy.subtitle}</p>
      <div className="mt-8 rounded-lg border border-border bg-card p-6">
        <TrackingLookup locale={locale} />
      </div>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{copy.note}</p>
    </div>
  )
}
