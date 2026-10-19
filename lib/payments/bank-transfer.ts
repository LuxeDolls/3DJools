// On for every checkout. The address list below is only used while this is off.
export const BANK_TRANSFER_CHECKOUT_ENABLED = true

const BANK_TRANSFER_ALLOWED_EMAILS = new Set(["stephan15@telfort.nl"])

export function isBankTransferCheckoutEnabled(email?: string | null) {
  if (BANK_TRANSFER_CHECKOUT_ENABLED) return true
  const normalized = email?.trim().toLowerCase()
  return Boolean(normalized && BANK_TRANSFER_ALLOWED_EMAILS.has(normalized))
}

// SEPA receiving account (Finom), shown at checkout and on order confirmation for the
// "sepa" / bank_transfer payment method.
export const BANK_TRANSFER_ACCOUNT = {
  accountName: "VORTIK L",
  iban: "NL42 FNOM 0839 7083 05",
  bic: "FNOMNL22XXX",
  bankAddress: "Finom Payments BV, Jachthavenweg 109H, 1081 KM Amsterdam, Netherlands",
} as const
