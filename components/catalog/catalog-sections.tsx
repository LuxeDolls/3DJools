import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type { Locale } from "@/lib/i18n/config"
import type { Dictionary } from "@/lib/i18n/dictionaries/en"
import type { Product, CategorySlug } from "@/lib/catalog/types"
import { categoryLabel } from "@/lib/catalog/category-labels"
import { localizedPath } from "@/lib/i18n/paths"
import { ProductGrid } from "@/components/product/product-grid"

const PREVIEW_COUNT = 4

interface CatalogSectionsProps {
  locale: Locale
  dict: Dictionary
  /** Ordered list of categories with their products, already fetched by the server. */
  sections: { category: CategorySlug; products: Product[] }[]
}

export function CatalogSections({ locale, dict, sections }: CatalogSectionsProps) {
  return (
    <div className="flex flex-col gap-14">
      {sections.map(({ category, products }) => {
        if (products.length === 0) return null
        const href = localizedPath(locale, `/catalog/${category}`)
        return (
          <section key={category} aria-labelledby={`section-${category}`}>
            <div className="mb-5 flex items-end justify-between gap-4 border-b border-border pb-4">
              <div>
                <h2
                  id={`section-${category}`}
                  className="font-heading text-2xl font-bold tracking-tight text-foreground"
                >
                  {categoryLabel(category, dict)}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {products.length} {dict.common.results}
                </p>
              </div>
              <Link
                href={href}
                className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
              >
                {dict.home.viewAll}
                <ArrowRight className="size-4" />
              </Link>
            </div>
            <ProductGrid products={products.slice(0, PREVIEW_COUNT)} locale={locale} dict={dict} />
          </section>
        )
      })}
    </div>
  )
}
