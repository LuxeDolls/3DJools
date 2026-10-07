import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { isLocale, type Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { getProductBySlug, getRelatedProducts } from "@/lib/catalog"
import { categoryLabel } from "@/lib/catalog/category-labels"
import { localizedPath } from "@/lib/i18n/paths"
import { Breadcrumb } from "@/components/breadcrumb"
import { ProductGallery } from "@/components/product/product-gallery"
import { ProductInfo } from "@/components/product/product-info"
import { ProductJsonLd } from "@/components/product/product-jsonld"
import { ProductGrid } from "@/components/product/product-grid"
import { SectionHeading } from "@/components/section-heading"

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
  const canonical = `https://www.3djools.com/${locale}/product/${product.slug}`
  return {
    title: product.name,
    description: product.shortDescription,
    alternates: { canonical },
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

  const related = await getRelatedProducts(product, 4, locale)
  const url = `https://www.3djools.com${localizedPath(locale, `/product/${product.slug}`)}`

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <ProductJsonLd product={product} url={url} />

      <Breadcrumb
        locale={locale}
        items={[
          { label: dict.common.home, href: "/" },
          { label: categoryLabel(product.category, dict), href: `/catalog/${product.category}` },
          { label: product.name },
        ]}
      />

      <div className="mt-6 grid min-w-0 gap-8 lg:grid-cols-2 lg:gap-12">
        <ProductGallery images={product.images} alt={product.name} />
        <ProductInfo product={product} />
      </div>

      {/* Details: highlights + description + specs */}
      <div className="mt-14 grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="font-heading text-xl font-bold text-foreground">{dict.product.description}</h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">{product.description}</p>

          <h3 className="mt-8 font-heading text-lg font-bold text-foreground">{dict.product.highlights}</h3>
          <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {product.highlights.map((h) => (
              <li key={h} className="flex items-start gap-2 text-sm text-foreground">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                {h}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-heading text-xl font-bold text-foreground">{dict.product.specifications}</h2>
          <dl className="mt-4 divide-y divide-border rounded-lg border border-border">
            {product.specs.map((spec) => (
              <div key={spec.label} className="flex justify-between gap-4 px-4 py-3 text-sm">
                <dt className="text-muted-foreground">{spec.label}</dt>
                <dd className="text-right font-medium text-foreground">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-16">
          <SectionHeading title={dict.product.relatedProducts} />
          <ProductGrid products={related} locale={locale} dict={dict} />
        </div>
      )}
    </div>
  )
}
