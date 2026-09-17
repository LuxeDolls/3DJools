"use client"

import { ShoppingCart, Check } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useCart } from "@/components/cart/cart-provider"
import { useI18n } from "@/components/i18n-provider"
import type { Product } from "@/lib/catalog/types"
import { cn } from "@/lib/utils"

export function AddToCartButton({
  product,
  quantity = 1,
  size = "default",
  className,
}: {
  product: Product
  quantity?: number
  size?: "sm" | "default" | "lg"
  className?: string
}) {
  const { dict } = useI18n()
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  const disabled = product.availability === "out_of_stock"

  function handleAdd() {
    addItem(
      {
        id: product.id,
        slug: product.slug,
        name: product.name,
        brand: product.brandName ?? product.brandSlug,
        priceCents: product.priceCents,
        image: product.images[0],
      },
      quantity,
    )
    toast.success(dict.product.addedToCart, { description: product.name })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <Button size={size} onClick={handleAdd} disabled={disabled} className={cn(className)}>
      {added ? <Check className="size-4" /> : <ShoppingCart className="size-4" />}
      {disabled
        ? dict.common.outOfStock
        : product.availability === "preorder"
          ? dict.common.preorder
          : dict.common.addToCart}
    </Button>
  )
}
