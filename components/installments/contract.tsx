import type { Locale } from "@/lib/i18n/config"
import { formatPrice } from "@/lib/format"
import type { ScheduleEntry } from "@/lib/db/schema"

/**
 * Installment Sales Agreement. Interpolates the concrete order figures for
 * each customer's plan.
 */

export const CREDITOR = {
  name: "Ln-Squared",
  address: "Rue du Chénia 17, 7170 Manage, Hainaut, Belgium",
  registration: "Company No. 0564.743.304 · Safe No. BE02758815",
  vat: "BE0564743304",
  email: "info@3djools.com",
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
    draftNotice: "DRAFT — for review. Final terms subject to legal review and approval before the order is binding.",
    parties: "1. Parties",
    creditorLabel: "Seller / Creditor",
    borrowerLabel: "Buyer / Borrower",
    subject: "2. Subject of the agreement",
    subjectBody:
      "The Seller sells the goods listed below to the Buyer under an interest-free installment plan. Title to the goods passes to the Buyer once all installments are paid in full.",
    financials: "3. Financial terms",
    totalPrice: "Total price of goods",
    downPayment: "Down payment (25%, due on approval)",
    financedAmount: "Amount financed (remaining 75%)",
    interest: "Interest rate (APR)",
    interestValue: "0% — interest-free",
    schedule: "4. Payment schedule",
    clausesTitle: "5. Terms & conditions",
    clauses: [
      "The Buyer authorizes the Seller to charge each scheduled installment to the payment method provided on its due date.",
      "The plan consists of 4 equal payments: a 25% down payment due on approval, then three further payments every two weeks.",
      "If a scheduled payment fails, the Seller will retry and may contact the Buyer; repeated failure may result in the full remaining balance becoming due.",
      "The Buyer has a statutory right of withdrawal of 14 days in accordance with EU consumer law; amounts paid are refunded per the return policy.",
      "The goods are shipped after the down payment is received and the plan is active.",
      "Personal data and identity documents are processed solely for identity verification and credit assessment in accordance with the GDPR and the Privacy Policy.",
    ],
    law: "6. Governing law — This agreement is governed by the laws of Belgium and applicable EU consumer-protection law.",
  },
  de: {
    draftNotice: "ENTWURF — zur Prüfung. Endgültige Bedingungen vorbehaltlich rechtlicher Prüfung und Genehmigung, bevor die Bestellung verbindlich ist.",
    parties: "1. Vertragsparteien",
    creditorLabel: "Verkäufer / Kreditgeber",
    borrowerLabel: "Käufer / Kreditnehmer",
    subject: "2. Vertragsgegenstand",
    subjectBody:
      "Der Verkäufer verkauft die unten aufgeführten Waren an den Käufer im Rahmen eines zinsfreien Ratenplans. Das Eigentum geht nach vollständiger Zahlung aller Raten auf den Käufer über.",
    financials: "3. Finanzielle Bedingungen",
    totalPrice: "Gesamtpreis der Ware",
    downPayment: "Anzahlung (25%, fällig bei Genehmigung)",
    financedAmount: "Finanzierter Betrag (restliche 75%)",
    interest: "Effektiver Jahreszins",
    interestValue: "0% — zinsfrei",
    schedule: "4. Zahlungsplan",
    clausesTitle: "5. Allgemeine Geschäftsbedingungen",
    clauses: [
      "Der Käufer ermächtigt den Verkäufer, jede fällige Rate am Fälligkeitstag über die angegebene Zahlungsmethode einzuziehen.",
      "Der Plan besteht aus 4 gleichen Zahlungen: 25% Anzahlung bei Genehmigung, dann drei weitere Zahlungen alle zwei Wochen.",
      "Schlägt eine Zahlung fehl, wird der Verkäufer es erneut versuchen und kann den Käufer kontaktieren; wiederholtes Fehlschlagen kann zur Fälligkeit des gesamten Restbetrags führen.",
      "Der Käufer hat ein gesetzliches Widerrufsrecht von 14 Tagen gemäß EU-Verbraucherrecht; gezahlte Beträge werden gemäß Rückgaberichtlinie erstattet.",
      "Die Ware wird versandt, nachdem die Anzahlung eingegangen und der Plan aktiv ist.",
      "Personenbezogene Daten und Ausweisdokumente werden ausschließlich zur Identitäts- und Bonitätsprüfung gemäß DSGVO und Datenschutzerklärung verarbeitet.",
    ],
    law: "6. Anwendbares Recht — Dieser Vertrag unterliegt belgischem Recht und dem geltenden EU-Verbraucherschutzrecht.",
  },
  fr: {
    draftNotice: "PROJET — pour révision. Conditions définitives sous réserve d'examen juridique et d'approbation avant que la commande soit ferme.",
    parties: "1. Parties",
    creditorLabel: "Vendeur / Créancier",
    borrowerLabel: "Acheteur / Emprunteur",
    subject: "2. Objet du contrat",
    subjectBody:
      "Le Vendeur vend les biens listés ci-dessous à l'Acheteur dans le cadre d'un plan de paiement échelonné sans intérêt. La propriété est transférée à l'Acheteur une fois tous les versements payés.",
    financials: "3. Conditions financières",
    totalPrice: "Prix total des biens",
    downPayment: "Acompte (25%, dû à l'approbation)",
    financedAmount: "Montant financé (75% restants)",
    interest: "Taux d'intérêt (TAEG)",
    interestValue: "0% — sans intérêt",
    schedule: "4. Échéancier de paiement",
    clausesTitle: "5. Conditions générales",
    clauses: [
      "L'Acheteur autorise le Vendeur à prélever chaque versement à son échéance sur le moyen de paiement fourni.",
      "Le plan comprend 4 paiements égaux : un acompte de 25% à l'approbation, puis trois paiements toutes les deux semaines.",
      "En cas d'échec d'un paiement, le Vendeur réessaiera et pourra contacter l'Acheteur ; des échecs répétés peuvent rendre exigible le solde total restant.",
      "L'Acheteur dispose d'un droit de rétractation légal de 14 jours conformément au droit européen de la consommation ; les sommes versées sont remboursées selon la politique de retour.",
      "Les biens sont expédiés après réception de l'acompte et activation du plan.",
      "Les données personnelles et pièces d'identité sont traitées uniquement pour la vérification d'identité et l'évaluation de solvabilité conformément au RGPD.",
    ],
    law: "6. Droit applicable — Le présent contrat est régi par le droit belge et le droit européen de la consommation applicable.",
  },
  it: {
    draftNotice: "BOZZA — da revisionare. Condizioni definitive soggette a revisione legale e approvazione prima che l'ordine sia vincolante.",
    parties: "1. Parti",
    creditorLabel: "Venditore / Creditore",
    borrowerLabel: "Acquirente / Debitore",
    subject: "2. Oggetto del contratto",
    subjectBody:
      "Il Venditore vende i beni elencati di seguito all'Acquirente nell'ambito di un piano rateale senza interessi. La proprietà passa all'Acquirente dopo il pagamento di tutte le rate.",
    financials: "3. Condizioni finanziarie",
    totalPrice: "Prezzo totale dei beni",
    downPayment: "Acconto (25%, dovuto all'approvazione)",
    financedAmount: "Importo finanziato (75% rimanente)",
    interest: "Tasso di interesse (TAEG)",
    interestValue: "0% — senza interessi",
    schedule: "4. Piano di pagamento",
    clausesTitle: "5. Termini e condizioni",
    clauses: [
      "L'Acquirente autorizza il Venditore ad addebitare ogni rata alla scadenza sul metodo di pagamento fornito.",
      "Il piano prevede 4 pagamenti uguali: un acconto del 25% all'approvazione, poi tre pagamenti ogni due settimane.",
      "Se un pagamento non va a buon fine, il Venditore riproverà e potrà contattare l'Acquirente; ripetuti fallimenti possono rendere esigibile l'intero saldo residuo.",
      "L'Acquirente ha diritto di recesso legale di 14 giorni secondo il diritto UE dei consumatori; gli importi versati sono rimborsati secondo la politica di reso.",
      "I beni vengono spediti dopo il ricevimento dell'acconto e l'attivazione del piano.",
      "I dati personali e i documenti d'identità sono trattati esclusivamente per la verifica dell'identità e la valutazione del credito ai sensi del GDPR.",
    ],
    law: "6. Legge applicabile — Il presente contratto è regolato dalla legge belga e dal diritto UE applicabile in materia di consumatori.",
  },
  nl: {
    draftNotice: "CONCEPT — ter beoordeling. Definitieve voorwaarden onder voorbehoud van juridische beoordeling en goedkeuring voordat de bestelling bindend is.",
    parties: "1. Partijen",
    creditorLabel: "Verkoper / Kredietgever",
    borrowerLabel: "Koper / Kredietnemer",
    subject: "2. Onderwerp van de overeenkomst",
    subjectBody:
      "De Verkoper verkoopt de onderstaande goederen aan de Koper via een renteloos termijnplan. De eigendom gaat over op de Koper zodra alle termijnen volledig zijn betaald.",
    financials: "3. Financiële voorwaarden",
    totalPrice: "Totaalprijs van de goederen",
    downPayment: "Aanbetaling (25%, verschuldigd bij goedkeuring)",
    financedAmount: "Gefinancierd bedrag (resterende 75%)",
    interest: "Rentepercentage (JKP)",
    interestValue: "0% — renteloos",
    schedule: "4. Betaalschema",
    clausesTitle: "5. Voorwaarden",
    clauses: [
      "De Koper machtigt de Verkoper om elke termijn op de vervaldatum af te schrijven van de opgegeven betaalmethode.",
      "Het plan bestaat uit 4 gelijke betalingen: een aanbetaling van 25% bij goedkeuring, daarna drie betalingen elke twee weken.",
      "Als een betaling mislukt, probeert de Verkoper het opnieuw en kan contact opnemen met de Koper; herhaalde mislukking kan het volledige resterende saldo opeisbaar maken.",
      "De Koper heeft een wettelijk herroepingsrecht van 14 dagen conform EU-consumentenrecht; betaalde bedragen worden terugbetaald volgens het retourbeleid.",
      "De goederen worden verzonden nadat de aanbetaling is ontvangen en het plan actief is.",
      "Persoonsgegevens en identiteitsdocumenten worden uitsluitend verwerkt voor identiteitsverificatie en kredietbeoordeling conform de AVG.",
    ],
    law: "6. Toepasselijk recht — Deze overeenkomst valt onder Belgisch recht en het toepasselijke EU-consumentenrecht.",
  },
  es: {
    draftNotice: "BORRADOR — para revisión. Condiciones finales sujetas a revisión legal y aprobación antes de que el pedido sea vinculante.",
    parties: "1. Partes",
    creditorLabel: "Vendedor / Acreedor",
    borrowerLabel: "Comprador / Prestatario",
    subject: "2. Objeto del contrato",
    subjectBody:
      "El Vendedor vende los bienes indicados a continuación al Comprador mediante un plan a plazos sin intereses. La propiedad se transfiere al Comprador una vez pagados todos los plazos.",
    financials: "3. Condiciones financieras",
    totalPrice: "Precio total de los bienes",
    downPayment: "Pago inicial (25%, a pagar en la aprobación)",
    financedAmount: "Importe financiado (75% restante)",
    interest: "Tipo de interés (TAE)",
    interestValue: "0% — sin intereses",
    schedule: "4. Calendario de pagos",
    clausesTitle: "5. Términos y condiciones",
    clauses: [
      "El Comprador autoriza al Vendedor a cobrar cada plazo en su fecha de vencimiento en el método de pago facilitado.",
      "El plan consta de 4 pagos iguales: un pago inicial del 25% en la aprobación y tres pagos más cada dos semanas.",
      "Si un pago falla, el Vendedor lo reintentará y podrá contactar al Comprador; fallos repetidos pueden hacer exigible el saldo restante completo.",
      "El Comprador tiene derecho legal de desistimiento de 14 días según la normativa de consumo de la UE; los importes pagados se reembolsan según la política de devoluciones.",
      "Los bienes se envían tras recibir el pago inicial y activarse el plan.",
      "Los datos personales y documentos de identidad se tratan únicamente para verificación de identidad y evaluación de crédito conforme al RGPD.",
    ],
    law: "6. Ley aplicable — Este contrato se rige por la ley belga y la normativa de consumo aplicable de la UE.",
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
  borrower?: { name?: string; address?: string; email?: string }
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
