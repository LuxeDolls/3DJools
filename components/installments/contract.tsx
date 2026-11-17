import type { Locale } from "@/lib/i18n/config"
import { COMPANY, companyStreetLine } from "@/lib/company"
import { formatPrice } from "@/lib/format"
import type { ScheduleEntry } from "@/lib/db/schema"

/**
 * Installment Sales Agreement. Interpolates the concrete order figures for
 * each customer's plan.
 */

export const CREDITOR = {
  name: COMPANY.legalName,
  address: companyStreetLine,
  registration: `KBO ${COMPANY.companyNumber}`,
  vat: COMPANY.vat,
  email: COMPANY.email,
}

type ClauseSet = {
  draftNotice: string
  parties: string
  creditorLabel: string
  borrowerLabel: string
  subject: string
  subjectBody: string
  financials: string
  totalPrice: string
  downPayment: string
  financedAmount: string
  interest: string
  interestValue: string
  schedule: string
  clausesTitle: string
  clauses: string[]
  law: string
}

const CLAUSES: Record<Locale, ClauseSet> = {
  en: {
    draftNotice: "PREVIEW COPY — generated for your order. Final binding schedule takes effect upon approval of your instalment request.",
    parties: "1. Contracting parties",
    creditorLabel: "Seller / Creditor",
    borrowerLabel: "Buyer / Borrower",
    subject: "2. Scope & retention of title",
    subjectBody:
      "The Seller supplies the items listed below to the Buyer under an interest-free payment plan. Legal ownership of the goods transfers to the Buyer once all four scheduled payments have been settled in full.",
    financials: "3. Financial breakdown",
    totalPrice: "Total order value",
    downPayment: "Initial payment (25%, due upon approval)",
    financedAmount: "Remaining balance (75% across 3 instalments)",
    interest: "Annual percentage rate (APR)",
    interestValue: "0% — zero interest & zero fees",
    schedule: "4. Repayment schedule",
    clausesTitle: "5. Key terms of the plan",
    clauses: [
      "The Buyer undertakes to settle each scheduled instalment on or before its due date using the payment instructions provided for the order.",
      "The repayment plan comprises 4 equal 25% payments: an initial 25% down payment upon approval followed by three fortnightly instalments over two months.",
      "If a scheduled instalment is not received on time, the Seller will contact the Buyer; repeated non-payment may render the entire outstanding balance immediately due.",
      "The Buyer holds a 14-day statutory EU right of withdrawal, which the Seller voluntarily extends to 30 days from delivery. Any payments already made are refunded within 7 working days after the returned goods are received and inspected, in line with the returns policy.",
      "The order is dispatched via free EU shipping once the 25% down payment has been confirmed and the plan is active.",
      "Personal details and identity documents submitted with the application are used strictly for identity verification and credit assessment under the GDPR and our Privacy Policy.",
    ],
    law: "6. Applicable law — This agreement is governed by the laws of Belgium and mandatory EU consumer-protection legislation.",
  },
  de: {
    draftNotice: "VORSCHAU — für Ihre Bestellung erstellt. Der verbindliche Tilgungsplan tritt mit Genehmigung Ihres Ratenantrags in Kraft.",
    parties: "1. Vertragsparteien",
    creditorLabel: "Verkäufer / Gläubiger",
    borrowerLabel: "Käufer / Darlehensnehmer",
    subject: "2. Vertragsgegenstand & Eigentumsvorbehalt",
    subjectBody:
      "Der Verkäufer liefert die nachstehend aufgeführten Artikel im Rahmen eines zinsfreien Ratenplans an den Käufer. Das Eigentum an der Ware geht erst mit vollständiger Tilgung aller vier Raten auf den Käufer über.",
    financials: "3. Finanzielle Eckdaten",
    totalPrice: "Gesamtbetrag der Ware",
    downPayment: "Erste Rate / Anzahlung (25 %, fällig bei Freigabe)",
    financedAmount: "Restbetrag (75 % in 3 Folgeraten)",
    interest: "Effektiver Jahreszins",
    interestValue: "0 % — zins- und gebührenfrei",
    schedule: "4. Fälligkeitsplan",
    clausesTitle: "5. Vertragsbedingungen",
    clauses: [
      "Der Käufer verpflichtet sich, jede Rate fristgerecht zum jeweiligen Fälligkeitstermin gemäß den Zahlungsanweisungen der Bestellung zu begleichen.",
      "Der Zahlungsplan umfasst 4 gleich hohe Raten zu je 25 %: eine Anzahlung von 25 % bei Genehmigung sowie drei weitere Zahlungen im Abstand von jeweils zwei Wochen.",
      "Bleibt eine Rate zum Fälligkeitstermin aus, kontaktiert der Verkäufer den Käufer; wiederholter Zahlungsverzug kann zur sofortigen Fälligkeit des gesamten Restsaldos führen.",
      "Dem Käufer steht das gesetzliche 14-tägige EU-Widerrufsrecht zu, das der Verkäufer freiwillig auf 30 Tage ab Erhalt erweitert. Bereits gezahlte Raten werden innerhalb von 7 Werktagen nach Eingang und Prüfung der Rücksendung gemäß der Rückgaberichtlinie erstattet.",
      "Der Versand erfolgt nach Eingang der 25-%-Anzahlung und Aktivierung des Ratenplans.",
      "Übermittelte Personen- und Ausweisdaten werden ausschließlich zur Identitäts- und Bonitätsprüfung gemäß DSGVO und Datenschutzerklärung verarbeitet.",
    ],
    law: "6. Geltendes Recht — Dieser Vertrag unterliegt belgischem Recht sowie dem zwingenden EU-Verbraucherschutzrecht.",
  },
  fr: {
    draftNotice: "APERÇU DU CONTRAT — généré pour votre commande. L'échéancier définitif prend effet dès validation de votre demande.",
    parties: "1. Parties au contrat",
    creditorLabel: "Vendeur / Créancier",
    borrowerLabel: "Acheteur / Emprunteur",
    subject: "2. Objet & réserve de propriété",
    subjectBody:
      "Le Vendeur fournit les articles détaillés ci-dessous à l'Acheteur selon un échéancier sans intérêt. Le transfert de propriété intervient une fois les quatre échéances intégralement réglées.",
    financials: "3. Détail financier",
    totalPrice: "Montant total des marchandises",
    downPayment: "Premier versement (25 %, dû à l'approbation)",
    financedAmount: "Solde échelonné (75 % en 3 versements)",
    interest: "Taux annuel effectif global (TAEG)",
    interestValue: "0 % — sans intérêt ni frais",
    schedule: "4. Calendrier des échéances",
    clausesTitle: "5. Stipulations principales",
    clauses: [
      "L'Acheteur s'engage à régler chaque échéance à sa date limite selon les instructions de paiement associées à la commande.",
      "Le plan comprend 4 versements égaux de 25 % : un acompte de 25 % dès validation, suivi de trois échéances espacées de deux semaines sur deux mois.",
      "En cas de retard sur une échéance, le Vendeur prendra contact avec l'Acheteur ; des défauts répétés peuvent entraîner l'exigibilité immédiate du solde restant.",
      "L'Acheteur bénéficie du délai légal européen de rétractation de 14 jours, volontairement porté par le Vendeur à 30 jours après livraison. Les sommes déjà versées sont remboursées sous 7 jours ouvrés après réception et inspection du retour, conformément à la politique de retour.",
      "Les articles sont expédiés dès réception de l'acompte de 25 % et activation de l'échéancier.",
      "Les données personnelles et justificatifs d'identité sont traités exclusivement pour vérifier l'identité et la solvabilité conformément au RGPD.",
    ],
    law: "6. Droit applicable — Le présent contrat est soumis au droit belge et au droit européen de la consommation.",
  },
  it: {
    draftNotice: "ANTEPRIMA CONTRATTO — generata per il tuo ordine. Il piano definitivo diventa vincolante all'approvazione della pratica.",
    parties: "1. Parti contraenti",
    creditorLabel: "Venditore / Creditore",
    borrowerLabel: "Acquirente / Debitore",
    subject: "2. Oggetto & riserva di proprietà",
    subjectBody:
      "Il Venditore fornisce i prodotti elencati di seguito all'Acquirente tramite un piano rateale a tasso zero. La proprietà dei beni si trasferisce all'Acquirente al saldo integrale di tutte le quattro rate.",
    financials: "3. Riepilogo economico",
    totalPrice: "Valore complessivo dei beni",
    downPayment: "Acconto iniziale (25%, dovuto all'approvazione)",
    financedAmount: "Importo dilazionato (75% in 3 rate)",
    interest: "Tasso annuo effettivo globale (TAEG)",
    interestValue: "0% — zero interessi e zero spese",
    schedule: "4. Scadenzario dei pagamenti",
    clausesTitle: "5. Condizioni del piano rateale",
    clauses: [
      "L'Acquirente si impegna a versare ciascuna rata entro la relativa scadenza seguendo le istruzioni di pagamento dell'ordine.",
      "Il piano prevede 4 quote uguali del 25%: un acconto del 25% all'approvazione e tre rate successive a cadenza quindicinale nell'arco di due mesi.",
      "In caso di mancato versamento entro la scadenza, il Venditore contatterà l'Acquirente; reiterati inadempimenti possono comportare la decadenza dal beneficio del termine per l'intero saldo residuo.",
      "L'Acquirente dispone del diritto legale UE di recesso di 14 giorni, esteso volontariamente dal Venditore a 30 giorni dalla consegna. Le quote già versate vengono rimborsate entro 7 giorni lavorativi dal ricevimento e dalla verifica del reso, secondo la politica di restituzione.",
      "La merce viene spedita non appena ricevuto l'acconto del 25% e attivato il piano.",
      "I dati personali e i documenti d'identità vengono trattati unicamente per la verifica dell'identità e del merito creditizio ai sensi del GDPR.",
    ],
    law: "6. Legge applicabile — Il presente contratto è disciplinato dalla legge belga e dalla normativa UE a tutela dei consumatori.",
  },
  nl: {
    draftNotice: "VOORBEELD — opgesteld voor uw bestelling. Het definitieve betalingsschema gaat in zodra uw aanvraag is goedgekeurd.",
    parties: "1. Contractpartijen",
    creditorLabel: "Verkoper / Schuldeiser",
    borrowerLabel: "Koper / Kredietnemer",
    subject: "2. Onderwerp & eigendomsvoorbehoud",
    subjectBody:
      "De Verkoper levert de hieronder vermelde goederen aan de Koper op basis van een rentevrij termijnplan. De eigendom van de goederen gaat over op de Koper zodra alle vier de termijnen volledig zijn voldaan.",
    financials: "3. Financieel overzicht",
    totalPrice: "Totaalbedrag van de goederen",
    downPayment: "Eerste betaling / aanbetaling (25%, bij goedkeuring)",
    financedAmount: "Resterend bedrag (75% over 3 termijnen)",
    interest: "Jaarlijks kostenpercentage (JKP)",
    interestValue: "0% — rente- en kosteloos",
    schedule: "4. Betalingsschema",
    clausesTitle: "5. Voorwaarden van het termijnplan",
    clauses: [
      "De Koper verplicht zich elke geplande termijn uiterlijk op de vervaldatum te voldoen volgens de betaalinstructies bij de bestelling.",
      "Het plan bestaat uit 4 gelijke betalingen van 25%: een aanbetaling van 25% bij goedkeuring, gevolgd door drie tweewekelijkse termijnen over twee maanden.",
      "Blijft een betaling op de vervaldatum uit, dan neemt de Verkoper contact op met de Koper; bij herhaald verzuim kan het volledige openstaande bedrag direct opeisbaar worden.",
      "De Koper heeft een wettelijke EU-bedenktijd van 14 dagen, die door de Verkoper vrijwillig wordt verruimd naar 30 dagen na levering. Reeds betaalde bedragen worden binnen 7 werkdagen na ontvangst en controle van de retourzending terugbetaald conform het retourbeleid.",
      "De bestelling wordt verzonden zodra de aanbetaling van 25% is ontvangen en het termijnplan actief is.",
      "Persoonsgegevens en identiteitsdocumenten worden uitsluitend verwerkt voor identiteitscontrole en kredietbeoordeling conform de AVG.",
    ],
    law: "6. Toepasselijk recht — Op deze overeenkomst is het Belgisch recht en het toepasselijke EU-consumentenrecht van toepassing.",
  },
  es: {
    draftNotice: "VISTA PREVIA — generada para tu pedido. El calendario definitivo entra en vigor al aprobarse la solicitud de fraccionamiento.",
    parties: "1. Partes contratantes",
    creditorLabel: "Vendedor / Acreedor",
    borrowerLabel: "Comprador / Prestatario",
    subject: "2. Objeto y reserva de dominio",
    subjectBody:
      "El Vendedor suministra los artículos detallados a continuación al Comprador mediante un plan de pago sin intereses. La propiedad de los bienes se transfiere al Comprador una vez abonadas íntegramente las cuatro cuotas.",
    financials: "3. Desglose económico",
    totalPrice: "Importe total de los bienes",
    downPayment: "Pago inicial (25 %, exigible tras la aprobación)",
    financedAmount: "Saldo aplazado (75 % en 3 cuotas)",
    interest: "Tasa anual equivalente (TAE)",
    interestValue: "0 % — sin intereses ni comisiones",
    schedule: "4. Calendario de vencimientos",
    clausesTitle: "5. Condiciones del fraccionamiento",
    clauses: [
      "El Comprador se compromete a abonar cada cuota en o antes de su fecha de vencimiento siguiendo las instrucciones de pago del pedido.",
      "El plan consta de 4 pagos iguales del 25 %: un pago inicial del 25 % al aprobarse la solicitud y tres cuotas quincenales posteriores a lo largo de dos meses.",
      "Si una cuota no se abona en plazo, el Vendedor contactará con el Comprador; el impago reiterado podrá hacer exigible de inmediato la totalidad del saldo pendiente.",
      "El Comprador dispone del derecho legal europeo de desistimiento de 14 días, ampliado voluntariamente por el Vendedor a 30 días desde la entrega. Los importes abonados se reembolsan en un plazo de 7 días laborables tras recibir y revisar la devolución, conforme a la política de devoluciones.",
      "Los artículos se envían una vez recibido el pago inicial del 25 % y activado el plan.",
      "Los datos personales y documentos identificativos se tratan exclusivamente para verificar la identidad y evaluar la solvencia conforme al RGPD.",
    ],
    law: "6. Legislación aplicable — Este contrato se rige por las leyes de Bélgica y la normativa europea de protección al consumidor.",
  },
}

function formatDate(iso: string, locale: Locale): string {
  try {
    return new Date(iso).toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" })
  } catch {
    return iso
  }
}

export function InstallmentContract({
  locale,
  totalCents,
  downPaymentCents,
  remainingCents,
  schedule,
  borrower,
  goods,
}: {
  locale: Locale
  totalCents: number
  downPaymentCents: number
  remainingCents: number
  schedule: ScheduleEntry[]
  borrower?: { name?: string; address?: string; email?: string; vatNumber?: string }
  goods: { name: string; quantity: number }[]
}) {
  const c = CLAUSES[locale] ?? CLAUSES.en
  const title = "Installment Sales Agreement"

  return (
    <div className="rounded-lg border border-border bg-card text-card-foreground">
      <div className="border-b border-border bg-muted/40 px-5 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-primary">{c.draftNotice}</p>
      </div>
      <div className="space-y-5 px-5 py-5 text-sm leading-relaxed">
        <h3 className="font-sans text-lg font-semibold">{title}</h3>

        <section>
          <h4 className="mb-1 font-semibold">{c.parties}</h4>
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">{c.creditorLabel}:</span> {CREDITOR.name}, {CREDITOR.address} ·{" "}
            {CREDITOR.registration} · VAT {CREDITOR.vat}
          </p>
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">{c.borrowerLabel}:</span>{" "}
            {borrower?.name || "—"}
            {borrower?.address ? `, ${borrower.address}` : ""}
            {borrower?.email ? ` · ${borrower.email}` : ""}
            {borrower?.vatNumber ? ` · VAT ${borrower.vatNumber}` : ""}
          </p>
        </section>

        <section>
          <h4 className="mb-1 font-semibold">{c.subject}</h4>
          <p className="text-muted-foreground">{c.subjectBody}</p>
          <ul className="mt-2 list-inside list-disc text-muted-foreground">
            {goods.map((g, i) => (
              <li key={i}>
                {g.quantity} × {g.name}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h4 className="mb-2 font-semibold">{c.financials}</h4>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1">
            <dt className="text-muted-foreground">{c.totalPrice}</dt>
            <dd className="text-right font-medium">{formatPrice(totalCents, locale)}</dd>
            <dt className="text-muted-foreground">{c.downPayment}</dt>
            <dd className="text-right font-medium">{formatPrice(downPaymentCents, locale)}</dd>
            <dt className="text-muted-foreground">{c.financedAmount}</dt>
            <dd className="text-right font-medium">{formatPrice(remainingCents, locale)}</dd>
            <dt className="text-muted-foreground">{c.interest}</dt>
            <dd className="text-right font-medium">{c.interestValue}</dd>
          </dl>
        </section>

        <section>
          <h4 className="mb-2 font-semibold">{c.schedule}</h4>
          <ol className="space-y-1">
            {schedule.map((s) => (
              <li key={s.index} className="flex items-center justify-between border-b border-border/60 py-1">
                <span className="text-muted-foreground">
                  {s.index + 1}. {s.label === "down_payment" ? c.downPayment : formatDate(s.dueDate, locale)}
                </span>
                <span className="font-medium">{formatPrice(s.amountCents, locale)}</span>
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h4 className="mb-2 font-semibold">{c.clausesTitle}</h4>
          <ol className="list-inside list-decimal space-y-1 text-muted-foreground">
            {c.clauses.map((clause, i) => (
              <li key={i}>{clause}</li>
            ))}
          </ol>
        </section>

        <p className="text-muted-foreground">{c.law}</p>
      </div>
    </div>
  )
}
