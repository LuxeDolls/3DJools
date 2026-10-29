import { Tag } from "lucide-react"
import { isLocale, type Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { getAllProducts } from "@/lib/catalog"
import { Breadcrumb } from "@/components/breadcrumb"
import { ProductGrid } from "@/components/product/product-grid"

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : "en"
  const dict = await getDictionary(locale)
  return { title: dict.nav.deals }
}

export default async function DealsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : "en"
  const dict = await getDictionary(locale)

  // The Black Friday promo code is auto-applied at checkout for every order, so
  // every product storefront-wide qualifies for the current deal.
  const highlighted = await getAllProducts(locale)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Breadcrumb locale={locale} items={[{ label: dict.common.home, href: "/" }, { label: dict.nav.deals }]} />
      <div className="mt-4 flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Tag className="size-5" />
        </span>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">{dict.nav.deals}</h1>
      </div>
      <div className="mt-8">
        <ProductGrid products={highlighted} locale={locale} dict={dict} />
      </div>
    </div>
  )
}
