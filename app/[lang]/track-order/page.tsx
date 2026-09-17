import { isLocale, type Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { Breadcrumb } from "@/components/breadcrumb"
import { TrackOrderForm } from "@/components/orders/track-order-form"

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : "en"
  const dict = await getDictionary(locale)
  return { title: dict.trackOrder.title, description: dict.trackOrder.subtitle }
}

export default async function TrackOrderPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : "en"
  const dict = await getDictionary(locale)

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <Breadcrumb locale={locale} items={[{ label: dict.common.home, href: "/" }, { label: dict.trackOrder.title }]} />

      <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {dict.trackOrder.title}
      </h1>
      <p className="mt-2 text-pretty text-muted-foreground">{dict.trackOrder.subtitle}</p>

      <div className="mt-8 rounded-lg border border-border bg-card p-6">
        <TrackOrderForm />
      </div>

      <p className="mt-4 text-center text-sm text-muted-foreground">{dict.trackOrder.helpText}</p>
    </div>
  )
}
