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
    <div className="mx-auto max-w-7xl px-4 py-5 sm:py-8">
      <Breadcrumb locale={locale} items={[{ label: dict.common.home, href: "/" }, { label: dict.nav.brands }]} />
      <h1 className="mt-3 font-heading text-2xl font-bold tracking-tight text-foreground sm:mt-4 sm:text-3xl">
        {dict.nav.brands}
      </h1>
      <p className="mt-1.5 max-w-2xl text-xs text-muted-foreground sm:mt-2 sm:text-sm">{dict.home.shopByBrand}</p>

      <div className="mt-5 grid gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {brands.map((brand) => {
          const count = countByBrand[brand.slug] ?? 0
          return (
            <Link
              key={brand.slug}
              href={localizedPath(locale, `/brands/${brand.slug}`)}
              className="group flex flex-col rounded-xl border border-border bg-card p-4 shadow-[0_4px_12px_rgba(0,0,0,0.18),0_20px_50px_-12px_rgba(0,0,0,0.5)] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_8px_20px_rgba(0,0,0,0.25),0_28px_60px_-12px_rgba(0,0,0,0.65)] sm:p-6"
            >
              <div className="flex items-center justify-between">
                <span className="font-heading text-lg font-bold text-foreground group-hover:text-primary sm:text-xl">
                  {brand.name}
                </span>
                <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
              <p className="mt-1.5 flex-1 text-pretty text-xs leading-relaxed text-muted-foreground sm:mt-2 sm:text-sm">
                {brand.blurb}
              </p>
              <p className="mt-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground sm:mt-4 sm:text-xs">
                {count} {dict.common.results}
              </p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
