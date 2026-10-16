// Off until bank transfer should be offered again. Existing unpaid orders still show the account below.
export const BANK_TRANSFER_CHECKOUT_ENABLED = false

// SEPA receiving account (Finom), shown at checkout and on order confirmation for the
// "sepa" / bank_transfer payment method.
export const BANK_TRANSFER_ACCOUNT = {
  accountName: "VORTIK L",
  iban: "NL42 FNOM 0839 7083 05",
  bic: "FNOMNL22XXX",
  bankAddress: "Finom Payments BV, Jachthavenweg 109H, 1081 KM Amsterdam, Netherlands",
} as const
