import Link from "next/link"
import { ArrowRight, MessageSquareText } from "lucide-react"
import type { Locale } from "@/lib/i18n/config"
import { localizedPath } from "@/lib/i18n/paths"
import { reviewsCopy } from "@/lib/i18n/reviews"
import { summarizeReviews, type StampedReview } from "@/lib/reviews/stamped-reviews"
import { RatingSummary } from "./rating-summary"
import { ReviewCard } from "./review-card"
import { StampedMark } from "./stamped-mark"

export function ProductReviews({ reviews, locale }: { reviews: StampedReview[]; locale: Locale }) {
  const copy = reviewsCopy[locale]
  const summary = summarizeReviews(reviews)

  return (
    <section id="reviews" aria-labelledby="product-reviews-title" className="mt-12 scroll-mt-24 sm:mt-16">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3 sm:mb-6">
        <div className="flex flex-col gap-1.5">
          <StampedMark label={copy.poweredBy} />
          <h2 id="product-reviews-title" className="font-heading text-xl font-bold text-foreground sm:text-2xl">
            {copy.productTitle}
          </h2>
        </div>
        <Link
          href={localizedPath(locale, "/reviews")}
          className="group inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          {copy.seeAllForProduct}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      </div>

      {summary.count > 0 ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
          <div className="min-w-0 lg:sticky lg:top-24 lg:self-start">
            <RatingSummary summary={summary} locale={locale} />
          </div>
          <ul className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2">
            {reviews.map((review) => (
              <li key={review.id} className="min-w-0">
                <ReviewCard review={review} locale={locale} />
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-3xl border border-dashed border-border bg-card/60 px-6 py-10 text-center">
          <MessageSquareText className="size-6 text-muted-foreground" aria-hidden="true" />
          <p className="font-semibold text-foreground">{copy.noReviews}</p>
          <p className="max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">{copy.noReviewsHint}</p>
        </div>
      )}
    </section>
  )
}
