import type { Locale } from "@/lib/i18n/config"

// Live Checkout uses key_3 and STRIPE_ACCESS_TOKEN_3. Do not fall back to the old keys.
// Set this to false to hide card checkout and block new Stripe sessions.
export const STRIPE_CHECKOUT_ENABLED = true

export const STRIPE_OFF_USP: Record<Locale, string> = {
  en: "Card payment via SumUp, SEPA bank transfer, or 4× instalments. Apple Pay, Google Pay, Link, and Bancontact are temporarily unavailable.",
  de: "Kartenzahlung über SumUp, SEPA-Überweisung oder 4× Raten. Apple Pay, Google Pay, Link und Bancontact sind vorübergehend nicht verfügbar.",
  fr: "Paiement par carte via SumUp, virement SEPA ou 4× sans frais. Apple Pay, Google Pay, Link et Bancontact sont temporairement indisponibles.",
  it: "Pagamento con carta tramite SumUp, bonifico SEPA o 4× senza interessi. Apple Pay, Google Pay, Link e Bancontact sono temporaneamente non disponibili.",
  es: "Pago con tarjeta a través de SumUp, transferencia SEPA o 4× sin intereses. Apple Pay, Google Pay, Link y Bancontact no están disponibles temporalmente.",
  nl: "Betalen met kaart via SumUp, SEPA-overschrijving of 4× rentevrij. Apple Pay, Google Pay, Link en Bancontact zijn tijdelijk niet beschikbaar.",
}

export const STRIPE_OFF_METHODS_NOTE: Record<Locale, string> = {
  en: "All prices are shown in euro (EUR) and include VAT where applicable. Card payment is available via SumUp's secure checkout. Apple Pay, Google Pay, Link, and Bancontact are temporarily unavailable. Instalment plans split your order into four equal, interest-free payments over two months. Bank transfer (SEPA) orders are reserved and dispatched once payment is received on our IBAN, which is shown at checkout and on your order confirmation.",
  de: "Alle Preise werden in Euro (EUR) angezeigt und enthalten die Mehrwertsteuer, soweit anwendbar. Kartenzahlung ist über die sichere Kasse von SumUp möglich. Apple Pay, Google Pay, Link und Bancontact sind vorübergehend nicht verfügbar. Die Ratenzahlung teilt die Bestellung in vier gleiche, zinsfreie Zahlungen über zwei Monate. Bestellungen per SEPA-Überweisung werden reserviert und versendet, sobald die Zahlung auf unserer IBAN eingegangen ist. Die Bankdaten sehen Sie an der Kasse und in der Bestellbestätigung.",
  fr: "Tous les prix sont affichés en euros (EUR) et incluent la TVA lorsqu'elle s'applique. Le paiement par carte est disponible via la caisse sécurisée de SumUp. Apple Pay, Google Pay, Link et Bancontact sont temporairement indisponibles. Le paiement en plusieurs fois divise la commande en quatre versements égaux, sans intérêt, sur deux mois. Les commandes par virement SEPA sont réservées et expédiées dès réception du paiement sur notre IBAN, indiqué lors du paiement et dans la confirmation de commande.",
  it: "Tutti i prezzi sono in euro (EUR) e includono l'IVA, se applicabile. Il pagamento con carta è disponibile tramite la cassa sicura di SumUp. Apple Pay, Google Pay, Link e Bancontact sono temporaneamente non disponibili. Il pagamento a rate divide l'ordine in quattro rate uguali, senza interessi, in due mesi. Gli ordini con bonifico SEPA vengono riservati e spediti quando il pagamento arriva sul nostro IBAN, indicato al checkout e nella conferma d'ordine.",
  es: "Todos los precios se muestran en euros (EUR) e incluyen el IVA cuando corresponde. El pago con tarjeta está disponible a través de la caja segura de SumUp. Apple Pay, Google Pay, Link y Bancontact no están disponibles temporalmente. El pago a plazos divide el pedido en cuatro pagos iguales, sin intereses, durante dos meses. Los pedidos por transferencia SEPA se reservan y se envían cuando recibimos el pago en nuestro IBAN, que se muestra en el pago y en la confirmación del pedido.",
  nl: "Alle prijzen staan in euro (EUR) en zijn inclusief btw waar van toepassing. Betalen met kaart kan via de beveiligde kassa van SumUp. Apple Pay, Google Pay, Link en Bancontact zijn tijdelijk niet beschikbaar. Gespreide betaling deelt de bestelling in vier gelijke, rentevrije betalingen over twee maanden. Bestellingen per SEPA-overschrijving worden gereserveerd en verzonden zodra de betaling op onze IBAN is ontvangen. De bankgegevens staan bij het afrekenen en in de orderbevestiging.",
}
