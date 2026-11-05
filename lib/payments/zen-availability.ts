import type { Locale } from "@/lib/i18n/config"
import { BANK_TRANSFER_CHECKOUT_ENABLED } from "@/lib/payments/bank-transfer"

export const ZEN_CHECKOUT_ENABLED = true

export const ZEN_CURRENCY = "EUR"
export const ZEN_CHECKOUT_URL = "https://secure.zen.com/api/checkouts"
export const ZEN_API_BASE_URL = "https://api.zen.com/v1"

export type ZenLocaleCopy = {
  title: string
  desc: string
  note: string
  unavailable: string
  failed: string
  cancelled: string
}

export const ZEN_COPY: Record<Locale, ZenLocaleCopy> = {
  en: {
    title: "Visa / Mastercard",
    desc: "Secure card payment via ZEN.COM",
    note: "After you place the order, you are redirected to ZEN.COM's secure payment page to pay by Visa or Mastercard in euros. We never see your card number. If you have already paid, wait for the status to update and do not pay twice.",
    unavailable: "Card payment via ZEN.COM is temporarily unavailable.",
    failed: "The card payment was not completed. You can try again.",
    cancelled: "You cancelled the payment on ZEN.COM. You can try again or choose another payment method.",
  },
  de: {
    title: "Visa / Mastercard",
    desc: "Sichere Kartenzahlung über ZEN.COM",
    note: "Nach der Bestellung werden Sie zur sicheren Zahlungsseite von ZEN.COM weitergeleitet, um mit Visa oder Mastercard in Euro zu bezahlen. Wir sehen Ihre Kartennummer nie. Falls Sie bereits bezahlt haben, warten Sie auf die Statusaktualisierung und zahlen Sie nicht zweimal.",
    unavailable: "Kartenzahlung über ZEN.COM ist vorübergehend nicht verfügbar.",
    failed: "Die Kartenzahlung wurde nicht abgeschlossen. Sie können es erneut versuchen.",
    cancelled: "Sie haben die Zahlung bei ZEN.COM abgebrochen. Sie können es erneut versuchen oder eine andere Zahlungsart wählen.",
  },
  fr: {
    title: "Visa / Mastercard",
    desc: "Paiement sécurisé par carte via ZEN.COM",
    note: "Après avoir passé la commande, vous êtes redirigé vers la page de paiement sécurisée de ZEN.COM pour payer par Visa ou Mastercard en euros. Nous ne voyons jamais votre numéro de carte. Si vous avez déjà payé, attendez la mise à jour du statut et ne payez pas deux fois.",
    unavailable: "Le paiement par carte via ZEN.COM est temporairement indisponible.",
    failed: "Le paiement par carte n'a pas abouti. Vous pouvez réessayer.",
    cancelled: "Vous avez annulé le paiement sur ZEN.COM. Vous pouvez réessayer ou choisir un autre moyen de paiement.",
  },
  it: {
    title: "Visa / Mastercard",
    desc: "Pagamento sicuro con carta tramite ZEN.COM",
    note: "Dopo aver effettuato l'ordine, verrai reindirizzato alla pagina di pagamento sicura di ZEN.COM per pagare con Visa o Mastercard in euro. Non vediamo mai il numero della tua carta. Se hai già pagato, attendi l'aggiornamento dello stato e non pagare due volte.",
    unavailable: "Il pagamento con carta tramite ZEN.COM è temporaneamente non disponibile.",
    failed: "Il pagamento con carta non è stato completato. Puoi riprovare.",
    cancelled: "Hai annullato il pagamento su ZEN.COM. Puoi riprovare o scegliere un altro metodo di pagamento.",
  },
  es: {
    title: "Visa / Mastercard",
    desc: "Pago seguro con tarjeta a través de ZEN.COM",
    note: "Después de realizar el pedido, serás redirigido a la página de pago segura de ZEN.COM para pagar con Visa o Mastercard en euros. Nunca vemos el número de tu tarjeta. Si ya has pagado, espera a que se actualice el estado y no pagues dos veces.",
    unavailable: "El pago con tarjeta a través de ZEN.COM no está disponible temporalmente.",
    failed: "El pago con tarjeta no se completó. Puedes intentarlo de nuevo.",
    cancelled: "Has cancelado el pago en ZEN.COM. Puedes intentarlo de nuevo o elegir otro método de pago.",
  },
  nl: {
    title: "Visa / Mastercard",
    desc: "Veilige kaartbetaling via ZEN.COM",
    note: "Na het plaatsen van de bestelling wordt u doorgestuurd naar de beveiligde betaalpagina van ZEN.COM om in euro te betalen met Visa of Mastercard. Wij zien uw kaartnummer nooit. Heeft u al betaald, wacht dan op de statusupdate en betaal niet twee keer.",
    unavailable: "Kaartbetaling via ZEN.COM is tijdelijk niet beschikbaar.",
    failed: "De kaartbetaling is niet voltooid. U kunt het opnieuw proberen.",
    cancelled: "U heeft de betaling bij ZEN.COM geannuleerd. U kunt het opnieuw proberen of een andere betaalmethode kiezen.",
  },
}

export const ZEN_ACTIVE_USP: Record<Locale, string> = {
  en: BANK_TRANSFER_CHECKOUT_ENABLED
    ? "Visa, Mastercard, SEPA bank transfer or 4× interest-free instalments."
    : "Visa, Mastercard or 4× interest-free instalments.",
  de: BANK_TRANSFER_CHECKOUT_ENABLED
    ? "Visa, Mastercard, SEPA-Überweisung oder 4× zinsfreie Raten."
    : "Visa, Mastercard oder 4× zinsfreie Raten.",
  fr: BANK_TRANSFER_CHECKOUT_ENABLED
    ? "Visa, Mastercard, virement SEPA ou 4× sans frais."
    : "Visa, Mastercard ou 4× sans frais.",
  it: BANK_TRANSFER_CHECKOUT_ENABLED
    ? "Visa, Mastercard, bonifico SEPA o 4× senza interessi."
    : "Visa, Mastercard o 4× senza interessi.",
  es: BANK_TRANSFER_CHECKOUT_ENABLED
    ? "Visa, Mastercard, transferencia SEPA o 4× sin intereses."
    : "Visa, Mastercard o 4× sin intereses.",
  nl: BANK_TRANSFER_CHECKOUT_ENABLED
    ? "Visa, Mastercard, SEPA-overschrijving of 4× rentevrij."
    : "Visa, Mastercard of 4× rentevrij.",
}

export const ZEN_ACTIVE_METHODS_NOTE: Record<Locale, string> = {
  en: BANK_TRANSFER_CHECKOUT_ENABLED
    ? "All prices are shown in euro (EUR) and include VAT where applicable. Visa and Mastercard payments are processed in euros on ZEN.COM's secure hosted payment page. We never see your card number. Instalment plans split your order into four equal, interest-free payments over two months. Bank transfer (SEPA) orders are reserved and dispatched once payment is received on our IBAN, which is shown at checkout and on your order confirmation."
    : "All prices are shown in euro (EUR) and include VAT where applicable. Visa and Mastercard payments are processed in euros on ZEN.COM's secure hosted payment page. We never see your card number. Instalment plans split your order into four equal, interest-free payments over two months.",
  de: BANK_TRANSFER_CHECKOUT_ENABLED
    ? "Alle Preise werden in Euro (EUR) angezeigt und enthalten die Mehrwertsteuer, soweit anwendbar. Zahlungen mit Visa und Mastercard werden in Euro auf der sicheren Zahlungsseite von ZEN.COM abgewickelt. Wir sehen Ihre Kartennummer nie. Die Ratenzahlung teilt die Bestellung in vier gleiche, zinsfreie Zahlungen über zwei Monate. Bestellungen per SEPA-Überweisung werden reserviert und versendet, sobald die Zahlung auf unserer IBAN eingegangen ist."
    : "Alle Preise werden in Euro (EUR) angezeigt und enthalten die Mehrwertsteuer, soweit anwendbar. Zahlungen mit Visa und Mastercard werden in Euro auf der sicheren Zahlungsseite von ZEN.COM abgewickelt. Wir sehen Ihre Kartennummer nie. Die Ratenzahlung teilt die Bestellung in vier gleiche, zinsfreie Zahlungen über zwei Monate.",
  fr: BANK_TRANSFER_CHECKOUT_ENABLED
    ? "Tous les prix sont affichés en euros (EUR) et incluent la TVA lorsqu'elle s'applique. Les paiements par Visa et Mastercard sont traités en euros sur la page de paiement sécurisée de ZEN.COM. Nous ne voyons jamais votre numéro de carte. Le paiement en plusieurs fois divise la commande en quatre versements égaux, sans intérêt, sur deux mois. Les commandes par virement SEPA sont réservées et expédiées dès réception du paiement sur notre IBAN."
    : "Tous les prix sont affichés en euros (EUR) et incluent la TVA lorsqu'elle s'applique. Les paiements par Visa et Mastercard sont traités en euros sur la page de paiement sécurisée de ZEN.COM. Nous ne voyons jamais votre numéro de carte. Le paiement en plusieurs fois divise la commande en quatre versements égaux, sans intérêt, sur deux mois.",
  it: BANK_TRANSFER_CHECKOUT_ENABLED
    ? "Tutti i prezzi sono in euro (EUR) e includono l'IVA, se applicabile. I pagamenti con Visa e Mastercard vengono elaborati in euro sulla pagina di pagamento sicura di ZEN.COM. Non vediamo mai il numero della carta. Il pagamento a rate divide l'ordine in quattro rate uguali, senza interessi, in due mesi. Gli ordini con bonifico SEPA vengono riservati e spediti quando il pagamento arriva sul nostro IBAN."
    : "Tutti i prezzi sono in euro (EUR) e includono l'IVA, se applicabile. I pagamenti con Visa e Mastercard vengono elaborati in euro sulla pagina di pagamento sicura di ZEN.COM. Non vediamo mai il numero della carta. Il pagamento a rate divide l'ordine in quattro rate uguali, senza interessi, in due mesi.",
  es: BANK_TRANSFER_CHECKOUT_ENABLED
    ? "Todos los precios se muestran en euros (EUR) e incluyen el IVA cuando corresponde. Los pagos con Visa y Mastercard se procesan en euros en la página de pago segura de ZEN.COM. Nunca vemos el número de tu tarjeta. El pago a plazos divide el pedido en cuatro pagos iguales, sin intereses, durante dos meses. Los pedidos por transferencia SEPA se reservan y se envían cuando recibimos el pago en nuestro IBAN."
    : "Todos los precios se muestran en euros (EUR) e incluyen el IVA cuando corresponde. Los pagos con Visa y Mastercard se procesan en euros en la página de pago segura de ZEN.COM. Nunca vemos el número de tu tarjeta. El pago a plazos divide el pedido en cuatro pagos iguales, sin intereses, durante dos meses.",
  nl: BANK_TRANSFER_CHECKOUT_ENABLED
    ? "Alle prijzen staan in euro (EUR) en zijn inclusief btw waar van toepassing. Betalingen met Visa en Mastercard worden in euro verwerkt op de beveiligde betaalpagina van ZEN.COM. Wij zien uw kaartnummer nooit. Gespreide betaling deelt de bestelling in vier gelijke, rentevrije betalingen over twee maanden. Bestellingen per SEPA-overschrijving worden gereserveerd en verzonden zodra de betaling op onze IBAN is ontvangen."
    : "Alle prijzen staan in euro (EUR) en zijn inclusief btw waar van toepassing. Betalingen met Visa en Mastercard worden in euro verwerkt op de beveiligde betaalpagina van ZEN.COM. Wij zien uw kaartnummer nooit. Gespreide betaling deelt de bestelling in vier gelijke, rentevrije betalingen over twee maanden.",
}
