import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { isLocale, type Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { getAllBrands, getAllProducts } from "@/lib/catalog"
import { localizedPath } from "@/lib/i18n/paths"
import { Breadcrumb } from "@/components/breadcrumb"

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : "en"
  const dict = await getDictionary(locale)
  return { title: dict.nav.brands }
}

export default async function BrandsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : "en"
  const dict = await getDictionary(locale)

  const [brands, allProducts] = await Promise.all([getAllBrands(), getAllProducts(locale)])
  const countByBrand = allProducts.reduce<Record<string, number>>((acc, p) => {
    acc[p.brandSlug] = (acc[p.brandSlug] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Breadcrumb locale={locale} items={[{ label: dict.common.home, href: "/" }, { label: dict.nav.brands }]} />
      <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight text-foreground">{dict.nav.brands}</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{dict.home.shopByBrand}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {brands.map((brand) => {
          const count = countByBrand[brand.slug] ?? 0
          return (
            <Link
              key={brand.slug}
              href={localizedPath(locale, `/brands/${brand.slug}`)}
              className="group flex flex-col rounded-lg border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="font-heading text-xl font-bold text-foreground group-hover:text-primary">
                  {brand.name}
                </span>
                <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
              <p className="mt-2 flex-1 text-pretty text-sm leading-relaxed text-muted-foreground">{brand.blurb}</p>
              <p className="mt-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {count} {dict.common.results}
              </p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
