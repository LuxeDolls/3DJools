/** Direct-link payment test. Never list, index, or put this in a shopping feed. */
export const CARD_PAYMENT_TEST_SLUG = "test-card-payment"

export function isCardPaymentTest(slug: string): boolean {
  return slug === CARD_PAYMENT_TEST_SLUG
}
