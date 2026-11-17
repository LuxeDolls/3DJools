import { isLocale, type Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { ProsePage, ProseSection } from "@/components/legal/prose-page"
import { COMPANY, companyFullAddress, fillCompany } from "@/lib/company"

type ReturnsCopy = {
  cancelHeading: string
  cancel: string
  returnPolicyHeading: string
  returnPolicy: string
  howToHeading: string
  howTo: string
  whoPaysHeading: string
  whoPays: string
  warrantyHeading: string
  warranty: string
  damagedHeading: string
  damaged: string
  contactHeading: string
  contactPre: string
  contactMid: string
  contactPost: string
}

const COPY: Record<Locale, ReturnsCopy> = {
  en: {
    cancelHeading: "Cancelling an order before dispatch",
    cancel:
      "You may cancel any order at no cost within 2 hours of placing it, provided the parcel has not yet left our warehouse, simply by messaging us with your order number. Once a shipment has been handed to the courier, it can no longer be cancelled directly and is instead covered by our withdrawal and return procedure below.",
    returnPolicyHeading: "30-day voluntary return window",
    returnPolicy:
      "EU consumer legislation grants you a mandatory 14-day period after delivery to withdraw from a purchase without explanation. At 3DEureka we go beyond the statutory minimum and give you 30 calendar days from the day you receive your goods. Both defective and non-defective products are eligible for return, provided every item is unused, in its original condition, and packed in its original factory box. We do not offer direct product exchanges. To start a return, reach out to our team with your order reference and we will walk you through the steps.",
    howToHeading: "Returning your parcel & refund timing",
    howTo:
      "Returned merchandise must be sent back in its original state and packaging to: {legalName} (3DEureka returns), {street}, {postalCode} {city}, Belgium. After your parcel arrives at our facility and passes inspection, we credit the full refund to your original payment method within 7 working days. Orders settled via SEPA transfer or an instalment plan are refunded to the bank account from which payment was made.",
    whoPaysHeading: "Return postage & zero restocking fees",
    whoPays:
      "We cover the full cost of return shipping on all approved returns — whether the item is faulty or you simply changed your mind. You will receive a prepaid return label ready to download and print, and we never apply restocking or handling deductions. For parcels that arrive with transit damage or an out-of-box fault, please see the section below.",
    warrantyHeading: "Statutory 2-year warranty coverage",
    warranty:
      "Every machine sold by 3DEureka is backed by the statutory 2-year EU consumer guarantee against defects in materials and workmanship, in addition to any commercial warranty provided directly by the manufacturer. If your equipment develops a fault, our support specialists will coordinate repair or replacement with you.",
    damagedHeading: "Items arriving damaged or defective",
    damaged:
      "If your parcel shows transit damage or a hardware defect upon delivery, please contact us within 48 hours of receipt and attach clear photos so we can arrange a free replacement or prepaid return right away.",
    contactHeading: "How to reach our returns desk",
    contactPre: "For order cancellations, return labels, or refund enquiries, contact {legalName} by email at",
    contactMid: " (Mon–Fri, 9:00–18:00 CET), or by post at",
    contactPost: ".",
  },
  de: {
    cancelHeading: "Bestellung vor dem Versand stornieren",
    cancel:
      "Solange Ihr Paket unser Lager noch nicht verlassen hat, können Sie Ihre Bestellung innerhalb von 2 Stunden nach Aufgabe gebührenfrei stornieren — teilen Sie uns dazu einfach Ihre Bestellnummer mit. Ist die Sendung bereits unterwegs, greift anstelle einer Stornierung unser nachfolgend beschriebenes Widerrufs- und Rückgabeverfahren.",
    returnPolicyHeading: "Freiwilliges 30-Tage-Rückgaberecht",
    returnPolicy:
      "Nach dem EU-Verbraucherrecht steht Ihnen ein gesetzliches Widerrufsrecht von 14 Tagen ab Erhalt der Ware ohne Angabe von Gründen zu. Wir erweitern diesen Zeitraum freiwillig auf volle 30 Tage ab Zustellung. Zurückgegeben werden können sowohl mangelfreie als auch defekte Produkte, vorausgesetzt, die Ware ist neu, unbenutzt und befindet sich im Originalzustand samt Originalverpackung. Einen direkten Umtausch bieten wir nicht an. Melden Sie sich mit Ihrer Bestellreferenz bei uns, damit wir die Rücksendung für Sie einrichten.",
    howToHeading: "Ablauf der Rücksendung & Rückerstattung",
    howTo:
      "Bitte senden Sie die Ware im Originalzustand und in der Originalverpackung an folgende Adresse zurück: {legalName} (3DEureka Retouren), {street}, {postalCode} {city}, Belgien. Nach Eintreffen und Prüfung der Retoure überweisen wir den Erstattungsbetrag innerhalb von 7 Werktagen auf Ihr ursprünglich gewähltes Zahlungsmittel. Bei SEPA-Überweisungen und Ratenkäufen fließt die Erstattung auf das verwendete Bankkonto zurück.",
    whoPaysHeading: "Kostenloser Rückversand ohne Gebühren",
    whoPays:
      "Für sämtliche genehmigten Rücksendungen — unabhängig davon, ob ein Mangel vorliegt oder nicht — übernehmen wir die Versandkosten. Sie erhalten von uns ein vorfrankiertes Rücksendeetikett zum Herunterladen und Ausdrucken; Wiedereinlagerungsgebühren werden nicht erhoben. Hinweise zu Transportschäden oder Defekten bei Lieferung finden Sie im entsprechenden Abschnitt weiter unten.",
    warrantyHeading: "Gesetzliche 2-Jahres-Gewährleistung",
    warranty:
      "Alle von uns gelieferten Maschinen unterliegen der gesetzlichen zweijährigen EU-Verbrauchergewährleistung gegen Mängel sowie einer etwaigen zusätzlichen Herstellergarantie. Sollte ein Defekt auftreten, organisiert unser Support-Team gemeinsam mit Ihnen eine Reparatur oder ein Ersatzgerät.",
    damagedHeading: "Transportschäden oder Defekt bei Erhalt",
    damaged:
      "Sollte Ihre Lieferung beschädigt oder funktionsuntüchtig bei Ihnen eintreffen, senden Sie uns bitte innerhalb von 48 Stunden nach Empfang Fotos des Schadens. Wir veranlassen dann umgehend und kostenlos einen Ersatz oder die Rückholung.",
    contactHeading: "Kontakt für Rückgaben & Erstattungen",
    contactPre: "Bei Fragen zu Stornierungen, Rücksendeetiketten oder Rückzahlungen erreichen Sie {legalName} per E-Mail unter",
    contactMid: " (Mo–Fr, 9:00–18:00 Uhr MEZ) oder schriftlich unter",
    contactPost: ".",
  },
  fr: {
    cancelHeading: "Annuler une commande avant expédition",
    cancel:
      "Vous avez la possibilité d'annuler sans frais toute commande dans les 2 heures suivant sa validation, à condition qu'elle n'ait pas encore quitté notre entrepôt, en nous communiquant simplement votre numéro de commande. Dès que le colis est remis au transporteur, l'annulation directe n'est plus possible et la demande relève de la procédure de rétractation et de retour détaillée ci-après.",
    returnPolicyHeading: "Garantie de retour étendue à 30 jours",
    returnPolicy:
      "La réglementation européenne accorde aux consommateurs un délai légal de rétractation de 14 jours après réception sans avoir à se justifier. Chez 3DEureka, nous prolongeons volontairement cette période à 30 jours calendaires à compter de la livraison. Les articles défectueux comme non défectueux sont acceptés en retour, pour autant qu'ils soient neufs, non utilisés et restitués dans leur état et emballage d'origine. Les échanges directs ne sont pas proposés. Contactez notre équipe avec votre référence de commande pour lancer la démarche.",
    howToHeading: "Expédier un retour & délai de remboursement",
    howTo:
      "Les produits doivent être renvoyés dans leur état et leur boîte d'origine à l'adresse : {legalName} (retours 3DEureka), {street}, {postalCode} {city}, Belgique. Dès réception et contrôle des articles retournés, nous déclenchons le remboursement sur votre moyen de paiement initial dans un délai de 7 jours ouvrés. Pour les règlements par virement SEPA ou en plusieurs fois, les fonds sont reversés sur le compte bancaire ayant servi au paiement.",
    whoPaysHeading: "Frais de retour offerts & zéro frais de dossier",
    whoPays:
      "Les frais de port retour sont entièrement gratuits pour tous les retours validés, qu'il s'agisse d'un produit défectueux ou non. Nous mettons à votre disposition une étiquette de retour prépayée à télécharger et imprimer, sans jamais facturer de frais de restockage. Pour les colis livrés endommagés ou en panne au déballage, reportez-vous à la rubrique ci-dessous.",
    warrantyHeading: "Garantie légale européenne de 2 ans",
    warranty:
      "Chaque machine commercialisée par 3DEureka bénéficie de la garantie légale européenne de 2 ans contre les défauts de conformité, en complément de la garantie commerciale éventuelle du constructeur. En cas de dysfonctionnement, notre service d'assistance organise la réparation ou le remplacement.",
    damagedHeading: "Colis endommagé ou matériel défectueux à la livraison",
    damaged:
      "Si votre commande vous parvient endommagée ou présente un défaut dès la réception, prévenez-nous sous 48 heures avec des photos afin que nous mettions en place gratuitement un remplacement ou une reprise.",
    contactHeading: "Contacter le service des retours",
    contactPre: "Pour toute demande d'annulation, de retour ou de suivi de remboursement, joignez {legalName} par e-mail à",
    contactMid: " (lun.–ven., 9h00–18h00 CET), ou par voie postale à",
    contactPost: ".",
  },
  it: {
    cancelHeading: "Annullare un ordine prima della spedizione",
    cancel:
      "È possibile annullare gratuitamente qualsiasi ordine entro 2 ore dall'invio, a condizione che il pacco non sia ancora partito dal magazzino, comunicandoci il numero di riferimento dell'ordine. Una volta affidata la spedizione al corriere, l'annullamento immediato non è più applicabile e si passa alla procedura di recesso e restituzione illustrata qui sotto.",
    returnPolicyHeading: "Diritto di reso esteso a 30 giorni",
    returnPolicy:
      "La normativa europea tutela i consumatori con un diritto legale di recesso di 14 giorni dalla consegna senza obbligo di motivazione. Noi estendiamo volontariamente tale periodo a 30 giorni dalla ricezione della merce. Accettiamo la restituzione sia di prodotti non difettosi sia di prodotti difettosi, purché gli articoli siano nuovi, inutilizzati e completi di imballaggio e confezione originali. Non sono previsti cambi diretti. Contattaci indicando il numero d'ordine per ricevere assistenza passo dopo passo.",
    howToHeading: "Procedura di rientro & tempistiche di rimborso",
    howTo:
      "La merce deve essere rispedita nelle condizioni e nell'imballo originali a: {legalName} (resi 3DEureka), {street}, {postalCode} {city}, Belgio. Dopo aver ricevuto e controllato il reso, accreditiamo il rimborso sul metodo di pagamento originario entro 7 giorni lavorativi. Per gli acquisti saldati tramite bonifico SEPA o piano rateale, il rimborso viene versato sul conto bancario utilizzato per il pagamento.",
    whoPaysHeading: "Spedizione di reso gratuita & zero costi di riassortimento",
    whoPays:
      "Le spese di spedizione per il rientro sono interamente a nostro carico per tutti i resi approvati, sia per articoli difettosi sia per ripensamento. Ti inviamo un'etichetta prepagata da scaricare e stampare e non tratteniamo alcun costo di riassortimento. Per i pacchi ricevuti danneggiati o guasti all'arrivo, consulta il paragrafo dedicato più in basso.",
    warrantyHeading: "Garanzia legale UE di 2 anni",
    warranty:
      "Tutte le macchine vendute da 3DEureka sono coperte dalla garanzia legale europea di 2 anni contro i difetti di conformità, oltre all'eventuale garanzia aggiuntiva del produttore. In caso di guasto, il nostro team di supporto ti assisterà per organizzare la riparazione o la sostituzione.",
    damagedHeading: "Merce danneggiata o difettosa alla consegna",
    damaged:
      "Se il tuo ordine arriva danneggiato dal trasporto o presenta un difetto fin dall'apertura, scrivici entro 48 ore allegando delle foto: provvederemo subito e senza alcun costo a una sostituzione o a un ritiro gratuito.",
    contactHeading: "Recapiti per resi e rimborsi",
    contactPre: "Per annullamenti, pratiche di reso o informazioni sui rimborsi, contatta {legalName} via e-mail a",
    contactMid: " (lun–ven, 9:00–18:00 CET), oppure per posta ordinaria presso",
    contactPost: ".",
  },
  es: {
    cancelHeading: "Cancelación de pedidos antes del envío",
    cancel:
      "Puedes anular cualquier pedido sin coste alguno durante las 2 horas posteriores a la compra, siempre que aún no haya salido de nuestro almacén, escribiéndonos con tu referencia de pedido. Una vez que el paquete ha sido entregado al transportista, ya no es posible cancelarlo directamente y pasa a regirse por el proceso de desistimiento y devolución detallado a continuación.",
    returnPolicyHeading: "Plazo ampliado de devolución de 30 días",
    returnPolicy:
      "La normativa de consumo de la UE te garantiza 14 días naturales desde la entrega para desistir de la compra sin dar explicaciones. En 3DEureka ampliamos voluntariamente ese margen hasta los 30 días desde que recibes el pedido. Admitimos devoluciones tanto de productos sin defectos como de productos defectuosos, siempre que se encuentren nuevos, sin usar y en su caja y embalaje originales. No se realizan cambios directos de producto. Escríbenos indicando tu número de pedido y te guiaremos en todo el trámite.",
    howToHeading: "Envío de la devolución y plazo de reembolso",
    howTo:
      "Los artículos deben enviarse en su estado y embalaje originales a la dirección: {legalName} (devoluciones 3DEureka), {street}, {postalCode} {city}, Bélgica. En cuanto recibamos y verifiquemos el paquete devuelto, emitiremos el reembolso en tu método de pago original dentro de un plazo de 7 días laborables. En pedidos abonados mediante transferencia SEPA o pago a plazos, el importe se devuelve a la cuenta bancaria utilizada.",
    whoPaysHeading: "Portes de devolución gratuitos y sin comisiones",
    whoPays:
      "Asumimos íntegramente los gastos de envío de retorno en todas las devoluciones aceptadas, tanto de artículos defectuosos como no defectuosos. Te proporcionamos una etiqueta de devolución prepagada lista para descargar e imprimir, sin cobrar cargos por reposición. Si el producto ha llegado golpeado o averiado, revisa el apartado correspondiente más abajo.",
    warrantyHeading: "Garantía legal europea de 2 años",
    warranty:
      "Todas las máquinas comercializadas por 3DEureka cuentan con la garantía legal de la UE de 2 años frente a defectos de conformidad, sumada a la garantía comercial propia de cada fabricante. Si surge cualquier incidencia técnica, nuestro equipo gestionará la reparación o el reemplazo.",
    damagedHeading: "Pedidos dañados o defectuosos al recibirlos",
    damaged:
      "Si tu paquete llega con daños de transporte o presenta un fallo al abrirlo, comunícanoslo en un máximo de 48 horas adjuntando fotografías para que organicemos sin coste alguno la sustitución o recogida.",
    contactHeading: "Contacto para cancelaciones y devoluciones",
    contactPre: "Para gestionar cancelaciones, devoluciones o consultas sobre reembolsos, contacta con {legalName} en",
    contactMid: " (lun–vie, 9:00–18:00 CET), o por correo postal en",
    contactPost: ".",
  },
  nl: {
    cancelHeading: "Een bestelling vóór verzending annuleren",
    cancel:
      "U kunt uw bestelling binnen 2 uur na het plaatsen kosteloos annuleren, zolang het pakket ons magazijn nog niet heeft verlaten, door ons uw bestelnummer door te geven. Zodra de zending aan de koerier is overgedragen, kan deze niet meer rechtstreeks worden geannuleerd en geldt onze onderstaande herroepings- en retourprocedure.",
    returnPolicyHeading: "Verruimde retourtermijn van 30 dagen",
    returnPolicy:
      "Volgens het Europese consumentenrecht heeft u recht op een wettelijke bedenktijd van 14 dagen na ontvangst zonder opgave van reden. Wij breiden deze periode vrijwillig uit naar 30 dagen na aflevering. Wij nemen zowel niet-defecte als defecte artikelen retour, mits ze nieuw en ongebruikt zijn en in de originele staat en fabrieksverpakking worden teruggestuurd. Direct omruilen bieden wij niet aan. Neem contact met ons op met uw bestelreferentie, dan begeleiden wij u stap voor stap.",
    howToHeading: "Artikel terugsturen & terugbetalingstermijn",
    howTo:
      "Retouren dienen in originele staat en verpakking te worden verzonden naar: {legalName} (3DEureka retouren), {street}, {postalCode} {city}, België. Nadat wij uw retourzending hebben ontvangen en gecontroleerd, storten wij het aankoopbedrag binnen 7 werkdagen terug via uw oorspronkelijke betaalmethode. Bij SEPA-overschrijvingen en termijnplannen wordt het bedrag teruggestort op de bankrekening waarmee is betaald.",
    whoPaysHeading: "Gratis retourlabel & geen herbevoorradingskosten",
    whoPays:
      "Bij alle goedgekeurde retouren — zowel voor defecte als niet-defecte goederen — nemen wij de retourkosten volledig voor onze rekening. U krijgt van ons een gefrankeerd retourlabel om te downloaden en uit te printen, en wij brengen nooit herbevoorradingskosten in rekening. Voor zendingen die beschadigd of defect aankomen, zie de sectie hieronder.",
    warrantyHeading: "Wettelijke EU-garantie van 2 jaar",
    warranty:
      "Op iedere machine die wij verkopen is de wettelijke Europese consumentengarantie van 2 jaar tegen gebreken van toepassing, naast een eventuele aanvullende fabrieksgarantie van de fabrikant. Bij problemen helpt onze klantenservice u direct met een reparatie of vervangend toestel.",
    damagedHeading: "Beschadigd of defect bij aflevering",
    damaged:
      "Komt uw bestelling met transportschade of een defect aan, meld dit dan binnen 48 uur na ontvangst met duidelijke foto's. Wij zorgen dan kosteloos voor een vervangend exemplaar of een gratis retourzending.",
    contactHeading: "Contact voor retouren en terugbetalingen",
    contactPre: "Voor annuleringen, retouraanvragen of vragen over uw terugbetaling bereikt u {legalName} via",
    contactMid: " (ma–vr, 9:00–18:00 uur CET), of per post op",
    contactPost: ".",
  },
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : "en"
  const dict = await getDictionary(locale)
  return { title: dict.footer.returns }
}

export default async function ReturnsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : "en"
  const dict = await getDictionary(locale)
  const t = fillCompany(COPY[locale])

  return (
    <ProsePage
      locale={locale}
      dict={dict}
      title={dict.footer.returns}
      crumbs={[{ label: dict.common.home, href: "/" }, { label: dict.footer.returns }]}
    >
      <ProseSection heading={t.returnPolicyHeading}>
        <p>{t.returnPolicy}</p>
      </ProseSection>

      <ProseSection heading={t.whoPaysHeading}>
        <p>{t.whoPays}</p>
      </ProseSection>

      <ProseSection heading={t.howToHeading}>
        <p>{t.howTo}</p>
      </ProseSection>

      <ProseSection heading={t.cancelHeading}>
        <p>{t.cancel}</p>
      </ProseSection>

      <ProseSection heading={t.damagedHeading}>
        <p>{t.damaged}</p>
      </ProseSection>

      <ProseSection heading={t.warrantyHeading}>
        <p>{t.warranty}</p>
      </ProseSection>

      <ProseSection heading={t.contactHeading}>
        <p>
          {t.contactPre}{" "}
          <a href={`mailto:${COMPANY.email}`} className="underline underline-offset-2 hover:text-foreground">
            {COMPANY.email}
          </a>
          {t.contactMid} {companyFullAddress}{t.contactPost}
        </p>
      </ProseSection>
    </ProsePage>
  )
}
