import type { Locale } from "@/lib/i18n/config"

// Live Checkout uses key_3 and STRIPE_ACCESS_TOKEN_3. Do not fall back to the old keys.
// Temporarily off. Buyers cannot select card, and no new Stripe session can be opened.
// Existing returns and webhooks still settle. Set this back to true to restore card checkout.
export const STRIPE_CHECKOUT_ENABLED = false

export const STRIPE_OFF_USP: Record<Locale, string> = {
  en: "SEPA bank transfer or 4× instalments. Card payment is temporarily unavailable.",
  de: "SEPA-Überweisung oder 4× Raten. Kartenzahlung ist vorübergehend nicht verfügbar.",
  fr: "Virement SEPA ou 4× sans frais. Le paiement par carte est temporairement indisponible.",
  it: "Bonifico SEPA o 4× senza interessi. Il pagamento con carta è temporaneamente non disponibile.",
  es: "Transferencia SEPA o 4× sin intereses. El pago con tarjeta no está disponible temporalmente.",
  nl: "SEPA-overschrijving of 4× rentevrij. Betalen met kaart is tijdelijk niet beschikbaar.",
}

export const STRIPE_OFF_METHODS_NOTE: Record<Locale, string> = {
  en: "All prices are shown in euro (EUR) and include VAT where applicable. Card payment is temporarily unavailable. Instalment plans split your order into four equal, interest-free payments over two months. Bank transfer (SEPA) orders are reserved and dispatched once payment is received on our IBAN, which is shown at checkout and on your order confirmation.",
  de: "Alle Preise werden in Euro (EUR) angezeigt und enthalten die Mehrwertsteuer, soweit anwendbar. Kartenzahlung ist vorübergehend nicht verfügbar. Die Ratenzahlung teilt die Bestellung in vier gleiche, zinsfreie Zahlungen über zwei Monate. Bestellungen per SEPA-Überweisung werden reserviert und versendet, sobald die Zahlung auf unserer IBAN eingegangen ist. Die Bankdaten sehen Sie an der Kasse und in der Bestellbestätigung.",
  fr: "Tous les prix sont affichés en euros (EUR) et incluent la TVA lorsqu'elle s'applique. Le paiement par carte est temporairement indisponible. Le paiement en plusieurs fois divise la commande en quatre versements égaux, sans intérêt, sur deux mois. Les commandes par virement SEPA sont réservées et expédiées dès réception du paiement sur notre IBAN, indiqué lors du paiement et dans la confirmation de commande.",
  it: "Tutti i prezzi sono in euro (EUR) e includono l'IVA, se applicabile. Il pagamento con carta è temporaneamente non disponibile. Il pagamento a rate divide l'ordine in quattro rate uguali, senza interessi, in due mesi. Gli ordini con bonifico SEPA vengono riservati e spediti quando il pagamento arriva sul nostro IBAN, indicato al checkout e nella conferma d'ordine.",
  es: "Todos los precios se muestran en euros (EUR) e incluyen el IVA cuando corresponde. El pago con tarjeta no está disponible temporalmente. El pago a plazos divide el pedido en cuatro pagos iguales, sin intereses, durante dos meses. Los pedidos por transferencia SEPA se reservan y se envían cuando recibimos el pago en nuestro IBAN, que se muestra en el pago y en la confirmación del pedido.",
  nl: "Alle prijzen staan in euro (EUR) en zijn inclusief btw waar van toepassing. Betalen met kaart is tijdelijk niet beschikbaar. Gespreide betaling deelt de bestelling in vier gelijke, rentevrije betalingen over twee maanden. Bestellingen per SEPA-overschrijving worden gereserveerd en verzonden zodra de betaling op onze IBAN is ontvangen. De bankgegevens staan bij het afrekenen en in de orderbevestiging.",
}
