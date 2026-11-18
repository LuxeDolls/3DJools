import { cache } from "react"
import { STAMPED_PUBLIC_API_KEY, STAMPED_STORE_HASH } from "@/lib/reviews/stamped"
import { STAMPED_REVIEWS_TAG } from "@/lib/reviews/stamped-reviews"

const REVIEWS_ENDPOINT = "https://stamped.io/api/widget/reviews"
const REVALIDATE_SECONDS = 900

export interface StampedProductRating {
  rating: number
  count: number
}

const EMPTY: StampedProductRating = { rating: 0, count: 0 }

/**
 * Rating and review count for one product, straight from Stamped.
 * Stamped reports `rating: 5` even for products with no reviews, so callers
 * must check both values before publishing an aggregate.
 */
export const getStampedProductRating = cache(
  async (productId: string): Promise<StampedProductRating> => {
    if (!productId || !STAMPED_PUBLIC_API_KEY || !STAMPED_STORE_HASH) return EMPTY

    const params = new URLSearchParams({
      apiKey: STAMPED_PUBLIC_API_KEY,
      storeUrl: STAMPED_STORE_HASH,
      productId,
      take: "1",
      // Without an explicit minRating Stamped counts only 5-star reviews.
      minRating: "1",
    })

    try {
      const res = await fetch(`${REVIEWS_ENDPOINT}?${params.toString()}`, {
        headers: { Accept: "application/json" },
        next: { revalidate: REVALIDATE_SECONDS, tags: [STAMPED_REVIEWS_TAG] },
      })
      if (!res.ok) throw new Error(`Stamped rating request failed with ${res.status}`)
      const body = (await res.json()) as { total?: number; rating?: number }
      const count = Math.max(0, Math.trunc(Number(body.total) || 0))
      const rating = Number(body.rating) || 0
      if (count === 0 || rating <= 0) return EMPTY
      return { rating: Math.round(Math.min(5, rating) * 100) / 100, count }
    } catch (error) {
      console.error(`[stamped] Could not load rating for product ${productId}:`, error)
      return EMPTY
    }
  },
)
