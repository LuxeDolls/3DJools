"use client"

import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react"
import { useI18n, useLocalizedPath } from "@/components/i18n-provider"
import { useCart, FREE_SHIPPING_THRESHOLD_CENTS } from "./cart-provider"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { formatPrice } from "@/lib/format"

export function CartDrawer() {
  const { locale, dict } = useI18n()
  const lp = useLocalizedPath()
  const { lines, subtotalCents, count, isOpen, closeCart, updateQuantity, removeItem } = useCart()

  const remaining = FREE_SHIPPING_THRESHOLD_CENTS - subtotalCents
  const progress = Math.min(100, (subtotalCents / FREE_SHIPPING_THRESHOLD_CENTS) * 100)

  return (
    <Sheet open={isOpen} onOpenChange={(o) => !o && closeCart()}>
      <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border px-4 py-4">
          <SheetTitle className="flex items-center gap-2 font-heading">
            <ShoppingCart className="size-5 text-primary" />
            {dict.cart.title}
            {count > 0 && <span className="text-muted-foreground">({count})</span>}
          </SheetTitle>
        </SheetHeader>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-secondary">
              <ShoppingCart className="size-7 text-muted-foreground" />
            </div>
            <div>
              <p className="font-heading font-semibold text-foreground">{dict.cart.empty}</p>
              <p className="mt-1 text-sm text-muted-foreground">{dict.cart.emptyText}</p>
            </div>
            <Button
              render={
                <Link href={lp("/catalog/printers")} onClick={closeCart}>
                  {dict.cart.startShopping}
                </Link>
              }
            />
          </div>
        ) : (
          <>
            <div className="border-b border-border bg-secondary/50 px-4 py-3">
              {remaining > 0 ? (
                <p className="text-xs text-muted-foreground">
                  {dict.cart.freeShippingProgress.replace("{amount}", formatPrice(remaining, locale))}
                </p>
              ) : (
                <p className="text-xs font-medium text-primary">{dict.cart.freeShippingReached}</p>
              )}
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <ul className="flex-1 divide-y divide-border overflow-y-auto px-4">
              {lines.map((line) => (
                <li key={line.id} className="flex gap-3 py-4">
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-md border border-border bg-card">
                    <Image src={line.image || "/placeholder.svg"} alt={line.name} fill className="object-cover" sizes="80px" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="text-xs text-muted-foreground">{line.brand}</p>
                    <Link
                      href={lp(`/product/${line.slug}`)}
                      onClick={closeCart}
                      className="line-clamp-2 text-sm font-medium text-foreground hover:text-primary"
                    >
                      {line.name}
                    </Link>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center rounded-md border border-border">
                        <button
                          onClick={() => updateQuantity(line.id, line.quantity - 1)}
                          className="flex size-7 items-center justify-center text-muted-foreground hover:text-foreground"
                          aria-label={dict.common.remove}
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="w-7 text-center text-sm font-medium tabular-nums">{line.quantity}</span>
                        <button
                          onClick={() => updateQuantity(line.id, line.quantity + 1)}
                          className="flex size-7 items-center justify-center text-muted-foreground hover:text-foreground"
                          aria-label={dict.common.addToCart}
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                      <span className="text-sm font-semibold tabular-nums">
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

            <SheetFooter className="border-t border-border p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{dict.common.subtotal}</span>
                <span className="font-heading text-lg font-bold tabular-nums">{formatPrice(subtotalCents, locale)}</span>
              </div>
              <p className="mb-3 text-xs text-muted-foreground">{dict.cart.vatIncluded}</p>
              <Button
                size="lg"
                className="w-full"
                render={
                  <Link href={lp("/checkout")} onClick={closeCart}>
                    {dict.cart.checkout}
                  </Link>
                }
              />
              <Separator className="my-3" />
              <Button
                variant="ghost"
                className="w-full"
                render={
                  <Link href={lp("/cart")} onClick={closeCart}>
                    {dict.common.cart}
                  </Link>
                }
              />
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
