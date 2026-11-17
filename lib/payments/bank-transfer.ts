import type { Locale } from "@/lib/i18n/config"

// Set to true to show bank transfer (SEPA) checkout.
export const BANK_TRANSFER_CHECKOUT_ENABLED = true

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
  en: "Every catalogue price is listed in euro (EUR) and includes applicable VAT. Visa and Mastercard transactions are settled in euros on an encrypted payment page, and your card number is never shared with us. With Open Banking, you can authorise an instant transfer directly from your bank account. Our 4× instalment plan divides eligible orders (€1,000+) into four equal, interest-free payments over two months.",
  de: "Sämtliche Preise verstehen sich in Euro (EUR) inklusive gesetzlicher Mehrwertsteuer, sofern anwendbar. Zahlungen per Visa und Mastercard werden in Euro über eine verschlüsselte Zahlungsseite abgewickelt, ohne dass wir Ihre Kartennummer einsehen können. Über Open Banking zahlen Sie direkt von Ihrem Bankkonto. Unsere 4×-Ratenzahlung teilt berechtigte Bestellungen (ab 1.000 €) in vier gleiche, zinsfreie Raten über zwei Monate auf.",
  fr: "Tous les prix sont exprimés en euros (EUR) et comprennent la TVA applicable. Les règlements par Visa et Mastercard s'effectuent en euros sur une page de paiement chiffrée, sans que votre numéro de carte ne nous soit communiqué. L'Open Banking permet un paiement instantané depuis votre compte bancaire. Le paiement en 4× répartit les commandes éligibles (dès 1 000 €) en quatre échéances égales sans frais sur deux mois.",
  it: "Tutti i prezzi sono indicati in euro (EUR) e includono l'IVA prevista dalla legge. Le transazioni con Visa e Mastercard vengono regolate in euro su una pagina protetta, senza che il numero della carta sia mai visibile a noi. Con Open Banking paghi istantaneamente dal tuo conto bancario. Il piano rateale 4× suddivide gli ordini idonei (da 1.000 €) in quattro quote uguali a tasso zero in due mesi.",
  es: "Todos los precios se indican en euros (EUR) con el IVA aplicable incluido. Los cobros con Visa y Mastercard se procesan en euros en una pasarela cifrada sin que tengamos acceso al número de tu tarjeta. Con Open Banking abonas tu compra al instante desde tu cuenta bancaria. El plan en 4× divide los pedidos elegibles (desde 1.000 €) en cuatro pagos iguales sin intereses durante dos meses.",
  nl: "Alle prijzen worden weergegeven in euro (EUR) inclusief toepasselijke btw. Betalingen met Visa en Mastercard worden in euro verwerkt op een versleutelde betaalpagina, waarbij wij uw kaartnummer nooit te zien krijgen. Met Open Banking betaalt u direct vanaf uw bankrekening. Ons 4×-termijnplan verdeelt geschikte bestellingen (vanaf € 1.000) in vier gelijke, rentevrije betalingen over twee maanden.",
}

// SEPA receiving account (ClearBank Europe N.V.), shown at checkout and on order confirmation for
// the "sepa" / bank_transfer payment method.
export const BANK_TRANSFER_ACCOUNT = {
  accountName: "NOVATECH SYSTEMS SIA",
  iban: "NL39 CLRB 0035 7984 54",
  bic: "CLRBNL2A007",
  bankAddress: "CLEARBANK EUROPE N.V.",
} as const
