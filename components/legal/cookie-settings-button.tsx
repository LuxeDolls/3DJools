"use client"

import { useI18n } from "@/components/i18n-provider"
import { OPEN_COOKIE_SETTINGS_EVENT } from "@/components/legal/cookie-consent"

export function CookieSettingsButton() {
  const { dict } = useI18n()

  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS_EVENT))}
      className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
    >
      {dict.cookies.manage}
    </button>
  )
}
