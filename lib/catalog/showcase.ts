import type { Product } from "./types"

const PER_TAB = 12
const PLACEHOLDER_IMAGE = "/products/filament-pla.png"

function hasRealImage(p: Product) {
  const first = p.images[0]
  return Boolean(first) && !first.endsWith(PLACEHOLDER_IMAGE)
}

function rank(a: Product, b: Product) {
  return (
    Number(Boolean(b.featured)) - Number(Boolean(a.featured)) ||
    Number(Boolean(b.bestseller)) - Number(Boolean(a.bestseller)) ||
    Number(b.availability === "in_stock") - Number(a.availability === "in_stock") ||
    Math.min(b.images.length, 4) - Math.min(a.images.length, 4) ||
    b.priceCents - a.priceCents
  )
}

function top(products: Product[], category: Product["category"], n: number) {
  return products
    .filter((p) => p.category === category && hasRealImage(p))
    .sort(rank)
    .slice(0, n)
}

/**
 * Picks a deeper set of products for the homepage "Highlighted equipment"
 * carousel: featured items first, then the strongest in-stock listings, so
 * each tab has enough cards to page through.
 */
export function selectShowcaseProducts(all: Product[]): Product[] {
  const materials = [
    ...top(all, "accessories", 4),
    ...top(all, "resins", 4),
    ...top(all, "filaments", 4),
  ]
  const groups = [
    top(all, "printers", PER_TAB),
    top(all, "laser-engravers", PER_TAB),
    top(all, "scanners", PER_TAB),
    materials,
  ]

  const seen = new Set<string>()
  const featured = groups.flat().filter((p) => p.featured)
  const ordered = [...featured, ...groups.flat()]
  return ordered.filter((p) => (seen.has(p.id) ? false : (seen.add(p.id), true)))
}
