"use client"

import { useSearchParams } from "next/navigation"
import { useMemo } from "react"
import { Search } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { ProductGrid } from "@/components/product/product-grid"
import { searchProducts } from "@/lib/catalog/filter"
import type { Product } from "@/lib/catalog/types"
import type { Locale } from "@/lib/i18n/config"

export function SearchView({ locale, products }: { locale: Locale; products: Product[] }) {
  const { dict } = useI18n()
  const searchParams = useSearchParams()
  const query = searchParams.get("q") ?? ""

  const results = useMemo(() => searchProducts(products, query), [products, query])

  return (
    <div>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Search className="size-5" />
        <p className="text-sm">
          {query ? (
            <>
              <span className="font-semibold text-foreground">{results.length}</span> {dict.common.results} · &ldquo;
              {query}&rdquo;
            </>
          ) : (
            dict.common.searchPlaceholder
          )}
        </p>
      </div>

      <div className="mt-8">
        {query && results.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border py-20 text-center">
            <Search className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{dict.common.noResults}</p>
          </div>
        ) : (
          <ProductGrid products={results} locale={locale} dict={dict} />
        )}
      </div>
    </div>
  )
}
