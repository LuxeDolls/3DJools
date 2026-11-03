import type { Locale } from "@/lib/i18n/config"
import { countryCode } from "@/lib/payments/country-codes"

export const SKRILL_CHECKOUT_ENABLED = true

export const SKRILL_MERCHANT_ID = "362079454"
export const SKRILL_RECEIVING_EMAIL = "predaj@mrpool.sk"
export const SKRILL_CURRENCY = "EUR"
export const SKRILL_HOSTED_URL = "https://pay.skrill.com/"
export const SKRILL_CARD_MAX_CENTS = 500_000

export type SkrillMethod = "skrill_card" | "skrill_ideal"

export function isSkrillPayment(method: string | null | undefined): method is SkrillMethod {
  return method === "skrill_card" || method === "skrill_ideal"
}

export function isSkrillIdealCountry(country: string | null | undefined): boolean {
  const trimmed = country?.trim() ?? ""
  if (!trimmed) return false
  if (trimmed === "NL" || trimmed === "NLD") return true
  return countryCode(trimmed) === "NL"
}

export type SkrillMethodError = "invalid_total" | "skrill_card_limit" | "skrill_ideal_nl_only"

export function skrillMethodError(
  method: SkrillMethod,
  totalCents: number,
  country: string | null | undefined,
): SkrillMethodError | null {
  if (!Number.isFinite(totalCents) || !Number.isInteger(totalCents) || totalCents <= 0) {
    return "invalid_total"
  }
  if (method === "skrill_card" && totalCents > SKRILL_CARD_MAX_CENTS) {
    return "skrill_card_limit"
  }
  if (method === "skrill_ideal" && !isSkrillIdealCountry(country)) {
    return "skrill_ideal_nl_only"
  }
  return null
}

export const SKRILL_ACTIVE_USP: Record<Locale, string> = {
  en: "Visa, Mastercard, iDEAL (NL), SEPA bank transfer or 4× interest-free instalments.",
  de: "Visa, Mastercard, iDEAL (NL), SEPA-Überweisung oder 4× zinsfreie Raten.",
  fr: "Visa, Mastercard, iDEAL (NL), virement SEPA ou 4× sans frais.",
  it: "Visa, Mastercard, iDEAL (NL), bonifico SEPA o 4× senza interessi.",
  es: "Visa, Mastercard, iDEAL (NL), transferencia SEPA o 4× sin intereses.",
  nl: "Visa, Mastercard, iDEAL (NL), SEPA-overschrijving of 4× rentevrij.",
}

export const SKRILL_ACTIVE_METHODS_NOTE: Record<Locale, string> = {
  en: "All prices are shown in euro (EUR) and include VAT where applicable. Visa and Mastercard payments (up to €5,000 per order) and iDEAL payments (for orders shipped to the Netherlands) are processed in euros on Skrill's secure hosted payment page. We never see your card number or bank login. Instalment plans split your order into four equal, interest-free payments over two months. Bank transfer (SEPA) orders are reserved and dispatched once payment is received on our IBAN, which is shown at checkout and on your order confirmation.",
  de: "Alle Preise werden in Euro (EUR) angezeigt und enthalten die Mehrwertsteuer, soweit anwendbar. Zahlungen mit Visa und Mastercard (bis zu 5.000 € pro Bestellung) sowie iDEAL (für Bestellungen in die Niederlande) werden in Euro auf der sicheren Zahlungsseite von Skrill abgewickelt. Wir sehen weder Ihre Kartennummer noch Ihre Bankzugangsdaten. Die Ratenzahlung teilt die Bestellung in vier gleiche, zinsfreie Zahlungen über zwei Monate. Bestellungen per SEPA-Überweisung werden reserviert und versendet, sobald die Zahlung auf unserer IBAN eingegangen ist.",
  fr: "Tous les prix sont affichés en euros (EUR) et incluent la TVA lorsqu'elle s'applique. Les paiements par Visa et Mastercard (jusqu'à 5 000 € par commande) ainsi qu'iDEAL (pour les commandes aux Pays-Bas) sont traités en euros sur la page de paiement sécurisée de Skrill. Nous ne voyons jamais votre numéro de carte ni vos identifiants bancaires. Le paiement en plusieurs fois divise la commande en quatre versements égaux, sans intérêt, sur deux mois. Les commandes par virement SEPA sont réservées et expédiées dès réception du paiement sur notre IBAN.",
  it: "Tutti i prezzi sono in euro (EUR) e includono l'IVA, se applicabile. I pagamenti con Visa e Mastercard (fino a 5.000 € per ordine) e iDEAL (per gli ordini nei Paesi Bassi) vengono elaborati in euro sulla pagina di pagamento sicura di Skrill. Non vediamo mai il numero della carta né le credenziali bancarie. Il pagamento a rate divide l'ordine in quattro rate uguali, senza interessi, in due mesi. Gli ordini con bonifico SEPA vengono riservati e spediti quando il pagamento arriva sul nostro IBAN.",
  es: "Todos los precios se muestran en euros (EUR) e incluyen el IVA cuando corresponde. Los pagos con Visa y Mastercard (hasta 5.000 € por pedido) e iDEAL (para pedidos en los Países Bajos) se procesan en euros en la página de pago segura de Skrill. Nunca vemos el número de tu tarjeta ni tus credenciales bancarias. El pago a plazos divide el pedido en cuatro pagos iguales, sin intereses, durante dos meses. Los pedidos por transferencia SEPA se reservan y se envían cuando recibimos el pago en nuestro IBAN.",
  nl: "Alle prijzen staan in euro (EUR) en zijn inclusief btw waar van toepassing. Betalingen met Visa en Mastercard (tot € 5.000 per bestelling) en iDEAL (voor bestellingen binnen Nederland) worden in euro verwerkt op de beveiligde betaalpagina van Skrill. Wij zien uw kaartnummer of bankgegevens nooit. Gespreide betaling deelt de bestelling in vier gelijke, rentevrije betalingen over twee maanden. Bestellingen per SEPA-overschrijving worden gereserveerd en verzonden zodra de betaling op onze IBAN is ontvangen.",
}
