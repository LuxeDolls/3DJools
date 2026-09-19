import { isLocale, type Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { ProsePage, ProseSection } from "@/components/legal/prose-page"
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
    s1Heading: "1. Parties",
    s1a: "This Instalment Sale Agreement (\u201cAgreement\u201d) is entered into between the Seller / Creditor and the Buyer / Borrower named on the order confirmation for any order placed on the 3DJools store using the interest-free instalment payment method.",
    s1SellerLabel: "Seller / Creditor:",
    s1BuyerLabel: "Buyer / Borrower:",
    s1b: "the individual or business identified on the corresponding order confirmation and instalment application.",
    s2Heading: "2. Subject of the agreement",
    s2: "The Seller sells the goods listed on the Buyer's order to the Buyer under an interest-free instalment plan. Title to the goods passes to the Buyer once all instalments due under the plan have been paid in full. A separate, order-specific version of this Agreement — with the exact goods, prices and payment dates for that order — is generated automatically and made available to the Buyer once an instalment application is approved.",
    s3Heading: "3. Eligibility & financial terms",
    s3: "The instalment payment method is available for orders with a total value of €1,000 or more, subject to a quick identity and creditworthiness check. Approved plans are interest-free (0% APR) and consist of 4 equal payments: a 25% down payment due on approval, followed by three further instalments of 25% each, spaced two weeks apart. No fees, interest or other charges are added to the total price of the goods.",
    s4Heading: "4. Payment collection",
    s4: "The Buyer authorizes the Seller to collect each scheduled instalment on its due date via the payment instructions provided (bank transfer or cryptocurrency, as shown in the payment dialog for that order). The Buyer confirms each payment by using the \u201cI've paid\u201d action on the order or instalment status page; the Seller then verifies receipt before marking the instalment as paid.",
    s5Heading: "5. Missed or failed payments",
    s5: "If a scheduled instalment is not confirmed as paid by its due date, the Seller may contact the Buyer to arrange payment. Repeated failure to pay may result in the full remaining balance becoming due immediately and may affect the Buyer's ability to use instalment payments for future orders.",
    s6Heading: "6. Right of withdrawal",
    s6: "The Buyer has a statutory right of withdrawal of 14 days in accordance with EU consumer law, which 3DJools voluntarily extends to a 30-day return policy as further described in our returns policy. Amounts already paid under this Agreement are refunded within 7 working days if the Buyer exercises this right.",
    s7Heading: "7. Shipping",
    s7: "Goods purchased under an instalment plan are shipped once the down payment has been received and the plan is active, using the standard EU shipping method described on our shipping page.",
    s8Heading: "8. Data protection",
    s8: "Personal data and identity documents submitted with an instalment application are processed solely for identity verification and credit assessment, in accordance with the GDPR and our Privacy Policy.",
    s9Heading: "9. Governing law",
    s9: "This Agreement, and any order-specific agreement generated under it, is governed by the laws of Belgium and applicable EU consumer-protection law.",
  },
  de: {
    s1Heading: "1. Parteien",
    s1a: "Dieser Ratenkaufvertrag (\u201cVertrag\u201d) wird zwischen dem Verkäufer/Gläubiger und dem Käufer/Darlehensnehmer geschlossen, die in der Bestellbestätigung für jede über den 3DJools-Shop mit der zinsfreien Ratenzahlungsmethode aufgegebene Bestellung genannt sind.",
    s1SellerLabel: "Verkäufer/Gläubiger:",
    s1BuyerLabel: "Käufer/Darlehensnehmer:",
    s1b: "die in der jeweiligen Bestellbestätigung und dem Ratenzahlungsantrag genannte Person oder das genannte Unternehmen.",
    s2Heading: "2. Vertragsgegenstand",
    s2: "Der Verkäufer verkauft dem Käufer die in dessen Bestellung aufgeführten Waren im Rahmen eines zinsfreien Ratenzahlungsplans. Das Eigentum an den Waren geht auf den Käufer über, sobald alle im Rahmen des Plans fälligen Raten vollständig bezahlt wurden. Eine separate, bestellspezifische Version dieses Vertrags — mit den genauen Waren, Preisen und Zahlungsterminen für diese Bestellung — wird automatisch erstellt und dem Käufer zur Verfügung gestellt, sobald ein Ratenzahlungsantrag genehmigt wurde.",
    s3Heading: "3. Voraussetzungen & finanzielle Bedingungen",
    s3: "Die Ratenzahlungsmethode steht für Bestellungen mit einem Gesamtwert ab 1.000 € zur Verfügung, vorbehaltlich einer schnellen Identitäts- und Bonitätsprüfung. Genehmigte Pläne sind zinsfrei (0 % effektiver Jahreszins) und bestehen aus 4 gleichen Zahlungen: einer Anzahlung von 25 % fällig bei Genehmigung, gefolgt von drei weiteren Raten von je 25 %, im Abstand von zwei Wochen. Dem Gesamtpreis der Waren werden keine Gebühren, Zinsen oder sonstigen Kosten hinzugefügt.",
    s4Heading: "4. Zahlungseinzug",
    s4: "Der Käufer ermächtigt den Verkäufer, jede fällige Rate zum jeweiligen Fälligkeitsdatum über die angegebenen Zahlungsanweisungen einzuziehen (Banküberweisung oder Kryptowährung, wie im Zahlungsdialog für diese Bestellung angezeigt). Der Käufer bestätigt jede Zahlung über die Funktion \u201cIch habe bezahlt\u201d auf der Bestell- oder Ratenstatusseite; der Verkäufer prüft anschließend den Zahlungseingang, bevor die Rate als bezahlt markiert wird.",
    s5Heading: "5. Verspätete oder ausbleibende Zahlungen",
    s5: "Wird eine fällige Rate nicht bis zum Fälligkeitsdatum als bezahlt bestätigt, kann der Verkäufer den Käufer kontaktieren, um die Zahlung zu klären. Wiederholte Zahlungsausfälle können dazu führen, dass der gesamte Restbetrag sofort fällig wird, und können die Möglichkeit des Käufers beeinträchtigen, Ratenzahlungen für künftige Bestellungen zu nutzen.",
    s6Heading: "6. Widerrufsrecht",
    s6: "Der Käufer hat gemäß EU-Verbraucherrecht ein gesetzliches Widerrufsrecht von 14 Tagen, das 3DJools freiwillig auf eine 30-tägige Rückgaberegelung erweitert, wie in unserer Rückgaberichtlinie näher beschrieben. Bereits im Rahmen dieses Vertrags gezahlte Beträge werden innerhalb von 7 Werktagen erstattet, wenn der Käufer dieses Recht ausübt.",
    s7Heading: "7. Versand",
    s7: "Im Rahmen eines Ratenzahlungsplans gekaufte Waren werden versandt, sobald die Anzahlung eingegangen ist und der Plan aktiv ist, unter Verwendung der auf unserer Versandseite beschriebenen Standard-EU-Versandmethode.",
    s8Heading: "8. Datenschutz",
    s8: "Personenbezogene Daten und Identitätsnachweise, die mit einem Ratenzahlungsantrag eingereicht werden, werden ausschließlich zur Identitätsprüfung und Bonitätsbewertung gemäß DSGVO und unserer Datenschutzerklärung verarbeitet.",
    s9Heading: "9. Anwendbares Recht",
    s9: "Dieser Vertrag sowie jeder darauf basierende bestellspezifische Vertrag unterliegt dem Recht Belgiens und dem anwendbaren EU-Verbraucherschutzrecht.",
  },
  fr: {
    s1Heading: "1. Parties",
    s1a: "Le présent contrat de vente à tempérament (\u201cContrat\u201d) est conclu entre le Vendeur/Créancier et l'Acheteur/Emprunteur nommés sur la confirmation de commande pour toute commande passée sur la boutique 3DJools via le mode de paiement échelonné sans intérêt.",
    s1SellerLabel: "Vendeur/Créancier :",
    s1BuyerLabel: "Acheteur/Emprunteur :",
    s1b: "la personne ou l'entreprise identifiée sur la confirmation de commande et la demande de paiement échelonné correspondantes.",
    s2Heading: "2. Objet du contrat",
    s2: "Le Vendeur vend à l'Acheteur les marchandises figurant sur sa commande dans le cadre d'un plan de paiement échelonné sans intérêt. La propriété des marchandises est transférée à l'Acheteur une fois que toutes les échéances dues au titre du plan ont été intégralement payées. Une version distincte de ce Contrat, spécifique à la commande — avec les marchandises, prix et dates de paiement exacts de cette commande — est générée automatiquement et mise à la disposition de l'Acheteur dès l'approbation d'une demande de paiement échelonné.",
    s3Heading: "3. Éligibilité & conditions financières",
    s3: "Le paiement échelonné est disponible pour les commandes d'une valeur totale de 1 000 € ou plus, sous réserve d'une vérification rapide d'identité et de solvabilité. Les plans approuvés sont sans intérêt (TAEG 0 %) et se composent de 4 paiements égaux : un acompte de 25 % dû à l'approbation, suivi de trois autres échéances de 25 % chacune, espacées de deux semaines. Aucun frais, intérêt ou autre charge n'est ajouté au prix total des marchandises.",
    s4Heading: "4. Prélèvement des paiements",
    s4: "L'Acheteur autorise le Vendeur à prélever chaque échéance programmée à sa date d'échéance selon les instructions de paiement fournies (virement bancaire ou cryptomonnaie, comme indiqué dans la fenêtre de paiement de cette commande). L'Acheteur confirme chaque paiement via l'action \u201cJ'ai payé\u201d sur la page de statut de la commande ou de l'échéancier ; le Vendeur vérifie ensuite la réception avant de marquer l'échéance comme payée.",
    s5Heading: "5. Paiements manqués ou en échec",
    s5: "Si une échéance programmée n'est pas confirmée comme payée à sa date d'échéance, le Vendeur peut contacter l'Acheteur pour organiser le paiement. Un défaut de paiement répété peut entraîner l'exigibilité immédiate du solde restant dû et affecter la possibilité pour l'Acheteur d'utiliser le paiement échelonné pour de futures commandes.",
    s6Heading: "6. Droit de rétractation",
    s6: "L'Acheteur dispose d'un droit de rétractation légal de 14 jours conformément au droit européen de protection des consommateurs, que 3DJools étend volontairement à une politique de retour de 30 jours, décrite plus en détail dans notre politique de retour. Les sommes déjà versées au titre du présent Contrat sont remboursées dans un délai de 7 jours ouvrés si l'Acheteur exerce ce droit.",
    s7Heading: "7. Livraison",
    s7: "Les marchandises achetées dans le cadre d'un plan de paiement échelonné sont expédiées une fois l'acompte reçu et le plan activé, selon le mode de livraison standard au sein de l'UE décrit sur notre page de livraison.",
    s8Heading: "8. Protection des données",
    s8: "Les données personnelles et les documents d'identité soumis avec une demande de paiement échelonné sont traités uniquement à des fins de vérification d'identité et d'évaluation de solvabilité, conformément au RGPD et à notre politique de confidentialité.",
    s9Heading: "9. Droit applicable",
    s9: "Le présent Contrat, ainsi que tout contrat spécifique à une commande généré en vertu de celui-ci, est régi par le droit belge et le droit européen applicable en matière de protection des consommateurs.",
  },
  it: {
    s1Heading: "1. Parti",
    s1a: "Il presente Contratto di vendita a rate (\u201cContratto\u201d) è stipulato tra il Venditore/Creditore e l'Acquirente/Debitore indicati nella conferma d'ordine per qualsiasi ordine effettuato sul negozio 3DJools utilizzando il metodo di pagamento rateale senza interessi.",
    s1SellerLabel: "Venditore/Creditore:",
    s1BuyerLabel: "Acquirente/Debitore:",
    s1b: "la persona o l'azienda identificata nella relativa conferma d'ordine e nella richiesta di rateizzazione.",
    s2Heading: "2. Oggetto del contratto",
    s2: "Il Venditore vende all'Acquirente la merce indicata nel suo ordine nell'ambito di un piano rateale senza interessi. La proprietà della merce passa all'Acquirente una volta che tutte le rate dovute nell'ambito del piano sono state pagate integralmente. Una versione separata e specifica dell'ordine di questo Contratto — con la merce, i prezzi e le date di pagamento esatti per tale ordine — viene generata automaticamente e resa disponibile all'Acquirente una volta approvata una richiesta di rateizzazione.",
    s3Heading: "3. Requisiti & condizioni finanziarie",
    s3: "Il metodo di pagamento rateale è disponibile per ordini con un valore totale pari o superiore a 1.000 €, previa rapida verifica dell'identità e dell'affidabilità creditizia. I piani approvati sono senza interessi (TAEG 0%) e consistono in 4 pagamenti uguali: un acconto del 25% dovuto all'approvazione, seguito da altre tre rate del 25% ciascuna, distanziate di due settimane. Nessuna commissione, interesse o altro onere viene aggiunto al prezzo totale della merce.",
    s4Heading: "4. Riscossione dei pagamenti",
    s4: "L'Acquirente autorizza il Venditore a riscuotere ogni rata programmata alla relativa scadenza tramite le istruzioni di pagamento fornite (bonifico bancario o criptovaluta, come indicato nella finestra di pagamento per tale ordine). L'Acquirente conferma ogni pagamento utilizzando l'azione \u201cHo pagato\u201d nella pagina di stato dell'ordine o della rateizzazione; il Venditore verifica quindi la ricezione prima di contrassegnare la rata come pagata.",
    s5Heading: "5. Pagamenti mancati o non riusciti",
    s5: "Se una rata programmata non viene confermata come pagata entro la scadenza, il Venditore può contattare l'Acquirente per concordare il pagamento. Il mancato pagamento ripetuto può comportare l'immediata esigibilità dell'intero saldo residuo e può influire sulla possibilità dell'Acquirente di utilizzare il pagamento rateale per ordini futuri.",
    s6Heading: "6. Diritto di recesso",
    s6: "L'Acquirente ha un diritto legale di recesso di 14 giorni ai sensi del diritto UE a tutela dei consumatori, che 3DJools estende volontariamente a una politica di restituzione di 30 giorni, come ulteriormente descritto nella nostra politica di restituzione. Gli importi già versati ai sensi del presente Contratto vengono rimborsati entro 7 giorni lavorativi se l'Acquirente esercita tale diritto.",
    s7Heading: "7. Spedizione",
    s7: "La merce acquistata nell'ambito di un piano rateale viene spedita una volta ricevuto l'acconto e attivato il piano, utilizzando il metodo di spedizione standard UE descritto nella nostra pagina di spedizione.",
    s8Heading: "8. Protezione dei dati",
    s8: "I dati personali e i documenti di identità presentati con una richiesta di rateizzazione sono trattati esclusivamente per la verifica dell'identità e la valutazione del merito creditizio, in conformità con il GDPR e la nostra Informativa sulla privacy.",
    s9Heading: "9. Legge applicabile",
    s9: "Il presente Contratto, e qualsiasi contratto specifico dell'ordine generato ai sensi dello stesso, è disciplinato dalla legge belga e dal diritto UE applicabile in materia di tutela dei consumatori.",
  },
  es: {
    s1Heading: "1. Partes",
    s1a: "El presente Contrato de venta a plazos (\u201cContrato\u201d) se celebra entre el Vendedor/Acreedor y el Comprador/Prestatario indicados en la confirmación del pedido para cualquier pedido realizado en la tienda 3DJools mediante el método de pago a plazos sin intereses.",
    s1SellerLabel: "Vendedor/Acreedor:",
    s1BuyerLabel: "Comprador/Prestatario:",
    s1b: "la persona o empresa identificada en la correspondiente confirmación del pedido y solicitud de pago a plazos.",
    s2Heading: "2. Objeto del contrato",
    s2: "El Vendedor vende al Comprador los bienes indicados en su pedido bajo un plan de pago a plazos sin intereses. La propiedad de los bienes se transfiere al Comprador una vez que se hayan pagado íntegramente todos los plazos adeudados conforme al plan. Se genera automáticamente una versión separada y específica del pedido de este Contrato — con los bienes, precios y fechas de pago exactos de dicho pedido — y se pone a disposición del Comprador una vez aprobada una solicitud de pago a plazos.",
    s3Heading: "3. Requisitos & condiciones financieras",
    s3: "El método de pago a plazos está disponible para pedidos con un valor total de 1.000 € o más, sujeto a una rápida verificación de identidad y solvencia. Los planes aprobados no tienen intereses (TAE 0%) y constan de 4 pagos iguales: un pago inicial del 25% al momento de la aprobación, seguido de otros tres plazos del 25% cada uno, espaciados dos semanas entre sí. No se añaden comisiones, intereses ni otros cargos al precio total de los bienes.",
    s4Heading: "4. Cobro de los pagos",
    s4: "El Comprador autoriza al Vendedor a cobrar cada plazo programado en su fecha de vencimiento mediante las instrucciones de pago proporcionadas (transferencia bancaria o criptomoneda, como se muestra en el cuadro de pago de dicho pedido). El Comprador confirma cada pago utilizando la acción \u201cHe pagado\u201d en la página de estado del pedido o del plazo; el Vendedor verifica entonces la recepción antes de marcar el plazo como pagado.",
    s5Heading: "5. Pagos atrasados o fallidos",
    s5: "Si un plazo programado no se confirma como pagado en su fecha de vencimiento, el Vendedor podrá contactar al Comprador para acordar el pago. El incumplimiento reiterado del pago puede hacer que la totalidad del saldo restante sea exigible de inmediato y puede afectar la posibilidad del Comprador de utilizar el pago a plazos en futuros pedidos.",
    s6Heading: "6. Derecho de desistimiento",
    s6: "El Comprador tiene un derecho legal de desistimiento de 14 días conforme al derecho de protección al consumidor de la UE, que 3DJools amplía voluntariamente a una política de devolución de 30 días, descrita con más detalle en nuestra política de devoluciones. Los importes ya pagados en virtud de este Contrato se reembolsarán dentro de 7 días laborables si el Comprador ejerce este derecho.",
    s7Heading: "7. Envío",
    s7: "Los bienes adquiridos bajo un plan de pago a plazos se envían una vez recibido el pago inicial y activado el plan, utilizando el método de envío estándar de la UE descrito en nuestra página de envíos.",
    s8Heading: "8. Protección de datos",
    s8: "Los datos personales y los documentos de identidad presentados con una solicitud de pago a plazos se procesan únicamente para la verificación de identidad y la evaluación de solvencia, de conformidad con el RGPD y nuestra Política de privacidad.",
    s9Heading: "9. Ley aplicable",
    s9: "El presente Contrato, así como cualquier contrato específico del pedido generado en virtud del mismo, se rige por las leyes de Bélgica y el derecho de protección al consumidor de la UE aplicable.",
  },
  nl: {
    s1Heading: "1. Partijen",
    s1a: "Deze overeenkomst voor verkoop op afbetaling (\u201cOvereenkomst\u201d) wordt aangegaan tussen de Verkoper/Schuldeiser en de Koper/Kredietnemer die worden genoemd op de orderbevestiging voor elke bestelling die via de webshop van 3DJools wordt geplaatst met de rentevrije gespreide betalingsmethode.",
    s1SellerLabel: "Verkoper/Schuldeiser:",
    s1BuyerLabel: "Koper/Kredietnemer:",
    s1b: "de persoon of onderneming vermeld op de bijbehorende orderbevestiging en aanvraag voor gespreide betaling.",
    s2Heading: "2. Voorwerp van de overeenkomst",
    s2: "De Verkoper verkoopt de goederen die op de bestelling van de Koper staan vermeld aan de Koper onder een rentevrij afbetalingsplan. De eigendom van de goederen gaat over op de Koper zodra alle onder het plan verschuldigde termijnen volledig zijn betaald. Een aparte, bestellingsspecifieke versie van deze Overeenkomst — met de exacte goederen, prijzen en betaaldata voor die bestelling — wordt automatisch gegenereerd en aan de Koper beschikbaar gesteld zodra een aanvraag voor gespreide betaling is goedgekeurd.",
    s3Heading: "3. Voorwaarden & financiële condities",
    s3: "De gespreide betalingsmethode is beschikbaar voor bestellingen met een totale waarde van € 1.000 of meer, onder voorbehoud van een snelle identiteits- en kredietwaardigheidscontrole. Goedgekeurde plannen zijn rentevrij (0% JKP) en bestaan uit 4 gelijke betalingen: een aanbetaling van 25% verschuldigd bij goedkeuring, gevolgd door nog drie termijnen van elk 25%, met tussenpozen van twee weken. Er worden geen kosten, rente of andere lasten toegevoegd aan de totale prijs van de goederen.",
    s4Heading: "4. Incasso van betalingen",
    s4: "De Koper machtigt de Verkoper om elke geplande termijn op de vervaldatum te innen via de verstrekte betaalinstructies (bankoverschrijving of cryptovaluta, zoals weergegeven in het betaalvenster voor die bestelling). De Koper bevestigt elke betaling via de actie \u201cIk heb betaald\u201d op de bestel- of betalingsstatuspagina; de Verkoper controleert vervolgens de ontvangst voordat de termijn als betaald wordt gemarkeerd.",
    s5Heading: "5. Gemiste of mislukte betalingen",
    s5: "Als een geplande termijn niet vóór de vervaldatum als betaald wordt bevestigd, kan de Verkoper contact opnemen met de Koper om de betaling te regelen. Herhaald uitblijven van betaling kan ertoe leiden dat het volledige resterende saldo onmiddellijk opeisbaar wordt en kan de mogelijkheid van de Koper beïnvloeden om gespreide betaling te gebruiken voor toekomstige bestellingen.",
    s6Heading: "6. Herroepingsrecht",
    s6: "De Koper heeft een wettelijk herroepingsrecht van 14 dagen conform het EU-consumentenrecht, dat 3DJools vrijwillig uitbreidt tot een retourbeleid van 30 dagen, zoals nader beschreven in ons retourbeleid. Reeds onder deze Overeenkomst betaalde bedragen worden binnen 7 werkdagen terugbetaald als de Koper dit recht uitoefent.",
    s7Heading: "7. Verzending",
    s7: "Goederen die zijn gekocht onder een afbetalingsplan worden verzonden zodra de aanbetaling is ontvangen en het plan actief is, via de standaard EU-verzendmethode beschreven op onze verzendpagina.",
    s8Heading: "8. Gegevensbescherming",
    s8: "Persoonsgegevens en identiteitsdocumenten die worden ingediend bij een aanvraag voor gespreide betaling, worden uitsluitend verwerkt voor identiteitsverificatie en kredietbeoordeling, in overeenstemming met de AVG en ons privacybeleid.",
    s9Heading: "9. Toepasselijk recht",
    s9: "Deze Overeenkomst, en elke daaronder gegenereerde bestellingsspecifieke overeenkomst, wordt beheerst door het Belgische recht en het toepasselijke EU-consumentenbeschermingsrecht.",
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
  const t = COPY[locale]

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
