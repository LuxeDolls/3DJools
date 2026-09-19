import { isLocale, type Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { ProsePage, ProseSection } from "@/components/legal/prose-page"

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
    returnPolicyHeading: "30-day return policy",
    returnPolicy:
      "As a consumer in the EU you have a statutory right to withdraw from your purchase within 14 days of receiving your goods, without giving any reason, in line with EU consumer protection law. 3DJools voluntarily extends this window: you can return most items within 30 days of receiving your goods. To exercise this right, contact us with your order reference and we'll guide you through the return.",
    howToHeading: "How to return an item",
    howTo:
      "Items must be returned in their original condition and packaging to: Ln-Squared (3DJools returns), Rue du Chénia 17, 7170 Manage, Hainaut, Belgium. Once we receive and inspect the return, we'll issue a refund to your original payment method within 7 working days. For instalment and bank-transfer orders, refunds are made to the account used for payment.",
    whoPaysHeading: "Who pays for return shipping",
    whoPays:
      "If you are returning an item within the 30-day period simply because you changed your mind, you are responsible for the direct cost of returning the item to us — we recommend using a tracked shipping service. If your order arrived damaged, faulty or incorrect, we cover the return shipping cost in full; see \u201cDamaged or faulty on arrival\u201d below.",
    warrantyHeading: "Warranty",
    warranty:
      "Every machine we sell is covered by the EU statutory 2-year consumer guarantee against defects. Many manufacturers also provide their own additional warranty. If something goes wrong, our support team will help arrange a repair or replacement.",
    damagedHeading: "Damaged or faulty on arrival",
    damaged:
      "If your order arrives damaged or faulty, contact us within 48 hours with photos and we'll arrange a free replacement or return at no cost to you.",
    contactHeading: "Contact information",
    contactPre: "For cancellations, returns or refund questions, reach Ln-Squared at",
    contactMid: ", by phone at +49 30 1234 5678 (Mon–Fri, 9:00–18:00 CET), or by post at",
    contactPost: ".",
  },
  de: {
    cancelHeading: "Stornierung der Bestellung",
    cancel:
      "Sie können eine Bestellung innerhalb von 2 Stunden nach Aufgabe kostenlos stornieren, solange sie noch nicht versandt wurde, indem Sie uns mit Ihrer Bestellnummer kontaktieren. Sobald eine Bestellung versandt wurde, kann sie nicht mehr storniert werden und unterliegt stattdessen unserem unten beschriebenen Widerrufs- und Rückgabeverfahren.",
    returnPolicyHeading: "30-tägige Rückgaberegelung",
    returnPolicy:
      "Als Verbraucher in der EU haben Sie gemäß dem EU-Verbraucherschutzrecht ein gesetzliches Widerrufsrecht, mit dem Sie Ihren Kauf innerhalb von 14 Tagen nach Erhalt der Ware ohne Angabe von Gründen widerrufen können. 3DJools erweitert dieses Zeitfenster freiwillig: Sie können die meisten Artikel innerhalb von 30 Tagen nach Erhalt zurückgeben. Um dieses Recht auszuüben, kontaktieren Sie uns mit Ihrer Bestellnummer, und wir führen Sie durch die Rückgabe.",
    howToHeading: "So geben Sie einen Artikel zurück",
    howTo:
      "Artikel müssen im Originalzustand und in der Originalverpackung zurückgesendet werden an: Ln-Squared (3DJools Retouren), Rue du Chénia 17, 7170 Manage, Hainaut, Belgien. Sobald wir die Rücksendung erhalten und geprüft haben, erstatten wir den Betrag innerhalb von 7 Werktagen auf Ihre ursprüngliche Zahlungsmethode. Bei Raten- und Überweisungsbestellungen erfolgt die Erstattung auf das für die Zahlung verwendete Konto.",
    whoPaysHeading: "Wer trägt die Rücksendekosten",
    whoPays:
      "Wenn Sie einen Artikel innerhalb der 30-Tage-Frist zurücksenden, weil Sie sich einfach umentschieden haben, tragen Sie die direkten Kosten der Rücksendung an uns — wir empfehlen einen Versand mit Sendungsverfolgung. Kam Ihre Bestellung beschädigt, fehlerhaft oder falsch an, übernehmen wir die Rücksendekosten vollständig; siehe \u201cBeschädigt oder fehlerhaft bei Ankunft\u201d unten.",
    warrantyHeading: "Gewährleistung",
    warranty:
      "Jede von uns verkaufte Maschine ist durch die gesetzliche 2-jährige EU-Verbrauchergarantie gegen Mängel abgedeckt. Viele Hersteller bieten zusätzlich ihre eigene Garantie. Bei Problemen hilft Ihnen unser Support-Team bei der Organisation einer Reparatur oder eines Ersatzes.",
    damagedHeading: "Beschädigt oder fehlerhaft bei Ankunft",
    damaged:
      "Kommt Ihre Bestellung beschädigt oder fehlerhaft an, kontaktieren Sie uns innerhalb von 48 Stunden mit Fotos, und wir organisieren einen kostenlosen Ersatz oder eine kostenlose Rücksendung.",
    contactHeading: "Kontaktinformationen",
    contactPre: "Bei Fragen zu Stornierungen, Rückgaben oder Rückerstattungen erreichen Sie Ln-Squared unter",
    contactMid: ", telefonisch unter +49 30 1234 5678 (Mo–Fr, 9:00–18:00 Uhr MEZ) oder per Post an",
    contactPost: ".",
  },
  fr: {
    cancelHeading: "Annulation de commande",
    cancel:
      "Vous pouvez annuler une commande gratuitement dans les 2 heures suivant sa passation, tant qu'elle n'a pas encore été expédiée, en nous contactant avec votre référence de commande. Une fois la commande expédiée, elle ne peut plus être annulée et relève alors de notre procédure de rétractation et de retour décrite ci-dessous.",
    returnPolicyHeading: "Politique de retour de 30 jours",
    returnPolicy:
      "En tant que consommateur au sein de l'UE, vous disposez d'un droit légal de rétractation vous permettant d'annuler votre achat dans les 14 jours suivant la réception de vos marchandises, sans avoir à justifier de motif, conformément au droit européen de protection des consommateurs. 3DJools étend volontairement ce délai : vous pouvez retourner la plupart des articles dans les 30 jours suivant leur réception. Pour exercer ce droit, contactez-nous avec votre référence de commande et nous vous guiderons dans la procédure de retour.",
    howToHeading: "Comment retourner un article",
    howTo:
      "Les articles doivent être retournés dans leur état et emballage d'origine à l'adresse suivante : Ln-Squared (retours 3DJools), Rue du Chénia 17, 7170 Manage, Hainaut, Belgique. Une fois le retour reçu et vérifié, nous procéderons au remboursement sur votre moyen de paiement d'origine dans un délai de 7 jours ouvrés. Pour les commandes payées en plusieurs fois ou par virement bancaire, le remboursement est effectué sur le compte utilisé pour le paiement.",
    whoPaysHeading: "Qui paie les frais de retour",
    whoPays:
      "Si vous retournez un article dans le délai de 30 jours simplement parce que vous avez changé d'avis, vous êtes responsable des frais directs de retour — nous vous recommandons d'utiliser un service d'expédition avec suivi. Si votre commande est arrivée endommagée, défectueuse ou incorrecte, nous prenons en charge intégralement les frais de retour ; voir \u201cArticle endommagé ou défectueux à l'arrivée\u201d ci-dessous.",
    warrantyHeading: "Garantie",
    warranty:
      "Chaque machine que nous vendons est couverte par la garantie légale européenne de 2 ans contre les défauts. De nombreux fabricants proposent également leur propre garantie supplémentaire. En cas de problème, notre équipe d'assistance vous aidera à organiser une réparation ou un remplacement.",
    damagedHeading: "Article endommagé ou défectueux à l'arrivée",
    damaged:
      "Si votre commande arrive endommagée ou défectueuse, contactez-nous dans les 48 heures avec des photos et nous organiserons un remplacement ou un retour gratuit, sans frais pour vous.",
    contactHeading: "Coordonnées",
    contactPre: "Pour toute question relative aux annulations, retours ou remboursements, contactez Ln-Squared à",
    contactMid: ", par téléphone au +49 30 1234 5678 (lun.–ven., 9h00–18h00 CET), ou par courrier à",
    contactPost: ".",
  },
  it: {
    cancelHeading: "Annullamento dell'ordine",
    cancel:
      "Puoi annullare un ordine gratuitamente entro 2 ore dalla sua effettuazione, purché non sia ancora stato spedito, contattandoci con il tuo numero d'ordine. Una volta spedito, l'ordine non può più essere annullato e rientra invece nella nostra procedura di recesso e restituzione descritta di seguito.",
    returnPolicyHeading: "Politica di restituzione di 30 giorni",
    returnPolicy:
      "In qualità di consumatore nell'UE, hai il diritto legale di recedere dal tuo acquisto entro 14 giorni dalla ricezione della merce, senza fornire alcuna motivazione, in conformità con il diritto UE a tutela dei consumatori. 3DJools estende volontariamente questo periodo: puoi restituire la maggior parte degli articoli entro 30 giorni dalla ricezione. Per esercitare questo diritto, contattaci con il tuo numero d'ordine e ti guideremo nella procedura di restituzione.",
    howToHeading: "Come restituire un articolo",
    howTo:
      "Gli articoli devono essere restituiti nelle condizioni e nella confezione originali all'indirizzo: Ln-Squared (resi 3DJools), Rue du Chénia 17, 7170 Manage, Hainaut, Belgio. Una volta ricevuto e ispezionato il reso, emetteremo un rimborso sul metodo di pagamento originale entro 7 giorni lavorativi. Per gli ordini a rate o con bonifico bancario, il rimborso viene effettuato sul conto utilizzato per il pagamento.",
    whoPaysHeading: "Chi paga la spedizione di ritorno",
    whoPays:
      "Se restituisci un articolo entro il periodo di 30 giorni semplicemente perché hai cambiato idea, sei responsabile del costo diretto della restituzione — ti consigliamo di utilizzare un servizio di spedizione tracciato. Se il tuo ordine è arrivato danneggiato, difettoso o errato, ci occupiamo noi interamente dei costi di restituzione; vedi \u201cDanneggiato o difettoso all'arrivo\u201d di seguito.",
    warrantyHeading: "Garanzia",
    warranty:
      "Ogni macchina che vendiamo è coperta dalla garanzia legale UE di 2 anni contro i difetti. Molti produttori offrono inoltre una propria garanzia aggiuntiva. In caso di problemi, il nostro team di assistenza ti aiuterà a organizzare una riparazione o una sostituzione.",
    damagedHeading: "Danneggiato o difettoso all'arrivo",
    damaged:
      "Se il tuo ordine arriva danneggiato o difettoso, contattaci entro 48 ore con delle foto e organizzeremo una sostituzione o una restituzione gratuita, senza alcun costo per te.",
    contactHeading: "Informazioni di contatto",
    contactPre: "Per domande su annullamenti, resi o rimborsi, contatta Ln-Squared all'indirizzo",
    contactMid: ", telefonicamente al +49 30 1234 5678 (lun–ven, 9:00–18:00 CET), oppure per posta a",
    contactPost: ".",
  },
  es: {
    cancelHeading: "Cancelación del pedido",
    cancel:
      "Puede cancelar un pedido de forma gratuita dentro de las 2 horas posteriores a su realización, siempre que no haya sido enviado, contactándonos con su número de pedido. Una vez enviado el pedido, ya no podrá cancelarse y quedará sujeto a nuestro procedimiento de desistimiento y devoluciones descrito a continuación.",
    returnPolicyHeading: "Política de devolución de 30 días",
    returnPolicy:
      "Como consumidor en la UE, tiene el derecho legal de desistir de su compra dentro de los 14 días posteriores a la recepción de los bienes, sin necesidad de justificar el motivo, de acuerdo con la legislación europea de protección al consumidor. 3DJools amplía voluntariamente este plazo: puede devolver la mayoría de los artículos dentro de los 30 días posteriores a su recepción. Para ejercer este derecho, contáctenos con su número de pedido y le guiaremos en el proceso de devolución.",
    howToHeading: "Cómo devolver un artículo",
    howTo:
      "Los artículos deben devolverse en su estado y embalaje originales a: Ln-Squared (devoluciones 3DJools), Rue du Chénia 17, 7170 Manage, Hainaut, Bélgica. Una vez recibida e inspeccionada la devolución, emitiremos un reembolso a su método de pago original dentro de 7 días laborables. Para pedidos con pago a plazos o transferencia bancaria, el reembolso se realiza a la cuenta utilizada para el pago.",
    whoPaysHeading: "Quién paga el envío de devolución",
    whoPays:
      "Si devuelve un artículo dentro del plazo de 30 días simplemente porque cambió de opinión, usted es responsable del coste directo de la devolución — recomendamos utilizar un servicio de envío con seguimiento. Si su pedido llegó dañado, defectuoso o incorrecto, cubrimos íntegramente el coste de devolución; consulte \u201cDañado o defectuoso a la llegada\u201d más abajo.",
    warrantyHeading: "Garantía",
    warranty:
      "Cada máquina que vendemos está cubierta por la garantía legal de la UE de 2 años contra defectos. Muchos fabricantes también ofrecen su propia garantía adicional. Si algo sale mal, nuestro equipo de soporte le ayudará a organizar una reparación o sustitución.",
    damagedHeading: "Dañado o defectuoso a la llegada",
    damaged:
      "Si su pedido llega dañado o defectuoso, contáctenos dentro de 48 horas con fotos y organizaremos una sustitución o devolución gratuita, sin ningún coste para usted.",
    contactHeading: "Información de contacto",
    contactPre: "Para cancelaciones, devoluciones o preguntas sobre reembolsos, contacte con Ln-Squared en",
    contactMid: ", por teléfono al +49 30 1234 5678 (lun–vie, 9:00–18:00 CET), o por correo postal a",
    contactPost: ".",
  },
  nl: {
    cancelHeading: "Bestelling annuleren",
    cancel:
      "U kunt een bestelling gratis annuleren binnen 2 uur na plaatsing, zolang deze nog niet is verzonden, door contact met ons op te nemen met uw bestelnummer. Zodra een bestelling is verzonden, kan deze niet meer worden geannuleerd en valt in plaats daarvan onder onze onderstaande herroepings- en retourprocedure.",
    returnPolicyHeading: "Retourbeleid van 30 dagen",
    returnPolicy:
      "Als consument in de EU heeft u het wettelijke recht om binnen 14 dagen na ontvangst van uw goederen uw aankoop te herroepen, zonder opgave van reden, in overeenstemming met het EU-consumentenrecht. 3DJools breidt deze termijn vrijwillig uit: u kunt de meeste artikelen binnen 30 dagen na ontvangst retourneren. Om dit recht uit te oefenen, neemt u contact met ons op met uw bestelnummer en begeleiden wij u door de retourprocedure.",
    howToHeading: "Hoe u een artikel retourneert",
    howTo:
      "Artikelen moeten in de originele staat en verpakking worden geretourneerd naar: Ln-Squared (3DJools retouren), Rue du Chénia 17, 7170 Manage, Hainaut, België. Zodra wij de retourzending hebben ontvangen en gecontroleerd, betalen wij binnen 7 werkdagen terug op uw oorspronkelijke betaalmethode. Bij bestellingen met gespreide betaling of overschrijving wordt terugbetaald op de rekening die voor de betaling is gebruikt.",
    whoPaysHeading: "Wie betaalt de retourverzending",
    whoPays:
      "Als u een artikel binnen de termijn van 30 dagen retourneert omdat u van gedachten bent veranderd, bent u zelf verantwoordelijk voor de directe kosten van de retourzending — wij raden aan een verzendservice met tracking te gebruiken. Als uw bestelling beschadigd, defect of onjuist is aangekomen, vergoeden wij de retourverzendkosten volledig; zie \u201cBeschadigd of defect bij aankomst\u201d hieronder.",
    warrantyHeading: "Garantie",
    warranty:
      "Elke machine die wij verkopen valt onder de wettelijke EU-consumentengarantie van 2 jaar tegen gebreken. Veel fabrikanten bieden daarnaast hun eigen extra garantie. Als er iets misgaat, helpt ons supportteam u bij het regelen van een reparatie of vervanging.",
    damagedHeading: "Beschadigd of defect bij aankomst",
    damaged:
      "Als uw bestelling beschadigd of defect aankomt, neem dan binnen 48 uur contact met ons op met foto's en wij regelen een gratis vervanging of retour zonder kosten voor u.",
    contactHeading: "Contactgegevens",
    contactPre: "Voor annuleringen, retouren of vragen over terugbetaling kunt u Ln-Squared bereiken via",
    contactMid: ", telefonisch op +49 30 1234 5678 (ma–vr, 9:00–18:00 uur CET), of per post naar",
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
  const t = COPY[locale]

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
          <a href="mailto:info@3djools.com" className="underline underline-offset-2 hover:text-foreground">
            info@3djools.com
          </a>
          {t.contactMid} Rue du Chénia 17, 7170 Manage, Hainaut, Belgium{t.contactPost}
        </p>
      </ProseSection>
    </ProsePage>
  )
}
