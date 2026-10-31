import type { Locale } from "@/lib/i18n/config"
import { formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"

export function Price({
  cents,
  compareAtCents,
  locale,
  size = "md",
}: {
  cents: number
  compareAtCents?: number
  locale: Locale
  size?: "sm" | "md" | "lg"
}) {
  const oldCents =
    compareAtCents && compareAtCents > cents ? compareAtCents : Math.round(cents / 0.9)
  const priceClass =
    size === "lg" ? "text-xl sm:text-2xl" : size === "sm" ? "text-xs sm:text-sm" : "text-sm sm:text-lg"
  const compareClass =
    size === "lg" ? "text-sm sm:text-base" : size === "sm" ? "text-[10px] sm:text-xs" : "text-[11px] sm:text-xs"

  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
      <span className={cn("font-heading font-bold tabular-nums text-foreground", priceClass)}>
        {formatPrice(cents, locale)}
      </span>
      {oldCents > cents && (
        <span className={cn("font-normal tabular-nums text-muted-foreground line-through", compareClass)}>
          {formatPrice(oldCents, locale)}
        </span>
      )}
    </span>
  )
}
