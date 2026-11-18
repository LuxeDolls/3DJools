import Link from "next/link"
import { BadgeCheck } from "lucide-react"
import type { Locale } from "@/lib/i18n/config"
import { localizedPath } from "@/lib/i18n/paths"
import { reviewCountLabel, reviewsCopy } from "@/lib/i18n/reviews"
import { getStampedSummary } from "@/lib/reviews/stamped-reviews"
import { StarRating } from "./star-rating"

export async function StampedFooterBadge({ locale }: { locale: Locale }) {
  const summary = await getStampedSummary()
  if (summary.count === 0) return null

  const copy = reviewsCopy[locale]
  const average = summary.average.toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 })

  return (
    <Link
      href={localizedPath(locale, "/reviews")}
      aria-label={`${copy.footerLabel}: ${average} ${copy.outOf}, ${reviewCountLabel(locale, summary.count)} (Stamped.io)`}
      className="inline-flex items-center gap-2.5 rounded-md border border-border bg-background px-3 py-2 text-xs transition-colors hover:border-primary/50 hover:bg-muted"
    >
      <span className="inline-flex items-center gap-1 font-semibold text-foreground">
        <BadgeCheck className="size-3.5 text-primary" aria-hidden="true" />
        Stamped
      </span>
      <StarRating value={summary.average} size="xs" />
      <span className="font-semibold text-foreground tabular-nums">{average}</span>
      <span className="text-muted-foreground">{reviewCountLabel(locale, summary.count)}</span>
    </Link>
  )
}
