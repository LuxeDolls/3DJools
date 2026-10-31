import Image from "next/image"
import Link from "next/link"
import { CalendarClock } from "lucide-react"
import type { Locale } from "@/lib/i18n/config"
import type { Dictionary } from "@/lib/i18n/dictionaries/en"
import type { Product } from "@/lib/catalog/types"
import { localizedPath } from "@/lib/i18n/paths"
import { formatPrice } from "@/lib/format"
import { qualifiesForInstallments } from "@/lib/installments"
import { Badge } from "@/components/ui/badge"
import { Price } from "./price"
import { QuickAddButton } from "./quick-add-button"
import { ProductQuickView } from "./product-quick-view"
import { cn } from "@/lib/utils"

export function ProductCard({
  product,
  locale,
  dict,
}: {
  product: Product
  locale: Locale
  dict: Dictionary
}) {
  const brand = product.brandName ?? product.brandSlug
  const onSale = product.compareAtCents && product.compareAtCents > product.priceCents
  const href = localizedPath(locale, `/product/${product.slug}`)
  const primaryImage = product.images[0] || "/placeholder.svg"
  const secondaryImage = product.images.length > 1 ? product.images[1] : null
  const installmentsEligible = qualifiesForInstallments(product.priceCents)
  const installmentCents = Math.round(product.priceCents / 4)

  const techBadge = product.technology
    ? dict.technology[product.technology]
    : product.specs[0]?.value && product.specs[0].value.length <= 22
      ? product.specs[0].value
      : null

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-[0_4px_12px_rgba(0,0,0,0.18),0_20px_50px_-12px_rgba(0,0,0,0.5)] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-[0_8px_20px_rgba(0,0,0,0.25),0_28px_60px_-12px_rgba(0,0,0,0.65)]">
      <div className="relative aspect-square overflow-hidden border-b border-border/60 bg-white">
        <Link href={href} className="relative block size-full" aria-label={product.name}>
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={cn(
              "object-contain p-2.5 transition-all duration-300 group-hover:scale-105 sm:p-3.5",
              secondaryImage && "group-hover:opacity-0",
            )}
          />
          {secondaryImage && (
            <Image
              src={secondaryImage}
              alt=""
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain p-2.5 opacity-0 transition-all duration-300 group-hover:scale-105 group-hover:opacity-100 sm:p-3.5"
            />
          )}
        </Link>

        {/* Top-left badges */}
        <div className="pointer-events-none absolute top-2 left-2 flex flex-col gap-1 sm:top-2.5 sm:left-2.5 sm:gap-1.5">
          {product.bestseller && (
            <Badge className="bg-foreground px-1.5 py-0 text-[9px] font-bold tracking-wide text-background uppercase sm:px-2 sm:py-0.5 sm:text-[10px]">
              {dict.common.staffPick}
            </Badge>
          )}
          {onSale && (
            <Badge className="px-1.5 py-0 text-[9px] font-bold tracking-wide uppercase sm:px-2 sm:py-0.5 sm:text-[10px]">
              -10%
            </Badge>
          )}
          {product.availability === "preorder" && (
            <Badge variant="secondary" className="px-1.5 py-0 text-[9px] font-bold tracking-wide uppercase sm:px-2 sm:py-0.5 sm:text-[10px]">
              {dict.common.preorder}
            </Badge>
          )}
        </div>

        {/* Top-right Quick View trigger */}
        <div className="absolute top-2 right-2 z-10 opacity-90 transition-opacity sm:top-2.5 sm:right-2.5 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
          <ProductQuickView product={product} locale={locale} dict={dict} />
        </div>

        {/* Bottom-left tech / key spec pill */}
        {techBadge && (
          <div className="absolute bottom-1.5 left-2 z-10 max-w-[calc(100%-1rem)] sm:bottom-2 sm:left-2.5">
            <span className="inline-flex max-w-full items-center truncate rounded-md border border-neutral-200 bg-white/95 px-1.5 py-0.5 text-[9px] font-semibold tracking-tight text-neutral-800 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.6)] transition-transform duration-200 hover:-translate-y-0.5 sm:px-2 sm:text-[10px]">
              {techBadge}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-2.5 sm:p-4">
        <div className="flex items-center justify-between gap-1.5">
          <p className="truncate text-[10px] font-bold tracking-wider text-muted-foreground uppercase sm:text-[11px]">
            {brand}
          </p>
          <span
            className="inline-flex shrink-0 items-center gap-1 text-[10px] font-medium text-muted-foreground sm:text-[11px]"
            title={
              product.availability === "in_stock"
                ? dict.common.inStock
                : product.availability === "preorder"
                  ? dict.common.preorder
                  : dict.common.outOfStock
            }
          >
            <span
              className={cn(
                "size-1.5 rounded-full",
                product.availability === "in_stock"
                  ? "bg-emerald-500"
                  : product.availability === "preorder"
                    ? "bg-amber-500"
                    : "bg-muted-foreground",
              )}
            />
            <span className="hidden sm:inline">
              {product.availability === "in_stock"
                ? dict.common.inStock
                : product.availability === "preorder"
                  ? dict.common.preorder
                  : dict.common.outOfStock}
            </span>
          </span>
        </div>

        <Link href={href} className="mt-1 sm:mt-1.5">
          <h3 className="line-clamp-2 text-xs font-semibold leading-snug text-foreground transition-colors group-hover:text-primary sm:text-sm">
            {product.name}
          </h3>
        </Link>

        <div className="mt-auto flex items-end justify-between gap-1.5 pt-2.5 sm:gap-2 sm:pt-3.5">
          <div className="min-w-0">
            <Price cents={product.priceCents} compareAtCents={product.compareAtCents} locale={locale} />
            {installmentsEligible ? (
              <p className="mt-0.5 flex items-center gap-1 truncate text-[10px] font-medium text-muted-foreground sm:text-[11px]">
                <CalendarClock className="size-2.5 shrink-0 text-primary sm:size-3" />
                <span className="truncate">4 × {formatPrice(installmentCents, locale)}</span>
              </p>
            ) : (
              <p className="mt-0.5 truncate text-[10px] text-muted-foreground sm:text-[11px]">
                {dict.product.freeShipping}
              </p>
            )}
          </div>
          <QuickAddButton product={product} label={dict.common.addToCart} />
        </div>
      </div>
    </div>
  )
}
