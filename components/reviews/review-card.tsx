import Image from "next/image"
import Link from "next/link"
import { BadgeCheck, MapPin } from "lucide-react"
import type { Locale } from "@/lib/i18n/config"
import { reviewsCopy } from "@/lib/i18n/reviews"
import { localeToIntl } from "@/lib/format"
import type { StampedReview } from "@/lib/reviews/stamped-reviews"
import { StarRating } from "./star-rating"
import { cn } from "@/lib/utils"

export interface ReviewProductRef {
  name: string
  href: string
  image?: string
}

export function formatReviewDate(date: string, locale: Locale) {
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return ""
  return new Intl.DateTimeFormat(localeToIntl[locale], { day: "numeric", month: "short", year: "numeric" }).format(parsed)
}

export function ReviewCard({
  review,
  locale,
  product,
  clamp = false,
  className,
}: {
  review: StampedReview
  locale: Locale
  product?: ReviewProductRef
  clamp?: boolean
  className?: string
}) {
  const copy = reviewsCopy[locale]
  const date = formatReviewDate(review.date, locale)
  const initial = review.author.charAt(0).toUpperCase()

  return (
    <article
      className={cn(
        "flex h-full min-w-0 flex-col gap-3 break-words rounded-3xl border border-border/90 bg-card/92 p-4 shadow-[var(--shadow-float-md)] backdrop-blur-md sm:p-5",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <StarRating value={review.rating} size="md" label={`${review.rating} ${copy.outOf}`} />
        {date ? (
          <time dateTime={review.date} className="text-[11px] text-muted-foreground tabular-nums sm:text-xs">
            {date}
          </time>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1.5">
        {review.title ? (
          <h3 className="text-pretty text-sm leading-snug font-semibold text-foreground sm:text-base">{review.title}</h3>
        ) : null}
        {review.message ? (
          <p className={cn("text-pretty text-sm leading-relaxed text-muted-foreground", clamp && "line-clamp-5")}>
            {review.message}
          </p>
        ) : null}
      </div>

      {review.reply ? (
        <div className="rounded-2xl border border-border bg-secondary/60 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
          <p className="mb-1 font-semibold text-foreground">{copy.storeReply}</p>
          {review.reply}
        </div>
      ) : null}

      <footer className="flex flex-col gap-3 border-t border-border/70 pt-3">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/12 font-heading text-sm font-bold text-primary"
          >
            {initial}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{review.author}</p>
            <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
              {review.verified ? (
                <span className="inline-flex items-center gap-1 text-primary">
                  <BadgeCheck className="size-3.5" aria-hidden="true" />
                  {copy.verifiedBuyer}
                </span>
              ) : null}
              {review.location ? (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3" aria-hidden="true" />
                  {review.location}
                </span>
              ) : null}
            </p>
          </div>
        </div>

        {product ? (
          <Link
            href={product.href}
            className="group flex min-w-0 items-center gap-2.5 rounded-2xl border border-border bg-background/70 p-1.5 pr-3 transition-colors hover:border-primary/60"
          >
            {product.image ? (
              <span className="relative size-10 shrink-0 overflow-hidden rounded-xl bg-photo">
                <Image src={product.image} alt="" fill sizes="40px" className="object-contain p-1" />
              </span>
            ) : null}
            <span className="min-w-0">
              <span className="block text-[10px] tracking-wider text-muted-foreground uppercase">{copy.reviewed}</span>
              <span className="block truncate text-xs font-semibold text-foreground transition-colors group-hover:text-primary">
                {product.name}
              </span>
            </span>
          </Link>
        ) : null}
      </footer>
    </article>
  )
}
