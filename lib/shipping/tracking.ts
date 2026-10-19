import type { Locale } from "@/lib/i18n/config"
import { SITE_ORIGIN } from "@/lib/catalog/image-urls"

export const OWN_CARRIER = "DnD3D Courier"
export const PARTNER_CARRIERS = ["DHL", "DPD"] as const
export const CARRIERS = [OWN_CARRIER, ...PARTNER_CARRIERS] as const
export type CarrierName = (typeof CARRIERS)[number]

export const SHIPMENT_STATUSES = [
  "label_created",
  "collected",
  "at_warehouse",
  "sorted",
  "in_transit",
  "at_delivery_point",
  "out_for_delivery",
  "delivery_attempted",
  "failed_handed_to_dhl",
  "awaiting_pickup",
  "address_issue",
  "delayed",
  "customs",
  "returning",
  "returned",
  "delivered",
] as const

export type ShipmentStatus = (typeof SHIPMENT_STATUSES)[number]

/** Shown only in the admin. Customers receive the label for their language. */
export const ADMIN_STATUS_LABELS: Record<ShipmentStatus, string> = {
  label_created: "Трек-номер создан",
  collected: "Курьер забрал посылку",
  at_warehouse: "Принята на складе",
  sorted: "Отсортирована",
  in_transit: "В пути",
  at_delivery_point: "Прибыла в пункт доставки",
  out_for_delivery: "Курьер везёт получателю",
  delivery_attempted: "Неудачная попытка доставки",
  failed_handed_to_dhl: "Неудачная доставка - Заказ передан в DHL",
  awaiting_pickup: "Ожидает получения",
  address_issue: "Проблема с адресом",
  delayed: "Задержка",
  customs: "Таможенное оформление",
  returning: "Возвращается отправителю",
  returned: "Возвращена отправителю",
  delivered: "Доставлена",
}

const STATUS_LABELS: Record<Locale, Record<ShipmentStatus, string>> = {
  en: {
    label_created: "Tracking number created",
    collected: "Courier collected the parcel",
    at_warehouse: "Accepted at the warehouse",
    sorted: "Sorted",
    in_transit: "In transit",
    at_delivery_point: "Arrived at the delivery point",
    out_for_delivery: "Courier is delivering to the recipient",
    delivery_attempted: "Delivery attempt failed",
    failed_handed_to_dhl: "Unsuccessful delivery — order handed to DHL",
    awaiting_pickup: "Awaiting collection",
    address_issue: "Address problem",
    delayed: "Delayed",
    customs: "Customs clearance",
    returning: "Returning to sender",
    returned: "Returned to sender",
    delivered: "Delivered",
  },
  de: {
    label_created: "Sendungsnummer erstellt",
    collected: "Kurier hat das Paket abgeholt",
    at_warehouse: "Im Lager angenommen",
    sorted: "Sortiert",
    in_transit: "Unterwegs",
    at_delivery_point: "Am Zustellpunkt angekommen",
    out_for_delivery: "Kurier bringt es zum Empfänger",
    delivery_attempted: "Zustellversuch fehlgeschlagen",
    failed_handed_to_dhl: "Zustellung fehlgeschlagen — Auftrag an DHL übergeben",
    awaiting_pickup: "Wartet auf Abholung",
    address_issue: "Adressproblem",
    delayed: "Verzögert",
    customs: "Zollabfertigung",
    returning: "Rücksendung an den Absender",
    returned: "An den Absender zurückgesandt",
    delivered: "Zugestellt",
  },
  fr: {
    label_created: "Numéro de suivi créé",
    collected: "Colis pris en charge par le coursier",
    at_warehouse: "Accepté à l'entrepôt",
    sorted: "Trié",
    in_transit: "En transit",
    at_delivery_point: "Arrivé au point de livraison",
    out_for_delivery: "Le coursier l'apporte au destinataire",
    delivery_attempted: "Tentative de livraison échouée",
    failed_handed_to_dhl: "Livraison non aboutie — commande remise à DHL",
    awaiting_pickup: "En attente de retrait",
    address_issue: "Problème d'adresse",
    delayed: "Retard",
    customs: "Dédouanement",
    returning: "Retour à l'expéditeur",
    returned: "Retourné à l'expéditeur",
    delivered: "Livré",
  },
  it: {
    label_created: "Numero di tracciamento creato",
    collected: "Ritirato dal corriere",
    at_warehouse: "Accettato in magazzino",
    sorted: "Smistato",
    in_transit: "In transito",
    at_delivery_point: "Arrivato al punto di consegna",
    out_for_delivery: "Il corriere lo porta al destinatario",
    delivery_attempted: "Tentativo di consegna non riuscito",
    failed_handed_to_dhl: "Consegna non riuscita — ordine affidato a DHL",
    awaiting_pickup: "In attesa di ritiro",
    address_issue: "Problema di indirizzo",
    delayed: "In ritardo",
    customs: "Sdoganamento",
    returning: "In restituzione al mittente",
    returned: "Restituito al mittente",
    delivered: "Consegnato",
  },
  es: {
    label_created: "Número de seguimiento creado",
    collected: "Recogido por el mensajero",
    at_warehouse: "Aceptado en el almacén",
    sorted: "Clasificado",
    in_transit: "En tránsito",
    at_delivery_point: "Llegado al punto de entrega",
    out_for_delivery: "El mensajero lo lleva al destinatario",
    delivery_attempted: "Intento de entrega fallido",
    failed_handed_to_dhl: "Entrega no realizada — pedido entregado a DHL",
    awaiting_pickup: "Pendiente de recogida",
    address_issue: "Problema con la dirección",
    delayed: "Retraso",
    customs: "Despacho de aduana",
    returning: "En devolución al remitente",
    returned: "Devuelto al remitente",
    delivered: "Entregado",
  },
  nl: {
    label_created: "Trackingnummer aangemaakt",
    collected: "Opgehaald door de koerier",
    at_warehouse: "Aangenomen in het magazijn",
    sorted: "Gesorteerd",
    in_transit: "Onderweg",
    at_delivery_point: "Aangekomen bij het afleverpunt",
    out_for_delivery: "Koerier brengt het naar de ontvanger",
    delivery_attempted: "Bezorgpoging mislukt",
    failed_handed_to_dhl: "Bezorging mislukt — bestelling overgedragen aan DHL",
    awaiting_pickup: "Wacht op afhaling",
    address_issue: "Adresprobleem",
    delayed: "Vertraging",
    customs: "Douaneafhandeling",
    returning: "Onderweg terug naar de afzender",
    returned: "Teruggestuurd naar de afzender",
    delivered: "Bezorgd",
  },
}

const LEGACY_LABELS: Record<Locale, Record<string, string>> = {
  en: {
    awaiting_collection: "Awaiting collection",
    at_origin_depot: "At origin depot",
    at_sorting_centre: "At sorting centre",
    handed_to_partner: "Handed to DHL or DPD",
    partner_in_transit: "With partner carrier",
    at_destination_depot: "At destination depot",
    held_for_collection: "Held for collection",
    rescheduled: "Delivery rescheduled",
    exception: "Delivery exception",
  },
  de: {
    awaiting_collection: "Wartet auf Abholung",
    at_origin_depot: "Im Ausgangsdepot",
    at_sorting_centre: "Im Sortierzentrum",
    handed_to_partner: "An DHL oder DPD übergeben",
    partner_in_transit: "Beim Partnerdienst",
    at_destination_depot: "Im Zieldepot",
    held_for_collection: "Zur Abholung bereit",
    rescheduled: "Zustellung verschoben",
    exception: "Zustellproblem",
  },
  fr: {
    awaiting_collection: "En attente d'enlèvement",
    at_origin_depot: "Au dépôt d'origine",
    at_sorting_centre: "Au centre de tri",
    handed_to_partner: "Remis à DHL ou DPD",
    partner_in_transit: "Chez le transporteur partenaire",
    at_destination_depot: "Au dépôt de destination",
    held_for_collection: "En attente de retrait",
    rescheduled: "Livraison reportée",
    exception: "Incident de livraison",
  },
  it: {
    awaiting_collection: "In attesa del ritiro",
    at_origin_depot: "Al deposito di partenza",
    at_sorting_centre: "Al centro di smistamento",
    handed_to_partner: "Affidato a DHL o DPD",
    partner_in_transit: "Presso il corriere partner",
    at_destination_depot: "Al deposito di destinazione",
    held_for_collection: "In attesa di ritiro",
    rescheduled: "Consegna riprogrammata",
    exception: "Problema di consegna",
  },
  es: {
    awaiting_collection: "Pendiente de recogida",
    at_origin_depot: "En el depósito de origen",
    at_sorting_centre: "En el centro de clasificación",
    handed_to_partner: "Entregado a DHL o DPD",
    partner_in_transit: "Con el transportista asociado",
    at_destination_depot: "En el depósito de destino",
    held_for_collection: "Pendiente de recogida en punto",
    rescheduled: "Entrega reprogramada",
    exception: "Incidencia de entrega",
  },
  nl: {
    awaiting_collection: "Wacht op ophaling",
    at_origin_depot: "In het vertrekdepot",
    at_sorting_centre: "In het sorteercentrum",
    handed_to_partner: "Overgedragen aan DHL of DPD",
    partner_in_transit: "Bij de partnervervoerder",
    at_destination_depot: "In het bestemmingsdepot",
    held_for_collection: "Klaar om af te halen",
    rescheduled: "Bezorging verzet",
    exception: "Bezorgprobleem",
  },
}

const PAGE_COPY: Record<
  Locale,
  {
    title: string
    subtitle: string
    numberLabel: string
    placeholder: string
    submit: string
    notFound: string
    order: string
    destination: string
    carrier: string
    history: string
    noUpdates: string
    latest: string
    note: string
    lookupHint: string
  }
> = {
  en: {
    title: "Track a delivery",
    subtitle: "Enter the tracking number from your shipping email.",
    numberLabel: "Tracking number",
    placeholder: "e.g. JD014600011234567890",
    submit: "Track",
    notFound: "We could not find that tracking number. Check the code in your shipping email.",
    order: "Order",
    destination: "Destination",
    carrier: "Carrier",
    history: "Delivery history",
    noUpdates: "No delivery updates yet. They appear here once the order ships.",
    latest: "Latest update",
    note: "DnD3D Courier delivers the parcel. If our courier cannot cover the route, we hand it to DHL or DPD. Tracking stays on this page.",
    lookupHint: "Have a tracking number? Follow the parcel here.",
  },
  de: {
    title: "Sendung verfolgen",
    subtitle: "Geben Sie die Sendungsnummer aus der Versand-E-Mail ein.",
    numberLabel: "Sendungsnummer",
    placeholder: "z. B. JD014600011234567890",
    submit: "Verfolgen",
    notFound: "Diese Sendungsnummer wurde nicht gefunden. Prüfen Sie den Code in der Versand-E-Mail.",
    order: "Bestellung",
    destination: "Ziel",
    carrier: "Dienst",
    history: "Sendungsverlauf",
    noUpdates: "Noch keine Sendungsupdates. Sie erscheinen hier, sobald die Bestellung versandt wurde.",
    latest: "Letztes Update",
    note: "DnD3D Courier stellt das Paket zu. Wenn unser Kurier die Strecke nicht abdecken kann, übergeben wir es an DHL oder DPD. Die Verfolgung bleibt auf dieser Seite.",
    lookupHint: "Sie haben eine Sendungsnummer? Verfolgen Sie das Paket hier.",
  },
  fr: {
    title: "Suivre une livraison",
    subtitle: "Saisissez le numéro de suivi reçu dans l'e-mail d'expédition.",
    numberLabel: "Numéro de suivi",
    placeholder: "ex. JD014600011234567890",
    submit: "Suivre",
    notFound: "Ce numéro de suivi est introuvable. Vérifiez le code dans l'e-mail d'expédition.",
    order: "Commande",
    destination: "Destination",
    carrier: "Transporteur",
    history: "Historique de livraison",
    noUpdates: "Pas encore de suivi. Il apparaîtra ici dès l'expédition.",
    latest: "Dernière mise à jour",
    note: "DnD3D Courier livre le colis. Si notre coursier ne peut pas couvrir le trajet, nous le remettons à DHL ou DPD. Le suivi reste sur cette page.",
    lookupHint: "Vous avez un numéro de suivi ? Suivez le colis ici.",
  },
  it: {
    title: "Traccia una consegna",
    subtitle: "Inserisci il numero di tracciamento dell'e-mail di spedizione.",
    numberLabel: "Numero di tracciamento",
    placeholder: "es. JD014600011234567890",
    submit: "Traccia",
    notFound: "Numero di tracciamento non trovato. Controlla il codice nell'e-mail di spedizione.",
    order: "Ordine",
    destination: "Destinazione",
    carrier: "Corriere",
    history: "Cronologia di consegna",
    noUpdates: "Nessun aggiornamento. Comparirà qui appena l'ordine viene spedito.",
    latest: "Ultimo aggiornamento",
    note: "DnD3D Courier consegna il pacco. Se il nostro corriere non può coprire il percorso, lo affidiamo a DHL o DPD. Il tracciamento resta su questa pagina.",
    lookupHint: "Hai un numero di tracciamento? Segui il pacco qui.",
  },
  es: {
    title: "Seguir un envío",
    subtitle: "Introduce el número de seguimiento del correo de envío.",
    numberLabel: "Número de seguimiento",
    placeholder: "p. ej. JD014600011234567890",
    submit: "Seguir",
    notFound: "No encontramos ese número. Revisa el código del correo de envío.",
    order: "Pedido",
    destination: "Destino",
    carrier: "Transportista",
    history: "Historial de entrega",
    noUpdates: "Aún no hay actualizaciones. Aparecerán aquí cuando el pedido se envíe.",
    latest: "Última actualización",
    note: "DnD3D Courier entrega el paquete. Si nuestro mensajero no puede cubrir la ruta, lo entregamos a DHL o DPD. El seguimiento sigue en esta página.",
    lookupHint: "¿Tienes un número de seguimiento? Sigue el paquete aquí.",
  },
  nl: {
    title: "Zending volgen",
    subtitle: "Vul het trackingnummer uit de verzendmail in.",
    numberLabel: "Trackingnummer",
    placeholder: "bijv. JD014600011234567890",
    submit: "Volgen",
    notFound: "Dit trackingnummer is niet gevonden. Controleer de code in de verzendmail.",
    order: "Bestelling",
    destination: "Bestemming",
    carrier: "Vervoerder",
    history: "Bezorggeschiedenis",
    noUpdates: "Nog geen updates. Die verschijnen hier zodra de bestelling is verzonden.",
    latest: "Laatste update",
    note: "DnD3D Courier bezorgt het pakket. Als onze koerier de route niet kan dekken, geven we het door aan DHL of DPD. De tracking blijft op deze pagina.",
    lookupHint: "Hebt u een trackingnummer? Volg het pakket hier.",
  },
}

const EMAIL_COPY: Record<
  Locale,
  {
    subject: (orderNumber: string, status: string) => string
    heading: string
    body: (orderNumber: string, status: string) => string
    comment: string
    location: string
    carrier: string
    tracking: string
    button: string
  }
> = {
  en: {
    subject: (orderNumber, status) => `Delivery update for order ${orderNumber}: ${status}`,
    heading: "Your delivery has a new status",
    body: (orderNumber, status) => `Order ${orderNumber} is now: ${status}.`,
    comment: "Note",
    location: "Location",
    carrier: "Carrier",
    tracking: "Tracking number",
    button: "Track your parcel",
  },
  de: {
    subject: (orderNumber, status) => `Sendungsupdate zu Bestellung ${orderNumber}: ${status}`,
    heading: "Neuer Status Ihrer Sendung",
    body: (orderNumber, status) => `Bestellung ${orderNumber} hat jetzt den Status: ${status}.`,
    comment: "Hinweis",
    location: "Ort",
    carrier: "Dienst",
    tracking: "Sendungsnummer",
    button: "Sendung verfolgen",
  },
  fr: {
    subject: (orderNumber, status) => `Suivi de la commande ${orderNumber} : ${status}`,
    heading: "Nouveau statut de livraison",
    body: (orderNumber, status) => `La commande ${orderNumber} est maintenant : ${status}.`,
    comment: "Commentaire",
    location: "Lieu",
    carrier: "Transporteur",
    tracking: "Numéro de suivi",
    button: "Suivre le colis",
  },
  it: {
    subject: (orderNumber, status) => `Aggiornamento consegna ordine ${orderNumber}: ${status}`,
    heading: "Nuovo stato della consegna",
    body: (orderNumber, status) => `L'ordine ${orderNumber} è ora: ${status}.`,
    comment: "Nota",
    location: "Luogo",
    carrier: "Corriere",
    tracking: "Numero di tracciamento",
    button: "Traccia il pacco",
  },
  es: {
    subject: (orderNumber, status) => `Actualización del pedido ${orderNumber}: ${status}`,
    heading: "Nuevo estado de la entrega",
    body: (orderNumber, status) => `El pedido ${orderNumber} está ahora: ${status}.`,
    comment: "Nota",
    location: "Lugar",
    carrier: "Transportista",
    tracking: "Número de seguimiento",
    button: "Seguir el paquete",
  },
  nl: {
    subject: (orderNumber, status) => `Bezorgupdate voor bestelling ${orderNumber}: ${status}`,
    heading: "Nieuwe status van uw zending",
    body: (orderNumber, status) => `Bestelling ${orderNumber} heeft nu de status: ${status}.`,
    comment: "Opmerking",
    location: "Plaats",
    carrier: "Vervoerder",
    tracking: "Trackingnummer",
    button: "Zending volgen",
  },
}

export function isShipmentStatus(value: string): value is ShipmentStatus {
  return (SHIPMENT_STATUSES as readonly string[]).includes(value)
}

export function isCarrierName(value: string): value is CarrierName {
  return (CARRIERS as readonly string[]).includes(value)
}

export function shipmentStatusLabel(status: string, locale: Locale): string {
  if (isShipmentStatus(status)) return STATUS_LABELS[locale][status]
  return LEGACY_LABELS[locale][status] ?? status
}

export function shipmentAdminLabel(status: string): string {
  if (isShipmentStatus(status)) return ADMIN_STATUS_LABELS[status]
  return LEGACY_LABELS.en[status] ?? status
}

export function trackingPageCopy(locale: Locale) {
  return PAGE_COPY[locale]
}

export function shipmentEmailCopy(locale: Locale) {
  return EMAIL_COPY[locale]
}

export function localeForCountry(country: string | null | undefined): Locale {
  const value = (country ?? "").trim().toLowerCase()
  if (["germany", "deutschland", "austria", "österreich", "switzerland", "schweiz", "de", "at", "ch"].includes(value)) {
    return "de"
  }
  if (["france", "frankreich", "fr"].includes(value)) return "fr"
  if (["italy", "italia", "italien", "it"].includes(value)) return "it"
  if (["spain", "españa", "espana", "spanien", "es"].includes(value)) return "es"
  if (["netherlands", "the netherlands", "nederland", "pays-bas", "nl"].includes(value)) return "nl"
  if (["belgium", "belgique", "belgië", "belgie", "belgien", "be"].includes(value)) return "fr"
  return "en"
}

export function trackingPageUrl(trackingNumber: string, locale: Locale = "en"): string {
  return `${SITE_ORIGIN}/${locale}/track/${encodeURIComponent(trackingNumber)}`
}

export function normalizeTrackingCode(value: string): string | null {
  const code = value.trim().toUpperCase().replace(/\s+/g, "")
  if (!/^[A-Z0-9-]{6,40}$/.test(code)) return null
  return code
}

function randomDigits(length: number): string {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  let out = ""
  for (let i = 0; i < length; i++) out += String(bytes[i] % 10)
  return out
}

function randomIndex(max: number): number {
  const bytes = new Uint8Array(1)
  crypto.getRandomValues(bytes)
  return bytes[0] % max
}

/** DHL Express piece ID (JD + 18 digits) or 10-digit airway bill. */
function dhlTrackingNumber(): string {
  if (randomIndex(2) === 0) return `JD${randomDigits(18)}`
  const bill = randomDigits(10)
  return bill.startsWith("0") ? `1${bill.slice(1)}` : bill
}

/** FedEx Express (12 digits) or Ground (15 digits, 96…). */
function fedexTrackingNumber(): string {
  if (randomIndex(2) === 0) {
    const number = randomDigits(12)
    return number.startsWith("0") ? `7${number.slice(1)}` : number
  }
  return `96${randomDigits(13)}`
}

export function randomTrackingNumber(): string {
  return randomIndex(2) === 0 ? dhlTrackingNumber() : fedexTrackingNumber()
}
