import type { Locale } from "@/lib/i18n/config"
import { formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"

// Only the final (already-discounted) price is ever displayed to customers —
// no strikethrough "was" price, even when compareAtCents is set on the product.
export function Price({
  cents,
  locale,
  size = "md",
}: {
  cents: number
  locale: Locale
  size?: "sm" | "md" | "lg"
}) {
  const priceClass =
    size === "lg" ? "text-xl sm:text-2xl" : size === "sm" ? "text-xs sm:text-sm" : "text-sm sm:text-lg"
  return (
    <span className={cn("font-heading font-bold tabular-nums text-foreground", priceClass)}>
      {formatPrice(cents, locale)}
    </span>
  )
}
