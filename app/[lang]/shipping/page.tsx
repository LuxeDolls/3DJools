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
  home: string
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
    sectionDelivery: "Shipping rates & transit schedule",
    colDestination: "Delivery region",
    colDeliveryTime: "Total delivery window",
    colCost: "Shipping fee",
    home: "Belgium",
    restOfEu: "All other EU countries & neighbouring territories",
    deliveryTime: (min, max) => `${min}–${max} business days`,
    free: "Free (0 €)",
    deliveryParagraph:
      "Every order placed on 3DEureka ships completely free of charge to all supported destinations, with no minimum order threshold. Parcels are carried by our dedicated logistics service, 3DEureka Courier; where a delivery address falls outside our direct fleet coverage, we hand the shipment over to DHL or DPD. Warehouse handling takes 0–2 business days (Monday to Friday) and road/air transit takes 3–5 business days. Orders submitted before 15:00 CET on a business day enter the handling queue that same day.",
    sectionHours: "Dispatch schedule & operating hours",
    hoursParagraph:
      "Our warehouse and support teams operate Monday through Friday from 9:00 to 18:00 CET, excluding official Belgian public holidays. Across all routes, the total estimated delivery timeframe is 3–7 business days — combining 0–2 business days for order preparation with 3–5 business days in transit. Orders confirmed by 15:00 CET are queued within the stated preparation window.",
    sectionZones: "Countries we deliver to",
    zonesParagraph:
      "We deliver throughout Belgium, across every member state of the European Union, and to selected neighbouring countries (Switzerland, Norway, and the United Kingdom) — always with complimentary shipping.",
    sectionTracking: "Live parcel tracking",
    trackingParagraph:
      "As soon as your parcel is dispatched, we send you an email with your tracking reference and a direct link to follow the shipment on our website. Automatic email updates are sent whenever the delivery milestone changes, including any handover to DHL or DPD. Customers with an account can also review the complete delivery timeline under their order history.",
  },
  de: {
    sectionDelivery: "Versandtarife & Laufzeiten",
    colDestination: "Liefergebiet",
    colDeliveryTime: "Gesamtlieferzeit",
    colCost: "Versandkosten",
    home: "Belgien",
    restOfEu: "Übrige EU-Staaten & Nachbarländer",
    deliveryTime: (min, max) => `${min}–${max} Werktage`,
    free: "Kostenlos (0 €)",
    deliveryParagraph:
      "Jede Bestellung bei 3DEureka wird ohne Mindestbestellwert komplett versandkostenfrei an alle unterstützten Zielorte geliefert. Den Transport übernimmt unser eigener Zustelldienst 3DEureka Courier; liegt eine Zieladresse außerhalb unseres direkten Streckennetzes, übergeben wir die Sendung an DHL oder DPD. Die Lagerbearbeitung dauert montags bis freitags 0–2 Werktage, die anschließende Transportlaufzeit beträgt 3–5 Werktage. Bestellungen, die werktags vor 15:00 Uhr MEZ eingehen, starten noch am selben Tag in das Bearbeitungsfenster.",
    sectionHours: "Abfertigungs- & Geschäftszeiten",
    hoursParagraph:
      "Unser Logistik- und Serviceteam ist von Montag bis Freitag zwischen 9:00 und 18:00 Uhr MEZ im Einsatz (ausgenommen gesetzliche Feiertage in Belgien). Die voraussichtliche Gesamtlieferdauer beläuft sich auf 3–7 Werktage, bestehend aus 0–2 Werktagen Vorbereitung und 3–5 Werktagen Beförderung. Bestellungen bis 15:00 Uhr MEZ werden innerhalb des genannten Bearbeitungszeitraums abgefertigt.",
    sectionZones: "Lieferländer",
    zonesParagraph:
      "Wir beliefern ganz Belgien, sämtliche weiteren Mitgliedstaaten der Europäischen Union sowie ausgewählte Nachbarstaaten (Schweiz, Norwegen und Vereinigtes Königreich) — in jedes dieser Länder liefern wir versandkostenfrei.",
    sectionTracking: "Sendungsverfolgung in Echtzeit",
    trackingParagraph:
      "Unmittelbar nach dem Versand erhalten Sie per E-Mail Ihre Sendungsnummer sowie einen Direktlink zur Online-Verfolgung. Bei jedem neuen Zustellstatus — einschließlich einer Übergabe an DHL oder DPD — informieren wir Sie automatisch per E-Mail. Mit einem Kundenkonto können Sie den gesamten Sendungsverlauf jederzeit in Ihrer Bestellübersicht einsehen.",
  },
  fr: {
    sectionDelivery: "Tarifs d'expédition & délais d'acheminement",
    colDestination: "Zone de livraison",
    colDeliveryTime: "Délai global",
    colCost: "Frais de port",
    home: "Belgique",
    restOfEu: "Autres pays de l'UE & pays voisins",
    deliveryTime: (min, max) => `${min}–${max} jours ouvrés`,
    free: "Gratuit (0 €)",
    deliveryParagraph:
      "Toutes les commandes passées sur 3DEureka bénéficient de la livraison gratuite vers l'ensemble des destinations desservies, sans montant minimum d'achat. L'acheminement est assuré par notre propre flotte, 3DEureka Courier ; lorsqu'un trajet sort de notre couverture directe, nous confions le colis à DHL ou DPD. La préparation en entrepôt prend 0 à 2 jours ouvrés (du lundi au vendredi) et le transport dure 3 à 5 jours ouvrés. Toute commande validée avant 15h00 CET un jour ouvré intègre le créneau de préparation le jour même.",
    sectionHours: "Horaires de préparation & d'ouverture",
    hoursParagraph:
      "Nos équipes logistiques et support travaillent du lundi au vendredi de 9h00 à 18h00 CET (hors jours fériés en Belgique). Le délai global estimé est de 3 à 7 jours ouvrés, comprenant 0 à 2 jours ouvrés de préparation et 3 à 5 jours ouvrés de transit. Les commandes enregistrées avant 15h00 CET sont traitées dans le créneau annoncé.",
    sectionZones: "Pays desservis",
    zonesParagraph:
      "Nous expédions en Belgique, dans tous les autres États membres de l'Union européenne ainsi que vers plusieurs pays voisins (Suisse, Norvège et Royaume-Uni) — toujours sans frais de livraison.",
    sectionTracking: "Suivi de colis en direct",
    trackingParagraph:
      "Dès la remise en expédition de votre commande, vous recevez un e-mail contenant votre numéro de suivi et un lien direct pour suivre son avancement sur notre site. Une notification vous est également envoyée à chaque étape clé, y compris lors d'un relais par DHL ou DPD. Les clients disposant d'un compte retrouvent l'historique complet dans leur espace personnel.",
  },
  it: {
    sectionDelivery: "Tariffe di spedizione & tempi di percorrenza",
    colDestination: "Area di consegna",
    colDeliveryTime: "Tempistica totale",
    colCost: "Costo di spedizione",
    home: "Belgio",
    restOfEu: "Altri Paesi UE & nazioni limitrofe",
    deliveryTime: (min, max) => `${min}–${max} giorni lavorativi`,
    free: "Gratuita (0 €)",
    deliveryParagraph:
      "Ogni ordine effettuato su 3DEureka viaggia con spedizione completamente gratuita verso tutte le destinazioni servite, senza alcun ordine minimo. Consegniamo tramite la nostra flotta proprietaria, 3DEureka Courier; qualora una tratta non sia coperta direttamente dal nostro corriere, affidiamo la spedizione a DHL o DPD. La preparazione in magazzino richiede 0–2 giorni lavorativi (dal lunedì al venerdì), mentre il transito impiega 3–5 giorni lavorativi. Gli ordini confermati entro le 15:00 CET di un giorno lavorativo entrano nella finestra di preparazione lo stesso giorno.",
    sectionHours: "Orari operativi & gestione ordini",
    hoursParagraph:
      "Il nostro reparto logistico e l'assistenza clienti sono attivi dal lunedì al venerdì, dalle 9:00 alle 18:00 CET (escluse le festività nazionali belghe). Il tempo complessivo stimato per la consegna è di 3–7 giorni lavorativi: 0–2 giorni lavorativi per l'allestimento più 3–5 giorni lavorativi di viaggio. Gli ordini ricevuti entro le 15:00 CET vengono gestiti entro la finestra indicata.",
    sectionZones: "Aree geografiche coperte",
    zonesParagraph:
      "Effettuiamo consegne in Belgio, in tutti gli altri Stati membri dell'Unione Europea e in alcuni Paesi limitrofi (Svizzera, Norvegia e Regno Unito), sempre con spedizione gratuita.",
    sectionTracking: "Monitoraggio della spedizione",
    trackingParagraph:
      "Alla partenza del pacco ti inviamo un'e-mail con il codice di tracciamento e il link diretto per controllare la spedizione su questo sito. Riceverai aggiornamenti automatici via e-mail a ogni cambio di stato, incluso l'eventuale affidamento a DHL o DPD. Gli utenti registrati possono consultare l'intero storico anche dal proprio profilo.",
  },
  es: {
    sectionDelivery: "Tarifas de transporte y plazos de entrega",
    colDestination: "Región de destino",
    colDeliveryTime: "Plazo total estimado",
    colCost: "Coste de envío",
    home: "Bélgica",
    restOfEu: "Resto de la Unión Europea y países vecinos",
    deliveryTime: (min, max) => `${min}–${max} días laborables`,
    free: "Gratis (0 €)",
    deliveryParagraph:
      "Todos los pedidos realizados en 3DEureka cuentan con envío totalmente gratuito hacia cualquier destino habilitado, sin exigencia de compra mínima. El reparto se realiza con nuestro propio servicio logístico, 3DEureka Courier; cuando una ruta queda fuera de nuestra cobertura directa, cedemos el paquete a DHL o DPD. La preparación en almacén lleva de 0 a 2 días laborables (de lunes a viernes) y el transporte en ruta tarda de 3 a 5 días laborables. Los pedidos registrados antes de las 15:00 CET en día laborable entran en preparación ese mismo día.",
    sectionHours: "Horario operativo y de expedición",
    hoursParagraph:
      "Nuestro equipo trabaja de lunes a viernes entre las 9:00 y las 18:00 CET (exceptuando los días festivos en Bélgica). El tiempo total estimado de entrega es de 3 a 7 días laborables: de 0 a 2 días laborables de preparación más de 3 a 5 días laborables de tránsito. Los pedidos recibidos antes de las 15:00 CET se tramitan dentro del margen de preparación indicado.",
    sectionZones: "Países a los que enviamos",
    zonesParagraph:
      "Realizamos entregas en Bélgica, en todos los demás países de la Unión Europea y en varios estados vecinos (Suiza, Noruega y Reino Unido) — siempre con envío sin coste.",
    sectionTracking: "Seguimiento en tiempo real",
    trackingParagraph:
      "Tan pronto como tu pedido sale de nuestras instalaciones, te enviamos un correo electrónico con el código de seguimiento y un enlace para consultar su avance en esta web. Además, recibirás avisos por correo en cada cambio de estado, incluida la entrega a DHL o DPD cuando corresponda. Los clientes con cuenta pueden revisar todo el historial desde su panel.",
  },
  nl: {
    sectionDelivery: "Verzendkosten & levertijden",
    colDestination: "Leveringsgebied",
    colDeliveryTime: "Totale levertijd",
    colCost: "Verzendtarief",
    home: "België",
    restOfEu: "Overige EU-landen & omliggende landen",
    deliveryTime: (min, max) => `${min}–${max} werkdagen`,
    free: "Gratis (0 €)",
    deliveryParagraph:
      "Elke bestelling bij 3DEureka wordt volledig gratis verzonden naar alle ondersteunde bestemmingen, zonder minimumbestelbedrag. Wij bezorgen met onze eigen vervoersdienst, 3DEureka Courier; valt een adres buiten onze directe route, dan dragen wij het pakket over aan DHL of DPD. De magazijnverwerking duurt van maandag tot en met vrijdag 0–2 werkdagen en het transport neemt 3–5 werkdagen in beslag. Bestellingen die op een werkdag vóór 15:00 CET binnenkomen, gaan diezelfde dag nog het verwerkingsproces in.",
    sectionHours: "Verwerkings- en openingstijden",
    hoursParagraph:
      "Ons magazijn- en supportteam is bereikbaar van maandag tot en met vrijdag van 9:00 tot 18:00 CET (met uitzondering van Belgische feestdagen). De totale geschatte levertijd bedraagt 3–7 werkdagen: 0–2 werkdagen voorbereiding plus 3–5 werkdagen onderweg. Bestellingen vóór 15:00 CET worden binnen het aangegeven tijdvenster verwerkt.",
    sectionZones: "Landen waar wij bezorgen",
    zonesParagraph:
      "Wij leveren in heel België, in alle andere lidstaten van de Europese Unie en in enkele buurlanden (Zwitserland, Noorwegen en het Verenigd Koninkrijk) — altijd met gratis verzending.",
    sectionTracking: "Live pakkettracking",
    trackingParagraph:
      "Zodra uw pakket ons magazijn verlaat, sturen wij u een e-mail met uw trackingnummer en een directe link om de zending op deze website te volgen. Bij elke nieuwe status — inclusief een eventuele overdracht aan DHL of DPD — ontvangt u automatisch een bericht. Geregistreerde klanten kunnen de volledige verzendhistorie ook in hun account bekijken.",
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
                <td className="px-4 py-3 font-medium text-foreground">{c.home}</td>
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

      <ProseSection heading={c.sectionZones}>
        <p>{c.zonesParagraph}</p>
      </ProseSection>

      <ProseSection heading={c.sectionHours}>
        <p>{c.hoursParagraph}</p>
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
