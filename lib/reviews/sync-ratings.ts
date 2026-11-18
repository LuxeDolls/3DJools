import { and, eq, gt, notInArray, or, ne } from "drizzle-orm"
import { db } from "@/lib/db"
import { products } from "@/lib/db/schema"
import { loadStampedReviews, summarizeReviews, type StampedReview } from "@/lib/reviews/stamped-reviews"

/**
 * Copies the per-product rating and review count from Stamped into
 * `products.rating` / `products.review_count`, so product cards, filters and
 * JSON-LD all read the same numbers Stamped shows.
 */
export async function syncStampedRatings(): Promise<{ updated: number; cleared: number }> {
  const reviews = await loadStampedReviews(true)
  // An empty answer is far more likely a Stamped outage than every review vanishing.
  if (reviews.length === 0) return { updated: 0, cleared: 0 }

  const byProduct = new Map<string, StampedReview[]>()
  for (const review of reviews) {
    if (!review.productId) continue
    const list = byProduct.get(review.productId) ?? []
    list.push(review)
    byProduct.set(review.productId, list)
  }

  let updated = 0
  for (const [productId, list] of byProduct) {
    const { count, average } = summarizeReviews(list)
    const rows = await db
      .update(products)
      .set({ rating: average, reviewCount: count })
      .where(
        and(
          eq(products.productId, productId),
          or(ne(products.rating, average), ne(products.reviewCount, count)),
        ),
      )
      .returning({ id: products.id })
    updated += rows.length
  }

  const cleared = await db
    .update(products)
    .set({ rating: 0, reviewCount: 0 })
    .where(and(gt(products.reviewCount, 0), notInArray(products.productId, [...byProduct.keys()])))
    .returning({ id: products.id })

  return { updated, cleared: cleared.length }
}
