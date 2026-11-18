"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import Script from "next/script"
import { STAMPED_PUBLIC_API_KEY, STAMPED_STORE_HASH } from "@/lib/reviews/stamped"

declare global {
  interface Window {
    StampedFn?: {
      init: (options: { apiKey: string; sId: string; storeUrl?: string }) => void
      reloadUGC?: () => void
      loadWidget?: (force?: boolean) => void
      loadDisplayWidgets?: () => void
      loadBadges?: () => void
    }
    jQueryStamped?: (selector: string) => {
      attr: (name: string) => string | undefined
    }
  }
}

export function initOrReloadStamped() {
  if (typeof window === "undefined" || !window.StampedFn) return
  try {
    window.StampedFn.init({
      apiKey: STAMPED_PUBLIC_API_KEY,
      sId: STAMPED_STORE_HASH,
      storeUrl: STAMPED_STORE_HASH,
    })
    if (typeof window.StampedFn.reloadUGC === "function") {
      window.StampedFn.reloadUGC()
    } else {
      window.StampedFn.loadWidget?.(true)
      window.StampedFn.loadDisplayWidgets?.()
    }
  } catch {
    // Ignore transient third-party widget init errors
  }
}

export function StampedProvider() {
  const pathname = usePathname()

  useEffect(() => {
    function handleReviewsLoaded() {
      if (typeof window === "undefined" || typeof window.jQueryStamped === "undefined") {
        return
      }

      const ratingCountRaw = window.jQueryStamped('meta[itemprop="reviewCount"]').attr("content")
      const ratingValueRaw = window.jQueryStamped('meta[itemprop="ratingValue"]').attr("content")
      const ratingCount = ratingCountRaw ? parseInt(ratingCountRaw, 10) : 0
      const ratingValue = ratingValueRaw ? parseFloat(ratingValueRaw) : 0

      if (document.querySelector("script[data-stamped-rich-snippet]")) {
        return
      }

      const richSnippet: Record<string, unknown> = {
        "@context": "http://schema.org",
        "@type": "Product",
        "@id": `${window.location.href}#product`,
      }

      if (ratingValue > 0 && ratingCount > 0) {
        richSnippet.aggregateRating = {
          "@type": "AggregateRating",
          ratingValue,
          reviewCount: ratingCount,
        }
      } else {
        return
      }

      const script = document.createElement("script")
      script.type = "application/ld+json"
      script.setAttribute("data-stamped-rich-snippet", "true")
      script.innerHTML = JSON.stringify(richSnippet)
      document.head.appendChild(script)
    }

    document.addEventListener("stamped:reviews:loaded", handleReviewsLoaded)
    return () => {
      document.removeEventListener("stamped:reviews:loaded", handleReviewsLoaded)
    }
  }, [])

  useEffect(() => {
    const existing = document.querySelector("script[data-stamped-rich-snippet]")
    if (existing) {
      existing.remove()
    }
    const timer = window.setTimeout(() => {
      initOrReloadStamped()
    }, 150)
    return () => window.clearTimeout(timer)
  }, [pathname])

  return (
    <Script
      id="stamped-widget-js"
      src="https://cdn1.stamped.io/files/widget.min.js"
      strategy="afterInteractive"
      onLoad={() => {
        initOrReloadStamped()
      }}
    />
  )
}
