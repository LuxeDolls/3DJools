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
  const priceClass = size === "lg" ? "text-2xl" : size === "sm" ? "text-sm" : "text-lg"
  return (
    <div className="flex flex-wrap items-baseline gap-2">
      <span className={cn("font-heading font-bold tabular-nums text-foreground", priceClass)}>
        {formatPrice(cents, locale)}
      </span>
      {compareAtCents && compareAtCents > cents && (
        <span className="text-sm font-medium tabular-nums text-muted-foreground line-through">
          {formatPrice(compareAtCents, locale)}
        </span>
      )}
    </div>
  )
}
