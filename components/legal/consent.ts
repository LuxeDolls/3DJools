export const CONSENT_KEY = "voltika-cookie-consent"
export const CONSENT_EVENT = "3djools:cookie-consent"

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
    const saved = JSON.parse(localStorage.getItem(CONSENT_KEY) || "null") as { value?: string } | null
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
