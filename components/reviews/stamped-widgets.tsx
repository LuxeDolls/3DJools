"use client"

import { useEffect } from "react"
import { initOrReloadStamped } from "./stamped-provider"

export function StampedStarBadge({
  productId,
  productSku,
  productTitle,
  className,
}: {
  productId: string
  productSku?: string
  productTitle?: string
  className?: string
}) {
  return (
    <span
      className={`stamped-product-reviews-badge stamped-main-badge ${className ?? ""}`.trim()}
      data-id={productId}
      data-product-sku={productSku}
      data-product-title={productTitle}
    />
  )
}

export function StampedMainWidget({
  productId,
  name,
  url,
  imageUrl,
  description,
  productSku,
}: {
  productId: string
  name: string
  url: string
  imageUrl?: string
  description?: string
  productSku?: string
}) {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      initOrReloadStamped()
    }, 100)
    return () => window.clearTimeout(timer)
  }, [productId])

  return (
    <section aria-label="Customer reviews" className="mt-12 sm:mt-16">
      <div
        id="stamped-main-widget"
        data-product-id={productId}
        data-name={name}
        data-url={url}
        data-image-url={imageUrl}
        data-description={description}
        data-product-sku={productSku}
      />
    </section>
  )
}
