"use client"

import { useEffect, useRef } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { readConsent } from "./consent"

const GA_ID = "G-CMCRK9MQT9"

export function GoogleTagRoute() {
  const pathname = usePathname()
  const search = useSearchParams()
  const first = useRef(true)

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    if (readConsent() !== "all" || typeof window.gtag !== "function") return
    const query = search.toString()
    window.gtag("event", "page_view", {
      send_to: GA_ID,
      page_path: query ? `${pathname}?${query}` : pathname,
    })
  }, [pathname, search])

  return null
}
