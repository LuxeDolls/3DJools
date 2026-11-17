import { isLocale, type Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { getFeaturedProducts, getBestsellers } from "@/lib/catalog"
import { localizedPath } from "@/lib/i18n/paths"
import { Hero } from "@/components/home/hero"
import { BrandMarquee } from "@/components/home/brand-marquee"
import { UspBar } from "@/components/home/usp-bar"
import { CategoryTiles } from "@/components/home/category-tiles"
import { FeaturedShowcase } from "@/components/home/featured-showcase"
import { PrinterFinder } from "@/components/home/printer-finder"
import { HelpStrip } from "@/components/home/help-strip"
import { MemberPromo } from "@/components/home/member-promo"
import { Newsletter } from "@/components/home/newsletter"
import { ScamAdviserTrust } from "@/components/home/scamadviser-trust"
import { SectionHeading } from "@/components/section-heading"
import { ProductCard } from "@/components/product/product-card"
import { ProductRail } from "@/components/product/product-rail"

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
      <BrandMarquee locale={locale} dict={dict} />

      <PrinterFinder products={[...featured, ...bestsellers]} locale={locale} dict={dict} />

      <CategoryTiles locale={locale} dict={dict} />

      <section className="mx-auto max-w-7xl px-4 pb-4">
        <SectionHeading
          eyebrow={dict.common.staffPick}
          title={dict.home.bestsellers}
          viewAllHref={localizedPath(locale, "/catalog")}
          viewAllLabel={dict.home.viewAll}
        />
        <ProductRail label={dict.home.bestsellers}>
          {bestsellers.slice(0, 12).map((p) => (
            <ProductCard key={p.id} product={p} locale={locale} dict={dict} />
          ))}
        </ProductRail>
      </section>

      <MemberPromo />

      <FeaturedShowcase products={featured} locale={locale} dict={dict} />

      <UspBar dict={dict} locale={locale} />
      <HelpStrip locale={locale} dict={dict} />
      <ScamAdviserTrust dict={dict} />

      <Newsletter />
    </>
  )
}
