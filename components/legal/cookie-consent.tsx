"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import Link from "next/link"
import { Cookie } from "lucide-react"
import { useI18n, useLocalizedPath } from "@/components/i18n-provider"
import { applyAnalyticsConsent, CONSENT_KEY, readConsent } from "./consent"

export const OPEN_COOKIE_SETTINGS_EVENT = "voltika:open-cookie-settings"

export function CookieConsent() {
  const { dict } = useI18n()
  const lp = useLocalizedPath()
  const [visible, setVisible] = useState(false)
  const bannerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    applyAnalyticsConsent(readConsent())
    if (!localStorage.getItem(CONSENT_KEY)) {
      setVisible(true)
    }
    const reopen = () => setVisible(true)
    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, reopen)
    return () => window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, reopen)
  }, [])

  // While the fixed banner is on screen, reserve equal space at the bottom of
  // the page so it never overlaps interactive content (e.g. the checkout
  // "Place order" button sitting at the end of the page).
  useLayoutEffect(() => {
    if (!visible) return
    const apply = () => {
      const h = bannerRef.current?.offsetHeight ?? 0
      document.body.style.paddingBottom = `${h}px`
    }
    apply()
    const ro = new ResizeObserver(apply)
    if (bannerRef.current) ro.observe(bannerRef.current)
    window.addEventListener("resize", apply)
    return () => {
      ro.disconnect()
      window.removeEventListener("resize", apply)
      document.body.style.paddingBottom = ""
    }
  }, [visible])

  function choose(value: "all" | "essential") {
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify({ value, at: new Date().toISOString() }))
    } catch {
      // Ignore storage errors (e.g. private mode); banner still dismisses for this session.
    }
    applyAnalyticsConsent(value)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      ref={bannerRef}
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-consent-title"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 px-4 py-4 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-card/80"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Cookie className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
          <div className="flex flex-col gap-1">
            <p id="cookie-consent-title" className="text-sm font-semibold text-foreground">
              {dict.cookies.title}
            </p>
            <p className="text-pretty text-xs leading-relaxed text-muted-foreground">
              {dict.cookies.text}{" "}
              <Link href={lp("/cookie-policy")} className="font-medium text-primary underline-offset-4 hover:underline">
                {dict.cookies.learnMore}
              </Link>
            </p>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => choose("essential")}
            className="rounded-md border border-border px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
          >
            {dict.cookies.essentialOnly}
          </button>
          <button
            type="button"
            onClick={() => choose("all")}
            className="rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {dict.cookies.acceptAll}
          </button>
        </div>
      </div>
    </div>
  )
}
