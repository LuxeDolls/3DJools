import { isLocale, type Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { getFeaturedProducts, getBestsellers } from "@/lib/catalog"
import { localizedPath } from "@/lib/i18n/paths"
import { Hero } from "@/components/home/hero"
import { UspBar } from "@/components/home/usp-bar"
import { CategoryTiles } from "@/components/home/category-tiles"
import { FeaturedShowcase } from "@/components/home/featured-showcase"
import { PrinterFinder } from "@/components/home/printer-finder"
import { HelpStrip } from "@/components/home/help-strip"
import { MemberPromo } from "@/components/home/member-promo"
import { Newsletter } from "@/components/home/newsletter"
import { ScamAdviserTrust } from "@/components/home/scamadviser-trust"
import { SectionHeading } from "@/components/section-heading"
import { ProductGrid } from "@/components/product/product-grid"

// Product prices come from the database. Without this, the homepage stays
// frozen at build time and a price change never reaches the live site.
export const revalidate = 300

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : "en"
  const dict = await getDictionary(locale)

  const [featured, bestsellers] = await Promise.all([
    getFeaturedProducts(locale),
    getBestsellers(locale),
  ])

  return (
    <>
      <Hero locale={locale} dict={dict} />
      <UspBar dict={dict} locale={locale} />
      <MemberPromo />
      <CategoryTiles locale={locale} dict={dict} />

      <PrinterFinder products={[...featured, ...bestsellers]} locale={locale} dict={dict} />

      <FeaturedShowcase products={featured} locale={locale} dict={dict} />

      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
          <SectionHeading
            title={dict.home.bestsellers}
            viewAllHref={localizedPath(locale, "/catalog")}
            viewAllLabel={dict.home.viewAll}
          />
          <ProductGrid products={bestsellers.slice(0, 8)} locale={locale} dict={dict} />
        </div>
      </section>

      <ScamAdviserTrust dict={dict} />
      <HelpStrip locale={locale} dict={dict} />
      <Newsletter />
    </>
  )
}
