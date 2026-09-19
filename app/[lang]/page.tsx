import { isLocale, type Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { getFeaturedProducts, getBestsellers, getAllBrands } from "@/lib/catalog"
import { localizedPath } from "@/lib/i18n/paths"
import { SaleBanner } from "@/components/home/sale-banner"
import { Hero } from "@/components/home/hero"
import { UspBar } from "@/components/home/usp-bar"
import { CategoryTiles } from "@/components/home/category-tiles"
import { BrandStrip } from "@/components/home/brand-strip"
import { MemberPromo } from "@/components/home/member-promo"
import { Newsletter } from "@/components/home/newsletter"
import { ScamAdviserTrust } from "@/components/home/scamadviser-trust"
import { SectionHeading } from "@/components/section-heading"
import { ProductGrid } from "@/components/product/product-grid"

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : "en"
  const dict = await getDictionary(locale)

  const [featured, bestsellers, brands] = await Promise.all([
    getFeaturedProducts(locale),
    getBestsellers(locale),
    getAllBrands(),
  ])

  return (
    <>
      <SaleBanner locale={locale} dict={dict} />
      <Hero locale={locale} dict={dict} />
      <UspBar dict={dict} />
      <MemberPromo />
      <CategoryTiles locale={locale} dict={dict} />

      <section className="mx-auto max-w-7xl px-4 py-12">
        <SectionHeading
          title={dict.home.featuredPrinters}
          viewAllHref={localizedPath(locale, "/catalog/printers")}
          viewAllLabel={dict.home.viewAll}
        />
        <ProductGrid products={featured} locale={locale} dict={dict} />
      </section>

      <section className="bg-card">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <SectionHeading
            title={dict.home.bestsellers}
            viewAllHref={localizedPath(locale, "/catalog")}
            viewAllLabel={dict.home.viewAll}
          />
          <ProductGrid products={bestsellers} locale={locale} dict={dict} />
        </div>
      </section>

      <BrandStrip locale={locale} dict={dict} brands={brands} />
      <ScamAdviserTrust dict={dict} />
      <Newsletter />
    </>
  )
}
