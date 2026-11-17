import { isLocale, type Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { ProsePage, ProseSection } from "@/components/legal/prose-page"
import { fillCompany } from "@/lib/company"
import { CREDITOR } from "@/components/installments/contract"

type InstalmentCopy = {
  s1Heading: string
  s1a: string
  s1SellerLabel: string
  s1BuyerLabel: string
  s1b: string
  s2Heading: string
  s2: string
  s3Heading: string
  s3: string
  s4Heading: string
  s4: string
  s5Heading: string
  s5: string
  s6Heading: string
  s6: string
  s7Heading: string
  s7: string
  s8Heading: string
  s8: string
  s9Heading: string
  s9: string
}

const COPY: Record<Locale, InstalmentCopy> = {
  en: {
    s1Heading: "1. Contracting parties",
    s1a: "This Instalment Sale Agreement (\u201cAgreement\u201d) governs any purchase on the 3DEureka store for which the customer selects the 3\u00d7 interest-free instalment plan, and is concluded between the Seller / Creditor and the Buyer / Borrower named on the order confirmation.",
    s1SellerLabel: "Seller / Creditor:",
    s1BuyerLabel: "Buyer / Borrower:",
    s1b: "the natural person or business entity named on the relevant order confirmation and instalment request.",
    s2Heading: "2. Scope & retention of title",
    s2: "Under this Agreement, the Seller supplies the items specified in the Buyer's order against an interest-free payment schedule. Legal title to the hardware remains with the Seller until all three scheduled payments have been settled in full. Once an instalment application is approved, an individualised copy of this Agreement — listing the exact products, amounts, and due dates — is generated automatically for the Buyer.",
    s3Heading: "3. Qualifying orders & payment structure (0% APR)",
    s3: "Orders with a basket value of €1,000 or higher qualify for the instalment option, subject to a brief identity and credit assessment. Approved plans carry a 0% annual percentage rate (interest-free) and split the total into 3 equal instalments (1/3 each): an initial 1/3 down payment payable upon approval, followed by two subsequent instalments spaced two weeks apart. No arrangement fees, interest, or hidden surcharges apply.",
    s4Heading: "4. Settlement of instalments",
    s4: "The Buyer agrees to remit each scheduled instalment on or before its due date using the bank transfer instructions displayed in the order's payment dialog. After sending a transfer, the Buyer clicks \u201cI've paid\u201d on the order or instalment status page; the Seller then verifies receipt of funds on the receiving account before marking that instalment as settled.",
    s5Heading: "5. Late or missed instalments",
    s5: "Should a scheduled payment not be confirmed by its due date, the Seller will reach out to the Buyer to arrange settlement. Persistent non-payment may cause the entire remaining balance to become immediately due and payable, and may restrict the Buyer from using instalment plans on future purchases.",
    s6Heading: "6. Right of withdrawal & 30-day returns",
    s6: "In accordance with EU consumer protection rules, the Buyer holds a statutory 14-day right of withdrawal, which we voluntarily extend to 30 days from receipt as detailed in our returns policy. If the Buyer exercises this right, any instalments already paid under this Agreement are refunded within 7 working days after the returned goods are received and inspected. Direct exchanges are not available.",
    s7Heading: "7. Dispatch of goods",
    s7: "Equipment purchased on an instalment plan enters our standard free EU shipping workflow as soon as the 1/3 down payment has been confirmed and the plan is active.",
    s8Heading: "8. Processing of identity & credit data",
    s8: "Any personal details and identification documents provided during the instalment application are used strictly for identity verification and creditworthiness checks in compliance with the GDPR and our Privacy Policy.",
    s9Heading: "9. Applicable law",
    s9: "This Agreement, together with every order-specific schedule issued under it, is governed by the laws of Belgium and mandatory EU consumer-protection legislation.",
  },
  de: {
    s1Heading: "1. Vertragsparteien",
    s1a: "Dieser Ratenkaufvertrag (\u201cVertrag\u201d) regelt alle Einkäufe im 3DEureka-Onlineshop, bei denen die zinsfreie 3\u00d7-Ratenzahlung gewählt wird, und kommt zwischen dem Verkäufer/Gläubiger und dem in der Bestellbestätigung genannten Käufer/Darlehensnehmer zustande.",
    s1SellerLabel: "Verkäufer/Gläubiger:",
    s1BuyerLabel: "Käufer/Darlehensnehmer:",
    s1b: "die in der jeweiligen Bestellbestätigung und im Ratenantrag aufgeführte natürliche Person oder Firma.",
    s2Heading: "2. Vertragsgegenstand & Eigentumsvorbehalt",
    s2: "Der Verkäufer liefert dem Käufer die in der Bestellung bezeichneten Waren im Rahmen eines zinsfreien Teilzahlungsplans. Bis zur vollständigen Begleichung sämtlicher drei Raten verbleibt das Eigentum an der Ware beim Verkäufer. Nach Freigabe eines Ratenantrags wird automatisch eine bestellbezogene Vertragsfassung mit den konkreten Artikeln, Beträgen und Fälligkeitsterminen für den Käufer bereitgestellt.",
    s3Heading: "3. Mindestbestellwert & Zahlungsplan (0 % Zinsen)",
    s3: "Die Ratenzahlung kann ab einem Bestellwert von 1.000 € nach einer kurzen Identitäts- und Bonitätsprüfung genutzt werden. Genehmigte Ratenpläne sind komplett zinsfrei (0 % effektiver Jahreszins) und teilen den Kaufpreis in 3 gleiche Raten (je 1/3) auf: 1/3 Anzahlung direkt nach Genehmigung sowie zwei Folgeraten im Abstand von jeweils zwei Wochen. Es fallen weder Zinsen noch Bearbeitungs- oder Zusatzgebühren an.",
    s4Heading: "4. Zahlungsabwicklung der Raten",
    s4: "Der Käufer verpflichtet sich, jede Rate fristgerecht zum jeweiligen Fälligkeitstermin gemäß den im Zahlungsfenster der Bestellung angezeigten Überweisungsdaten zu begleichen. Nach Ausführung der Überweisung bestätigt der Käufer die Zahlung über die Schaltfläche \u201cIch habe bezahlt\u201d auf der Bestell- bzw. Ratenstatusseite; nach Prüfung des Geldeingangs verbucht der Verkäufer die Rate als bezahlt.",
    s5Heading: "5. Zahlungsverzug",
    s5: "Geht eine fällige Rate nicht rechtzeitig ein, setzt sich der Verkäufer mit dem Käufer in Verbindung, um den Ausgleich abzustimmen. Bei wiederholtem Zahlungsausfall kann der gesamte offene Restbetrag sofort fällig gestellt werden; zudem kann der Käufer für künftige Ratenkäufe gesperrt werden.",
    s6Heading: "6. Widerrufsrecht & 30 Tage Rückgabe",
    s6: "Verbrauchern steht nach EU-Recht ein 14-tägiges Widerrufsrecht zu, das wir gemäß unserer Rückgaberichtlinie freiwillig auf 30 Tage ab Warenerhalt verlängern. Macht der Käufer hiervon Gebrauch, werden bereits geleistete Raten innerhalb von 7 Werktagen nach Eingang und Prüfung der Rücksendung erstattet. Ein Umtausch ist ausgeschlossen.",
    s7Heading: "7. Übergabe an den Versand",
    s7: "Waren aus einem Ratenkauf werden über unseren kostenlosen EU-Standardversand verschickt, sobald die erste Rate (1/3 Anzahlung) eingegangen und der Ratenplan aktiviert ist.",
    s8Heading: "8. Datenschutz bei der Antragsprüfung",
    s8: "Im Rahmen des Ratenantrags übermittelte Personen- und Ausweisdaten werden ausschließlich zur Identitätsfeststellung und Bonitätsprüfung im Einklang mit der DSGVO und unserer Datenschutzerklärung verarbeitet.",
    s9Heading: "9. Geltendes Recht",
    s9: "Für diesen Vertrag sowie alle daraus erzeugten bestellspezifischen Einzelverträge gilt belgisches Recht unter Wahrung des zwingenden EU-Verbraucherschutzrechts.",
  },
  fr: {
    s1Heading: "1. Parties au contrat",
    s1a: "Le présent contrat de vente à tempérament (\u201cContrat\u201d) encadre toute commande passée sur la boutique 3DEureka avec l'option de paiement échelonné en 3\u00d7 sans frais, entre le Vendeur/Créancier et l'Acheteur/Emprunteur désignés sur la confirmation de commande.",
    s1SellerLabel: "Vendeur/Créancier :",
    s1BuyerLabel: "Acheteur/Emprunteur :",
    s1b: "la personne physique ou l'entreprise mentionnée sur la confirmation de commande et le dossier d'échelonnement correspondants.",
    s2Heading: "2. Objet & réserve de propriété",
    s2: "Le Vendeur cède à l'Acheteur les équipements détaillés dans sa commande selon un échéancier sans intérêt. Le transfert de propriété des marchandises n'intervient qu'après le règlement intégral des trois échéances prévues. Dès validation du dossier, un exemplaire personnalisé du Contrat — récapitulant les articles, montants et dates d'échéance propres à la commande — est généré automatiquement pour l'Acheteur.",
    s3Heading: "3. Conditions d'accès & échéancier (TAEG 0 %)",
    s3: "Le règlement échelonné est accessible dès 1 000 € d'achat, après une vérification rapide d'identité et de solvabilité. Les dossiers acceptés bénéficient d'un taux annuel effectif global de 0 % (sans intérêt) et répartissent le montant en 3 versements égaux (1/3 chacun) : un acompte initial d'1/3 à l'approbation, puis deux échéances espacées de deux semaines. Aucuns frais de dossier, intérêts ou pénalités cachées ne s'ajoutent au prix.",
    s4Heading: "4. Règlement des échéances",
    s4: "L'Acheteur s'engage à régler chaque échéance à la date prévue en suivant les coordonnées de virement bancaire indiquées dans la fenêtre de paiement de la commande. Après avoir effectué le virement, l'Acheteur clique sur \u201cJ'ai payé\u201d sur la page de suivi ; le Vendeur contrôle alors la réception des fonds avant de valider l'échéance.",
    s5Heading: "5. Retard ou défaut de paiement",
    s5: "Si une échéance n'est pas réglée à sa date limite, le Vendeur prendra contact avec l'Acheteur afin de régulariser la situation. En cas de manquements répétés, l'intégralité du solde restant pourra devenir immédiatement exigible et l'accès aux facilités de paiement pourra être refusé pour les commandes ultérieures.",
    s6Heading: "6. Droit de rétractation & retour sous 30 jours",
    s6: "Conformément au droit européen de la consommation, l'Acheteur bénéficie d'un délai légal de rétractation de 14 jours, que nous étendons volontairement à 30 jours après réception selon notre politique de retour. En cas d'exercice de ce droit, les sommes déjà versées sont remboursées sous 7 jours ouvrés après réception et inspection du matériel retourné. Les échanges ne sont pas proposés.",
    s7Heading: "7. Expédition du matériel",
    s7: "Les commandes associées à un plan de paiement échelonné sont expédiées via notre livraison standard gratuite dans l'UE dès que l'acompte d'1/3 est réceptionné et que le plan est actif.",
    s8Heading: "8. Traitement des données personnelles",
    s8: "Les informations personnelles et pièces justificatives fournies lors d'une demande d'échelonnement sont traitées exclusivement à des fins de vérification d'identité et d'analyse de solvabilité, dans le strict respect du RGPD et de notre politique de confidentialité.",
    s9Heading: "9. Droit applicable",
    s9: "Le présent Contrat et tout échéancier particulier qui en découle sont soumis au droit belge ainsi qu'aux règles européennes impératives de protection des consommateurs.",
  },
  it: {
    s1Heading: "1. Parti contraenti",
    s1a: "Il presente Contratto di vendita a rate (\u201cContratto\u201d) disciplina gli ordini effettuati sullo store 3DEureka con piano di dilazione in 3\u00d7 senza interessi ed è concluso tra il Venditore/Creditore e l'Acquirente/Debitore indicati nella conferma d'ordine.",
    s1SellerLabel: "Venditore/Creditore:",
    s1BuyerLabel: "Acquirente/Debitore:",
    s1b: "la persona fisica o giuridica riportata nella conferma d'ordine e nella relativa richiesta di rateizzazione.",
    s2Heading: "2. Oggetto & riserva di proprietà",
    s2: "Il Venditore fornisce all'Acquirente i prodotti elencati nell'ordine secondo un piano di pagamento rateale a tasso zero. La proprietà dei beni passa all'Acquirente solo al saldo integrale di tutte le tre rate previste. Una volta approvata la pratica, il sistema genera automaticamente una copia specifica per l'ordine — contenente articoli, importi e scadenze esatte — consultabile dall'Acquirente.",
    s3Heading: "3. Requisiti d'accesso & condizioni economiche (TAEG 0%)",
    s3: "La dilazione è richiedibile per ordini di importo pari o superiore a 1.000 €, previa rapida verifica dell'identità e del merito creditizio. I piani approvati sono a tasso zero (TAEG 0%) e suddividono il totale in 3 quote uguali (1/3 ciascuna): un acconto di 1/3 all'approvazione, seguito da due ulteriori rate a intervalli di due settimane. Non vengono applicati interessi, spese di istruttoria o costi aggiuntivi.",
    s4Heading: "4. Modalità di versamento delle rate",
    s4: "L'Acquirente si impegna a versare ciascuna rata entro la data di scadenza seguendo le coordinate di bonifico bancario mostrate nella schermata di pagamento dell'ordine. Effettuato il bonifico, l'Acquirente conferma il versamento tramite il pulsante \u201cHo pagato\u201d nella pagina dell'ordine o del piano rateale; il Venditore verifica quindi l'accredito prima di registrare la rata come saldata.",
    s5Heading: "5. Ritardi o mancati pagamenti",
    s5: "Qualora una rata non risulti saldata entro la scadenza, il Venditore potrà contattare l'Acquirente per concordare il pagamento. In caso di inadempimento reiterato, l'intero importo residuo potrà divenire immediatamente esigibile e l'Acquirente potrà perdere l'accesso ai piani rateali per acquisti futuri.",
    s6Heading: "6. Diritto di recesso & reso a 30 giorni",
    s6: "Ai sensi della normativa UE a tutela dei consumatori, l'Acquirente dispone di 14 giorni legali per recedere dall'acquisto, termine che estendiamo volontariamente a 30 giorni dalla consegna come indicato nella nostra politica di reso. In caso di recesso, le quote già corrisposte vengono rimborsate entro 7 giorni lavorativi dal ricevimento e dalla verifica dei beni restituiti. Non si effettuano cambi.",
    s7Heading: "7. Spedizione della merce",
    s7: "I prodotti acquistati con formula rateale vengono spediti tramite il nostro servizio di consegna gratuita UE non appena l'acconto di 1/3 risulta accreditato e il piano è attivo.",
    s8Heading: "8. Tutela dei dati personali",
    s8: "I dati anagrafici e i documenti d'identità allegati alla domanda di rateizzazione vengono trattati esclusivamente per l'accertamento dell'identità e la valutazione creditizia, nel pieno rispetto del GDPR e della nostra Informativa sulla privacy.",
    s9Heading: "9. Legge regolatrice",
    s9: "Il presente Contratto e ogni piano specifico generato in base ad esso sono regolati dalla legge belga e dalle norme imperative dell'Unione Europea a tutela dei consumatori.",
  },
  es: {
    s1Heading: "1. Partes contratantes",
    s1a: "El presente Contrato de compraventa a plazos (\u201cContrato\u201d) regula cualquier pedido realizado en la tienda 3DEureka acogido a la modalidad de pago fraccionado en 3\u00d7 sin intereses, y se suscribe entre el Vendedor/Acreedor y el Comprador/Prestatario identificados en la confirmación del pedido.",
    s1SellerLabel: "Vendedor/Acreedor:",
    s1BuyerLabel: "Comprador/Prestatario:",
    s1b: "la persona física o empresa que figura en la confirmación del pedido y en la solicitud de fraccionamiento correspondiente.",
    s2Heading: "2. Objeto y reserva de dominio",
    s2: "El Vendedor entrega al Comprador los artículos detallados en su pedido bajo un calendario de pagos sin intereses. La titularidad de los bienes permanece en poder del Vendedor hasta que se hayan abonado íntegramente las tres cuotas pactadas. Al aprobarse la solicitud, se genera automáticamente una versión individualizada de este Contrato con el desglose exacto de productos, importes y vencimientos de dicho pedido.",
    s3Heading: "3. Importe mínimo y condiciones financieras (0 % TAE)",
    s3: "El pago fraccionado está disponible para pedidos a partir de 1.000 €, previa comprobación ágil de identidad y solvencia. Los planes autorizados no devengan intereses (0 % TAE) y dividen el total en 3 cuotas idénticas (1/3 cada una): un pago inicial de 1/3 tras la aprobación y dos cuotas posteriores cada dos semanas. No se añaden comisiones de apertura ni recargos de ningún tipo.",
    s4Heading: "4. Abono de las cuotas",
    s4: "El Comprador se compromete a abonar cada cuota en su fecha de vencimiento siguiendo las instrucciones de transferencia bancaria indicadas en el panel de pago del pedido. Tras ordenar la transferencia, el Comprador pulsa el botón \u201cHe pagado\u201d en la página de estado del pedido o del plan; el Vendedor comprueba entonces el ingreso antes de marcar la cuota como pagada.",
    s5Heading: "5. Impagos o demoras",
    s5: "Si llegada la fecha de vencimiento no consta el abono de una cuota, el Vendedor se pondrá en contacto con el Comprador para regularizar el pago. El incumplimiento reiterado podrá dar lugar al vencimiento anticipado de todo el saldo pendiente y limitar el acceso del Comprador a futuros planes a plazos.",
    s6Heading: "6. Derecho de desistimiento y devolución en 30 días",
    s6: "De acuerdo con la legislación europea de consumo, el Comprador cuenta con un plazo legal de desistimiento de 14 días, que ampliamos voluntariamente a 30 días desde la entrega según nuestra política de devoluciones. Si el Comprador ejerce este derecho, las cantidades ya abonadas se reembolsarán en un máximo de 7 días laborables tras recibir y revisar la mercancía devuelta. No se admiten cambios.",
    s7Heading: "7. Expedición del pedido",
    s7: "Los artículos adquiridos mediante un plan a plazos se envían a través de nuestro servicio de transporte estándar gratuito en la UE tan pronto como se recibe el pago inicial de 1/3 y queda activado el plan.",
    s8Heading: "8. Protección de datos personales",
    s8: "Los datos personales y documentos identificativos aportados en la solicitud de fraccionamiento se tratan exclusivamente para verificar la identidad y evaluar la solvencia, conforme al RGPD y a nuestra Política de privacidad.",
    s9Heading: "9. Legislación aplicable",
    s9: "Este Contrato y cualquier acuerdo específico derivado del mismo se rigen por la legislación de Bélgica y por la normativa europea imperativa de protección al consumidor.",
  },
  nl: {
    s1Heading: "1. Contractpartijen",
    s1a: "Deze koopovereenkomst op afbetaling (\u201cOvereenkomst\u201d) is van toepassing op iedere bestelling in de 3DEureka-webshop waarbij gekozen is voor gespreid betalen in 3\u00d7 zonder rente, en wordt gesloten tussen de Verkoper/Schuldeiser en de Koper/Kredietnemer vermeld op de orderbevestiging.",
    s1SellerLabel: "Verkoper/Schuldeiser:",
    s1BuyerLabel: "Koper/Kredietnemer:",
    s1b: "de natuurlijke persoon of onderneming die op de betreffende orderbevestiging en termijnaanvraag staat geregistreerd.",
    s2Heading: "2. Onderwerp & eigendomsvoorbehoud",
    s2: "De Verkoper levert de in de bestelling opgenomen goederen aan de Koper op basis van een rentevrij betalingsschema. De eigendom van de goederen gaat pas over op de Koper zodra alle drie de termijnen volledig zijn voldaan. Na goedkeuring van een aanvraag wordt automatisch een orderspecifieke versie van deze Overeenkomst — met de exacte producten, bedragen en vervaldata — voor de Koper aangemaakt.",
    s3Heading: "3. Toelating & financiële voorwaarden (0% JKP)",
    s3: "Gespreid betalen is mogelijk bij bestellingen vanaf € 1.000, na een korte identiteits- en kredietwaardigheidstoets. Goedgekeurde plannen zijn volledig rentevrij (0% JKP) en verdelen het aankoopbedrag in 3 gelijke betalingen (elk 1/3): een aanbetaling van 1/3 bij goedkeuring, gevolgd door twee termijnen om de twee weken. Er worden geen rente, administratiekosten of andere toeslagen berekend.",
    s4Heading: "4. Voldoening van de termijnen",
    s4: "De Koper verplicht zich om iedere geplande termijn uiterlijk op de vervaldatum over te maken volgens de betaalinstructies (bankoverschrijving) in het betaalvenster van de bestelling. Na de overschrijving bevestigt de Koper de betaling via de knop \u201cIk heb betaald\u201d op de statuspagina; de Verkoper controleert vervolgens de bijschrijving voordat de termijn als voldaan wordt geregistreerd.",
    s5Heading: "5. Te late of uitblijvende betalingen",
    s5: "Wanneer een termijn op de vervaldatum nog niet is bevestigd, neemt de Verkoper contact op met de Koper om de betaling af te stemmen. Bij herhaaldelijk verzuim kan het volledige openstaande restbedrag direct opeisbaar worden en kan de Koper worden uitgesloten van toekomstige termijnbetalingen.",
    s6Heading: "6. Herroepingsrecht & 30 dagen retour",
    s6: "Overeenkomstig het EU-consumentenrecht heeft de Koper een wettelijke bedenktijd van 14 dagen, die wij volgens ons retourbeleid vrijwillig verruimen naar 30 dagen na ontvangst. Maakt de Koper gebruik van dit recht, dan worden reeds betaalde termijnen binnen 7 werkdagen na ontvangst en inspectie van de retourzending terugbetaald. Omruilen is niet mogelijk.",
    s7Heading: "7. Verzending van de bestelling",
    s7: "Goederen die onder een termijnplan zijn aangeschaft, worden verzonden via onze gratis standaard EU-levering zodra de aanbetaling van 1/3 is ontvangen en het plan actief is.",
    s8Heading: "8. Verwerking van persoonsgegevens",
    s8: "Persoonsgegevens en identiteitsdocumenten die bij een termijnaanvraag worden aangeleverd, worden uitsluitend gebruikt voor identiteitscontrole en kredietbeoordeling conform de AVG en ons privacybeleid.",
    s9Heading: "9. Toepasselijk recht",
    s9: "Op deze Overeenkomst en alle daaruit voortvloeiende orderspecifieke overeenkomsten is het Belgisch recht en het dwingende EU-consumentenbeschermingsrecht van toepassing.",
  },
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : "en"
  const dict = await getDictionary(locale)
  return { title: dict.footer.instalmentAgreement }
}

export default async function InstalmentAgreementPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : "en"
  const dict = await getDictionary(locale)
  const t = fillCompany(COPY[locale])

  return (
    <ProsePage
      locale={locale}
      dict={dict}
      title={dict.footer.instalmentAgreement}
      crumbs={[{ label: dict.common.home, href: "/" }, { label: dict.footer.instalmentAgreement }]}
    >
      <ProseSection heading={t.s1Heading}>
        <p>{t.s1a}</p>
        <p className="mt-2">
          <span className="font-medium text-foreground">{t.s1SellerLabel}</span> {CREDITOR.name}, {CREDITOR.address} ·{" "}
          {CREDITOR.registration} · VAT {CREDITOR.vat} ·{" "}
          <a href={`mailto:${CREDITOR.email}`} className="underline underline-offset-2 hover:text-foreground">
            {CREDITOR.email}
          </a>
        </p>
        <p className="mt-1">
          <span className="font-medium text-foreground">{t.s1BuyerLabel}</span> {t.s1b}
        </p>
      </ProseSection>

      <ProseSection heading={t.s2Heading}>
        <p>{t.s2}</p>
      </ProseSection>

      <ProseSection heading={t.s3Heading}>
        <p>{t.s3}</p>
      </ProseSection>

      <ProseSection heading={t.s4Heading}>
        <p>{t.s4}</p>
      </ProseSection>

      <ProseSection heading={t.s5Heading}>
        <p>{t.s5}</p>
      </ProseSection>

      <ProseSection heading={t.s6Heading}>
        <p>{t.s6}</p>
      </ProseSection>

      <ProseSection heading={t.s7Heading}>
        <p>{t.s7}</p>
      </ProseSection>

      <ProseSection heading={t.s8Heading}>
        <p>{t.s8}</p>
      </ProseSection>

      <ProseSection heading={t.s9Heading}>
        <p>{t.s9}</p>
      </ProseSection>
    </ProsePage>
  )
}
