import "server-only"
import { and, asc, eq, isNotNull, ne, notInArray, or } from "drizzle-orm"
import { db } from "@/lib/db"
import { brands as brandsTable, categories as categoriesTable, products as productsTable } from "@/lib/db/schema"
import { CARD_PAYMENT_TEST_SLUG } from "./hidden-products"
import { storefrontImageUrl } from "./image-urls"
import { localizeProduct, localizeProducts } from "./localize"
import type { Availability, Brand, Category, CategorySlug, Product, ProductSpec, Technology, UseCase } from "./types"

/* Map DB rows to the app's Product/Brand/Category shapes so the rest of the
   codebase keeps working against the exact same types it always has. */

/** A time-boxed sale (saleEndsAt set) automatically reverts to the original
 *  compareAtCents price once the end date passes — no cron job needed since
 *  this runs on every read. Sales without an end date (saleEndsAt null) are
 *  treated as permanent/manual and are never auto-reverted. */
function effectivePrice(r: { priceCents: number; compareAtCents: number | null; saleEndsAt: Date | null }) {
  const saleExpired = r.saleEndsAt != null && r.saleEndsAt.getTime() < Date.now()
  if (saleExpired) {
    return { priceCents: r.compareAtCents ?? r.priceCents, compareAtCents: undefined }
  }
  return { priceCents: r.priceCents, compareAtCents: r.compareAtCents ?? undefined }
}

function rowToProduct(r: typeof productsTable.$inferSelect, brandName?: string): Product {
  const { priceCents, compareAtCents } = effectivePrice(r)
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    brandSlug: r.brandSlug,
    brandName: brandName ?? r.brandSlug,
    category: r.category,
    technology: r.technology ?? undefined,
    useCases: r.useCases,
    priceCents,
    compareAtCents,
    availability: r.availability,
    condition: "new",
    gtin: r.gtin ?? undefined,
    ean: r.ean ?? undefined,
    mpn: r.mpn,
    shortDescription: r.shortDescription,
    description: r.description,
    highlights: r.highlights,
    translations: r.translations,
    specs: r.specs,
    images: r.images.map((image) => storefrontImageUrl(image)).filter((image): image is string => Boolean(image)),
    featured: r.featured,
    bestseller: r.bestseller,
    weightKg: r.weightKg,
    buildVolumeMm: r.buildVolumeMm ?? undefined,
    rating: r.rating,
    reviewCount: r.reviewCount,
  }
}

function rowToBrand(r: typeof brandsTable.$inferSelect): Brand {
  return { slug: r.slug, name: r.name, blurb: r.blurb, country: r.country }
}

/** Public lists never include the direct-link card test, even if it is unarchived. */
function storefrontVisible() {
  return and(eq(productsTable.archived, false), ne(productsTable.slug, CARD_PAYMENT_TEST_SLUG))
}

function rowToCategory(r: typeof categoriesTable.$inferSelect): Category {
  return { slug: r.slug as CategorySlug, key: r.key }
}

export async function getAllProducts(locale = "en"): Promise<Product[]> {
  const rows = await db
    .select({ p: productsTable, brandName: brandsTable.name })
    .from(productsTable)
    .leftJoin(brandsTable, eq(brandsTable.slug, productsTable.brandSlug))
    .where(storefrontVisible())
    .orderBy(asc(productsTable.name))
  return localizeProducts(rows.map((r) => rowToProduct(r.p, r.brandName ?? undefined)), locale)
}

export async function getAllBrands(): Promise<Brand[]> {
  const rows = await db.select().from(brandsTable).orderBy(asc(brandsTable.sortOrder))
  return rows.map(rowToBrand)
}

export async function getAllCategories(): Promise<Category[]> {
  const rows = await db.select().from(categoriesTable).orderBy(asc(categoriesTable.sortOrder))
  return rows.map(rowToCategory)
}

export async function getProductBySlug(slug: string, locale = "en"): Promise<Product | undefined> {
  const [row] = await db
    .select({ p: productsTable, brandName: brandsTable.name })
    .from(productsTable)
    .leftJoin(brandsTable, eq(brandsTable.slug, productsTable.brandSlug))
    .where(
      and(
        eq(productsTable.slug, slug),
        or(eq(productsTable.archived, false), eq(productsTable.slug, CARD_PAYMENT_TEST_SLUG)),
      ),
    )
    .limit(1)
  return row ? localizeProduct(rowToProduct(row.p, row.brandName ?? undefined), locale) : undefined
}

export async function getBrandBySlug(slug: string): Promise<Brand | undefined> {
  const [row] = await db.select().from(brandsTable).where(eq(brandsTable.slug, slug)).limit(1)
  return row ? rowToBrand(row) : undefined
}

export async function getBrandName(slug: string): Promise<string> {
  const b = await getBrandBySlug(slug)
  return b?.name ?? slug
}

export async function getProductsByCategory(category: CategorySlug, locale = "en"): Promise<Product[]> {
  const rows = await db
    .select({ p: productsTable, brandName: brandsTable.name })
    .from(productsTable)
    .leftJoin(brandsTable, eq(brandsTable.slug, productsTable.brandSlug))
    .where(and(eq(productsTable.category, category), storefrontVisible()))
    .orderBy(asc(productsTable.name))
  return localizeProducts(rows.map((r) => rowToProduct(r.p, r.brandName ?? undefined)), locale)
}

export async function getProductsByBrand(brandSlug: string, locale = "en"): Promise<Product[]> {
  const rows = await db
    .select({ p: productsTable, brandName: brandsTable.name })
    .from(productsTable)
    .leftJoin(brandsTable, eq(brandsTable.slug, productsTable.brandSlug))
    .where(and(eq(productsTable.brandSlug, brandSlug), storefrontVisible()))
    .orderBy(asc(productsTable.name))
  return localizeProducts(rows.map((r) => rowToProduct(r.p, r.brandName ?? undefined)), locale)
}

export async function getFeaturedProducts(locale = "en"): Promise<Product[]> {
  const rows = await db
    .select({ p: productsTable, brandName: brandsTable.name })
    .from(productsTable)
    .leftJoin(brandsTable, eq(brandsTable.slug, productsTable.brandSlug))
    .where(and(eq(productsTable.featured, true), storefrontVisible()))
  return localizeProducts(rows.map((r) => rowToProduct(r.p, r.brandName ?? undefined)), locale)
}

export async function getBestsellers(locale = "en"): Promise<Product[]> {
  const rows = await db
    .select({ p: productsTable, brandName: brandsTable.name })
    .from(productsTable)
    .leftJoin(brandsTable, eq(brandsTable.slug, productsTable.brandSlug))
    .where(and(eq(productsTable.bestseller, true), storefrontVisible()))
  return localizeProducts(rows.map((r) => rowToProduct(r.p, r.brandName ?? undefined)), locale)
}

export async function getRelatedProducts(product: Product, limit = 4, locale = "en"): Promise<Product[]> {
  const rows = await db
    .select({ p: productsTable, brandName: brandsTable.name })
    .from(productsTable)
    .leftJoin(brandsTable, eq(brandsTable.slug, productsTable.brandSlug))
    .where(
      and(
        ne(productsTable.id, product.id),
        storefrontVisible(),
        or(eq(productsTable.brandSlug, product.brandSlug), eq(productsTable.category, product.category)),
      ),
    )
    .limit(limit)
  return localizeProducts(rows.map((r) => rowToProduct(r.p, r.brandName ?? undefined)), locale)
}

/** Whether a time-boxed sale is currently running, and when the soonest-to-expire
 *  one ends — used to power the homepage sale banner. Products whose saleEndsAt
 *  has already passed are excluded (their price already reverted, see
 *  effectivePrice above). */
export async function getActiveSale(): Promise<{ active: boolean; endsAt: Date | null; count: number }> {
  const rows = await db
    .select({ saleEndsAt: productsTable.saleEndsAt })
    .from(productsTable)
    .where(and(storefrontVisible(), isNotNull(productsTable.saleEndsAt)))

  const now = Date.now()
  const active = rows.filter((r) => r.saleEndsAt != null && r.saleEndsAt.getTime() > now)
  if (active.length === 0) return { active: false, endsAt: null, count: 0 }

  const endsAt = active.reduce<Date>(
    (latest, r) => (r.saleEndsAt! > latest ? r.saleEndsAt! : latest),
    active[0].saleEndsAt!,
  )
  return { active: true, endsAt, count: active.length }
}

/** All non-archived product slugs — for generateStaticParams. */
export async function getAllProductSlugs(): Promise<string[]> {
  const rows = await db.select({ slug: productsTable.slug }).from(productsTable).where(storefrontVisible())
  return rows.map((r) => r.slug)
}

/** Spare parts are off the storefront. Filaments stay indexed when they are still for sale. */
const unlistedCategories = ["spare-parts"] as const

/** Live products that should be indexed: not archived, and not in a removed category. */
export async function getSitemapProducts(): Promise<
  { slug: string; category: CategorySlug; brandSlug: string; updatedAt: Date }[]
> {
  return db
    .select({
      slug: productsTable.slug,
      category: productsTable.category,
      brandSlug: productsTable.brandSlug,
      updatedAt: productsTable.updatedAt,
    })
    .from(productsTable)
    .where(and(storefrontVisible(), notInArray(productsTable.category, [...unlistedCategories])))
}

export async function getAllBrandSlugs(): Promise<string[]> {
  const rows = await db.select({ slug: brandsTable.slug }).from(brandsTable)
  return rows.map((r) => r.slug)
}

/* ------------------------------- admin ------------------------------- */

export type AdminProductRow = {
  slug: string
  name: string
  brandSlug: string
  brandName: string
  category: string
  priceCents: number
  compareAtCents: number | null
  stock: number
  featured: boolean
  bestseller: boolean
  archived: boolean
  image: string | null
  ean: string | null
}

/** Admin catalog list — includes archived products and raw stock/flags. */
export async function getAdminProducts(): Promise<AdminProductRow[]> {
  const rows = await db
    .select({ p: productsTable, brandName: brandsTable.name })
    .from(productsTable)
    .leftJoin(brandsTable, eq(brandsTable.slug, productsTable.brandSlug))
    .orderBy(asc(productsTable.archived), asc(productsTable.name))
  return rows.map((r) => ({
    slug: r.p.slug,
    name: r.p.name,
    brandSlug: r.p.brandSlug,
    brandName: r.brandName ?? r.p.brandSlug,
    category: r.p.category,
    priceCents: r.p.priceCents,
    compareAtCents: r.p.compareAtCents ?? null,
    stock: r.p.stock,
    featured: r.p.featured,
    bestseller: r.p.bestseller,
    archived: r.p.archived,
    image: r.p.images?.[0] ?? null,
    ean: r.p.ean ?? null,
  }))
}

/** Full editable detail for a single product, powering the admin edit form. */
export type AdminProductDetail = {
  slug: string
  name: string
  brandSlug: string
  category: CategorySlug
  technology: Technology | null
  useCases: UseCase[]
  priceCents: number
  compareAtCents: number | null
  availability: Availability
  stock: number
  gtin: string | null
  ean: string | null
  mpn: string
  shortDescription: string
  description: string
  highlights: string[]
  specs: ProductSpec[]
  images: string[]
  featured: boolean
  bestseller: boolean
  weightKg: number
  buildVolumeMm: { x: number; y: number; z: number } | null
  archived: boolean
}

export async function getAdminProductBySlug(slug: string): Promise<AdminProductDetail | null> {
  const [row] = await db.select().from(productsTable).where(eq(productsTable.slug, slug)).limit(1)
  if (!row) return null
  return {
    slug: row.slug,
    name: row.name,
    brandSlug: row.brandSlug,
    category: row.category,
    technology: row.technology ?? null,
    useCases: row.useCases,
    priceCents: row.priceCents,
    compareAtCents: row.compareAtCents ?? null,
    availability: row.availability,
    stock: row.stock,
    gtin: row.gtin ?? null,
    ean: row.ean ?? null,
    mpn: row.mpn,
    shortDescription: row.shortDescription,
    description: row.description,
    highlights: row.highlights,
    specs: row.specs,
    images: row.images,
    featured: row.featured,
    bestseller: row.bestseller,
    weightKg: row.weightKg,
    buildVolumeMm: row.buildVolumeMm ?? null,
    archived: row.archived,
  }
}

export async function getProductCount(): Promise<number> {
  const rows = await db.select({ slug: productsTable.slug }).from(productsTable).where(storefrontVisible())
  return rows.length
}
