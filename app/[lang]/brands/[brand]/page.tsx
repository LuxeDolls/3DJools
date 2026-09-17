import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { isLocale, type Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { getBrandBySlug, getAllBrandSlugs, getAllBrands, getProductsByBrand } from "@/lib/catalog"
import { Breadcrumb } from "@/components/breadcrumb"
import { CatalogView } from "@/components/catalog/catalog-view"

export async function generateStaticParams() {
  const slugs = await getAllBrandSlugs()
  return slugs.map((slug) => ({ brand: slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; brand: string }>
}): Promise<Metadata> {
  const { brand } = await params
  const b = await getBrandBySlug(brand)
  if (!b) return {}
  return { title: b.name, description: b.blurb }
}

export default async function BrandPage({
  params,
}: {
  params: Promise<{ lang: string; brand: string }>
}) {
  const { lang, brand } = await params
  const locale: Locale = isLocale(lang) ? lang : "en"
  const dict = await getDictionary(locale)

  const b = await getBrandBySlug(brand)
  if (!b) notFound()

  const [products, brands] = await Promise.all([getProductsByBrand(b.slug, locale), getAllBrands()])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Breadcrumb
        locale={locale}
        items={[
          { label: dict.common.home, href: "/" },
          { label: dict.nav.brands, href: "/brands" },
          { label: b.name },
        ]}
      />
      <div className="mt-4 rounded-lg border border-border bg-card p-6">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">{b.name}</h1>
        <p className="mt-2 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground">{b.blurb}</p>
      </div>
      <div className="mt-8">
        <CatalogView locale={locale} lockedBrand={b.slug} products={products} brands={brands} />
      </div>
    </div>
  )
}
