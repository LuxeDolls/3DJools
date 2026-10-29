// Registered-member discount. Centralized here so display (cart/checkout) and
// server-side order creation (Step 3) apply the exact same rule.
export const MEMBER_DISCOUNT_PERCENT = 7
export const MEMBER_DISCOUNT_RATE = MEMBER_DISCOUNT_PERCENT / 100

// Discount amount in integer cents, rounded to the nearest cent.
export function memberDiscountCents(subtotalCents: number): number {
  if (subtotalCents <= 0) return 0
  return Math.round(subtotalCents * MEMBER_DISCOUNT_RATE)
}

// Subtotal after the member discount is applied.
export function applyMemberDiscount(subtotalCents: number): number {
  return subtotalCents - memberDiscountCents(subtotalCents)
}

// Black Friday promo: unlike the member discount, this is baked directly into
// every product's listed price_cents (catalog-wide), not applied as a separate
// checkout line item. Kept here only as the documented rate so the catalog
// migration and marketing copy agree on the number.
export const BLACK_FRIDAY_DISCOUNT_PERCENT = 10
