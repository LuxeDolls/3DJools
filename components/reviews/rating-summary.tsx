import { Star } from "lucide-react"
import type { Locale } from "@/lib/i18n/config"
import { reviewCountLabel, reviewsCopy } from "@/lib/i18n/reviews"
import type { ReviewSummary } from "@/lib/reviews/stamped-reviews"
import { StarRating } from "./star-rating"

export function RatingSummary({ summary, locale }: { summary: ReviewSummary; locale: Locale }) {
  const copy = reviewsCopy[locale]
  const average = summary.average.toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 })

  return (
    <div className="flex flex-col gap-5 rounded-3xl border border-border/90 bg-card/92 p-5 shadow-[var(--shadow-float-md)] sm:flex-row sm:items-center sm:gap-8 sm:p-6">
      <div className="flex shrink-0 flex-col items-start gap-2">
        <p className="flex items-baseline gap-1.5">
          <span className="font-heading text-5xl leading-none font-bold text-foreground tabular-nums">{average}</span>
          <span className="text-sm text-muted-foreground">{copy.outOf}</span>
        </p>
        <StarRating value={summary.average} size="lg" label={`${average} ${copy.outOf}`} />
        <p className="text-xs text-muted-foreground">
          {copy.basedOn} {reviewCountLabel(locale, summary.count)}
        </p>
      </div>

      <ul className="flex flex-1 flex-col gap-1.5" aria-label={copy.pageTitle}>
        {summary.distribution.map((n, i) => {
          const stars = 5 - i
          const pct = summary.count > 0 ? Math.round((n / summary.count) * 100) : 0
          return (
            <li key={stars} className="flex items-center gap-2.5 text-xs">
              <span className="w-3 shrink-0 text-right font-semibold text-foreground tabular-nums">{stars}</span>
              <Star className="size-3 shrink-0 text-star" fill="currentColor" strokeWidth={0} aria-hidden="true" />
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                <span className="block h-full rounded-full bg-star" style={{ width: `${pct}%` }} />
              </span>
              <span className="w-8 shrink-0 text-right text-muted-foreground tabular-nums">
                <span className="sr-only">{`${stars} ★: `}</span>
                {n}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
