import type { Locale } from "@/lib/i18n/config"

export type NgeniusCopy = {
  methodTitle: string
  methodDesc: string
  checkoutNote: string
  payNow: string
  processing: string
  loadingForm: string
  reloadForm: string
  cardInvalid: string
  paymentFailed: string
  threeDsHint: string
  unavailable: string
}

const EN: NgeniusCopy = {
  methodTitle: "Visa / Mastercard (Direct)",
  methodDesc: "Pay directly on our checkout with 3D Secure",
  checkoutNote:
    "Enter your card details on the next step with 3D Secure verification to complete your payment.",
  payNow: "Pay {eur}",
  processing: "Processing payment…",
  loadingForm: "Loading secure card form…",
  reloadForm: "Reload card form",
  cardInvalid: "Please complete all card fields before paying.",
  paymentFailed:
    "The card payment could not be completed. Please check your details or try another payment method.",
  threeDsHint: "Complete the 3D Secure verification below to confirm your payment.",
  unavailable: "Direct card payment is temporarily unavailable.",
}

const COPY: Record<Locale, NgeniusCopy> = {
  en: EN,
  de: {
    methodTitle: "Visa / Mastercard (Direkt)",
    methodDesc: "Direkt per Karte mit 3D Secure bezahlen",
    checkoutNote:
      "Geben Sie Ihre Kartendaten im nächsten Schritt mit 3D-Secure-Prüfung ein, um Ihre Zahlung abzuschließen.",
    payNow: "{eur} bezahlen",
    processing: "Zahlung wird verarbeitet…",
    loadingForm: "Sicheres Kartenformular wird geladen…",
    reloadForm: "Formular neu laden",
    cardInvalid: "Bitte füllen Sie alle Kartenfelder vollständig aus.",
    paymentFailed:
      "Die Kartenzahlung konnte nicht abgeschlossen werden. Bitte prüfen Sie Ihre Daten oder wählen Sie eine andere Zahlungsart.",
    threeDsHint: "Bitte schließen Sie unten die 3D-Secure-Bestätigung ab.",
    unavailable: "Direkte Kartenzahlung ist derzeit nicht verfügbar.",
  },
  fr: {
    methodTitle: "Visa / Mastercard (Direct)",
    methodDesc: "Payer directement par carte avec 3D Secure",
    checkoutNote:
      "Saisissez vos coordonnées bancaires à l’étape suivante avec vérification 3D Secure pour finaliser votre paiement.",
    payNow: "Payer {eur}",
    processing: "Traitement du paiement…",
    loadingForm: "Chargement du formulaire sécurisé…",
    reloadForm: "Recharger le formulaire",
    cardInvalid: "Veuillez remplir tous les champs de la carte.",
    paymentFailed:
      "Le paiement par carte n’a pas pu aboutir. Vérifiez vos informations ou essayez un autre moyen de paiement.",
    threeDsHint: "Veuillez finaliser la vérification 3D Secure ci-dessous.",
    unavailable: "Le paiement direct par carte est temporairement indisponible.",
  },
  it: {
    methodTitle: "Visa / Mastercard (Diretto)",
    methodDesc: "Paga direttamente con carta e 3D Secure",
    checkoutNote:
      "Inserisci i dati della carta al passaggio successivo con verifica 3D Secure per completare il pagamento.",
    payNow: "Paga {eur}",
    processing: "Elaborazione pagamento…",
    loadingForm: "Caricamento modulo carta sicuro…",
    reloadForm: "Ricarica modulo",
    cardInvalid: "Compila tutti i campi della carta prima di procedere.",
    paymentFailed:
      "Il pagamento con carta non è andato a buon fine. Controlla i dati o scegli un altro metodo.",
    threeDsHint: "Completa la verifica 3D Secure qui sotto per confermare il pagamento.",
    unavailable: "Il pagamento diretto con carta non è al momento disponibile.",
  },
  es: {
    methodTitle: "Visa / Mastercard (Directo)",
    methodDesc: "Paga directamente con tarjeta y 3D Secure",
    checkoutNote:
      "Introduce los datos de tu tarjeta en el siguiente paso con verificación 3D Secure para completar tu pago.",
    payNow: "Pagar {eur}",
    processing: "Procesando pago…",
    loadingForm: "Cargando formulario seguro de tarjeta…",
    reloadForm: "Recargar formulario",
    cardInvalid: "Completa todos los campos de la tarjeta antes de pagar.",
    paymentFailed:
      "No se pudo completar el pago con tarjeta. Revisa tus datos o prueba otro método de pago.",
    threeDsHint: "Completa la verificación 3D Secure abajo para confirmar tu pago.",
    unavailable: "El pago directo con tarjeta no está disponible temporalmente.",
  },
  nl: {
    methodTitle: "Visa / Mastercard (Direct)",
    methodDesc: "Direct betalen met kaart en 3D Secure",
    checkoutNote:
      "Vul uw kaartgegevens in de volgende stap in met 3D Secure-verificatie om uw betaling te voltooien.",
    payNow: "{eur} betalen",
    processing: "Betaling verwerken…",
    loadingForm: "Beveiligd kaartformulier laden…",
    reloadForm: "Formulier opnieuw laden",
    cardInvalid: "Vul alle kaartgegevens in voordat u betaalt.",
    paymentFailed:
      "De kaartbetaling kon niet worden voltooid. Controleer uw gegevens of kies een andere betaalmethode.",
    threeDsHint: "Voltooi hieronder de 3D Secure-verificatie om uw betaling te bevestigen.",
    unavailable: "Directe kaartbetaling is tijdelijk niet beschikbaar.",
  },
}

export function getNgeniusCopy(locale: Locale): NgeniusCopy {
  return COPY[locale] ?? EN
}
