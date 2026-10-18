/**
 * Single source of truth for shipping pricing, used by both the checkout UI
 * and the server action that places orders (orders.ts recomputes everything
 * from this module too — it never trusts a shipping cost sent by the client).
 *
 * The store now offers free shipping on every order, to every destination we
 * deliver to — no minimum spend required.
 */

export function isBelgium(country: string | null | undefined): boolean {
  return (country ?? "").trim().toLowerCase() === "belgium"
}

export function shippingRateCents(_country: string | null | undefined): number {
  return 0
}

export function computeShippingCents(_subtotalCents: number, _country: string | null | undefined): number {
  return 0
}

// Countries selectable at checkout: the Netherlands plus the rest of the EU and the
// handful of nearby non-EU countries we already ship to per the shipping
// policy page. Shipping is free to every one of them.
export const SHIPPING_COUNTRIES: string[] = [
  "Netherlands",
  "Austria",
  "Belgium",
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
