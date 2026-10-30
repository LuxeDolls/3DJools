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
    <div className="flex flex-col gap-9 sm:gap-14">
      {sections.map(({ category, products }) => {
        if (products.length === 0) return null
        const href = localizedPath(locale, `/catalog/${category}`)
        return (
          <section key={category} aria-labelledby={`section-${category}`}>
            <div className="mb-4 flex items-end justify-between gap-3 border-b border-border pb-3 sm:mb-5 sm:gap-4 sm:pb-4">
              <div>
                <h2
                  id={`section-${category}`}
                  className="font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl"
                >
                  {categoryLabel(category, dict)}
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground sm:mt-1 sm:text-sm">
                  {products.length} {dict.common.results}
                </p>
              </div>
              <Link
                href={href}
                className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary transition-colors hover:text-primary/80 sm:text-sm sm:font-medium"
              >
                {dict.home.viewAll}
                <ArrowRight className="size-3.5 sm:size-4" />
              </Link>
            </div>
            <ProductGrid products={products.slice(0, PREVIEW_COUNT)} locale={locale} dict={dict} />
          </section>
        )
      })}
    </div>
  )
}
