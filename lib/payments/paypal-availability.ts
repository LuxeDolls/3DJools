// Original PayPal checkout. Checked on each request so it turns off without a restart.
const PAYPAL_DISABLE_AT = Date.parse("2026-10-11T14:26:10.000Z")

export function isPaypalCheckoutEnabled(): boolean {
  return Date.now() < PAYPAL_DISABLE_AT
}
