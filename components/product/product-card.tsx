import Image from "next/image"
import Link from "next/link"
import type { Locale } from "@/lib/i18n/config"
import type { Dictionary } from "@/lib/i18n/dictionaries/en"
import type { Product } from "@/lib/catalog/types"
import { localizedPath } from "@/lib/i18n/paths"
import { formatPrice } from "@/lib/format"
import { qualifiesForInstallments } from "@/lib/installments"
import { Price } from "./price"
import { QuickAddButton } from "./quick-add-button"
import { ProductQuickView } from "./product-quick-view"
import { StampedStarBadge } from "@/components/reviews/stamped-widgets"
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
  const installmentCents = Math.round(product.priceCents / 3)

  const availabilityLabel =
    product.availability === "in_stock"
      ? dict.common.inStock
      : product.availability === "preorder"
        ? dict.common.preorder
        : dict.common.outOfStock

  return (
    <div
      data-product-id={product.productId}
      data-product-sku={product.mpn || product.slug}
      className="group relative flex h-full flex-col gap-2 rounded-3xl border border-border/90 bg-card/92 p-1.5 shadow-[var(--shadow-float-md)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/60 hover:shadow-[var(--shadow-float-md-hover)] sm:gap-3 sm:p-2"
    >
      <div className="relative aspect-square overflow-hidden rounded-[1.15rem] bg-photo shadow-sm">
        <Link href={href} className="relative block size-full" aria-label={product.name}>
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={cn(
              "object-contain p-3 transition-all duration-500 ease-out group-hover:scale-[1.04] sm:p-5",
              secondaryImage && "group-hover:opacity-0",
            )}
          />
          {secondaryImage && (
            <Image
              src={secondaryImage}
              alt=""
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain p-3 opacity-0 transition-all duration-500 ease-out group-hover:scale-[1.04] group-hover:opacity-100 sm:p-5"
            />
          )}
        </Link>

        <div className="pointer-events-none absolute top-2 left-2 flex flex-wrap gap-1">
          {product.bestseller && (
            <span className="rounded-full bg-signal px-2 py-0.5 text-[9px] font-bold tracking-wide text-signal-foreground uppercase sm:text-[10px]">
              {dict.common.staffPick}
            </span>
          )}
          {onSale && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold text-primary-foreground sm:text-[10px]">
              -5%
            </span>
          )}
          {product.availability === "preorder" && (
            <span className="rounded-full bg-ink px-2 py-0.5 text-[9px] font-bold tracking-wide text-ink-foreground uppercase sm:text-[10px]">
              {dict.common.preorder}
            </span>
          )}
        </div>

        <div className="absolute top-2 right-2 z-10 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
          <ProductQuickView product={product} locale={locale} dict={dict} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1 px-1.5 pb-1 sm:px-2 sm:pb-1.5">
        <div className="flex items-center justify-between gap-1.5">
          <p className="truncate font-mono text-[10px] tracking-wider text-muted-foreground uppercase sm:text-[11px]">
            {brand}
          </p>
          <span className="inline-flex shrink-0 items-center gap-1 text-[10px] text-muted-foreground" title={availabilityLabel}>
            <span
              className={cn(
                "size-1.5 rounded-full",
                product.availability === "in_stock"
                  ? "bg-emerald-500"
                  : product.availability === "preorder"
                    ? "bg-signal"
                    : "bg-muted-foreground",
              )}
              aria-hidden="true"
            />
            <span className="sr-only sm:not-sr-only">{availabilityLabel}</span>
          </span>
        </div>

        <Link href={href}>
          <h3 className="line-clamp-2 text-[13px] leading-snug font-semibold text-foreground transition-colors group-hover:text-primary sm:text-[15px]">
            {product.name}
          </h3>
        </Link>

        <StampedStarBadge
          productId={product.productId}
          productSku={product.mpn || product.slug}
          productTitle={product.name}
          className="text-xs empty:hidden"
        />

        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div className="min-w-0">
            <Price cents={product.priceCents} compareAtCents={product.compareAtCents} locale={locale} />
            <p className="mt-0.5 truncate text-[10px] text-muted-foreground sm:text-[11px]">
              {installmentsEligible
                ? `3 × ${formatPrice(installmentCents, locale)} · 0%`
                : dict.product.freeShipping}
            </p>
          </div>
          <QuickAddButton product={product} label={dict.common.addToCart} />
        </div>
      </div>
    </div>
  )
}
