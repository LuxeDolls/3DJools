"use client"

import { useEffect, useState } from "react"
import { Analytics } from "@vercel/analytics/next"
import { CONSENT_EVENT, readConsent } from "./consent"

export function OptionalAnalytics() {
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    const sync = () => setAllowed(readConsent() === "all")
    sync()
    window.addEventListener(CONSENT_EVENT, sync)
    return () => window.removeEventListener(CONSENT_EVENT, sync)
  }, [])

  if (!allowed || process.env.NODE_ENV !== "production") return null
  return <Analytics />
}
