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
    cancelHeading: "Order cancellation",
    cancel:
      "You can cancel an order free of charge within 2 hours of placing it, as long as it has not yet been dispatched, by contacting us with your order reference. Once an order has shipped, it can no longer be cancelled and instead falls under our right-of-withdrawal and returns process below.",
    returnPolicyHeading: "14-day return policy",
    returnPolicy:
      "As a consumer in the EU you have a statutory right to withdraw from your purchase within 14 days of receiving your goods, without giving any reason, in line with EU consumer protection law. We accept returns for both non-defective and defective products. Items must be new and returned in their original condition and packaging. Exchanges are not accepted. To exercise this right, contact us with your order reference and we'll guide you through the return.",
    howToHeading: "How to return an item",
    howTo:
      "Items must be returned in their original condition and packaging to: {legalName} (DnD3D returns), {street}, {postalCode} {city}, Netherlands. Once we receive and inspect the return, we'll issue a refund to your original payment method within 14 days. For instalment and bank-transfer orders, refunds are made to the account used for payment.",
    whoPaysHeading: "Who pays for return shipping",
    whoPays:
      "Return shipping is free for accepted returns, including returns of non-defective and defective products. We provide a return label to download and print. There are no restocking fees. See \u201cDamaged or faulty on arrival\u201d below for items that arrive damaged or faulty.",
    warrantyHeading: "Warranty",
    warranty:
      "Every machine we sell is covered by the EU statutory 2-year consumer guarantee against defects. Many manufacturers also provide their own additional warranty. If something goes wrong, our support team will help arrange a repair or replacement.",
    damagedHeading: "Damaged or faulty on arrival",
    damaged:
      "If your order arrives damaged or faulty, contact us within 48 hours with photos and we'll arrange a free replacement or return at no cost to you.",
    contactHeading: "Contact information",
    contactPre: "For cancellations, returns or refund questions, reach {legalName} at",
    contactMid: ", by phone at {phone} (Mon–Fri, 9:00–18:00 CET), or by post at",
    contactPost: ".",
  },
  de: {
    cancelHeading: "Stornierung der Bestellung",
    cancel:
      "Sie können eine Bestellung innerhalb von 2 Stunden nach Aufgabe kostenlos stornieren, solange sie noch nicht versandt wurde, indem Sie uns mit Ihrer Bestellnummer kontaktieren. Sobald eine Bestellung versandt wurde, kann sie nicht mehr storniert werden und unterliegt stattdessen unserem unten beschriebenen Widerrufs- und Rückgabeverfahren.",
    returnPolicyHeading: "14-tägige Rückgaberegelung",
    returnPolicy:
      "Als Verbraucher in der EU haben Sie gemäß dem EU-Verbraucherschutzrecht ein gesetzliches Widerrufsrecht, mit dem Sie Ihren Kauf innerhalb von 14 Tagen nach Erhalt der Ware ohne Angabe von Gründen widerrufen können. Wir akzeptieren Rückgaben sowohl für mangelfreie als auch für mangelhafte Produkte. Die Artikel müssen neu sowie im Originalzustand und in der Originalverpackung sein. Umtausch ist nicht möglich. Um dieses Recht auszuüben, kontaktieren Sie uns mit Ihrer Bestellnummer, und wir führen Sie durch die Rückgabe.",
    howToHeading: "So geben Sie einen Artikel zurück",
    howTo:
      "Artikel müssen im Originalzustand und in der Originalverpackung zurückgesendet werden an: {legalName} (DnD3D Retouren), {street}, {postalCode} {city}, Niederlande. Sobald wir die Rücksendung erhalten und geprüft haben, erstatten wir den Betrag innerhalb von 14 Tagen auf Ihre ursprüngliche Zahlungsmethode. Bei Raten- und Überweisungsbestellungen erfolgt die Erstattung auf das für die Zahlung verwendete Konto.",
    whoPaysHeading: "Wer trägt die Rücksendekosten",
    whoPays:
      "Die Rücksendung ist für akzeptierte Rückgaben kostenlos, sowohl für mangelfreie als auch für mangelhafte Produkte. Wir stellen ein Rücksendeetikett zum Herunterladen und Ausdrucken bereit. Es fallen keine Wiedereinlagerungsgebühren an. Für bei Ankunft beschädigte oder fehlerhafte Artikel siehe \u201cBeschädigt oder fehlerhaft bei Ankunft\u201d unten.",
    warrantyHeading: "Gewährleistung",
    warranty:
      "Jede von uns verkaufte Maschine ist durch die gesetzliche 2-jährige EU-Verbrauchergarantie gegen Mängel abgedeckt. Viele Hersteller bieten zusätzlich ihre eigene Garantie. Bei Problemen hilft Ihnen unser Support-Team bei der Organisation einer Reparatur oder eines Ersatzes.",
    damagedHeading: "Beschädigt oder fehlerhaft bei Ankunft",
    damaged:
      "Kommt Ihre Bestellung beschädigt oder fehlerhaft an, kontaktieren Sie uns innerhalb von 48 Stunden mit Fotos, und wir organisieren einen kostenlosen Ersatz oder eine kostenlose Rücksendung.",
    contactHeading: "Kontaktinformationen",
    contactPre: "Bei Fragen zu Stornierungen, Rückgaben oder Rückerstattungen erreichen Sie {legalName} unter",
    contactMid: ", telefonisch unter {phone} (Mo–Fr, 9:00–18:00 Uhr MEZ) oder per Post an",
    contactPost: ".",
  },
  fr: {
    cancelHeading: "Annulation de commande",
    cancel:
      "Vous pouvez annuler une commande gratuitement dans les 2 heures suivant sa passation, tant qu'elle n'a pas encore été expédiée, en nous contactant avec votre référence de commande. Une fois la commande expédiée, elle ne peut plus être annulée et relève alors de notre procédure de rétractation et de retour décrite ci-dessous.",
    returnPolicyHeading: "Politique de retour de 14 jours",
    returnPolicy:
      "En tant que consommateur au sein de l'UE, vous disposez d'un droit légal de rétractation vous permettant d'annuler votre achat dans les 14 jours suivant la réception de vos marchandises, sans avoir à justifier de motif, conformément au droit européen de protection des consommateurs. Nous acceptons les retours de produits non défectueux comme de produits défectueux. Les articles doivent être neufs, dans leur état et emballage d'origine. Les échanges ne sont pas acceptés. Pour exercer ce droit, contactez-nous avec votre référence de commande et nous vous guiderons dans la procédure de retour.",
    howToHeading: "Comment retourner un article",
    howTo:
      "Les articles doivent être retournés dans leur état et emballage d'origine à l'adresse suivante : {legalName} (retours DnD3D), {street}, {postalCode} {city}, Pays-Bas. Une fois le retour reçu et vérifié, nous procéderons au remboursement sur votre moyen de paiement d'origine dans un délai de 14 jours. Pour les commandes payées en plusieurs fois ou par virement bancaire, le remboursement est effectué sur le compte utilisé pour le paiement.",
    whoPaysHeading: "Qui paie les frais de retour",
    whoPays:
      "Les frais de retour sont gratuits pour les retours acceptés, qu'il s'agisse de produits non défectueux ou défectueux. Nous fournissons une étiquette de retour à télécharger et à imprimer. Aucun frais de restockage ne s'applique. Pour les articles endommagés ou défectueux à l'arrivée, voir \u201cArticle endommagé ou défectueux ���� l'arrivée\u201d ci-dessous.",
    warrantyHeading: "Garantie",
    warranty:
      "Chaque machine que nous vendons est couverte par la garantie légale européenne de 2 ans contre les défauts. De nombreux fabricants proposent également leur propre garantie supplémentaire. En cas de problème, notre équipe d'assistance vous aidera à organiser une réparation ou un remplacement.",
    damagedHeading: "Article endommagé ou défectueux à l'arrivée",
    damaged:
      "Si votre commande arrive endommagée ou défectueuse, contactez-nous dans les 48 heures avec des photos et nous organiserons un remplacement ou un retour gratuit, sans frais pour vous.",
    contactHeading: "Coordonnées",
    contactPre: "Pour toute question relative aux annulations, retours ou remboursements, contactez {legalName} à",
    contactMid: ", par téléphone au {phone} (lun.–ven., 9h00–18h00 CET), ou par courrier à",
    contactPost: ".",
  },
  it: {
    cancelHeading: "Annullamento dell'ordine",
    cancel:
      "Puoi annullare un ordine gratuitamente entro 2 ore dalla sua effettuazione, purché non sia ancora stato spedito, contattandoci con il tuo numero d'ordine. Una volta spedito, l'ordine non può più essere annullato e rientra invece nella nostra procedura di recesso e restituzione descritta di seguito.",
    returnPolicyHeading: "Politica di restituzione di 14 giorni",
    returnPolicy:
      "In qualità di consumatore nell'UE, hai il diritto legale di recedere dal tuo acquisto entro 14 giorni dalla ricezione della merce, senza fornire alcuna motivazione, in conformità con il diritto UE a tutela dei consumatori. Accettiamo resi sia di prodotti non difettosi sia di prodotti difettosi. Gli articoli devono essere nuovi e nelle condizioni e nella confezione originali. Non accettiamo cambi. Per esercitare questo diritto, contattaci con il tuo numero d'ordine e ti guideremo nella procedura di restituzione.",
    howToHeading: "Come restituire un articolo",
    howTo:
      "Gli articoli devono essere restituiti nelle condizioni e nella confezione originali all'indirizzo: {legalName} (resi DnD3D), {street}, {postalCode} {city}, Paesi Bassi. Una volta ricevuto e ispezionato il reso, emetteremo un rimborso sul metodo di pagamento originale entro 14 giorni. Per gli ordini a rate o con bonifico bancario, il rimborso viene effettuato sul conto utilizzato per il pagamento.",
    whoPaysHeading: "Chi paga la spedizione di ritorno",
    whoPays:
      "La spedizione di ritorno è gratuita per i resi accettati, sia per i prodotti non difettosi sia per quelli difettosi. Forniamo un'etichetta di reso da scaricare e stampare. Non sono applicate commissioni di reintegro. Per gli articoli arrivati danneggiati o difettosi, consulta \u201cDanneggiato o difettoso all'arrivo\u201d di seguito.",
    warrantyHeading: "Garanzia",
    warranty:
      "Ogni macchina che vendiamo è coperta dalla garanzia legale UE di 2 anni contro i difetti. Molti produttori offrono inoltre una propria garanzia aggiuntiva. In caso di problemi, il nostro team di assistenza ti aiuterà a organizzare una riparazione o una sostituzione.",
    damagedHeading: "Danneggiato o difettoso all'arrivo",
    damaged:
      "Se il tuo ordine arriva danneggiato o difettoso, contattaci entro 48 ore con delle foto e organizzeremo una sostituzione o una restituzione gratuita, senza alcun costo per te.",
    contactHeading: "Informazioni di contatto",
    contactPre: "Per domande su annullamenti, resi o rimborsi, contatta {legalName} all'indirizzo",
    contactMid: ", telefonicamente al {phone} (lun–ven, 9:00–18:00 CET), oppure per posta a",
    contactPost: ".",
  },
  es: {
    cancelHeading: "Cancelación del pedido",
    cancel:
      "Puede cancelar un pedido de forma gratuita dentro de las 2 horas posteriores a su realización, siempre que no haya sido enviado, contactándonos con su número de pedido. Una vez enviado el pedido, ya no podrá cancelarse y quedará sujeto a nuestro procedimiento de desistimiento y devoluciones descrito a continuación.",
    returnPolicyHeading: "Política de devolución de 14 días",
    returnPolicy:
      "Como consumidor en la UE, tiene el derecho legal de desistir de su compra dentro de los 14 días posteriores a la recepción de los bienes, sin necesidad de justificar el motivo, de acuerdo con la legislación europea de protección al consumidor. Aceptamos devoluciones tanto de productos no defectuosos como defectuosos. Los artículos deben ser nuevos y estar en su estado y embalaje originales. No se aceptan cambios. Para ejercer este derecho, contáctenos con su número de pedido y le guiaremos en el proceso de devolución.",
    howToHeading: "Cómo devolver un artículo",
    howTo:
      "Los artículos deben devolverse en su estado y embalaje originales a: {legalName} (devoluciones DnD3D), {street}, {postalCode} {city}, Países Bajos. Una vez recibida e inspeccionada la devolución, emitiremos un reembolso a su método de pago original dentro de 14 días. Para pedidos con pago a plazos o transferencia bancaria, el reembolso se realiza a la cuenta utilizada para el pago.",
    whoPaysHeading: "Quién paga el envío de devolución",
    whoPays:
      "El envío de devolución es gratuito para las devoluciones aceptadas, tanto de productos no defectuosos como defectuosos. Proporcionamos una etiqueta de devolución para descargar e imprimir. No se aplican gastos de reposición. Para los artículos dañados o defectuosos a la llegada, consulte \u201cDañado o defectuoso a la llegada\u201d más abajo.",
    warrantyHeading: "Garantía",
    warranty:
      "Cada máquina que vendemos está cubierta por la garantía legal de la UE de 2 años contra defectos. Muchos fabricantes también ofrecen su propia garantía adicional. Si algo sale mal, nuestro equipo de soporte le ayudará a organizar una reparación o sustitución.",
    damagedHeading: "Dañado o defectuoso a la llegada",
    damaged:
      "Si su pedido llega dañado o defectuoso, contáctenos dentro de 48 horas con fotos y organizaremos una sustitución o devolución gratuita, sin ningún coste para usted.",
    contactHeading: "Información de contacto",
    contactPre: "Para cancelaciones, devoluciones o preguntas sobre reembolsos, contacte con {legalName} en",
    contactMid: ", por teléfono al {phone} (lun–vie, 9:00–18:00 CET), o por correo postal a",
    contactPost: ".",
  },
  nl: {
    cancelHeading: "Bestelling annuleren",
    cancel:
      "U kunt een bestelling gratis annuleren binnen 2 uur na plaatsing, zolang deze nog niet is verzonden, door contact met ons op te nemen met uw bestelnummer. Zodra een bestelling is verzonden, kan deze niet meer worden geannuleerd en valt in plaats daarvan onder onze onderstaande herroepings- en retourprocedure.",
    returnPolicyHeading: "Retourbeleid van 14 dagen",
    returnPolicy:
      "Als consument in de EU heeft u het wettelijke recht om binnen 14 dagen na ontvangst van uw goederen uw aankoop te herroepen, zonder opgave van reden, in overeenstemming met het EU-consumentenrecht. Wij accepteren retouren van zowel niet-defecte als defecte producten. Artikelen moeten nieuw zijn en zich in de originele staat en verpakking bevinden. Ruilingen worden niet geaccepteerd. Om dit recht uit te oefenen, neemt u contact met ons op met uw bestelnummer en begeleiden wij u door de retourprocedure.",
    howToHeading: "Hoe u een artikel retourneert",
    howTo:
      "Artikelen moeten in de originele staat en verpakking worden geretourneerd naar: {legalName} (DnD3D retouren), {street}, {postalCode} {city}, Nederland. Zodra wij de retourzending hebben ontvangen en gecontroleerd, betalen wij binnen 14 dagen terug op uw oorspronkelijke betaalmethode. Bij bestellingen met gespreide betaling of overschrijving wordt terugbetaald op de rekening die voor de betaling is gebruikt.",
    whoPaysHeading: "Wie betaalt de retourverzending",
    whoPays:
      "De retourzending is gratis voor geaccepteerde retouren, zowel voor niet-defecte als defecte producten. Wij verstrekken een retourlabel dat u kunt downloaden en afdrukken. Er worden geen herbevoorradingskosten aangerekend. Voor artikelen die beschadigd of defect aankomen, zie \u201cBeschadigd of defect bij aankomst\u201d hieronder.",
    warrantyHeading: "Garantie",
    warranty:
      "Elke machine die wij verkopen valt onder de wettelijke EU-consumentengarantie van 2 jaar tegen gebreken. Veel fabrikanten bieden daarnaast hun eigen extra garantie. Als er iets misgaat, helpt ons supportteam u bij het regelen van een reparatie of vervanging.",
    damagedHeading: "Beschadigd of defect bij aankomst",
    damaged:
      "Als uw bestelling beschadigd of defect aankomt, neem dan binnen 48 uur contact met ons op met foto's en wij regelen een gratis vervanging of retour zonder kosten voor u.",
    contactHeading: "Contactgegevens",
    contactPre: "Voor annuleringen, retouren of vragen over terugbetaling kunt u {legalName} bereiken via",
    contactMid: ", telefonisch op {phone} (ma–vr, 9:00–18:00 uur CET), of per post naar",
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
      <ProseSection heading={t.cancelHeading}>
        <p>{t.cancel}</p>
      </ProseSection>

      <ProseSection heading={t.returnPolicyHeading}>
        <p>{t.returnPolicy}</p>
      </ProseSection>

      <ProseSection heading={t.howToHeading}>
        <p>{t.howTo}</p>
      </ProseSection>

      <ProseSection heading={t.whoPaysHeading}>
        <p>{t.whoPays}</p>
      </ProseSection>

      <ProseSection heading={t.warrantyHeading}>
        <p>{t.warranty}</p>
      </ProseSection>

      <ProseSection heading={t.damagedHeading}>
        <p>{t.damaged}</p>
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
