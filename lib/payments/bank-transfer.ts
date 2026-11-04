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
  en: "Visa, Mastercard, iDEAL (NL) or 4× interest-free instalments.",
  de: "Visa, Mastercard, iDEAL (NL) oder 4× zinsfreie Raten.",
  fr: "Visa, Mastercard, iDEAL (NL) ou 4× sans frais.",
  it: "Visa, Mastercard, iDEAL (NL) o 4× senza interessi.",
  es: "Visa, Mastercard, iDEAL (NL) o 4× sin intereses.",
  nl: "Visa, Mastercard, iDEAL (NL) of 4× rentevrij.",
}

export const BANK_TRANSFER_OFF_METHODS_NOTE: Record<Locale, string> = {
  en: "All prices are shown in euro (EUR) and include VAT where applicable. Visa and Mastercard payments (up to €5,000 per order) and iDEAL payments (for orders shipped to the Netherlands) are processed in euros on Skrill's secure hosted payment page. We never see your card number or bank login. Instalment plans split your order into four equal, interest-free payments over two months.",
  de: "Alle Preise werden in Euro (EUR) angezeigt und enthalten die Mehrwertsteuer, soweit anwendbar. Zahlungen mit Visa und Mastercard (bis zu 5.000 € pro Bestellung) sowie iDEAL (für Bestellungen in die Niederlande) werden in Euro auf der sicheren Zahlungsseite von Skrill abgewickelt. Wir sehen weder Ihre Kartennummer noch Ihre Bankzugangsdaten. Die Ratenzahlung teilt die Bestellung in vier gleiche, zinsfreie Zahlungen über zwei Monate.",
  fr: "Tous les prix sont affichés en euros (EUR) et incluent la TVA lorsqu'elle s'applique. Les paiements par Visa et Mastercard (jusqu'à 5 000 € par commande) ainsi qu'iDEAL (pour les commandes aux Pays-Bas) sont traités en euros sur la page de paiement sécurisée de Skrill. Nous ne voyons jamais votre numéro de carte ni vos identifiants bancaires. Le paiement en plusieurs fois divise la commande en quatre versements égaux, sans intérêt, sur deux mois.",
  it: "Tutti i prezzi sono in euro (EUR) e includono l'IVA, se applicabile. I pagamenti con Visa e Mastercard (fino a 5.000 € per ordine) e iDEAL (per gli ordini nei Paesi Bassi) vengono elaborati in euro sulla pagina di pagamento sicura di Skrill. Non vediamo mai il numero della carta né le credenziali bancarie. Il pagamento a rate divide l'ordine in quattro rate uguali, senza interessi, in due mesi.",
  es: "Todos los precios se muestran en euros (EUR) e incluyen el IVA cuando corresponde. Los pagos con Visa y Mastercard (hasta 5.000 € por pedido) e iDEAL (para pedidos en los Países Bajos) se procesan en euros en la página de pago segura de Skrill. Nunca vemos el número de tu tarjeta ni tus credenciales bancarias. El pago a plazos divide el pedido en cuatro pagos iguales, sin intereses, durante dos meses.",
  nl: "Alle prijzen staan in euro (EUR) en zijn inclusief btw waar van toepassing. Betalingen met Visa en Mastercard (tot € 5.000 per bestelling) en iDEAL (voor bestellingen binnen Nederland) worden in euro verwerkt op de beveiligde betaalpagina van Skrill. Wij zien uw kaartnummer of bankgegevens nooit. Gespreide betaling deelt de bestelling in vier gelijke, rentevrije betalingen over twee maanden.",
}

// SEPA receiving account (Finom), shown at checkout and on order confirmation for
// the "sepa" / bank_transfer payment method.
export const BANK_TRANSFER_ACCOUNT = {
  accountName: "Mutable Atoll-Unipessoal Lda",
  iban: "NL10 FNOM 0823 8359 95",
  bic: "FNOMNL22",
  bankAddress: "FINOM PAYMENTS",
} as const
