// Single source of truth for shipping rates and destinations.
// Keep this in sync with the values quoted on the Shipping page, FAQ, checkout,
// and whatever is configured in Google Merchant Center's account-level shipping settings.
// GMC does not support a "free over X" threshold inside a per-item <g:shipping> feed tag —
// that must be configured as a conditional/promotion in the Merchant Center account itself
// using the same numbers below.

export const FREE_SHIPPING_THRESHOLD_CENTS = 25_000 // €250

export const DOMESTIC_RATE_CENTS = 490 // €4.90 — Belgium
export const INTERNATIONAL_RATE_CENTS = 1499 // €14.99 — rest of EU + neighbouring countries

export const DELIVERY_TIME_LABEL = "5–10 working days"
export const DISPATCH_TIME_LABEL = "within 48 business hours"

// Language-neutral numbers, used to build the translated delivery/dispatch phrase per locale.
export const DELIVERY_MIN_DAYS = 5
export const DELIVERY_MAX_DAYS = 10
export const DISPATCH_HOURS = 48

export const DOMESTIC_COUNTRY = { code: "BE", name: "Belgium" } as const

// Rest of the EU (26 members excluding Belgium) plus neighbouring countries we also ship to.
export const INTERNATIONAL_COUNTRIES = [
  { code: "AT", name: "Austria" },
  { code: "BG", name: "Bulgaria" },
  { code: "HR", name: "Croatia" },
  { code: "CY", name: "Cyprus" },
  { code: "CZ", name: "Czechia" },
  { code: "DK", name: "Denmark" },
  { code: "EE", name: "Estonia" },
  { code: "FI", name: "Finland" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "GR", name: "Greece" },
  { code: "HU", name: "Hungary" },
  { code: "IE", name: "Ireland" },
  { code: "IT", name: "Italy" },
  { code: "LV", name: "Latvia" },
  { code: "LT", name: "Lithuania" },
  { code: "LU", name: "Luxembourg" },
  { code: "MT", name: "Malta" },
  { code: "NL", name: "Netherlands" },
  { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" },
  { code: "RO", name: "Romania" },
  { code: "SK", name: "Slovakia" },
  { code: "SI", name: "Slovenia" },
  { code: "ES", name: "Spain" },
  { code: "SE", name: "Sweden" },
  { code: "CH", name: "Switzerland" },
  { code: "NO", name: "Norway" },
  { code: "GB", name: "United Kingdom" },
] as const

export const ALL_SHIPPING_COUNTRIES = [DOMESTIC_COUNTRY, ...INTERNATIONAL_COUNTRIES]
