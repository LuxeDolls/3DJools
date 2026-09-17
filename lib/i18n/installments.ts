import type { Locale } from "./config"

/**
 * Self-contained i18n for the installment feature (form, contract, status).
 * Kept separate from the main dictionaries because it is a large, cohesive
 * surface. English is the reference; the other five locales mirror its shape.
 */
export type InstallmentDict = {
  planName: string
  planTagline: string
  applyTitle: string
  applySubtitle: string
  // steps
  stepPersonal: string
  stepIdentity: string
  stepReview: string
  stepContract: string
  // personal fields
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  nationality: string
  addressLine1: string
  addressLine2: string
  city: string
  postalCode: string
  country: string
  employmentStatus: string
  monthlyIncome: string
  employmentOptions: { employed: string; selfEmployed: string; student: string; retired: string; other: string }
  // identity
  idType: string
  idTypeOptions: { passport: string; national_id: string; drivers_license: string }
  idNumber: string
  idUpload: string
  idUploadHint: string
  idUploadCta: string
  idUploaded: string
  uploading: string
  // review / schedule
  orderTotal: string
  downPaymentNow: string
  remaining: string
  paymentSchedule: string
  dueNow: string
  dueOn: string
  installmentLabel: string
  downPaymentLabel: string
  // contract
  contractTitle: string
  contractAccept: string
  dataConsent: string
  // actions
  next: string
  back: string
  submit: string
  submitting: string
  // outcome
  successTitle: string
  successBody: string
  yourRef: string
  trackCta: string
  // status page
  statusTitle: string
  statusPending: string
  statusApproved: string
  statusRejected: string
  statusCancelled: string
  statusPendingBody: string
  statusApprovedBody: string
  statusRejectedBody: string
  payDownPayment: string
  payInstallment: string
  lookupTitle: string
  lookupCta: string
  notFound: string
  // checkout
  checkoutInstallmentCta: string
  checkoutInstallmentNote: string
  // validation
  errRequired: string
  errConsent: string
  errUpload: string
}

const en: InstallmentDict = {
  planName: "Pay in 4",
  planTagline: "Split your order into 4 payments over 6 weeks. 0% interest.",
  applyTitle: "Apply for installments",
  applySubtitle: "25% today, then 3 payments every 2 weeks. Subject to approval.",
  stepPersonal: "Your details",
  stepIdentity: "Identity",
  stepReview: "Payment plan",
  stepContract: "Agreement",
  firstName: "First name",
  lastName: "Last name",
  email: "Email",
  phone: "Phone",
  dateOfBirth: "Date of birth",
  nationality: "Nationality",
  addressLine1: "Address",
  addressLine2: "Address line 2 (optional)",
  city: "City",
  postalCode: "Postal code",
  country: "Country",
  employmentStatus: "Employment status",
  monthlyIncome: "Net monthly income (EUR)",
  employmentOptions: {
    employed: "Employed",
    selfEmployed: "Self-employed",
    student: "Student",
    retired: "Retired",
    other: "Other",
  },
  idType: "ID document type",
  idTypeOptions: { passport: "Passport", national_id: "National ID", drivers_license: "Driver's license" },
  idNumber: "Document number",
  idUpload: "ID document photo",
  idUploadHint: "Upload a clear photo of your ID. Stored securely and encrypted. Max 8 MB (JPG, PNG, PDF).",
  idUploadCta: "Choose file",
  idUploaded: "Uploaded",
  uploading: "Uploading...",
  orderTotal: "Order total",
  downPaymentNow: "Down payment (25%) due today",
  remaining: "Remaining (75%)",
  paymentSchedule: "Payment schedule",
  dueNow: "Due today",
  dueOn: "Due",
  installmentLabel: "Installment",
  downPaymentLabel: "Down payment",
  contractTitle: "Installment Sales Agreement",
  contractAccept: "I have read and accept the Installment Sales Agreement.",
  dataConsent:
    "I consent to the processing of my personal data and ID document for identity verification and credit assessment (GDPR).",
  next: "Continue",
  back: "Back",
  submit: "Submit application",
  submitting: "Submitting...",
  successTitle: "Application received",
  successBody:
    "Thanks! We are reviewing your installment application. You'll get an email once it's approved, then you pay only the 25% down payment to confirm your order.",
  yourRef: "Your reference",
  trackCta: "Track application",
  statusTitle: "Installment application",
  statusPending: "Under review",
  statusApproved: "Approved",
  statusRejected: "Not approved",
  statusCancelled: "Cancelled",
  statusPendingBody: "Your application is being reviewed. This usually takes up to 1 business day.",
  statusApprovedBody: "Your plan is approved. Pay the 25% down payment below to confirm your order.",
  statusRejectedBody: "Unfortunately we could not approve this application. You can still pay by another method.",
  payDownPayment: "Pay down payment",
  payInstallment: "Pay installment",
  lookupTitle: "Track your application",
  lookupCta: "View status",
  notFound: "No application found with that reference.",
  checkoutInstallmentCta: "Apply for Pay in 4",
  checkoutInstallmentNote:
    "With installments you'll complete a short application. After approval you pay only the 25% down payment now.",
  errRequired: "Please fill in all required fields.",
  errConsent: "Please accept the agreement and data consent.",
  errUpload: "Please upload your ID document.",
}

const de: InstallmentDict = {
  ...en,
  planName: "In 4 Raten zahlen",
  planTagline: "Teilen Sie Ihre Bestellung in 4 Zahlungen über 6 Wochen. 0% Zinsen.",
  applyTitle: "Ratenzahlung beantragen",
  applySubtitle: "25% heute, dann 3 Zahlungen alle 2 Wochen. Vorbehaltlich Genehmigung.",
  stepPersonal: "Ihre Daten",
  stepIdentity: "Identität",
  stepReview: "Zahlungsplan",
  stepContract: "Vertrag",
  firstName: "Vorname",
  lastName: "Nachname",
  email: "E-Mail",
  phone: "Telefon",
  dateOfBirth: "Geburtsdatum",
  nationality: "Staatsangehörigkeit",
  addressLine1: "Adresse",
  addressLine2: "Adresszusatz (optional)",
  city: "Stadt",
  postalCode: "Postleitzahl",
  country: "Land",
  employmentStatus: "Beschäftigungsstatus",
  monthlyIncome: "Netto-Monatseinkommen (EUR)",
  employmentOptions: {
    employed: "Angestellt",
    selfEmployed: "Selbstständig",
    student: "Student",
    retired: "Rentner",
    other: "Sonstiges",
  },
  idType: "Ausweisart",
  idTypeOptions: { passport: "Reisepass", national_id: "Personalausweis", drivers_license: "Führerschein" },
  idNumber: "Dokumentnummer",
  idUpload: "Foto des Ausweises",
  idUploadHint: "Laden Sie ein klares Foto Ihres Ausweises hoch. Sicher und verschlüsselt gespeichert. Max. 8 MB (JPG, PNG, PDF).",
  idUploadCta: "Datei auswählen",
  idUploaded: "Hochgeladen",
  uploading: "Wird hochgeladen...",
  orderTotal: "Bestellsumme",
  downPaymentNow: "Anzahlung (25%) heute fällig",
  remaining: "Restbetrag (75%)",
  paymentSchedule: "Zahlungsplan",
  dueNow: "Heute fällig",
  dueOn: "Fällig",
  installmentLabel: "Rate",
  downPaymentLabel: "Anzahlung",
  contractTitle: "Ratenkaufvertrag",
  contractAccept: "Ich habe den Ratenkaufvertrag gelesen und akzeptiere ihn.",
  dataConsent:
    "Ich willige in die Verarbeitung meiner personenbezogenen Daten und meines Ausweises zur Identitäts- und Bonitätsprüfung ein (DSGVO).",
  next: "Weiter",
  back: "Zurück",
  submit: "Antrag absenden",
  submitting: "Wird gesendet...",
  successTitle: "Antrag erhalten",
  successBody:
    "Danke! Wir prüfen Ihren Ratenzahlungsantrag. Sie erhalten eine E-Mail nach der Genehmigung, dann zahlen Sie nur die 25% Anzahlung zur Bestätigung.",
  yourRef: "Ihre Referenz",
  trackCta: "Antrag verfolgen",
  statusTitle: "Ratenzahlungsantrag",
  statusPending: "In Prüfung",
  statusApproved: "Genehmigt",
  statusRejected: "Nicht genehmigt",
  statusCancelled: "Storniert",
  statusPendingBody: "Ihr Antrag wird geprüft. Das dauert in der Regel bis zu 1 Werktag.",
  statusApprovedBody: "Ihr Plan ist genehmigt. Zahlen Sie unten die 25% Anzahlung zur Bestätigung.",
  statusRejectedBody: "Leider konnten wir diesen Antrag nicht genehmigen. Sie können mit einer anderen Methode zahlen.",
  payDownPayment: "Anzahlung zahlen",
  payInstallment: "Rate zahlen",
  lookupTitle: "Antrag verfolgen",
  lookupCta: "Status ansehen",
  notFound: "Kein Antrag mit dieser Referenz gefunden.",
  checkoutInstallmentCta: "In 4 Raten beantragen",
  checkoutInstallmentNote:
    "Bei Ratenzahlung füllen Sie einen kurzen Antrag aus. Nach Genehmigung zahlen Sie jetzt nur die 25% Anzahlung.",
  errRequired: "Bitte füllen Sie alle Pflichtfelder aus.",
  errConsent: "Bitte akzeptieren Sie den Vertrag und die Datenverarbeitung.",
  errUpload: "Bitte laden Sie Ihren Ausweis hoch.",
}

const fr: InstallmentDict = {
  ...en,
  planName: "Payer en 4 fois",
  planTagline: "Divisez votre commande en 4 paiements sur 6 semaines. 0% d'intérêt.",
  applyTitle: "Demander un paiement échelonné",
  applySubtitle: "25% aujourd'hui, puis 3 paiements toutes les 2 semaines. Sous réserve d'approbation.",
  stepPersonal: "Vos informations",
  stepIdentity: "Identité",
  stepReview: "Échéancier",
  stepContract: "Contrat",
  firstName: "Prénom",
  lastName: "Nom",
  email: "E-mail",
  phone: "Téléphone",
  dateOfBirth: "Date de naissance",
  nationality: "Nationalité",
  addressLine1: "Adresse",
  addressLine2: "Complément d'adresse (facultatif)",
  city: "Ville",
  postalCode: "Code postal",
  country: "Pays",
  employmentStatus: "Situation professionnelle",
  monthlyIncome: "Revenu net mensuel (EUR)",
  employmentOptions: {
    employed: "Salarié",
    selfEmployed: "Indépendant",
    student: "Étudiant",
    retired: "Retraité",
    other: "Autre",
  },
  idType: "Type de pièce d'identité",
  idTypeOptions: { passport: "Passeport", national_id: "Carte d'identité", drivers_license: "Permis de conduire" },
  idNumber: "Numéro du document",
  idUpload: "Photo de la pièce d'identité",
  idUploadHint: "Téléchargez une photo nette de votre pièce d'identité. Stockée en sécurité et chiffrée. Max 8 Mo (JPG, PNG, PDF).",
  idUploadCta: "Choisir un fichier",
  idUploaded: "Téléchargé",
  uploading: "Téléchargement...",
  orderTotal: "Total de la commande",
  downPaymentNow: "Acompte (25%) dû aujourd'hui",
  remaining: "Restant (75%)",
  paymentSchedule: "Échéancier de paiement",
  dueNow: "Dû aujourd'hui",
  dueOn: "Échéance",
  installmentLabel: "Versement",
  downPaymentLabel: "Acompte",
  contractTitle: "Contrat de vente à tempérament",
  contractAccept: "J'ai lu et j'accepte le contrat de vente à tempérament.",
  dataConsent:
    "Je consens au traitement de mes données personnelles et de ma pièce d'identité pour la vérification d'identité et l'évaluation de solvabilité (RGPD).",
  next: "Continuer",
  back: "Retour",
  submit: "Envoyer la demande",
  submitting: "Envoi...",
  successTitle: "Demande reçue",
  successBody:
    "Merci ! Nous examinons votre demande. Vous recevrez un e-mail après approbation, puis vous ne payez que l'acompte de 25% pour confirmer.",
  yourRef: "Votre référence",
  trackCta: "Suivre la demande",
  statusTitle: "Demande de paiement échelonné",
  statusPending: "En cours d'examen",
  statusApproved: "Approuvée",
  statusRejected: "Non approuvée",
  statusCancelled: "Annulée",
  statusPendingBody: "Votre demande est en cours d'examen. Cela prend généralement jusqu'à 1 jour ouvrable.",
  statusApprovedBody: "Votre plan est approuvé. Payez l'acompte de 25% ci-dessous pour confirmer.",
  statusRejectedBody: "Nous n'avons pas pu approuver cette demande. Vous pouvez payer par un autre moyen.",
  payDownPayment: "Payer l'acompte",
  payInstallment: "Payer l'échéance",
  lookupTitle: "Suivre votre demande",
  lookupCta: "Voir le statut",
  notFound: "Aucune demande trouvée avec cette référence.",
  checkoutInstallmentCta: "Demander le paiement en 4 fois",
  checkoutInstallmentNote:
    "Avec le paiement échelonné, vous remplissez une courte demande. Après approbation, vous ne payez que l'acompte de 25%.",
  errRequired: "Veuillez remplir tous les champs obligatoires.",
  errConsent: "Veuillez accepter le contrat et le consentement des données.",
  errUpload: "Veuillez télécharger votre pièce d'identité.",
}

const it: InstallmentDict = {
  ...en,
  planName: "Paga in 4",
  planTagline: "Dividi il tuo ordine in 4 pagamenti in 6 settimane. 0% di interessi.",
  applyTitle: "Richiedi il pagamento rateale",
  applySubtitle: "25% oggi, poi 3 pagamenti ogni 2 settimane. Soggetto ad approvazione.",
  stepPersonal: "I tuoi dati",
  stepIdentity: "Identità",
  stepReview: "Piano di pagamento",
  stepContract: "Contratto",
  firstName: "Nome",
  lastName: "Cognome",
  email: "Email",
  phone: "Telefono",
  dateOfBirth: "Data di nascita",
  nationality: "Nazionalità",
  addressLine1: "Indirizzo",
  addressLine2: "Indirizzo riga 2 (facoltativo)",
  city: "Città",
  postalCode: "CAP",
  country: "Paese",
  employmentStatus: "Stato occupazionale",
  monthlyIncome: "Reddito netto mensile (EUR)",
  employmentOptions: {
    employed: "Dipendente",
    selfEmployed: "Autonomo",
    student: "Studente",
    retired: "Pensionato",
    other: "Altro",
  },
  idType: "Tipo di documento",
  idTypeOptions: { passport: "Passaporto", national_id: "Carta d'identità", drivers_license: "Patente" },
  idNumber: "Numero del documento",
  idUpload: "Foto del documento",
  idUploadHint: "Carica una foto nitida del documento. Conservata in modo sicuro e crittografata. Max 8 MB (JPG, PNG, PDF).",
  idUploadCta: "Scegli file",
  idUploaded: "Caricato",
  uploading: "Caricamento...",
  orderTotal: "Totale ordine",
  downPaymentNow: "Acconto (25%) dovuto oggi",
  remaining: "Rimanente (75%)",
  paymentSchedule: "Piano di pagamento",
  dueNow: "Dovuto oggi",
  dueOn: "Scadenza",
  installmentLabel: "Rata",
  downPaymentLabel: "Acconto",
  contractTitle: "Contratto di vendita a rate",
  contractAccept: "Ho letto e accetto il contratto di vendita a rate.",
  dataConsent:
    "Acconsento al trattamento dei miei dati personali e del documento per la verifica dell'identità e la valutazione del credito (GDPR).",
  next: "Continua",
  back: "Indietro",
  submit: "Invia richiesta",
  submitting: "Invio...",
  successTitle: "Richiesta ricevuta",
  successBody:
    "Grazie! Stiamo esaminando la tua richiesta. Riceverai un'email dopo l'approvazione, poi paghi solo l'acconto del 25% per confermare.",
  yourRef: "Il tuo riferimento",
  trackCta: "Segui la richiesta",
  statusTitle: "Richiesta di pagamento rateale",
  statusPending: "In revisione",
  statusApproved: "Approvata",
  statusRejected: "Non approvata",
  statusCancelled: "Annullata",
  statusPendingBody: "La tua richiesta è in fase di revisione. Di solito richiede fino a 1 giorno lavorativo.",
  statusApprovedBody: "Il tuo piano è approvato. Paga l'acconto del 25% qui sotto per confermare.",
  statusRejectedBody: "Purtroppo non abbiamo potuto approvare questa richiesta. Puoi pagare con un altro metodo.",
  payDownPayment: "Paga l'acconto",
  payInstallment: "Paga la rata",
  lookupTitle: "Segui la tua richiesta",
  lookupCta: "Vedi stato",
  notFound: "Nessuna richiesta trovata con questo riferimento.",
  checkoutInstallmentCta: "Richiedi Paga in 4",
  checkoutInstallmentNote:
    "Con il pagamento rateale compili una breve richiesta. Dopo l'approvazione paghi solo l'acconto del 25%.",
  errRequired: "Compila tutti i campi obbligatori.",
  errConsent: "Accetta il contratto e il consenso ai dati.",
  errUpload: "Carica il tuo documento.",
}

const nl: InstallmentDict = {
  ...en,
  planName: "Betaal in 4",
  planTagline: "Verdeel je bestelling in 4 betalingen over 6 weken. 0% rente.",
  applyTitle: "Gespreid betalen aanvragen",
  applySubtitle: "25% vandaag, daarna 3 betalingen elke 2 weken. Onder voorbehoud van goedkeuring.",
  stepPersonal: "Jouw gegevens",
  stepIdentity: "Identiteit",
  stepReview: "Betaalplan",
  stepContract: "Overeenkomst",
  firstName: "Voornaam",
  lastName: "Achternaam",
  email: "E-mail",
  phone: "Telefoon",
  dateOfBirth: "Geboortedatum",
  nationality: "Nationaliteit",
  addressLine1: "Adres",
  addressLine2: "Adresregel 2 (optioneel)",
  city: "Plaats",
  postalCode: "Postcode",
  country: "Land",
  employmentStatus: "Arbeidsstatus",
  monthlyIncome: "Netto maandinkomen (EUR)",
  employmentOptions: {
    employed: "In loondienst",
    selfEmployed: "Zelfstandige",
    student: "Student",
    retired: "Gepensioneerd",
    other: "Anders",
  },
  idType: "Type identiteitsbewijs",
  idTypeOptions: { passport: "Paspoort", national_id: "Identiteitskaart", drivers_license: "Rijbewijs" },
  idNumber: "Documentnummer",
  idUpload: "Foto van identiteitsbewijs",
  idUploadHint: "Upload een duidelijke foto van je ID. Veilig en versleuteld opgeslagen. Max 8 MB (JPG, PNG, PDF).",
  idUploadCta: "Bestand kiezen",
  idUploaded: "Geüpload",
  uploading: "Uploaden...",
  orderTotal: "Besteltotaal",
  downPaymentNow: "Aanbetaling (25%) vandaag verschuldigd",
  remaining: "Resterend (75%)",
  paymentSchedule: "Betaalschema",
  dueNow: "Vandaag verschuldigd",
  dueOn: "Vervalt",
  installmentLabel: "Termijn",
  downPaymentLabel: "Aanbetaling",
  contractTitle: "Overeenkomst voor gespreide betaling",
  contractAccept: "Ik heb de overeenkomst voor gespreide betaling gelezen en ga akkoord.",
  dataConsent:
    "Ik geef toestemming voor de verwerking van mijn persoonsgegevens en ID voor identiteitsverificatie en kredietbeoordeling (AVG).",
  next: "Doorgaan",
  back: "Terug",
  submit: "Aanvraag verzenden",
  submitting: "Verzenden...",
  successTitle: "Aanvraag ontvangen",
  successBody:
    "Bedankt! We beoordelen je aanvraag. Je ontvangt een e-mail na goedkeuring, daarna betaal je alleen de 25% aanbetaling om te bevestigen.",
  yourRef: "Jouw referentie",
  trackCta: "Aanvraag volgen",
  statusTitle: "Aanvraag gespreide betaling",
  statusPending: "In behandeling",
  statusApproved: "Goedgekeurd",
  statusRejected: "Niet goedgekeurd",
  statusCancelled: "Geannuleerd",
  statusPendingBody: "Je aanvraag wordt beoordeeld. Dit duurt meestal tot 1 werkdag.",
  statusApprovedBody: "Je plan is goedgekeurd. Betaal hieronder de 25% aanbetaling om te bevestigen.",
  statusRejectedBody: "Helaas konden we deze aanvraag niet goedkeuren. Je kunt met een andere methode betalen.",
  payDownPayment: "Aanbetaling betalen",
  payInstallment: "Termijn betalen",
  lookupTitle: "Volg je aanvraag",
  lookupCta: "Status bekijken",
  notFound: "Geen aanvraag gevonden met die referentie.",
  checkoutInstallmentCta: "Betaal in 4 aanvragen",
  checkoutInstallmentNote:
    "Bij gespreide betaling vul je een korte aanvraag in. Na goedkeuring betaal je nu alleen de 25% aanbetaling.",
  errRequired: "Vul alle verplichte velden in.",
  errConsent: "Accepteer de overeenkomst en gegevensverwerking.",
  errUpload: "Upload je identiteitsbewijs.",
}

const es: InstallmentDict = {
  ...en,
  planName: "Paga en 4",
  planTagline: "Divide tu pedido en 4 pagos durante 6 semanas. 0% de interés.",
  applyTitle: "Solicitar pago a plazos",
  applySubtitle: "25% hoy, luego 3 pagos cada 2 semanas. Sujeto a aprobación.",
  stepPersonal: "Tus datos",
  stepIdentity: "Identidad",
  stepReview: "Plan de pago",
  stepContract: "Contrato",
  firstName: "Nombre",
  lastName: "Apellidos",
  email: "Correo electrónico",
  phone: "Teléfono",
  dateOfBirth: "Fecha de nacimiento",
  nationality: "Nacionalidad",
  addressLine1: "Dirección",
  addressLine2: "Dirección línea 2 (opcional)",
  city: "Ciudad",
  postalCode: "Código postal",
  country: "País",
  employmentStatus: "Situación laboral",
  monthlyIncome: "Ingreso neto mensual (EUR)",
  employmentOptions: {
    employed: "Empleado",
    selfEmployed: "Autónomo",
    student: "Estudiante",
    retired: "Jubilado",
    other: "Otro",
  },
  idType: "Tipo de documento",
  idTypeOptions: { passport: "Pasaporte", national_id: "DNI", drivers_license: "Carné de conducir" },
  idNumber: "Número de documento",
  idUpload: "Foto del documento",
  idUploadHint: "Sube una foto clara de tu documento. Almacenada de forma segura y cifrada. Máx 8 MB (JPG, PNG, PDF).",
  idUploadCta: "Elegir archivo",
  idUploaded: "Subido",
  uploading: "Subiendo...",
  orderTotal: "Total del pedido",
  downPaymentNow: "Pago inicial (25%) hoy",
  remaining: "Restante (75%)",
  paymentSchedule: "Calendario de pagos",
  dueNow: "Vence hoy",
  dueOn: "Vence",
  installmentLabel: "Plazo",
  downPaymentLabel: "Pago inicial",
  contractTitle: "Contrato de venta a plazos",
  contractAccept: "He leído y acepto el contrato de venta a plazos.",
  dataConsent:
    "Consiento el tratamiento de mis datos personales y documento para verificación de identidad y evaluación de crédito (RGPD).",
  next: "Continuar",
  back: "Atrás",
  submit: "Enviar solicitud",
  submitting: "Enviando...",
  successTitle: "Solicitud recibida",
  successBody:
    "¡Gracias! Estamos revisando tu solicitud. Recibirás un correo tras la aprobación y luego pagas solo el 25% inicial para confirmar.",
  yourRef: "Tu referencia",
  trackCta: "Seguir solicitud",
  statusTitle: "Solicitud de pago a plazos",
  statusPending: "En revisión",
  statusApproved: "Aprobada",
  statusRejected: "No aprobada",
  statusCancelled: "Cancelada",
  statusPendingBody: "Tu solicitud está en revisión. Suele tardar hasta 1 día hábil.",
  statusApprovedBody: "Tu plan está aprobado. Paga el 25% inicial abajo para confirmar.",
  statusRejectedBody: "Lamentablemente no pudimos aprobar esta solicitud. Puedes pagar con otro método.",
  payDownPayment: "Pagar inicial",
  payInstallment: "Pagar cuota",
  lookupTitle: "Sigue tu solicitud",
  lookupCta: "Ver estado",
  notFound: "No se encontró ninguna solicitud con esa referencia.",
  checkoutInstallmentCta: "Solicitar Paga en 4",
  checkoutInstallmentNote:
    "Con el pago a plazos completas una breve solicitud. Tras la aprobación pagas solo el 25% inicial ahora.",
  errRequired: "Rellena todos los campos obligatorios.",
  errConsent: "Acepta el contrato y el consentimiento de datos.",
  errUpload: "Sube tu documento de identidad.",
}

const dictionaries: Record<Locale, InstallmentDict> = { en, de, fr, it, nl, es }

export function getInstallmentDict(locale: Locale): InstallmentDict {
  return dictionaries[locale] ?? en
}
