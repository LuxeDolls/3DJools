"use client"

import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash2, ShoppingCart, Lock } from "lucide-react"
import { useI18n, useLocalizedPath } from "@/components/i18n-provider"
import { useCart } from "./cart-provider"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { formatPrice } from "@/lib/format"
import { memberDiscountCents } from "@/lib/discount"
import { useSession } from "@/lib/auth-client"
import type { Locale } from "@/lib/i18n/config"

export function CartPageView({ locale }: { locale: Locale }) {
  const { dict } = useI18n()
  const lp = useLocalizedPath()
  const { lines, subtotalCents, updateQuantity, removeItem } = useCart()
  const { data: session } = useSession()
  const isMember = Boolean(session?.user)
  const discountCents = isMember ? memberDiscountCents(subtotalCents) : 0
  const totalCents = subtotalCents - discountCents

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border py-24 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-secondary">
          <ShoppingCart className="size-7 text-muted-foreground" />
        </div>
        <div>
          <p className="font-heading text-lg font-semibold text-foreground">{dict.cart.empty}</p>
          <p className="mt-1 text-sm text-muted-foreground">{dict.cart.emptyText}</p>
        </div>
        <Button render={<Link href={lp("/catalog/printers")}>{dict.cart.startShopping}</Link>} />
      </div>
    )
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
      <ul className="divide-y divide-border rounded-lg border border-border">
        {lines.map((line) => (
          <li key={line.id} className="flex gap-4 p-4">
            <Link
              href={lp(`/product/${line.slug}`)}
              className="relative size-24 shrink-0 overflow-hidden rounded-md border border-border bg-secondary/40"
            >
              <Image src={line.image || "/placeholder.svg"} alt={line.name} fill sizes="96px" className="object-cover" />
            </Link>
            <div className="flex min-w-0 flex-1 flex-col">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{line.brand}</p>
              <Link
                href={lp(`/product/${line.slug}`)}
                className="font-medium text-foreground hover:text-primary"
              >
                {line.name}
              </Link>
              <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                <div className="flex items-center rounded-md border border-border">
                  <button
                    onClick={() => updateQuantity(line.id, line.quantity - 1)}
                    className="flex size-9 items-center justify-center text-muted-foreground hover:text-foreground"
                    aria-label={dict.common.remove}
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="w-10 text-center text-sm font-medium tabular-nums">{line.quantity}</span>
                  <button
                    onClick={() => updateQuantity(line.id, line.quantity + 1)}
                    className="flex size-9 items-center justify-center text-muted-foreground hover:text-foreground"
                    aria-label={dict.common.addToCart}
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
                <span className="font-heading font-bold tabular-nums text-foreground">
                  {formatPrice(line.priceCents * line.quantity, locale)}
                </span>
              </div>
            </div>
            <button
              onClick={() => removeItem(line.id)}
              className="self-start text-muted-foreground transition-colors hover:text-destructive"
              aria-label={dict.common.remove}
            >
              <Trash2 className="size-4" />
            </button>
          </li>
        ))}
      </ul>

      <aside className="h-fit rounded-lg border border-border bg-card p-5">
        <h2 className="font-heading text-lg font-bold text-foreground">{dict.cart.orderSummary}</h2>
        <dl className="mt-4 space-y-2.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">{dict.common.subtotal}</dt>
            <dd className="font-medium tabular-nums text-foreground">{formatPrice(subtotalCents, locale)}</dd>
          </div>
          {isMember && discountCents > 0 && (
            <div className="flex justify-between text-primary">
              <dt>{dict.cart.memberDiscount}</dt>
              <dd className="font-medium tabular-nums">-{formatPrice(discountCents, locale)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-muted-foreground">{dict.cart.shipping}</dt>
            <dd className="font-medium text-foreground">{dict.cart.shippingFree}</dd>
          </div>
        </dl>
        {!isMember && (
          <Link
            href={lp("/sign-in")}
            className="mt-3 flex items-center justify-center rounded-md border border-dashed border-primary/50 bg-primary/5 px-3 py-2 text-center text-xs font-medium text-primary transition-colors hover:bg-primary/10"
          >
            {dict.cart.signInToSave}
          </Link>
        )}
        <Separator className="my-4" />
        <div className="flex items-baseline justify-between">
          <span className="font-medium text-foreground">{dict.common.total}</span>
          <span className="font-heading text-xl font-bold tabular-nums text-foreground">
            {formatPrice(totalCents, locale)}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{dict.cart.vatIncluded}</p>
        <Button
          size="lg"
          className="mt-4 w-full"
          render={
            <Link href={lp("/checkout")}>
              <Lock className="size-4" />
              {dict.cart.checkout}
            </Link>
          }
        />
        <Button
          variant="ghost"
          className="mt-2 w-full"
          render={<Link href={lp("/catalog/printers")}>{dict.common.continueShopping}</Link>}
        />
      </aside>
    </div>
  )
}
