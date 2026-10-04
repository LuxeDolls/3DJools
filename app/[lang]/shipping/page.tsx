import { isLocale, type Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { ProsePage, ProseSection } from "@/components/legal/prose-page"
import { DELIVERY_MAX_DAYS, DELIVERY_MIN_DAYS } from "@/lib/shipping/rates"

type ShippingCopy = {
  sectionDelivery: string
  colDestination: string
  colDeliveryTime: string
  colCost: string
  belgium: string
  restOfEu: string
  deliveryTime: (min: number, max: number) => string
  free: string
  deliveryParagraph: string
  sectionHours: string
  hoursParagraph: string
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
    deliveryParagraph:
      "Shipping is completely free on every order, to every destination we deliver to — no minimum spend required. We ship with trusted carriers (DPD, GLS, DHL and UPS). Orders are handled within 0–1 business day Monday to Friday, and transit takes 3–5 business days. Orders placed by 15:00 CET on a working day enter the handling window that day.",
    sectionHours: "Business hours",
    hoursParagraph:
      "Our team works Monday to Friday, 9:00–18:00 CET (excluding Belgian public holidays). The total estimated delivery time is 3–6 business days: 0–1 business day handling plus 3–5 business days in transit. Orders placed by 15:00 CET are processed within the stated handling window.",
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
    deliveryParagraph:
      "Der Versand ist bei jeder Bestellung und zu jedem Lieferziel völlig kostenlos — kein Mindestbestellwert erforderlich. Wir versenden mit vertrauenswürdigen Paketdiensten (DPD, GLS, DHL und UPS). Bestellungen werden von Montag bis Freitag innerhalb von 0–1 Werktag bearbeitet; der Transport dauert 3–5 Werktage. Bestellungen, die bis 15:00 Uhr MEZ an einem Werktag eingehen, werden an diesem Tag in das Bearbeitungsfenster aufgenommen.",
    sectionHours: "Geschäftszeiten",
    hoursParagraph:
      "Unser Team arbeitet Montag bis Freitag von 9:00 bis 18:00 Uhr MEZ (außer an belgischen Feiertagen). Die voraussichtliche Gesamtlieferzeit beträgt 3–6 Werktage: 0–1 Werktag Bearbeitung plus 3–5 Werktage Transport. Bestellungen bis 15:00 Uhr MEZ werden innerhalb des angegebenen Bearbeitungsfensters bearbeitet.",
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
    deliveryParagraph:
      "La livraison est entièrement gratuite pour toute commande, vers toutes les destinations que nous livrons — aucun montant minimum requis. Nous expédions avec des transporteurs de confiance (DPD, GLS, DHL et UPS). Les commandes sont traitées sous 0 à 1 jour ouvré du lundi au vendredi ; le transport prend 3 à 5 jours ouvrés. Les commandes passées avant 15h00 CET un jour ouvré entrent dans le délai de traitement du jour.",
    sectionHours: "Horaires d'ouverture",
    hoursParagraph:
      "Notre équipe travaille du lundi au vendredi, de 9h00 à 18h00 CET (hors jours fériés belges). Le délai total estimé est de 3 à 6 jours ouvrés : 0 à 1 jour ouvré de traitement, puis 3 à 5 jours ouvrés de transport. Les commandes passées avant 15h00 CET sont traitées dans le délai indiqué.",
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
    deliveryParagraph:
      "La spedizione è sempre completamente gratuita, per qualsiasi ordine e verso tutte le destinazioni servite — nessun importo minimo richiesto. Spediamo con corrieri affidabili (DPD, GLS, DHL e UPS). Ogni ordine viene elaborato entro 0–1 giorno lavorativo dal lunedì al venerdì; il trasporto richiede 3–5 giorni lavorativi. Gli ordini effettuati entro le 15:00 CET di un giorno lavorativo entrano nel periodo di gestione della giornata.",
    sectionHours: "Orari di apertura",
    hoursParagraph:
      "Il nostro team lavora dal lunedì al venerdì, dalle 9:00 alle 18:00 CET (escluse le festività belghe). Il tempo totale stimato di consegna è di 3–6 giorni lavorativi: 0–1 giorno lavorativo di gestione più 3–5 giorni lavorativi di trasporto. Gli ordini effettuati entro le 15:00 CET vengono elaborati entro il periodo indicato.",
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
    deliveryParagraph:
      "El envío es siempre completamente gratuito, en cualquier pedido y hacia todos los destinos a los que entregamos ��� sin importe mínimo. Enviamos con transportistas de confianza (DPD, GLS, DHL y UPS). Cada pedido se procesa en un plazo de 0–1 día laborable de lunes a viernes; el transporte tarda 3–5 días laborables. Los pedidos realizados antes de las 15:00 CET en un día laborable entran en el plazo de gestión de ese día.",
    sectionHours: "Horario de atención",
    hoursParagraph:
      "Nuestro equipo trabaja de lunes a viernes, de 9:00 a 18:00 CET (excepto festivos belgas). El plazo total estimado de entrega es de 3–6 días laborables: 0–1 día laborable de gestión más 3–5 días laborables de transporte. Los pedidos realizados antes de las 15:00 CET se procesan dentro del plazo indicado.",
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
    deliveryParagraph:
      "De verzending is altijd volledig gratis, voor elke bestelling en naar elke bestemming die wij bedienen — geen minimumbedrag vereist. Wij verzenden met betrouwbare vervoerders (DPD, GLS, DHL en UPS). Elke bestelling wordt van maandag tot vrijdag binnen 0–1 werkdag verwerkt; het transport duurt 3–5 werkdagen. Bestellingen die vóór 15:00 CET op een werkdag worden geplaatst, vallen die dag binnen het verwerkingstijdvenster.",
    sectionHours: "Openingstijden",
    hoursParagraph:
      "Ons team werkt van maandag tot vrijdag, 9:00–18:00 CET (met uitzondering van Belgische feestdagen). De totale geschatte levertijd bedraagt 3–6 werkdagen: 0–1 werkdag verwerking plus 3–5 werkdagen transport. Bestellingen vóór 15:00 CET worden binnen het vermelde verwerkingstijdvenster verwerkt.",
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
        <p>{c.deliveryParagraph}</p>
      </ProseSection>

      <ProseSection heading={c.sectionHours}>
        <p>{c.hoursParagraph}</p>
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
