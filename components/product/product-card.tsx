import Image from "next/image"
import Link from "next/link"
import type { Locale } from "@/lib/i18n/config"
import type { Dictionary } from "@/lib/i18n/dictionaries/en"
import type { Product } from "@/lib/catalog/types"
import { localizedPath } from "@/lib/i18n/paths"
import { Price } from "./price"
import { StarRating } from "./star-rating"
import { QuickAddButton } from "./quick-add-button"

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

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-all hover:border-primary/40 hover:shadow-md">
      <Link href={href} className="relative aspect-square overflow-hidden bg-secondary/40">
        <Image
          src={product.images[0] || "/placeholder.svg"}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute left-2.5 top-2.5 flex flex-col gap-1.5">
          {product.bestseller && (
            <span className="rounded-full bg-foreground px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-background">
              {dict.common.staffPick}
            </span>
          )}
          {onSale && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">
              Sale
            </span>
          )}
          {product.availability === "preorder" && (
            <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent-foreground">
              {dict.common.preorder}
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-3.5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{brand}</p>
        <Link href={href} className="mt-1">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
            {product.name}
          </h3>
        </Link>
        <div className="mt-1.5">
          <StarRating rating={product.rating} count={product.reviewCount} />
        </div>
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <Price cents={product.priceCents} locale={locale} />
          <QuickAddButton product={product} label={dict.common.addToCart} />
        </div>
      </div>
    </div>
  )
}
