import type { Product } from "./types"

/**
 * Applies a per-locale translation override (if present) on top of the
 * base (English) Product fields. Safe to call with locale "en" — it's a
 * no-op since English lives in the base columns.
 */
export function localizeProduct(product: Product, locale: string): Product {
  if (locale === "en") return product
  const t = product.translations?.[locale]
  if (!t) return product
  return {
    ...product,
    name: t.name || product.name,
    shortDescription: t.shortDescription || product.shortDescription,
    description: t.description || product.description,
    highlights: t.highlights?.length ? t.highlights : product.highlights,
  }
}

export function localizeProducts(products: Product[], locale: string): Product[] {
  return products.map((p) => localizeProduct(p, locale))
}
