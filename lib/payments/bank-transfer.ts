import type { Locale } from "@/lib/i18n/config"

// Set to true to show bank transfer (SEPA) checkout.
export const BANK_TRANSFER_CHECKOUT_ENABLED = false

const BANK_TRANSFER_ALLOWED_EMAILS = new Set<string>([])

export function isBankTransferCheckoutEnabled(email?: string | null) {
  if (BANK_TRANSFER_CHECKOUT_ENABLED) return true
  const normalized = email?.trim().toLowerCase()
  return Boolean(normalized && BANK_TRANSFER_ALLOWED_EMAILS.has(normalized))
}

export const BANK_TRANSFER_OFF_USP: Record<Locale, string> = {
  en: "Visa, Mastercard or 4× interest-free instalments.",
  de: "Visa, Mastercard oder 4× zinsfreie Raten.",
  fr: "Visa, Mastercard ou 4× sans frais.",
  it: "Visa, Mastercard o 4× senza interessi.",
  es: "Visa, Mastercard o 4× sin intereses.",
  nl: "Visa, Mastercard of 4× rentevrij.",
}

export const BANK_TRANSFER_OFF_METHODS_NOTE: Record<Locale, string> = {
  en: "All prices are shown in euro (EUR) and include VAT where applicable. Visa and Mastercard payments are processed in euros on ZEN.COM's secure hosted payment page. We never see your card number. Instalment plans split your order into four equal, interest-free payments over two months.",
  de: "Alle Preise werden in Euro (EUR) angezeigt und enthalten die Mehrwertsteuer, soweit anwendbar. Zahlungen mit Visa und Mastercard werden in Euro auf der sicheren Zahlungsseite von ZEN.COM abgewickelt. Wir sehen Ihre Kartennummer nie. Die Ratenzahlung teilt die Bestellung in vier gleiche, zinsfreie Zahlungen über zwei Monate.",
  fr: "Tous les prix sont affichés en euros (EUR) et incluent la TVA lorsqu'elle s'applique. Les paiements par Visa et Mastercard sont traités en euros sur la page de paiement sécurisée de ZEN.COM. Nous ne voyons jamais votre numéro de carte. Le paiement en plusieurs fois divise la commande en quatre versements égaux, sans intérêt, sur deux mois.",
  it: "Tutti i prezzi sono in euro (EUR) e includono l'IVA, se applicabile. I pagamenti con Visa e Mastercard vengono elaborati in euro sulla pagina di pagamento sicura di ZEN.COM. Non vediamo mai il numero della carta. Il pagamento a rate divide l'ordine in quattro rate uguali, senza interessi, in due mesi.",
  es: "Todos los precios se muestran en euros (EUR) e incluyen el IVA cuando corresponde. Los pagos con Visa y Mastercard se procesan en euros en la página de pago segura de ZEN.COM. Nunca vemos el número de tu tarjeta. El pago a plazos divide el pedido en cuatro pagos iguales, sin intereses, durante dos meses.",
  nl: "Alle prijzen staan in euro (EUR) en zijn inclusief btw waar van toepassing. Betalingen met Visa en Mastercard worden in euro verwerkt op de beveiligde betaalpagina van ZEN.COM. Wij zien uw kaartnummer nooit. Gespreide betaling deelt de bestelling in vier gelijke, rentevrije betalingen over twee maanden.",
}

// SEPA receiving account (Finom), shown at checkout and on order confirmation for
// the "sepa" / bank_transfer payment method.
export const BANK_TRANSFER_ACCOUNT = {
  accountName: "Mutable Atoll-Unipessoal Lda",
  iban: "NL10 FNOM 0823 8359 95",
  bic: "FNOMNL22",
  bankAddress: "FINOM PAYMENTS",
} as const
