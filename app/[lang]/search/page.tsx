import { Suspense } from "react"
import { isLocale, type Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { getAllProducts } from "@/lib/catalog"
import { Breadcrumb } from "@/components/breadcrumb"
import { SearchView } from "@/components/catalog/search-view"

export default async function SearchPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : "en"
  const dict = await getDictionary(locale)
  const products = await getAllProducts(locale)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Breadcrumb locale={locale} items={[{ label: dict.common.home, href: "/" }, { label: dict.common.search }]} />
      <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight text-foreground">{dict.common.search}</h1>
      <div className="mt-8">
        <Suspense fallback={<p className="text-sm text-muted-foreground">{dict.common.loading}</p>}>
          <SearchView locale={locale} products={products} />
        </Suspense>
      </div>
    </div>
  )
}
