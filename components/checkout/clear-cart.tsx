"use client"

import { useEffect } from "react"
import { useCart } from "@/components/cart/cart-provider"

/** Empties the cart after a document redirect, once checkout has left the page. */
export function ClearCart() {
  const { clear } = useCart()
  useEffect(() => {
    const id = window.setTimeout(clear, 0)
    return () => window.clearTimeout(id)
  }, [clear])
  return null
}
