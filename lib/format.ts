import type { Locale } from "@/lib/i18n/config"

const localeToIntl: Record<Locale, string> = {
  en: "en-IE",
  de: "de-DE",
  it: "it-IT",
  fr: "fr-FR",
  nl: "nl-NL",
  es: "es-ES",
}

// All prices are stored as integer cents in EUR to avoid float errors.
export function formatPrice(cents: number, locale: Locale = "en"): string {
  return new Intl.NumberFormat(localeToIntl[locale], {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(cents / 100)
}

export function formatPriceRange(minCents: number, maxCents: number, locale: Locale = "en"): string {
  if (minCents === maxCents) return formatPrice(minCents, locale)
  return `${formatPrice(minCents, locale)} – ${formatPrice(maxCents, locale)}`
}
