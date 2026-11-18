import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { isLocale, locales, type Locale } from "@/lib/i18n/config"
import { SITE_ORIGIN } from "@/lib/catalog/image-urls"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { getProductBySlug, getRelatedProducts } from "@/lib/catalog"
import { isCardPaymentTest } from "@/lib/catalog/hidden-products"
import { categoryLabel } from "@/lib/catalog/category-labels"
import { localizedPath } from "@/lib/i18n/paths"
import { Breadcrumb } from "@/components/breadcrumb"
import { ProductGallery } from "@/components/product/product-gallery"
import { ProductInfo } from "@/components/product/product-info"
import { ProductJsonLd } from "@/components/product/product-jsonld"
import { ProductGrid } from "@/components/product/product-grid"
import { SectionHeading } from "@/components/section-heading"
import { ProductReviews } from "@/components/reviews/product-reviews"
import { getProductStampedReviews, summarizeReviews } from "@/lib/reviews/stamped-reviews"
import { getStampedProductRating } from "@/lib/reviews/stamped-rating"
import { localizeReviews } from "@/lib/reviews/translations"

// Prices and stock are read live. Prerendering every product in every language
// opens thousands of database connections during deploy, and one timeout fails
// the whole build.
export const dynamic = "force-dynamic"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}): Promise<Metadata> {
  const { lang, slug } = await params
  const locale: Locale = isLocale(lang) ? lang : "en"
  const product = await getProductBySlug(slug, locale)
  if (!product) return {}
  const canonical = `${SITE_ORIGIN}/${locale}/product/${product.slug}`
  const languages: Record<string, string> = Object.fromEntries(
    locales.map((l) => [l, `${SITE_ORIGIN}/${l}/product/${product.slug}`]),
  )
  languages["x-default"] = `${SITE_ORIGIN}/en/product/${product.slug}`
  return {
    title: product.name,
    description: product.shortDescription,
    robots: isCardPaymentTest(product.slug) ? { index: false, follow: false } : undefined,
    alternates: { canonical, languages },
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: product.images,
      url: canonical,
      type: "website",
    },
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}) {
  const { lang, slug } = await params
  const locale: Locale = isLocale(lang) ? lang : "en"
  const dict = await getDictionary(locale)

  const product = await getProductBySlug(slug, locale)
  if (!product) notFound()

  const [related, reviews, stampedRating] = await Promise.all([
    getRelatedProducts(product, 4, locale),
    getProductStampedReviews(product.productId),
    getStampedProductRating(product.productId),
  ])
  const url = `${SITE_ORIGIN}${localizedPath(locale, `/product/${product.slug}`)}`
  const reviewSummary = summarizeReviews(reviews)
  const displayedReviews = await localizeReviews(reviews, locale)
  const ratedProduct =
    stampedRating.count > 0
      ? { ...product, rating: stampedRating.rating, reviewCount: stampedRating.count }
      : reviewSummary.count > 0
        ? { ...product, rating: reviewSummary.average, reviewCount: reviewSummary.count }
        : product

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 sm:py-8">
      {isCardPaymentTest(product.slug) ? null : (
        <ProductJsonLd product={ratedProduct} url={url} reviews={reviews} rating={stampedRating} />
      )}

      <Breadcrumb
        locale={locale}
        items={[
          { label: dict.common.home, href: "/" },
          { label: categoryLabel(product.category, dict), href: `/catalog/${product.category}` },
          { label: product.name },
        ]}
      />

      <div className="mt-4 grid min-w-0 grid-cols-1 gap-6 sm:mt-6 sm:gap-8 lg:grid-cols-2 lg:gap-12">
        <ProductGallery images={product.images} alt={product.name} />
        <ProductInfo product={ratedProduct} />
      </div>

      {/* Details: highlights + description + specs */}
      <div className="mt-10 grid grid-cols-1 gap-8 sm:mt-14 sm:gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="font-heading text-lg font-bold text-foreground sm:text-xl">{dict.product.description}</h2>
          <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground sm:mt-4 sm:text-base">
            {product.description}
          </p>

          <h3 className="mt-6 font-heading text-base font-bold text-foreground sm:mt-8 sm:text-lg">
            {dict.product.highlights}
          </h3>
          <ul className="mt-3 grid gap-2 sm:mt-4 sm:grid-cols-2 sm:gap-2.5">
            {product.highlights.map((h) => (
              <li key={h} className="flex items-start gap-2 text-xs text-foreground sm:text-sm">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                {h}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-heading text-lg font-bold text-foreground sm:text-xl">{dict.product.specifications}</h2>
          <dl className="mt-3 divide-y divide-border rounded-xl border border-border bg-card/40 shadow-xs transition-transform duration-200 hover:-translate-y-0.5 sm:mt-4">
            {product.specs.map((spec) => (
              <div
                key={spec.label}
                className="grid grid-cols-[2fr_3fr] items-baseline gap-3 px-3.5 py-2.5 text-xs sm:px-4 sm:py-3 sm:text-sm"
              >
                <dt className="text-muted-foreground">{spec.label}</dt>
                <dd className="text-right font-medium text-foreground">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {!isCardPaymentTest(product.slug) && <ProductReviews reviews={displayedReviews} locale={locale} />}

      {related.length > 0 && (
        <div className="mt-12 sm:mt-16">
          <SectionHeading title={dict.product.relatedProducts} />
          <ProductGrid products={related} locale={locale} dict={dict} />
        </div>
      )}
    </div>
  )
}
