const LEGACY_CONSENT_KEY = "voltika-cookie-consent"
export const CONSENT_KEY = "dnd3d-cookie-consent"
export const CONSENT_EVENT = "dnd3d:cookie-consent"

function storedConsent(): string | null {
  const current = localStorage.getItem(CONSENT_KEY)
  if (current) return current
  const legacy = localStorage.getItem(LEGACY_CONSENT_KEY)
  if (!legacy) return null
  localStorage.setItem(CONSENT_KEY, legacy)
  localStorage.removeItem(LEGACY_CONSENT_KEY)
  return legacy
}

export function hasStoredConsent(): boolean {
  try {
    return storedConsent() !== null
  } catch {
    return false
  }
}

type ConsentChoice = "all" | "essential"

type Gtag = (...args: unknown[]) => void

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: Gtag
  }
}

export function readConsent(): ConsentChoice | null {
  try {
    const saved = JSON.parse(storedConsent() || "null") as { value?: string } | null
    return saved?.value === "all" || saved?.value === "essential" ? saved.value : null
  } catch {
    return null
  }
}

export function applyAnalyticsConsent(value: ConsentChoice | null) {
  const granted = value === "all" ? "granted" : "denied"
  window.dataLayer = window.dataLayer || []
  window.gtag =
    window.gtag ||
    function gtag(...args: unknown[]) {
      window.dataLayer?.push(args)
    }
  window.gtag("consent", "update", {
    analytics_storage: granted,
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  })
  window.dispatchEvent(new Event(CONSENT_EVENT))
}
