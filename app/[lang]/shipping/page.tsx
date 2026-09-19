import { isLocale, type Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { ProsePage, ProseSection } from "@/components/legal/prose-page"
import {
  DELIVERY_MAX_DAYS,
  DELIVERY_MIN_DAYS,
  DISPATCH_HOURS,
  DOMESTIC_RATE_CENTS,
  FREE_SHIPPING_THRESHOLD_CENTS,
  INTERNATIONAL_RATE_CENTS,
} from "@/lib/shipping/rates"

function formatEuro(cents: number): string {
  return `€${(cents / 100).toFixed(2).replace(/\.00$/, "")}`
}

type ShippingCopy = {
  sectionDelivery: string
  colDestination: string
  colDeliveryTime: string
  colCost: string
  belgium: string
  restOfEu: string
  deliveryTime: (min: number, max: number) => string
  freeOver: (amount: string) => string
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
    freeOver: (amount) => `(free over ${amount})`,
    deliveryParagraph: (hours) =>
      `The delivery country you select at checkout automatically determines your shipping cost — no manual calculation needed. We ship with trusted carriers (DPD, GLS, DHL and UPS). Every order is processed and dispatched within ${hours} hours on business days; orders placed before 14:00 CET on a working day are often dispatched the same day. Our 3D printers, laser engravers and other equipment are large and heavy, so the flat international rate reflects the real cost of shipping this kind of freight — there are no additional surprise surcharges at checkout.`,
    sectionHours: "Business hours",
    hoursParagraph: (hours) =>
      `Our team works Monday to Friday, 9:00–18:00 CET (excluding Belgian public holidays). Orders and enquiries received outside these hours are processed on the next business day, still within our ${hours}-hour turnaround.`,
    sectionZones: "Shipping zones",
    zonesParagraph:
      "We ship to Belgium and to the rest of the European Union plus a handful of neighbouring countries (Switzerland, Norway, United Kingdom). Belgium is our domestic market and has a lower flat rate; every other destination we deliver to pays the same flat international rate regardless of distance.",
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
    freeOver: (amount) => `(kostenlos ab ${amount})`,
    deliveryParagraph: (hours) =>
      `Das an der Kasse ausgewählte Lieferland bestimmt automatisch die Versandkosten — keine manuelle Berechnung nötig. Wir versenden mit vertrauenswürdigen Paketdiensten (DPD, GLS, DHL und UPS). Jede Bestellung wird innerhalb von ${hours} Stunden an Werktagen bearbeitet und versandt; Bestellungen, die vor 14:00 Uhr MEZ an einem Werktag eingehen, werden häufig noch am selben Tag versandt. Unsere 3D-Drucker, Lasergravierer und andere Geräte sind groß und schwer, daher spiegelt die einheitliche internationale Pauschale die tatsächlichen Versandkosten für diese Art von Fracht wider — es gibt keine versteckten Zusatzkosten an der Kasse.`,
    sectionHours: "Geschäftszeiten",
    hoursParagraph: (hours) =>
      `Unser Team arbeitet Montag bis Freitag von 9:00 bis 18:00 Uhr MEZ (außer an belgischen Feiertagen). Bestellungen und Anfragen außerhalb dieser Zeiten werden am nächsten Werktag bearbeitet, weiterhin innerhalb unserer ${hours}-Stunden-Bearbeitungszeit.`,
    sectionZones: "Versandzonen",
    zonesParagraph:
      "Wir versenden nach Belgien sowie in die übrige Europäische Union und einige Nachbarländer (Schweiz, Norwegen, Vereinigtes Königreich). Belgien ist unser Heimatmarkt mit einer niedrigeren Pauschale; jedes andere Lieferziel zahlt dieselbe internationale Pauschale unabhängig von der Entfernung.",
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
    freeOver: (amount) => `(gratuit au-delà de ${amount})`,
    deliveryParagraph: (hours) =>
      `Le pays de livraison sélectionné lors du paiement détermine automatiquement les frais de port — aucun calcul manuel nécessaire. Nous expédions avec des transporteurs de confiance (DPD, GLS, DHL et UPS). Chaque commande est traitée et expédiée dans un délai de ${hours} heures les jours ouvrés ; les commandes passées avant 14h00 CET un jour ouvré sont souvent expédiées le jour même. Nos imprimantes 3D, graveurs laser et autres équipements sont volumineux et lourds, donc le tarif international forfaitaire reflète le coût réel d'expédition de ce type de fret — aucun frais supplémentaire surprise lors du paiement.`,
    sectionHours: "Horaires d'ouverture",
    hoursParagraph: (hours) =>
      `Notre équipe travaille du lundi au vendredi, de 9h00 à 18h00 CET (hors jours fériés belges). Les commandes et demandes reçues hors de ces horaires sont traitées le jour ouvré suivant, toujours dans notre délai de ${hours} heures.`,
    sectionZones: "Zones de livraison",
    zonesParagraph:
      "Nous livrons en Belgique ainsi que dans le reste de l'Union européenne et quelques pays voisins (Suisse, Norvège, Royaume-Uni). La Belgique est notre marché domestique avec un tarif forfaitaire plus bas ; toute autre destination que nous livrons paie le même tarif international forfaitaire, quelle que soit la distance.",
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
    freeOver: (amount) => `(gratuita sopra ${amount})`,
    deliveryParagraph: (hours) =>
      `Il paese di consegna selezionato al momento del pagamento determina automaticamente il costo di spedizione — nessun calcolo manuale necessario. Spediamo con corrieri affidabili (DPD, GLS, DHL e UPS). Ogni ordine viene elaborato e spedito entro ${hours} ore nei giorni lavorativi; gli ordini effettuati prima delle 14:00 CET in un giorno lavorativo vengono spesso spediti lo stesso giorno. Le nostre stampanti 3D, incisori laser e altre attrezzature sono grandi e pesanti, quindi la tariffa internazionale forfettaria riflette il costo reale della spedizione di questo tipo di merce — nessun costo aggiuntivo a sorpresa al momento del pagamento.`,
    sectionHours: "Orari di apertura",
    hoursParagraph: (hours) =>
      `Il nostro team lavora dal lunedì al venerdì, dalle 9:00 alle 18:00 CET (escluse le festività belghe). Ordini e richieste ricevuti fuori da questi orari vengono elaborati il giorno lavorativo successivo, sempre entro il nostro tempo di gestione di ${hours} ore.`,
    sectionZones: "Zone di spedizione",
    zonesParagraph:
      "Spediamo in Belgio e nel resto dell'Unione Europea, oltre ad alcuni paesi limitrofi (Svizzera, Norvegia, Regno Unito). Il Belgio è il nostro mercato nazionale con una tariffa forfettaria inferiore; ogni altra destinazione paga la stessa tariffa internazionale forfettaria, indipendentemente dalla distanza.",
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
    freeOver: (amount) => `(gratis a partir de ${amount})`,
    deliveryParagraph: (hours) =>
      `El país de entrega seleccionado en el pago determina automáticamente el coste de envío — sin cálculos manuales. Enviamos con transportistas de confianza (DPD, GLS, DHL y UPS). Cada pedido se procesa y se envía dentro de ${hours} horas en días laborables; los pedidos realizados antes de las 14:00 CET en un día laborable suelen enviarse el mismo día. Nuestras impresoras 3D, grabadoras láser y otros equipos son grandes y pesados, por lo que la tarifa internacional plana refleja el coste real de enviar este tipo de carga — sin recargos sorpresa adicionales al pagar.`,
    sectionHours: "Horario de atención",
    hoursParagraph: (hours) =>
      `Nuestro equipo trabaja de lunes a viernes, de 9:00 a 18:00 CET (excepto festivos belgas). Los pedidos y consultas recibidos fuera de este horario se procesan el siguiente día laborable, siempre dentro de nuestro plazo de ${hours} horas.`,
    sectionZones: "Zonas de envío",
    zonesParagraph:
      "Enviamos a Bélgica y al resto de la Unión Europea, además de algunos países vecinos (Suiza, Noruega, Reino Unido). Bélgica es nuestro mercado nacional con una tarifa plana más baja; cualquier otro destino al que enviamos paga la misma tarifa internacional plana, independientemente de la distancia.",
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
    freeOver: (amount) => `(gratis vanaf ${amount})`,
    deliveryParagraph: (hours) =>
      `Het afleverland dat u bij het afrekenen selecteert, bepaalt automatisch uw verzendkosten — geen handmatige berekening nodig. Wij verzenden met betrouwbare vervoerders (DPD, GLS, DHL en UPS). Elke bestelling wordt binnen ${hours} uur op werkdagen verwerkt en verzonden; bestellingen die voor 14:00 CET op een werkdag worden geplaatst, worden vaak nog dezelfde dag verzonden. Onze 3D-printers, lasergraveermachines en andere apparatuur zijn groot en zwaar, dus het vaste internationale tarief weerspiegelt de werkelijke kosten van het verzenden van dit type vracht — geen verrassende extra kosten bij het afrekenen.`,
    sectionHours: "Openingstijden",
    hoursParagraph: (hours) =>
      `Ons team werkt van maandag tot vrijdag, 9:00–18:00 CET (met uitzondering van Belgische feestdagen). Bestellingen en vragen die buiten deze uren worden ontvangen, worden op de volgende werkdag verwerkt, nog steeds binnen onze doorlooptijd van ${hours} uur.`,
    sectionZones: "Verzendzones",
    zonesParagraph:
      "Wij verzenden naar Belgïe en de rest van de Europese Unie plus enkele buurlanden (Zwitserland, Noorwegen, Verenigd Koninkrijk). Belgïe is onze thuismarkt met een lager vast tarief; elke andere bestemming waar wij naar leveren betaalt hetzelfde vaste internationale tarief, ongeacht de afstand.",
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
                <td className="px-4 py-3">
                  {formatEuro(DOMESTIC_RATE_CENTS)}{" "}
                  <span className="font-medium text-primary">
                    {c.freeOver(formatEuro(FREE_SHIPPING_THRESHOLD_CENTS))}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-foreground">{c.restOfEu}</td>
                <td className="px-4 py-3">{c.deliveryTime(DELIVERY_MIN_DAYS, DELIVERY_MAX_DAYS)}</td>
                <td className="px-4 py-3">
                  {formatEuro(INTERNATIONAL_RATE_CENTS)}{" "}
                  <span className="font-medium text-primary">
                    {c.freeOver(formatEuro(FREE_SHIPPING_THRESHOLD_CENTS))}
                  </span>
                </td>
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
