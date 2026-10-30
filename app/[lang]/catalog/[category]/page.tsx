import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { isLocale, type Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { allCategorySlugs, type CategorySlug, getProductsByCategory, getAllBrands } from "@/lib/catalog"
import { categoryLabel } from "@/lib/catalog/category-labels"
import { Breadcrumb } from "@/components/breadcrumb"
import { CatalogView } from "@/components/catalog/catalog-view"

function isCategory(value: string): value is CategorySlug {
  return (allCategorySlugs as readonly string[]).includes(value)
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; category: string }>
}): Promise<Metadata> {
  const { lang, category } = await params
  const locale: Locale = isLocale(lang) ? lang : "en"
  const dict = await getDictionary(locale)
  if (!isCategory(category)) return {}
  const label = categoryLabel(category, dict)
  return {
    title: label,
    description: `${label} — ${dict.footer.companyBlurb}`,
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ lang: string; category: string }>
}) {
  const { lang, category } = await params
  const locale: Locale = isLocale(lang) ? lang : "en"
  const dict = await getDictionary(locale)

  if (!isCategory(category)) notFound()

  const label = categoryLabel(category, dict)
  const [products, brands] = await Promise.all([getProductsByCategory(category, locale), getAllBrands()])

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 sm:py-8">
      <Breadcrumb
        locale={locale}
        items={[
          { label: dict.common.home, href: "/" },
          { label: dict.nav.all, href: "/catalog" },
          { label },
        ]}
      />
      <h1 className="mt-3 font-heading text-2xl font-bold tracking-tight text-foreground sm:mt-4 sm:text-3xl">
        {label}
      </h1>
      <div className="mt-5 sm:mt-8">
        <CatalogView locale={locale} lockedCategory={category} products={products} brands={brands} />
      </div>
    </div>
  )
}
