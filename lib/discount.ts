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

// Site-wide Black Friday promo. Unlike the member discount, this applies to
// every customer (signed in or not) and is auto-applied at checkout, no code
// entry required. The code string is still shown in the banner and at
// checkout so the discount is visibly tied to the promotion.
export const BLACK_FRIDAY_PROMO_CODE = "BLACKFRIDAY10"
export const BLACK_FRIDAY_DISCOUNT_PERCENT = 10
export const BLACK_FRIDAY_DISCOUNT_RATE = BLACK_FRIDAY_DISCOUNT_PERCENT / 100

export function blackFridayDiscountCents(subtotalCents: number): number {
  if (subtotalCents <= 0) return 0
  return Math.round(subtotalCents * BLACK_FRIDAY_DISCOUNT_RATE)
}
