import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type { Locale } from "@/lib/i18n/config"
import type { Product } from "@/lib/catalog/types"
import { localizedPath } from "@/lib/i18n/paths"
import { reviewCountLabel, reviewsCopy } from "@/lib/i18n/reviews"
import { summarizeReviews, type StampedReview } from "@/lib/reviews/stamped-reviews"
import { ProductRail } from "@/components/product/product-rail"
import { ReviewCard } from "@/components/reviews/review-card"
import { StarRating } from "@/components/reviews/star-rating"
import { StampedMark } from "@/components/reviews/stamped-mark"

const CAROUSEL_SIZE = 12

export function ReviewsCarousel({
  reviews,
  products,
  locale,
}: {
  reviews: StampedReview[]
  products: Product[]
  locale: Locale
}) {
  if (reviews.length === 0) return null

  const copy = reviewsCopy[locale]
  const summary = summarizeReviews(reviews)
  const byId = new Map(products.map((p) => [p.productId, p]))

  // Prefer reviews with a real message for a product that is still on sale, newest first.
  const picks = reviews
    .filter((r) => r.message.length >= 60 && byId.has(r.productId))
    .slice(0, CAROUSEL_SIZE)

  if (picks.length === 0) return null

  const average = summary.average.toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 })

  return (
    <section aria-labelledby="home-reviews-title" className="mx-auto max-w-7xl px-4 py-10 sm:py-14">
      <div className="mb-5 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 flex-col gap-2">
          <StampedMark label={copy.homeEyebrow} />
          <h2
            id="home-reviews-title"
            className="font-heading text-2xl leading-none font-bold text-balance text-foreground sm:text-4xl lg:text-5xl"
          >
            {copy.homeTitle}
          </h2>
          <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <StarRating value={summary.average} size="md" label={`${average} ${copy.outOf}`} />
            <span className="font-semibold text-foreground tabular-nums">{average}</span>
            <span aria-hidden="true">·</span>
            <span>{reviewCountLabel(locale, summary.count)}</span>
          </p>
        </div>
        <Link
          href={localizedPath(locale, "/reviews")}
          className="group inline-flex shrink-0 items-center gap-1.5 self-start rounded-full border border-primary/40 bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-md shadow-primary/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 sm:self-auto sm:px-5 sm:py-2.5 sm:text-sm"
        >
          {copy.viewAll}
          <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5 sm:size-4" aria-hidden="true" />
        </Link>
      </div>

      <ProductRail label={copy.homeTitle}>
        {picks.map((review) => {
          const product = byId.get(review.productId)
          return (
            <ReviewCard
              key={review.id}
              review={review}
              locale={locale}
              clamp
              product={
                product
                  ? {
                      name: product.name,
                      href: localizedPath(locale, `/product/${product.slug}`),
                      image: product.images[0],
                    }
                  : undefined
              }
            />
          )
        })}
      </ProductRail>
    </section>
  )
}
