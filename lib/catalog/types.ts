// Shapes here mirror the future DB schema so swapping mock -> DB stays clean.
// They also carry the fields a Google Merchant Center feed will require
// (brand, gtin, mpn, price, availability, condition, image).

export type CategorySlug =
  | "printers"
  | "filaments"
  | "resins"
  | "spare-parts"
  | "accessories"
  | "scanners"
  | "laser-engravers"

export type Technology = "fdm" | "resin" | "laser"

export type UseCase = "home" | "makers" | "business" | "engineering"

export type Availability = "in_stock" | "out_of_stock" | "preorder"

export interface Brand {
  slug: string
  name: string
  /** Short blurb shown on the brand page. Localized at render via dictionary fallback. */
  blurb: string
  country: string
}

export interface Category {
  slug: CategorySlug
  /** i18n key resolved against dictionary.categories */
  key: string
}

export interface ProductSpec {
  /** i18n key resolved against dictionary.specs, falls back to label */
  key: string
  label: string
  value: string
}

/** Per-locale override for a product's free-text fields. English lives in the base Product fields. */
export interface ProductTranslation {
  name: string
  shortDescription: string
  description: string
  highlights: string[]
}

export interface Product {
  id: string
  slug: string
  name: string
  brandSlug: string
  /** Denormalized brand display name, resolved at query time. */
  brandName?: string
  category: CategorySlug
  technology?: Technology
  useCases: UseCase[]
  /** integer cents, EUR */
  priceCents: number
  /** optional strike-through original price, integer cents */
  compareAtCents?: number
  availability: Availability
  condition: "new"
  /** GMC feed identifiers — placeholders in Step 1, real values later */
  gtin?: string
  /** Real EAN-13 barcode sourced per product. */
  ean?: string
  mpn: string
  shortDescription: string
  description: string
  highlights: string[]
  /** Per-locale overrides, keyed by locale code. Base fields above are English. */
  translations?: Record<string, ProductTranslation>
  specs: ProductSpec[]
  images: string[]
  featured?: boolean
  bestseller?: boolean
  /** kg — used later for shipping rate calc; modeled now */
  weightKg: number
  buildVolumeMm?: { x: number; y: number; z: number }
  rating: number
  reviewCount: number
}
