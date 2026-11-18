import { cache } from "react"
import { STAMPED_PUBLIC_API_KEY, STAMPED_STORE_HASH } from "@/lib/reviews/stamped"

export const STAMPED_REVIEWS_TAG = "stamped-reviews"

const REVIEWS_ENDPOINT = "https://stamped.io/api/widget/reviews"
const PAGE_SIZE = 100
const MAX_PAGES = 30
const REVALIDATE_SECONDS = 900

export interface StampedReview {
  id: string
  author: string
  title: string
  message: string
  rating: number
  date: string
  productId: string
  productName: string
  location: string
  verified: boolean
  reply: string
}

export interface ReviewSummary {
  count: number
  average: number
  /** Index 0 = 5 stars … index 4 = 1 star. */
  distribution: [number, number, number, number, number]
}

interface StampedApiReview {
  id: number | string
  author?: string
  reviewTitle?: string
  reviewMessage?: string
  reviewRating?: number
  reviewVerifiedType?: number
  reviewReply?: string
  productId?: number | string
  productName?: string
  location?: string
  dateCreated?: string
}

interface StampedApiPage {
  total?: number
  data?: StampedApiReview[]
}

function pageUrl(page: number) {
  const params = new URLSearchParams({
    apiKey: STAMPED_PUBLIC_API_KEY,
    storeUrl: STAMPED_STORE_HASH,
    take: String(PAGE_SIZE),
    page: String(page),
    sortReviews: "recent",
    // Without an explicit minRating Stamped returns only 5-star reviews.
    minRating: "1",
  })
  return `${REVIEWS_ENDPOINT}?${params.toString()}`
}

async function fetchPage(page: number, fresh: boolean): Promise<StampedApiPage> {
  const res = await fetch(
    pageUrl(page),
    fresh
      ? { cache: "no-store", headers: { Accept: "application/json" } }
      : {
          headers: { Accept: "application/json" },
          next: { revalidate: REVALIDATE_SECONDS, tags: [STAMPED_REVIEWS_TAG] },
        },
  )
  if (!res.ok) throw new Error(`Stamped reviews request failed with ${res.status}`)
  return (await res.json()) as StampedApiPage
}

function normalize(raw: StampedApiReview): StampedReview | null {
  const rating = Number(raw.reviewRating)
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) return null
  return {
    id: String(raw.id),
    author: (raw.author || "").trim() || "Customer",
    title: (raw.reviewTitle || "").trim(),
    message: (raw.reviewMessage || "").trim(),
    rating,
    date: raw.dateCreated || "",
    productId: raw.productId != null ? String(raw.productId) : "",
    productName: (raw.productName || "").trim(),
    location: (raw.location || "").trim(),
    verified: Number(raw.reviewVerifiedType) > 0,
    reply: (raw.reviewReply || "").trim(),
  }
}

/** Every published product review from Stamped, newest first. */
export async function loadStampedReviews(fresh = false): Promise<StampedReview[]> {
  const first = await fetchPage(1, fresh)
  const total = Number(first.total) || 0
  const pages = Math.min(MAX_PAGES, Math.max(1, Math.ceil(total / PAGE_SIZE)))
  const rest = await Promise.all(
    Array.from({ length: pages - 1 }, (_, i) => fetchPage(i + 2, fresh)),
  )
  const seen = new Set<string>()
  const reviews: StampedReview[] = []
  for (const page of [first, ...rest]) {
    for (const raw of page.data ?? []) {
      const review = normalize(raw)
      if (!review || seen.has(review.id)) continue
      seen.add(review.id)
      reviews.push(review)
    }
  }
  return reviews.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
}

/** Cached for the request and in the data cache; a failed Stamped call yields no reviews. */
export const getStampedReviews = cache(async (): Promise<StampedReview[]> => {
  try {
    return await loadStampedReviews()
  } catch (error) {
    console.error("[stamped] Could not load reviews:", error)
    return []
  }
})

export function summarizeReviews(reviews: StampedReview[]): ReviewSummary {
  const distribution: ReviewSummary["distribution"] = [0, 0, 0, 0, 0]
  let sum = 0
  for (const r of reviews) {
    const stars = Math.round(r.rating)
    distribution[5 - stars] += 1
    sum += r.rating
  }
  const count = reviews.length
  return {
    count,
    average: count > 0 ? Math.round((sum / count) * 10) / 10 : 0,
    distribution,
  }
}

export async function getStampedSummary(): Promise<ReviewSummary> {
  return summarizeReviews(await getStampedReviews())
}

export async function getProductStampedReviews(productId: string): Promise<StampedReview[]> {
  if (!productId) return []
  const reviews = await getStampedReviews()
  return reviews.filter((r) => r.productId === productId)
}
