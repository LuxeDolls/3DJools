// Off while the receiving account is being changed. Existing unpaid orders still
// show the account below; new checkout orders cannot select bank transfer.
export const BANK_TRANSFER_CHECKOUT_ENABLED = false

// SEPA receiving account (Finom), shown at checkout and on order confirmation for the
// "sepa" / bank_transfer payment method.
export const BANK_TRANSFER_ACCOUNT = {
  accountName: "SEIMANIS S.R.O.",
  iban: "NL89 FNOM 0347 6766 08",
  bic: "FNOMNL22XXX",
  bankAddress: "Finom Payments BV, Jachthavenweg 109H, 1081 KM Amsterdam, Netherlands",
} as const
