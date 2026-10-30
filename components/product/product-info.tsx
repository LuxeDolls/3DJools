"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import {
  Minus,
  Plus,
  Truck,
  ShieldCheck,
  Lock,
  CheckCircle2,
  Clock,
  CalendarClock,
  RotateCcw,
  BadgePercent,
} from "lucide-react"
import { useI18n, useLocalizedPath } from "@/components/i18n-provider"
import { Badge } from "@/components/ui/badge"
import { AddToCartButton } from "./add-to-cart-button"
import { Price } from "./price"
import type { Product } from "@/lib/catalog/types"
import { formatPrice } from "@/lib/format"
import { qualifiesForInstallments } from "@/lib/installments"

export function ProductInfo({ product }: { product: Product }) {
  const { locale, dict } = useI18n()
  const lp = useLocalizedPath()
  const [quantity, setQuantity] = useState(1)
  const [showStickyBar, setShowStickyBar] = useState(false)
  const actionBoxRef = useRef<HTMLDivElement>(null)

  const brand = product.brandName ?? product.brandSlug
  const ean = product.ean ?? product.gtin

  useEffect(() => {
    function checkPosition() {
      const el = actionBoxRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      setShowStickyBar(rect.bottom < 80)
    }
    checkPosition()
    window.addEventListener("scroll", checkPosition, { passive: true })
    return () => window.removeEventListener("scroll", checkPosition)
  }, [])

  const availabilityBadge = {
    in_stock: { label: dict.common.inStock, icon: CheckCircle2, className: "text-emerald-500" },
    preorder: { label: dict.common.preorder, icon: Clock, className: "text-amber-500" },
    out_of_stock: { label: dict.common.outOfStock, icon: Clock, className: "text-muted-foreground" },
  }[product.availability]

  // 4 interest-free instalments over 2 months — only available above the minimum order total.
  const installmentCents = Math.round(product.priceCents / 4)
  const installmentsEligible = qualifiesForInstallments(product.priceCents)

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={lp(`/brands/${product.brandSlug}`)}
          className="inline-flex items-center rounded-full border border-border bg-secondary px-3 py-1 text-xs font-bold tracking-wider text-foreground uppercase transition-colors hover:border-primary hover:text-primary"
        >
          {brand}
        </Link>
        {product.bestseller && (
          <Badge className="bg-foreground text-background uppercase">
            {dict.common.staffPick}
          </Badge>
        )}
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold ${availabilityBadge.className}`}>
          <availabilityBadge.icon className="size-3.5" />
          {availabilityBadge.label}
        </span>
      </div>

      <h1 className="mt-3 text-balance font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {product.name}
      </h1>

      <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>
          {dict.product.mpn}: <strong className="font-mono font-medium text-foreground">{product.mpn}</strong>
        </span>
        {ean ? (
          <span>
            {dict.product.ean}: <strong className="font-mono font-medium tabular-nums text-foreground">{ean}</strong>
          </span>
        ) : null}
      </div>

      {/* Price & Instalments Box */}
      <div className="mt-5 rounded-xl border border-border bg-card p-4 shadow-2xs">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-2.5">
            <Price cents={product.priceCents} locale={locale} size="lg" />
            <Badge variant="secondary" className="text-[11px] font-semibold">
              -10% Black Friday
            </Badge>
          </div>
          <span className="text-xs text-muted-foreground">{dict.cart.vatIncluded}</span>
        </div>

        {installmentsEligible && (
          <div className="mt-3 flex items-center justify-between gap-2 rounded-lg border border-primary/25 bg-primary/10 px-3 py-2 text-xs">
            <span className="flex items-center gap-2 text-foreground">
              <CalendarClock className="size-4 shrink-0 text-primary" />
              <span>
                {dict.checkout.payInstallments}:{" "}
                <strong className="font-bold text-primary">
                  4 × {formatPrice(installmentCents, locale)}
                </strong>
              </span>
            </span>
            <span className="rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
              0%
            </span>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/70 pt-2.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <BadgePercent className="size-3.5 text-primary" />
            <span>{dict.promo.memberTitle}</span>
          </span>
          <Link href={lp("/sign-up")} className="font-semibold text-primary hover:underline">
            {dict.promo.memberBadge}
          </Link>
        </div>
      </div>

      <p className="mt-5 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
        {product.shortDescription}
      </p>

      {/* Top 3 Quick Specs Preview */}
      {product.specs.length > 0 && (
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {product.specs.slice(0, 3).map((s) => (
            <div key={s.label} className="rounded-lg border border-border/80 bg-secondary/30 px-3 py-2">
              <p className="truncate text-[11px] text-muted-foreground">{s.label}</p>
              <p className="mt-0.5 truncate text-xs font-semibold text-foreground">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Quantity + add to cart */}
      <div ref={actionBoxRef} className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex w-fit items-center rounded-lg border border-border bg-card">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex size-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Decrease quantity"
          >
            <Minus className="size-4" />
          </button>
          <span className="w-10 text-center font-medium tabular-nums">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(20, q + 1))}
            className="flex size-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Increase quantity"
          >
            <Plus className="size-4" />
          </button>
        </div>
        <AddToCartButton product={product} quantity={quantity} size="lg" className="w-full sm:flex-1" />
      </div>

      {/* Trust badges */}
      <ul className="mt-6 grid grid-cols-1 gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2">
        <li className="flex items-start gap-2.5 text-sm text-foreground">
          <Truck className="mt-0.5 size-4 shrink-0 text-primary" />
          <span>
            <span className="font-semibold">{dict.product.freeShipping}</span>
            <span className="mt-0.5 block text-xs font-normal leading-relaxed text-muted-foreground">
              {dict.product.deliveryEstimate}
            </span>
          </span>
        </li>
        <li className="flex items-start gap-2.5 text-sm text-foreground">
          <RotateCcw className="mt-0.5 size-4 shrink-0 text-primary" />
          <span>
            <span className="font-semibold">{dict.footer.returns}</span>
            <span className="mt-0.5 block text-xs font-normal leading-relaxed text-muted-foreground">
              30 days free return label
            </span>
          </span>
        </li>
        <li className="flex items-center gap-2.5 text-sm font-medium text-foreground">
          <ShieldCheck className="size-4 shrink-0 text-primary" />
          {dict.product.warranty}
        </li>
        <li className="flex items-center gap-2.5 text-sm font-medium text-foreground">
          <Lock className="size-4 shrink-0 text-primary" />
          {dict.product.securePayment}
        </li>
      </ul>

      {/* Sticky Bottom Conversion Bar when scrolled down */}
      {showStickyBar && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 py-3 pr-20 pl-4 shadow-lg backdrop-blur-md sm:pr-24">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative hidden size-11 shrink-0 overflow-hidden rounded-lg border border-border bg-white sm:block">
                <Image
                  src={product.images[0] || "/placeholder.svg"}
                  alt=""
                  fill
                  sizes="44px"
                  className="object-contain p-1"
                />
              </div>
              <div className="min-w-0">
                <p className="truncate font-heading text-sm font-bold text-foreground">{product.name}</p>
                <div className="flex items-center gap-2">
                  <Price cents={product.priceCents} locale={locale} size="sm" />
                  {installmentsEligible && (
                    <span className="hidden text-xs text-muted-foreground md:inline">
                      · 4 × {formatPrice(installmentCents, locale)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <AddToCartButton product={product} quantity={quantity} size="lg" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
