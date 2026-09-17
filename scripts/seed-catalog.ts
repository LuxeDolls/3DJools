/**
 * One-time catalog seed: reads the in-repo mock data and upserts it into
 * the database. Idempotent — safe to re-run; existing rows are updated.
 *
 * Run with:  npx tsx scripts/seed-catalog.ts
 */
import { db } from "@/lib/db"
import { brands as brandsTable, categories as categoriesTable, products as productsTable } from "@/lib/db/schema"
import { brands as brandsData, categories as categoriesData, products as productsData } from "@/lib/catalog/data"

async function seed() {
  console.log("[v0] Seeding catalog…")

  for (const [i, b] of brandsData.entries()) {
    await db
      .insert(brandsTable)
      .values({ slug: b.slug, name: b.name, blurb: b.blurb, country: b.country, sortOrder: i })
      .onConflictDoUpdate({
        target: brandsTable.slug,
        set: { name: b.name, blurb: b.blurb, country: b.country, sortOrder: i, updatedAt: new Date() },
      })
  }
  console.log(`[v0] Upserted ${brandsData.length} brands`)

  for (const [i, c] of categoriesData.entries()) {
    await db
      .insert(categoriesTable)
      .values({ slug: c.slug, key: c.key, sortOrder: i })
      .onConflictDoUpdate({
        target: categoriesTable.slug,
        set: { key: c.key, sortOrder: i, updatedAt: new Date() },
      })
  }
  console.log(`[v0] Upserted ${categoriesData.length} categories`)

  for (const p of productsData) {
    // Seed a sensible stock level from availability so admin has real numbers to edit.
    const stock = p.availability === "in_stock" ? 25 : p.availability === "preorder" ? 0 : 0
    const values = {
      id: p.id,
      slug: p.slug,
      name: p.name,
      brandSlug: p.brandSlug,
      category: p.category,
      technology: p.technology,
      useCases: p.useCases,
      priceCents: p.priceCents,
      compareAtCents: p.compareAtCents ?? null,
      availability: p.availability,
      condition: p.condition,
      stock,
      gtin: p.gtin ?? null,
      ean: p.ean ?? null,
      mpn: p.mpn,
      shortDescription: p.shortDescription,
      description: p.description,
      highlights: p.highlights,
      specs: p.specs,
      images: p.images,
      featured: Boolean(p.featured),
      bestseller: Boolean(p.bestseller),
      weightKg: p.weightKg,
      buildVolumeMm: p.buildVolumeMm ?? null,
      rating: p.rating,
      reviewCount: p.reviewCount,
      archived: false,
    }
    await db
      .insert(productsTable)
      .values(values)
      .onConflictDoUpdate({ target: productsTable.id, set: { ...values, updatedAt: new Date() } })
  }
  console.log(`[v0] Upserted ${productsData.length} products`)
  console.log("[v0] Catalog seed complete.")
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("[v0] Seed failed:", err)
    process.exit(1)
  })
