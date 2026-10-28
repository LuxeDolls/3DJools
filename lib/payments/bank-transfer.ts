import type { Locale } from "@/lib/i18n/config"

// Set to false to hide bank transfer (SEPA) checkout.
export const BANK_TRANSFER_CHECKOUT_ENABLED = false

const BANK_TRANSFER_ALLOWED_EMAILS = new Set<string>([])

export function isBankTransferCheckoutEnabled(email?: string | null) {
  if (BANK_TRANSFER_CHECKOUT_ENABLED) return true
  const normalized = email?.trim().toLowerCase()
  return Boolean(normalized && BANK_TRANSFER_ALLOWED_EMAILS.has(normalized))
}

export const BANK_TRANSFER_OFF_USP: Record<Locale, string> = {
  en: "Card payment or 4× instalments. Bank transfer (SEPA) is temporarily unavailable.",
  de: "Kartenzahlung oder 4× Raten. Banküberweisung (SEPA) ist vorübergehend nicht verfügbar.",
  fr: "Paiement par carte ou 4× sans frais. Le virement bancaire (SEPA) est temporairement indisponible.",
  it: "Pagamento con carta o 4× senza interessi. Il bonifico bancario (SEPA) è temporaneamente non disponibile.",
  es: "Pago con tarjeta o 4× sin intereses. La transferencia bancaria (SEPA) no está disponible temporalmente.",
  nl: "Betalen met kaart of 4× rentevrij. Bankoverschrijving (SEPA) is tijdelijk niet beschikbaar.",
}

export const BANK_TRANSFER_OFF_METHODS_NOTE: Record<Locale, string> = {
  en: "All prices are shown in euro (EUR) and include VAT where applicable. Card payments are charged on a secure payment page. Apple Pay, Link and Bancontact are available when you pay by card. We never see your card number. Instalment plans split your order into four equal, interest-free payments over two months. Bank transfer (SEPA) is temporarily unavailable.",
  de: "Alle Preise werden in Euro (EUR) angezeigt und enthalten die Mehrwertsteuer, soweit anwendbar. Kartenzahlungen werden auf einer sicheren Zahlungsseite abgewickelt. Apple Pay, Link und Bancontact stehen bei Kartenzahlung zur Verfügung. Die Ratenzahlung teilt die Bestellung in vier gleiche, zinsfreie Zahlungen über zwei Monate. Banküberweisung (SEPA) ist vorübergehend nicht verfügbar.",
  fr: "Tous les prix sont affichés en euros (EUR) et incluent la TVA lorsqu'elle s'applique. Les paiements par carte sont effectués sur une page sécurisée. Apple Pay, Link et Bancontact sont disponibles lors du paiement par carte. Le paiement en plusieurs fois divise la commande en quatre versements égaux, sans intérêt, sur deux mois. Le virement bancaire (SEPA) est temporairement indisponible.",
  it: "Tutti i prezzi sono in euro (EUR) e includono l'IVA, se applicabile. I pagamenti con carta avvengono su una pagina sicura. Apple Pay, Link e Bancontact sono disponibili pagando con carta. Il pagamento a rate divide l'ordine in quattro rate uguali, senza interessi, in due mesi. Il bonifico bancario (SEPA) è temporaneamente non disponibile.",
  es: "Todos los precios se muestran en euros (EUR) e incluyen el IVA cuando corresponde. Los pagos con tarjeta se realizan en una página segura. Apple Pay, Link y Bancontact están disponibles al pagar con tarjeta. El pago a plazos divide el pedido en cuatro pagos iguales, durante dos meses. La transferencia bancaria (SEPA) no está disponible temporalmente.",
  nl: "Alle prijzen staan in euro (EUR) en zijn inclusief btw waar van toepassing. Kaartbetalingen verlopen via een beveiligde betaalpagina. Apple Pay, Link en Bancontact zijn beschikbaar bij kaartbetaling. Gespreide betaling deelt de bestelling in vier gelijke, rentevrije betalingen over twee maanden. Bankoverschrijving (SEPA) is tijdelijk niet beschikbaar.",
}

// SEPA receiving account (Finom), shown at checkout and on order confirmation for the
// "sepa" / bank_transfer payment method.
export const BANK_TRANSFER_ACCOUNT = {
  accountName: "BWB Group",
  iban: "NL89 FNOM 0816 2512 10",
  bic: "FNOMNL22XXX",
  bankAddress: "Finom Payments BV, Jachthavenweg 109H, 1081 KM Amsterdam, Netherlands",
} as const
