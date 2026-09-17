import type { CategorySlug, Product, Technology, UseCase } from "./types"

/* Pure, in-memory helpers. These operate on a product array passed in by a
   server component, so they are safe to run on the client (catalog filtering,
   search-as-you-type) without ever touching the database from the browser. */

export interface CatalogFilters {
  categories?: CategorySlug[]
  brands?: string[]
  technologies?: Technology[]
  useCases?: UseCase[]
  minCents?: number
  maxCents?: number
  query?: string
  brandNames?: Record<string, string>
}

export type SortKey = "featured" | "price-asc" | "price-desc" | "rating" | "name"

export function filterProducts(list: Product[], filters: CatalogFilters): Product[] {
  return list.filter((p) => {
    if (filters.categories?.length && !filters.categories.includes(p.category)) return false
    if (filters.brands?.length && !filters.brands.includes(p.brandSlug)) return false
    if (filters.technologies?.length) {
      if (!p.technology || !filters.technologies.includes(p.technology)) return false
    }
    if (filters.useCases?.length && !filters.useCases.some((u) => p.useCases.includes(u))) return false
    if (typeof filters.minCents === "number" && p.priceCents < filters.minCents) return false
    if (typeof filters.maxCents === "number" && p.priceCents > filters.maxCents) return false
    if (filters.query) {
      const q = filters.query.toLowerCase()
      const brandName = filters.brandNames?.[p.brandSlug] ?? p.brandSlug
      const haystack = `${p.name} ${brandName} ${p.shortDescription} ${p.category}`.toLowerCase()
      if (!haystack.includes(q)) return false
    }
    return true
  })
}

export function sortProducts(list: Product[], sort: SortKey): Product[] {
  const copy = [...list]
  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => a.priceCents - b.priceCents)
    case "price-desc":
      return copy.sort((a, b) => b.priceCents - a.priceCents)
    case "rating":
      return copy.sort((a, b) => b.rating - a.rating)
    case "name":
      return copy.sort((a, b) => a.name.localeCompare(b.name))
    case "featured":
    default:
      return copy.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || b.rating - a.rating)
  }
}

export function searchProducts(list: Product[], query: string): Product[] {
  if (!query.trim()) return []
  return filterProducts(list, { query: query.trim() })
}

export function getPriceBounds(list: Product[]): { min: number; max: number } {
  if (!list.length) return { min: 0, max: 0 }
  const prices = list.map((p) => p.priceCents)
  return { min: Math.min(...prices), max: Math.max(...prices) }
}
