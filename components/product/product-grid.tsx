import type { Locale } from "@/lib/i18n/config"
import type { Dictionary } from "@/lib/i18n/dictionaries/en"
import type { Product } from "@/lib/catalog/types"
import { ProductCard } from "./product-card"
import { cn } from "@/lib/utils"

export function ProductGrid({
  products,
  locale,
  dict,
  className,
}: {
  products: Product[]
  locale: Locale
  dict: Dictionary
  className?: string
}) {
  return (
    <div className={cn("grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4", className)}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} locale={locale} dict={dict} />
      ))}
    </div>
  )
}
