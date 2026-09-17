"use client"

import { Plus, Check } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { useCart } from "@/components/cart/cart-provider"
import type { Product } from "@/lib/catalog/types"

export function QuickAddButton({ product, label }: { product: Product; label: string }) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)
  const disabled = product.availability === "out_of_stock"

  function handleAdd() {
    addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      brand: product.brandName ?? product.brandSlug,
      priceCents: product.priceCents,
      image: product.images[0],
    })
    toast.success(label, { description: product.name })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={disabled}
      aria-label={`${label} — ${product.name}`}
      className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {added ? <Check className="size-4" /> : <Plus className="size-4" />}
    </button>
  )
}
