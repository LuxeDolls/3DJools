import Link from "next/link"
import { isLocale, type Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { localizedPath } from "@/lib/i18n/paths"
import { ProsePage, ProseSection } from "@/components/legal/prose-page"
import { trackingPageCopy } from "@/lib/shipping/tracking"
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
      "Shipping is completely free on every order, to every destination we deliver to — no minimum spend required. We deliver with our own courier service, DnD3D Courier. If our courier cannot cover the route, we hand the parcel to DHL or DPD. Orders are handled within 0–2 business days Monday to Friday, and transit takes 3–5 business days. Orders placed by 15:00 CET on a working day enter the handling window that day.",
    sectionHours: "Business hours",
    hoursParagraph:
      "Our team works Monday to Friday, 9:00–18:00 CET (excluding Dutch public holidays). The total estimated delivery time is 3–7 business days: 0–2 business days handling plus 3–5 business days in transit. Orders placed by 15:00 CET are processed within the stated handling window.",
    sectionZones: "Shipping zones",
    zonesParagraph:
      "We ship to Belgium and to the rest of the European Union plus a handful of neighbouring countries (Switzerland, Norway, United Kingdom) — shipping is free to every one of these destinations.",
    sectionTracking: "Tracking your order",
    trackingParagraph:
      "Once your order ships you receive an email with a tracking number and a link to follow it on this site. You also receive an email each time the delivery status changes, including a handover to DHL or DPD when our own courier cannot complete the route. Registered customers can open an order in their account to see the full history.",
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
      "Der Versand ist bei jeder Bestellung und zu jedem Lieferziel völlig kostenlos — kein Mindestbestellwert erforderlich. Wir liefern mit unserem eigenen Kurierdienst, DnD3D Courier. Wenn unser Kurier die Strecke nicht abdecken kann, übergeben wir das Paket an DHL oder DPD. Bestellungen werden von Montag bis Freitag innerhalb von 0–2 Werktagen bearbeitet; der Transport dauert 3–5 Werktage. Bestellungen, die bis 15:00 Uhr MEZ an einem Werktag eingehen, werden an diesem Tag in das Bearbeitungsfenster aufgenommen.",
    sectionHours: "Geschäftszeiten",
    hoursParagraph:
      "Unser Team arbeitet Montag bis Freitag von 9:00 bis 18:00 Uhr MEZ (außer an niederländischen Feiertagen). Die voraussichtliche Gesamtlieferzeit beträgt 3–7 Werktage: 0–2 Werktage Bearbeitung plus 3–5 Werktage Transport. Bestellungen bis 15:00 Uhr MEZ werden innerhalb des angegebenen Bearbeitungsfensters bearbeitet.",
    sectionZones: "Versandzonen",
    zonesParagraph:
      "Wir versenden nach Belgien sowie in die übrige Europäische Union und einige Nachbarländer (Schweiz, Norwegen, Vereinigtes Königreich) — der Versand ist zu jedem dieser Ziele kostenlos.",
    sectionTracking: "Sendungsverfolgung",
    trackingParagraph:
      "Sobald Ihre Bestellung versandt wurde, erhalten Sie eine E-Mail mit einer Sendungsnummer und einem Link zur Sendungsverfolgung auf dieser Website. Bei jeder Statusänderung erhalten Sie eine weitere E-Mail, auch wenn das Paket an DHL oder DPD übergeben wird. Registrierte Kunden sehen den vollständigen Verlauf in ihrem Konto.",
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
      "La livraison est entièrement gratuite pour toute commande, vers toutes les destinations que nous livrons — aucun montant minimum requis. Nous livrons avec notre propre service de coursier, DnD3D Courier. Si notre coursier ne peut pas couvrir le trajet, nous remettons le colis à DHL ou DPD. Les commandes sont traitées sous 0 à 2 jours ouvrés du lundi au vendredi ; le transport prend 3 à 5 jours ouvrés. Les commandes passées avant 15h00 CET un jour ouvré entrent dans le délai de traitement du jour.",
    sectionHours: "Horaires d'ouverture",
    hoursParagraph:
      "Notre équipe travaille du lundi au vendredi, de 9h00 à 18h00 CET (hors jours fériés néerlandais). Le délai total estimé est de 3 à 7 jours ouvrés : 0 à 2 jours ouvrés de traitement, puis 3 à 5 jours ouvrés de transport. Les commandes passées avant 15h00 CET sont traitées dans le délai indiqué.",
    sectionZones: "Zones de livraison",
    zonesParagraph:
      "Nous livrons en Belgique ainsi que dans le reste de l'Union européenne et quelques pays voisins (Suisse, Norvège, Royaume-Uni) — la livraison est gratuite vers chacune de ces destinations.",
    sectionTracking: "Suivi de votre commande",
    trackingParagraph:
      "Une fois votre commande expédiée, vous recevez un e-mail avec un numéro de suivi et un lien pour la suivre sur ce site. Vous recevez aussi un e-mail à chaque changement de statut, y compris en cas de remise à DHL ou DPD. Les clients inscrits voient tout l'historique dans leur compte.",
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
      "La spedizione è sempre completamente gratuita, per qualsiasi ordine e verso tutte le destinazioni servite — nessun importo minimo richiesto. Consegniamo con il nostro servizio di corriere, DnD3D Courier. Se il nostro corriere non può coprire il percorso, affidiamo il pacco a DHL o DPD. Ogni ordine viene elaborato entro 0–2 giorni lavorativi dal lunedì al venerdì; il trasporto richiede 3–5 giorni lavorativi. Gli ordini effettuati entro le 15:00 CET di un giorno lavorativo entrano nel periodo di gestione della giornata.",
    sectionHours: "Orari di apertura",
    hoursParagraph:
      "Il nostro team lavora dal lunedì al venerdì, dalle 9:00 alle 18:00 CET (escluse le festività olandesi). Il tempo totale stimato di consegna è di 3–7 giorni lavorativi: 0–2 giorni lavorativi di gestione più 3–5 giorni lavorativi di trasporto. Gli ordini effettuati entro le 15:00 CET vengono elaborati entro il periodo indicato.",
    sectionZones: "Zone di spedizione",
    zonesParagraph:
      "Spediamo in Belgio e nel resto dell'Unione Europea, oltre ad alcuni paesi limitrofi (Svizzera, Norvegia, Regno Unito) — la spedizione è gratuita verso ciascuna di queste destinazioni.",
    sectionTracking: "Tracciamento dell'ordine",
    trackingParagraph:
      "Una volta spedito l'ordine, riceverai un'e-mail con un numero di tracciamento e un link per seguirlo su questo sito. Riceverai un'e-mail a ogni aggiornamento di stato, anche quando il pacco passa a DHL o DPD. I clienti registrati vedono l'intera cronologia nel proprio account.",
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
      "El envío es siempre completamente gratuito, en cualquier pedido y hacia todos los destinos a los que entregamos, sin importe mínimo. Entregamos con nuestro propio servicio de mensajería, DnD3D Courier. Si nuestro mensajero no puede cubrir la ruta, entregamos el paquete a DHL o DPD. Cada pedido se procesa en un plazo de 0–2 días laborables de lunes a viernes; el transporte tarda 3–5 días laborables. Los pedidos realizados antes de las 15:00 CET en un día laborable entran en el plazo de gestión de ese día.",
    sectionHours: "Horario de atención",
    hoursParagraph:
      "Nuestro equipo trabaja de lunes a viernes, de 9:00 a 18:00 CET (excepto festivos neerlandeses). El plazo total estimado de entrega es de 3–7 días laborables: 0–2 días laborables de gestión más 3–5 días laborables de transporte. Los pedidos realizados antes de las 15:00 CET se procesan dentro del plazo indicado.",
    sectionZones: "Zonas de envío",
    zonesParagraph:
      "Enviamos a Bélgica y al resto de la Unión Europea, además de algunos países vecinos (Suiza, Noruega, Reino Unido) — el envío es gratuito a cada uno de estos destinos.",
    sectionTracking: "Seguimiento de tu pedido",
    trackingParagraph:
      "Cuando el pedido se envía, recibes un correo con el número de seguimiento y un enlace para seguirlo en este sitio. También recibes un correo en cada cambio de estado, incluso si el paquete pasa a DHL o DPD. Los clientes registrados ven el historial completo en su cuenta.",
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
      "De verzending is altijd volledig gratis, voor elke bestelling en naar elke bestemming die wij bedienen — geen minimumbedrag vereist. Wij leveren met onze eigen koeriersdienst, DnD3D Courier. Als onze koerier de route niet kan dekken, geven wij het pakket door aan DHL of DPD. Elke bestelling wordt van maandag tot vrijdag binnen 0–2 werkdagen verwerkt; het transport duurt 3–5 werkdagen. Bestellingen die vóór 15:00 CET op een werkdag worden geplaatst, vallen die dag binnen het verwerkingstijdvenster.",
    sectionHours: "Openingstijden",
    hoursParagraph:
      "Ons team werkt van maandag tot vrijdag, 9:00–18:00 CET (met uitzondering van Nederlandse feestdagen). De totale geschatte levertijd bedraagt 3–7 werkdagen: 0–2 werkdagen verwerking plus 3–5 werkdagen transport. Bestellingen vóór 15:00 CET worden binnen het vermelde verwerkingstijdvenster verwerkt.",
    sectionZones: "Verzendzones",
    zonesParagraph:
      "Wij verzenden naar Belgïe en de rest van de Europese Unie plus enkele buurlanden (Zwitserland, Noorwegen, Verenigd Koninkrijk) — de verzending is gratis naar elk van deze bestemmingen.",
    sectionTracking: "Uw bestelling volgen",
    trackingParagraph:
      "Zodra uw bestelling is verzonden, ontvangt u een e-mail met een trackingnummer en een link om de zending op deze site te volgen. Bij elke statuswijziging ontvangt u opnieuw een e-mail, ook als het pakket naar DHL of DPD gaat. Geregistreerde klanten zien de volledige geschiedenis in hun account.",
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
        <p>
          <Link href={localizedPath(locale, "/track")} className="font-medium text-primary underline-offset-4 hover:underline">
            {trackingPageCopy(locale).title}
          </Link>
        </p>
      </ProseSection>
    </ProsePage>
  )
}
