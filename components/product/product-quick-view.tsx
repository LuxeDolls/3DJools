"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Eye, CheckCircle2, Clock, CalendarClock, Truck, ShieldCheck, ArrowRight } from "lucide-react"
import type { Locale } from "@/lib/i18n/config"
import type { Dictionary } from "@/lib/i18n/dictionaries/en"
import type { Product } from "@/lib/catalog/types"
import { localizedPath } from "@/lib/i18n/paths"
import { formatPrice } from "@/lib/format"
import { qualifiesForInstallments } from "@/lib/installments"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Price } from "./price"
import { AddToCartButton } from "./add-to-cart-button"
import { cn } from "@/lib/utils"

export function ProductQuickView({
  product,
  locale,
  dict,
}: {
  product: Product
  locale: Locale
  dict: Dictionary
}) {
  const [activeImage, setActiveImage] = useState(0)
  const gallery = product.images.length ? product.images : ["/placeholder.svg"]
  const brand = product.brandName ?? product.brandSlug
  const href = localizedPath(locale, `/product/${product.slug}`)
  const installmentsEligible = qualifiesForInstallments(product.priceCents)
  const installmentCents = Math.round(product.priceCents / 4)
  const topSpecs = product.specs.slice(0, 4)
  const topHighlights = product.highlights.slice(0, 3)

  return (
    <Dialog>
      <DialogTrigger
        render={
          <button
            type="button"
            aria-label={`${dict.common.viewDetails}: ${product.name}`}
            className="flex size-8 items-center justify-center rounded-full border border-border/80 bg-background/90 text-foreground shadow-[0_10px_25px_-5px_rgba(0,0,0,0.6)] backdrop-blur-xs transition-transform duration-200 hover:-translate-y-0.5 hover:border-primary hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Eye className="size-4" />
          </button>
        }
      />
      <DialogContent className="max-h-[90dvh] overflow-y-auto p-0 sm:max-w-3xl">
        <div className="grid gap-0 md:grid-cols-12">
          {/* Left column: studio image + thumbnails */}
          <div className="flex flex-col justify-between border-b border-border bg-white p-5 md:col-span-6 md:border-r md:border-b-0 md:rounded-l-xl">
            <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-white">
              <Image
                src={gallery[activeImage] || "/placeholder.svg"}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 90vw, 400px"
                className="object-contain p-3"
              />
            </div>
            {gallery.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {gallery.slice(0, 6).map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(idx)}
                    aria-label={`${product.name} ${idx + 1}`}
                    className={cn(
                      "relative size-14 shrink-0 overflow-hidden rounded-md border-2 bg-white transition-all",
                      idx === activeImage
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-neutral-200 opacity-75 hover:opacity-100",
                    )}
                  >
                    <Image src={img || "/placeholder.svg"} alt="" fill sizes="56px" className="object-contain p-1" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right column: product details & actions */}
          <div className="flex flex-col justify-between p-5 sm:p-6 md:col-span-6">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="uppercase tracking-wider">
                  {brand}
                </Badge>
                {product.availability === "in_stock" ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                    <CheckCircle2 className="size-3.5" />
                    {dict.common.inStock}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                    <Clock className="size-3.5" />
                    {product.availability === "preorder" ? dict.common.preorder : dict.common.outOfStock}
                  </span>
                )}
              </div>

              <DialogHeader className="mt-2.5 text-left">
                <DialogTitle className="font-heading text-xl font-bold leading-snug text-foreground">
                  {product.name}
                </DialogTitle>
                <DialogDescription className="line-clamp-3 pt-1 text-xs leading-relaxed text-muted-foreground">
                  {product.shortDescription}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4 flex flex-col gap-1.5 rounded-lg border border-border bg-secondary/40 p-3">
                <div className="flex items-baseline justify-between gap-2">
                  <Price cents={product.priceCents} compareAtCents={product.compareAtCents} locale={locale} size="lg" />
                  <span className="text-[11px] font-medium text-muted-foreground">
                    {dict.cart.vatIncluded}
                  </span>
                </div>
                {installmentsEligible && (
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarClock className="size-3.5 shrink-0 text-primary" />
                    <span>
                      {dict.checkout.payInstallments}:{" "}
                      <strong className="font-semibold text-foreground">
                        4 × {formatPrice(installmentCents, locale)}
                      </strong>
                    </span>
                  </p>
                )}
              </div>

              {topSpecs.length > 0 && (
                <div className="mt-4">
                  <dl className="grid grid-cols-2 gap-2">
                    {topSpecs.map((spec) => (
                      <div
                        key={spec.label}
                        className="rounded-md border border-border/70 bg-card px-2.5 py-1.5 text-xs"
                      >
                        <dt className="truncate text-[11px] text-muted-foreground">{spec.label}</dt>
                        <dd className="truncate font-semibold text-foreground">{spec.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {topHighlights.length > 0 && (
                <ul className="mt-3.5 flex flex-col gap-1.5">
                  {topHighlights.map((h) => (
                    <li key={h} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                      <span className="line-clamp-1">{h}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-5 pt-3">
              <Separator className="mb-4" />
              <div className="flex flex-col gap-2.5">
                <AddToCartButton product={product} quantity={1} size="lg" className="w-full" />
                <Button
                  variant="outline"
                  className="w-full"
                  render={
                    <Link href={href}>
                      {dict.common.viewDetails}
                      <ArrowRight data-icon="inline-end" />
                    </Link>
                  }
                />
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Truck className="size-3.5 text-primary" />
                  {dict.product.freeShipping}
                </span>
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="size-3.5 text-primary" />
                  {dict.product.warranty}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
