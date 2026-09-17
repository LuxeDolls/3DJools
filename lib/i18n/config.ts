export const locales = ["en", "de", "it", "fr", "nl", "es"] as const

export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = "en"

export const localeNames: Record<Locale, string> = {
  en: "English",
  de: "Deutsch",
  it: "Italiano",
  fr: "Français",
  nl: "Nederlands",
  es: "Español",
}

export const localeFlags: Record<Locale, string> = {
  en: "GB",
  de: "DE",
  it: "IT",
  fr: "FR",
  nl: "NL",
  es: "ES",
}

// BCP-47 tags used for hreflang + Intl number/date formatting.
export const localeHreflang: Record<Locale, string> = {
  en: "en",
  de: "de",
  it: "it",
  fr: "fr",
  nl: "nl",
  es: "es",
}

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value)
}

// Maps an ISO-3166 alpha-2 country code (as provided by the CDN geo header)
// to the storefront locale that best serves visitors from that country.
// Multilingual countries resolve to their most widely spoken option among the
// locales we support (e.g. Switzerland -> German, Belgium -> Dutch).
const localeByCountry: Record<string, Locale> = {
  // German
  DE: "de",
  AT: "de",
  CH: "de",
  LI: "de",
  LU: "de",
  // Italian
  IT: "it",
  SM: "it",
  VA: "it",
  // French
  FR: "fr",
  BE: "nl",
  MC: "fr",
  // Dutch
  NL: "nl",
  // Spanish (Spain + Spanish-speaking Latin America)
  ES: "es",
  MX: "es",
  AR: "es",
  CO: "es",
  CL: "es",
  PE: "es",
  VE: "es",
  EC: "es",
  GT: "es",
  CU: "es",
  BO: "es",
  DO: "es",
  HN: "es",
  PY: "es",
  SV: "es",
  NI: "es",
  CR: "es",
  PA: "es",
  UY: "es",
  // English-first markets
  GB: "en",
  US: "en",
  IE: "en",
  CA: "en",
  AU: "en",
  NZ: "en",
}

export function localeFromCountry(country: string | null | undefined): Locale | null {
  if (!country) return null
  return localeByCountry[country.toUpperCase()] ?? null
}
