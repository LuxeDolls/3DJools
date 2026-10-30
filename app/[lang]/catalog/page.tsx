import { isLocale, type Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { getAllProducts, allCategorySlugs } from "@/lib/catalog"
import { Breadcrumb } from "@/components/breadcrumb"
import { CatalogSections } from "@/components/catalog/catalog-sections"

export default async function CatalogPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : "en"
  const dict = await getDictionary(locale)
  const products = await getAllProducts(locale)

  const sections = allCategorySlugs.map((category) => ({
    category,
    products: products.filter((p) => p.category === category),
  }))

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 sm:py-8">
      <Breadcrumb
        locale={locale}
        items={[{ label: dict.common.home, href: "/" }, { label: dict.nav.all }]}
      />
      <h1 className="mt-3 font-heading text-2xl font-bold tracking-tight text-foreground sm:mt-4 sm:text-3xl">
        {dict.nav.all}
      </h1>
      <p className="mt-1.5 max-w-2xl text-xs text-muted-foreground sm:mt-2 sm:text-sm">{dict.footer.companyBlurb}</p>
      <div className="mt-6 sm:mt-10">
        <CatalogSections locale={locale} dict={dict} sections={sections} />
      </div>
    </div>
  )
}
