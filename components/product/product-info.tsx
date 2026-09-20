"use client"

import { useState } from "react"
import { Minus, Plus, Truck, ShieldCheck, Lock, CheckCircle2, Clock, CalendarClock } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { AddToCartButton } from "./add-to-cart-button"
import { Price } from "./price"
import { StarRating } from "./star-rating"
import type { Product } from "@/lib/catalog/types"
import { formatPrice } from "@/lib/format"
import { qualifiesForInstallments } from "@/lib/installments"

export function ProductInfo({ product }: { product: Product }) {
  const { locale, dict } = useI18n()
  const [quantity, setQuantity] = useState(1)
  const brand = product.brandName ?? product.brandSlug
  const ean = product.ean ?? product.gtin

  const availabilityBadge = {
    in_stock: { label: dict.common.inStock, icon: CheckCircle2, className: "text-primary" },
    preorder: { label: dict.common.preorder, icon: Clock, className: "text-accent-foreground" },
    out_of_stock: { label: dict.common.outOfStock, icon: Clock, className: "text-muted-foreground" },
  }[product.availability]

  // 4 interest-free instalments over 2 months — only available above the minimum order total.
  const installmentCents = Math.round(product.priceCents / 4)
  const installmentsEligible = qualifiesForInstallments(product.priceCents)

  return (
    <div>
      <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">{brand}</p>
      <h1 className="mt-1.5 text-balance font-heading text-3xl font-bold tracking-tight text-foreground">
        {product.name}
      </h1>

      <div className="mt-3 flex items-center gap-4">
        <StarRating rating={product.rating} count={product.reviewCount} size="md" />
        <span className="text-sm text-muted-foreground">
          {dict.product.mpn}: {product.mpn}
        </span>
        {ean ? (
          <span className="text-sm text-muted-foreground">
            {dict.product.ean}: <span className="tabular-nums">{ean}</span>
          </span>
        ) : null}
      </div>

      <div className="mt-5">
        <Price cents={product.priceCents} locale={locale} size="lg" />
        {installmentsEligible && (
          <p className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-muted-foreground">
            <CalendarClock className="size-4 shrink-0 text-primary" />
            <span>
              {dict.checkout.payInstallments}:{" "}
              <span className="font-medium text-foreground">4 × {formatPrice(installmentCents, locale)}</span>
            </span>
          </p>
        )}
      </div>

      <p className="mt-5 text-pretty leading-relaxed text-muted-foreground">{product.shortDescription}</p>

      <div className={`mt-5 flex items-center gap-1.5 text-sm font-medium ${availabilityBadge.className}`}>
        <availabilityBadge.icon className="size-4" />
        {availabilityBadge.label}
      </div>

      {/* Quantity + add to cart */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex w-fit items-center rounded-md border border-border">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex size-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Decrease quantity"
          >
            <Minus className="size-4" />
          </button>
          <span className="w-10 text-center font-medium tabular-nums">{quantity}</span>
          <button
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
      <ul className="mt-6 grid grid-cols-1 gap-3 rounded-lg border border-border bg-card p-4 sm:grid-cols-3">
        <li className="flex items-center gap-2 text-sm text-foreground">
          <Truck className="size-4 shrink-0 text-primary" />
          {dict.product.freeShipping}
        </li>
        <li className="flex items-center gap-2 text-sm text-foreground">
          <ShieldCheck className="size-4 shrink-0 text-primary" />
          {dict.product.warranty}
        </li>
        <li className="flex items-center gap-2 text-sm text-foreground">
          <Lock className="size-4 shrink-0 text-primary" />
          {dict.product.securePayment}
        </li>
      </ul>
    </div>
  )
}
