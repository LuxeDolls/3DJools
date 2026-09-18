/**
 * Single source of truth for shipping pricing, used by both the checkout UI
 * and the server action that places orders (orders.ts recomputes everything
 * from this module too — it never trusts a shipping cost sent by the client).
 *
 * Belgium gets a lower flat rate since it's the domestic market; every other
 * destination we ship to pays a higher flat rate that reflects the real cost
 * of shipping large/heavy 3D printing equipment internationally. Either rate
 * is waived once the subtotal reaches the free-shipping threshold.
 */

export const FREE_SHIPPING_THRESHOLD_CENTS = 25000
export const SHIPPING_BELGIUM_CENTS = 490
export const SHIPPING_INTERNATIONAL_CENTS = 1499

export function isBelgium(country: string | null | undefined): boolean {
  return (country ?? "").trim().toLowerCase() === "belgium"
}

export function shippingRateCents(country: string | null | undefined): number {
  return isBelgium(country) ? SHIPPING_BELGIUM_CENTS : SHIPPING_INTERNATIONAL_CENTS
}

export function computeShippingCents(subtotalCents: number, country: string | null | undefined): number {
  if (subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS) return 0
  return shippingRateCents(country)
}

// Countries selectable at checkout: Belgium (domestic rate) plus the rest of
// the EU and the handful of nearby non-EU countries we already ship to per
// the shipping policy page. All pay the flat international rate.
export const SHIPPING_COUNTRIES: string[] = [
  "Belgium",
  "Austria",
  "Bulgaria",
  "Croatia",
  "Cyprus",
  "Czechia",
  "Denmark",
  "Estonia",
  "Finland",
  "France",
  "Germany",
  "Greece",
  "Hungary",
  "Ireland",
  "Italy",
  "Latvia",
  "Lithuania",
  "Luxembourg",
  "Malta",
  "Netherlands",
  "Norway",
  "Poland",
  "Portugal",
  "Romania",
  "Slovakia",
  "Slovenia",
  "Spain",
  "Sweden",
  "Switzerland",
  "United Kingdom",
]
