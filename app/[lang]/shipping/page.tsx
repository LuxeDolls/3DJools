import { isLocale, type Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { ProsePage, ProseSection } from "@/components/legal/prose-page"
import { DELIVERY_MAX_DAYS, DELIVERY_MIN_DAYS, DISPATCH_HOURS } from "@/lib/shipping/rates"

type ShippingCopy = {
  sectionDelivery: string
  colDestination: string
  colDeliveryTime: string
  colCost: string
  belgium: string
  restOfEu: string
  deliveryTime: (min: number, max: number) => string
  free: string
  deliveryParagraph: (hours: number) => string
  sectionHours: string
  hoursParagraph: (hours: number) => string
  sectionZones: string
  zonesParagraph: string
  sectionTracking: string
  trackingParagraph: string
}

const COPY: Record<Locale, ShippingCopy> = {
  en: {
    sectionDelivery: "Delivery options & pricing",
    colDestination: "Destination",
    colDeliveryTime: "Delivery time",
    colCost: "Cost",
    belgium: "Belgium",
    restOfEu: "Rest of the EU & neighbouring countries",
    deliveryTime: (min, max) => `${min}–${max} working days`,
    free: "Free",
    deliveryParagraph: (hours) =>
      `Shipping is completely free on every order, to every destination we deliver to — no minimum spend required. We ship with trusted carriers (DPD, GLS, DHL and UPS). Every order is processed and dispatched within ${hours} hours on business days; orders placed before 14:00 CET on a working day are often dispatched the same day.`,
    sectionHours: "Business hours",
    hoursParagraph: (hours) =>
      `Our team works Monday to Friday, 9:00–18:00 CET (excluding Belgian public holidays). Orders and enquiries received outside these hours are processed on the next business day, still within our ${hours}-hour turnaround.`,
    sectionZones: "Shipping zones",
    zonesParagraph:
      "We ship to Belgium and to the rest of the European Union plus a handful of neighbouring countries (Switzerland, Norway, United Kingdom) — shipping is free to every one of these destinations.",
    sectionTracking: "Tracking your order",
    trackingParagraph:
      "Once your order ships you'll receive an email with a tracking number. Registered customers can follow every order from payment to delivery in their account area.",
  },
  de: {
    sectionDelivery: "Versandoptionen & Preise",
    colDestination: "Ziel",
    colDeliveryTime: "Lieferzeit",
    colCost: "Kosten",
    belgium: "Belgien",
    restOfEu: "Restliche EU & Nachbarländer",
    deliveryTime: (min, max) => `${min}–${max} Werktage`,
    free: "Kostenlos",
    deliveryParagraph: (hours) =>
      `Der Versand ist bei jeder Bestellung und zu jedem Lieferziel völlig kostenlos — kein Mindestbestellwert erforderlich. Wir versenden mit vertrauenswürdigen Paketdiensten (DPD, GLS, DHL und UPS). Jede Bestellung wird innerhalb von ${hours} Stunden an Werktagen bearbeitet und versandt; Bestellungen, die vor 14:00 Uhr MEZ an einem Werktag eingehen, werden häufig noch am selben Tag versandt.`,
    sectionHours: "Geschäftszeiten",
    hoursParagraph: (hours) =>
      `Unser Team arbeitet Montag bis Freitag von 9:00 bis 18:00 Uhr MEZ (außer an belgischen Feiertagen). Bestellungen und Anfragen außerhalb dieser Zeiten werden am nächsten Werktag bearbeitet, weiterhin innerhalb unserer ${hours}-Stunden-Bearbeitungszeit.`,
    sectionZones: "Versandzonen",
    zonesParagraph:
      "Wir versenden nach Belgien sowie in die übrige Europäische Union und einige Nachbarländer (Schweiz, Norwegen, Vereinigtes Königreich) — der Versand ist zu jedem dieser Ziele kostenlos.",
    sectionTracking: "Sendungsverfolgung",
    trackingParagraph:
      "Sobald Ihre Bestellung versandt wurde, erhalten Sie eine E-Mail mit einer Sendungsnummer. Registrierte Kunden können jede Bestellung von der Zahlung bis zur Lieferung in ihrem Kontobereich verfolgen.",
  },
  fr: {
    sectionDelivery: "Options et tarifs de livraison",
    colDestination: "Destination",
    colDeliveryTime: "Délai de livraison",
    colCost: "Coût",
    belgium: "Belgique",
    restOfEu: "Reste de l'UE & pays voisins",
    deliveryTime: (min, max) => `${min}–${max} jours ouvrés`,
    free: "Gratuit",
    deliveryParagraph: (hours) =>
      `La livraison est entièrement gratuite pour toute commande, vers toutes les destinations que nous livrons — aucun montant minimum requis. Nous expédions avec des transporteurs de confiance (DPD, GLS, DHL et UPS). Chaque commande est traitée et expédiée dans un délai de ${hours} heures les jours ouvrés ; les commandes passées avant 14h00 CET un jour ouvré sont souvent expédiées le jour même.`,
    sectionHours: "Horaires d'ouverture",
    hoursParagraph: (hours) =>
      `Notre équipe travaille du lundi au vendredi, de 9h00 à 18h00 CET (hors jours fériés belges). Les commandes et demandes reçues hors de ces horaires sont traitées le jour ouvré suivant, toujours dans notre délai de ${hours} heures.`,
    sectionZones: "Zones de livraison",
    zonesParagraph:
      "Nous livrons en Belgique ainsi que dans le reste de l'Union européenne et quelques pays voisins (Suisse, Norvège, Royaume-Uni) — la livraison est gratuite vers chacune de ces destinations.",
    sectionTracking: "Suivi de votre commande",
    trackingParagraph:
      "Une fois votre commande expédiée, vous recevrez un e-mail avec un numéro de suivi. Les clients inscrits peuvent suivre chaque commande, du paiement à la livraison, dans leur espace client.",
  },
  it: {
    sectionDelivery: "Opzioni e tariffe di spedizione",
    colDestination: "Destinazione",
    colDeliveryTime: "Tempi di consegna",
    colCost: "Costo",
    belgium: "Belgio",
    restOfEu: "Resto dell'UE e paesi limitrofi",
    deliveryTime: (min, max) => `${min}–${max} giorni lavorativi`,
    free: "Gratuita",
    deliveryParagraph: (hours) =>
      `La spedizione è sempre completamente gratuita, per qualsiasi ordine e verso tutte le destinazioni servite — nessun importo minimo richiesto. Spediamo con corrieri affidabili (DPD, GLS, DHL e UPS). Ogni ordine viene elaborato e spedito entro ${hours} ore nei giorni lavorativi; gli ordini effettuati prima delle 14:00 CET in un giorno lavorativo vengono spesso spediti lo stesso giorno.`,
    sectionHours: "Orari di apertura",
    hoursParagraph: (hours) =>
      `Il nostro team lavora dal lunedì al venerdì, dalle 9:00 alle 18:00 CET (escluse le festività belghe). Ordini e richieste ricevuti fuori da questi orari vengono elaborati il giorno lavorativo successivo, sempre entro il nostro tempo di gestione di ${hours} ore.`,
    sectionZones: "Zone di spedizione",
    zonesParagraph:
      "Spediamo in Belgio e nel resto dell'Unione Europea, oltre ad alcuni paesi limitrofi (Svizzera, Norvegia, Regno Unito) — la spedizione è gratuita verso ciascuna di queste destinazioni.",
    sectionTracking: "Tracciamento dell'ordine",
    trackingParagraph:
      "Una volta spedito il tuo ordine, riceverai un'e-mail con un numero di tracciamento. I clienti registrati possono seguire ogni ordine dal pagamento alla consegna nella propria area account.",
  },
  es: {
    sectionDelivery: "Opciones y tarifas de envío",
    colDestination: "Destino",
    colDeliveryTime: "Tiempo de entrega",
    colCost: "Coste",
    belgium: "Bélgica",
    restOfEu: "Resto de la UE y países vecinos",
    deliveryTime: (min, max) => `${min}–${max} días laborables`,
    free: "Gratis",
    deliveryParagraph: (hours) =>
      `El envío es siempre completamente gratuito, en cualquier pedido y hacia todos los destinos a los que entregamos — sin importe mínimo. Enviamos con transportistas de confianza (DPD, GLS, DHL y UPS). Cada pedido se procesa y se envía dentro de ${hours} horas en días laborables; los pedidos realizados antes de las 14:00 CET en un día laborable suelen enviarse el mismo día.`,
    sectionHours: "Horario de atención",
    hoursParagraph: (hours) =>
      `Nuestro equipo trabaja de lunes a viernes, de 9:00 a 18:00 CET (excepto festivos belgas). Los pedidos y consultas recibidos fuera de este horario se procesan el siguiente día laborable, siempre dentro de nuestro plazo de ${hours} horas.`,
    sectionZones: "Zonas de envío",
    zonesParagraph:
      "Enviamos a Bélgica y al resto de la Unión Europea, además de algunos países vecinos (Suiza, Noruega, Reino Unido) — el envío es gratuito a cada uno de estos destinos.",
    sectionTracking: "Seguimiento de tu pedido",
    trackingParagraph:
      "Una vez enviado tu pedido, recibirás un correo electrónico con un número de seguimiento. Los clientes registrados pueden seguir cada pedido desde el pago hasta la entrega en su área de cuenta.",
  },
  nl: {
    sectionDelivery: "Verzendopties & tarieven",
    colDestination: "Bestemming",
    colDeliveryTime: "Levertijd",
    colCost: "Kosten",
    belgium: "Belgïe",
    restOfEu: "Rest van de EU & buurlanden",
    deliveryTime: (min, max) => `${min}–${max} werkdagen`,
    free: "Gratis",
    deliveryParagraph: (hours) =>
      `De verzending is altijd volledig gratis, voor elke bestelling en naar elke bestemming die wij bedienen — geen minimumbedrag vereist. Wij verzenden met betrouwbare vervoerders (DPD, GLS, DHL en UPS). Elke bestelling wordt binnen ${hours} uur op werkdagen verwerkt en verzonden; bestellingen die voor 14:00 CET op een werkdag worden geplaatst, worden vaak nog dezelfde dag verzonden.`,
    sectionHours: "Openingstijden",
    hoursParagraph: (hours) =>
      `Ons team werkt van maandag tot vrijdag, 9:00–18:00 CET (met uitzondering van Belgische feestdagen). Bestellingen en vragen die buiten deze uren worden ontvangen, worden op de volgende werkdag verwerkt, nog steeds binnen onze doorlooptijd van ${hours} uur.`,
    sectionZones: "Verzendzones",
    zonesParagraph:
      "Wij verzenden naar Belgïe en de rest van de Europese Unie plus enkele buurlanden (Zwitserland, Noorwegen, Verenigd Koninkrijk) — de verzending is gratis naar elk van deze bestemmingen.",
    sectionTracking: "Uw bestelling volgen",
    trackingParagraph:
      "Zodra uw bestelling is verzonden, ontvangt u een e-mail met een trackingnummer. Geregistreerde klanten kunnen elke bestelling van betaling tot levering volgen in hun accountgedeelte.",
  },
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : "en"
  const dict = await getDictionary(locale)
  return { title: dict.footer.shipping }
}

export default async function ShippingPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : "en"
  const dict = await getDictionary(locale)
  const c = COPY[locale]

  return (
    <ProsePage
      locale={locale}
      dict={dict}
      title={dict.footer.shipping}
      crumbs={[{ label: dict.common.home, href: "/" }, { label: dict.footer.shipping }]}
    >
      <ProseSection heading={c.sectionDelivery}>
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary text-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">{c.colDestination}</th>
                <th className="px-4 py-3 font-semibold">{c.colDeliveryTime}</th>
                <th className="px-4 py-3 font-semibold">{c.colCost}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="px-4 py-3 font-medium text-foreground">{c.belgium}</td>
                <td className="px-4 py-3">{c.deliveryTime(DELIVERY_MIN_DAYS, DELIVERY_MAX_DAYS)}</td>
                <td className="px-4 py-3 font-medium text-primary">{c.free}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-foreground">{c.restOfEu}</td>
                <td className="px-4 py-3">{c.deliveryTime(DELIVERY_MIN_DAYS, DELIVERY_MAX_DAYS)}</td>
                <td className="px-4 py-3 font-medium text-primary">{c.free}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>{c.deliveryParagraph(DISPATCH_HOURS)}</p>
      </ProseSection>

      <ProseSection heading={c.sectionHours}>
        <p>{c.hoursParagraph(DISPATCH_HOURS)}</p>
      </ProseSection>

      <ProseSection heading={c.sectionZones}>
        <p>{c.zonesParagraph}</p>
      </ProseSection>

      <ProseSection heading={c.sectionTracking}>
        <p>{c.trackingParagraph}</p>
      </ProseSection>
    </ProsePage>
  )
}
