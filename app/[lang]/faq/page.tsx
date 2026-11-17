import Link from "next/link"
import { CARD_CHECKOUT_ENABLED } from "@/lib/payments/cardholder"
import { BANK_TRANSFER_CHECKOUT_ENABLED } from "@/lib/payments/bank-transfer"
import { isLocale, type Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { localizedPath } from "@/lib/i18n/paths"
import { Breadcrumb } from "@/components/breadcrumb"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

type FaqLink = {
  href: "/track-order" | "/payment-methods" | "/contact"
  before: string
  label: string
  after: string
}

type FaqItem = {
  question: string
  answer?: string
  link?: FaqLink
}

type FaqCopy = {
  intro: string
  description: string
  policiesHeading: string
  groups: { heading: string; items: FaqItem[] }[]
}

function answerText(item: FaqItem) {
  if (!item.link) return item.answer ?? ""
  return `${item.link.before}${item.link.label}${item.link.after}`
}

const CARD_OFF_FAQ: Record<Locale, string> = {
  en: "You can pay by SEPA bank transfer or split your purchase into 4 interest-free instalments. Card checkout is temporarily offline. Full information is listed on our ",
  de: "Sie können per SEPA-Banküberweisung bezahlen oder den Kaufbetrag in 4 zinsfreie Raten aufteilen. Die Kartenzahlung ist derzeit vorübergehend deaktiviert. Alle Einzelheiten finden Sie auf unserer Seite ",
  fr: "Vous pouvez régler par virement bancaire SEPA ou étaler votre achat en 4 échéances sans frais. Le paiement par carte est momentanément indisponible. Retrouvez toutes les précisions sur notre ",
  it: "Puoi saldare tramite bonifico bancario SEPA oppure suddividere l'acquisto in 4 rate a tasso zero. Il pagamento con carta è temporaneamente sospeso. Tutti i dettagli sono disponibili nella ",
  es: "Puedes abonar tu pedido mediante transferencia bancaria SEPA o fraccionarlo en 4 cuotas sin intereses. El pago con tarjeta está temporalmente inactivo. Consulta toda la información en nuestra ",
  nl: "U kunt afrekenen via een SEPA-bankoverschrijving of uw aankoop spreiden over 4 rentevrije termijnen. Kaartbetalingen zijn tijdelijk buiten gebruik. Alle informatie vindt u op onze ",
}

const CARD_FAQ: Record<Locale, string> = {
  en: BANK_TRANSFER_CHECKOUT_ENABLED
    ? "We accept Visa and Mastercard, instant bank payments via Open Banking (directly through your banking app or IBAN), SEPA bank transfers, and 4× interest-free instalments. Read the full breakdown on our "
    : "We accept Visa and Mastercard, instant bank payments via Open Banking (directly through your banking app or IBAN), and 4× interest-free instalments. Read the full breakdown on our ",
  de: BANK_TRANSFER_CHECKOUT_ENABLED
    ? "Wir unterstützen Visa und Mastercard, Sofortzahlungen über Open Banking (direkt per Banking-App oder IBAN), SEPA-Banküberweisungen sowie die 4× zinsfreie Ratenzahlung. Eine Übersicht finden Sie auf unserer Seite "
    : "Wir unterstützen Visa und Mastercard, Sofortzahlungen über Open Banking (direkt per Banking-App oder IBAN) sowie die 4× zinsfreie Ratenzahlung. Eine Übersicht finden Sie auf unserer Seite ",
  fr: BANK_TRANSFER_CHECKOUT_ENABLED
    ? "Nous prenons en charge Visa et Mastercard, le paiement bancaire instantané via Open Banking (depuis votre application bancaire ou par IBAN), le virement SEPA ainsi que le règlement en 4× sans intérêt. Consultez le récapitulatif sur notre "
    : "Nous prenons en charge Visa et Mastercard, le paiement bancaire instantané via Open Banking (depuis votre application bancaire ou par IBAN) ainsi que le règlement en 4× sans intérêt. Consultez le récapitulatif sur notre ",
  it: BANK_TRANSFER_CHECKOUT_ENABLED
    ? "Accettiamo circuiti Visa e Mastercard, pagamento bancario istantaneo tramite Open Banking (direttamente da app bancaria o IBAN), bonifico SEPA e dilazione in 4 rate senza interessi. Scopri tutti i dettagli nella "
    : "Accettiamo circuiti Visa e Mastercard, pagamento bancario istantaneo tramite Open Banking (direttamente da app bancaria o IBAN) e dilazione in 4 rate senza interessi. Scopri tutti i dettagli nella ",
  es: BANK_TRANSFER_CHECKOUT_ENABLED
    ? "Admitimos tarjetas Visa y Mastercard, pago bancario instantáneo mediante Open Banking (desde tu app bancaria o con IBAN), transferencia SEPA y financiación en 4 plazos sin intereses. Revisa el detalle completo en nuestra "
    : "Admitimos tarjetas Visa y Mastercard, pago bancario instantáneo mediante Open Banking (desde tu app bancaria o con IBAN) y financiación en 4 plazos sin intereses. Revisa el detalle completo en nuestra ",
  nl: BANK_TRANSFER_CHECKOUT_ENABLED
    ? "Wij accepteren Visa en Mastercard, directe bankbetalingen via Open Banking (via uw bank-app of IBAN), SEPA-overschrijvingen en gespreide betaling in 4 rentevrije termijnen. Bekijk het volledige overzicht op onze "
    : "Wij accepteren Visa en Mastercard, directe bankbetalingen via Open Banking (via uw bank-app of IBAN) en gespreide betaling in 4 rentevrije termijnen. Bekijk het volledige overzicht op onze ",
}

function withoutCard(locale: Locale, copy: FaqCopy): FaqCopy {
  const replacement = CARD_CHECKOUT_ENABLED ? CARD_FAQ[locale] : CARD_OFF_FAQ[locale]
  return {
    ...copy,
    groups: copy.groups.map((group) => ({
      ...group,
      items: group.items.map((item) =>
        item.link?.href === "/payment-methods"
          ? { ...item, link: { ...item.link, before: replacement } }
          : item,
      ),
    })),
  }
}

const COPY: Record<Locale, FaqCopy> = {
  en: {
    intro: "Quick, clear answers covering payment options, European parcel delivery, our 30-day return window, warranty coverage, and customer care.",
    description: "Frequently asked questions about payments, delivery times, 30-day returns, EU warranty, and support at 3DEureka.",
    policiesHeading: "Store policies & legal documents",
    groups: [
      {
        heading: "Payment options & pricing",
        items: [
          {
            question: "Which ways to pay are available at checkout?",
            link: {
              href: "/payment-methods",
              before:
                "We accept Visa and Mastercard, instant bank payments via Open Banking (directly through your banking app or IBAN), SEPA bank transfers, and 4× interest-free instalments. Read the full breakdown on our ",
              label: "payment methods page",
              after: ".",
            },
          },
          {
            question: "Do listed prices already include VAT?",
            answer:
              "Yes. Every price displayed across our catalogue is denominated in euro (EUR) and already includes applicable statutory VAT.",
          },
          {
            question: "How does the 4× interest-free instalment plan work?",
            answer:
              "Orders worth €1,000 or above can be divided into four equal 25% payments spread over two months (an initial 25% payment upon approval followed by three fortnightly instalments) at 0% APR and with zero extra charges.",
          },
        ],
      },
      {
        heading: "Returns, refunds & warranty",
        items: [
          {
            question: "How does your 30-day return and refund policy work?",
            answer:
              "Under EU consumer law you are entitled to a 14-day cooling-off period without stating a reason, which we voluntarily extend to a full 30 days from the date of delivery. Both defective and non-defective items qualify, provided they are unused and sent back in their original condition and factory packaging. Direct product exchanges are not offered. Once your parcel reaches us and passes inspection, your refund is credited back to the original payment method within 7 working days.",
          },
          {
            question: "Are return labels free, and what if a parcel arrives damaged?",
            answer:
              "Yes — we cover return postage on all approved returns (both faulty and non-faulty goods), supply a printable prepaid return label, and never charge restocking fees. Should your shipment arrive with transit damage or a defect, please notify us with photos within 48 hours of receipt so we can arrange a free replacement or return right away.",
          },
          {
            question: "What warranty protection comes with my hardware?",
            answer:
              "All equipment purchased from 3DEureka is protected by the mandatory 2-year EU statutory warranty against manufacturing defects, alongside any additional commercial warranty offered by the brand. Our support specialists assist you with troubleshooting, repairs, or replacements.",
          },
        ],
      },
      {
        heading: "Delivery & order tracking",
        items: [
          {
            question: "How can I follow the status of my shipment?",
            link: {
              href: "/track-order",
              before:
                "As soon as your parcel leaves our warehouse, we email you a tracking code. You can also monitor every stage from payment confirmation to doorstep delivery on our ",
              label: "order tracking page",
              after: ".",
            },
          },
          {
            question: "Where do you deliver and which couriers handle the parcels?",
            answer:
              "We ship across Belgium, all other European Union member states, and selected nearby countries (United Kingdom, Switzerland, and Norway). Deliveries are carried out by our dedicated fleet, 3DEureka Courier, or handed over to DHL or DPD on routes outside our direct network — always free of charge.",
          },
          {
            question: "What are the shipping costs and total delivery times?",
            answer:
              "Delivery is 100% free on every order with no minimum basket value. Warehouse preparation takes 0–2 business days (orders placed before 15:00 CET Monday–Friday enter preparation the same day) and courier transit takes 3–5 business days, resulting in an overall delivery window of 3–7 business days.",
          },
          {
            question: "When does your team process orders and messages?",
            answer:
              "Our operations and customer care teams work Monday through Friday from 9:00 to 18:00 CET, excluding official Belgian public holidays. Enquiries and orders submitted outside those hours are picked up on the next working day.",
          },
        ],
      },
      {
        heading: "Hardware & customer care",
        items: [
          {
            question: "How do I get in touch with customer support?",
            link: {
              href: "/contact",
              before: "Send us a message through our ",
              label: "contact form",
              after: " or start a live chat session — our specialists respond within 48 hours on business days (Mon–Fri, 9:00–18:00 CET).",
            },
          },
          {
            question: "Are the 3D printers delivered pre-assembled?",
            answer:
              "That depends on the specific machine: most Bambu Lab and Prusa units arrive ready to print out of the box, whereas certain DIY or kit models need minor assembly. You can check the exact box contents and setup format on each product page.",
          },
        ],
      },
    ],
  },
  de: {
    intro: "Klare Antworten auf die wichtigsten Fragen rund um Zahlungsmethoden, kostenlose EU-Lieferung, unser 30-tägiges Rückgaberecht, Gewährleistung und Kundenservice.",
    description: "Häufig gestellte Fragen zu Zahlung, Lieferzeiten, 30 Tagen Rückgabe, EU-Gewährleistung und Support bei 3DEureka.",
    policiesHeading: "Richtlinien & Rechtliches",
    groups: [
      {
        heading: "Zahlungsarten & Preise",
        items: [
          {
            question: "Welche Zahlungsmethoden stehen im Checkout zur Verfügung?",
            link: {
              href: "/payment-methods",
              before:
                "Wir unterstützen Visa und Mastercard, Sofortzahlungen über Open Banking (direkt per Banking-App oder IBAN), SEPA-Banküberweisungen sowie die 4× zinsfreie Ratenzahlung. Eine Übersicht finden Sie auf unserer Seite ",
              label: "Zahlungsarten",
              after: ".",
            },
          },
          {
            question: "Verstehen sich die angezeigten Preise inklusive Mehrwertsteuer?",
            answer:
              "Ja. Sämtliche Preise im Shop sind in Euro (EUR) ausgewiesen und enthalten bereits die gesetzlich vorgeschriebene Mehrwertsteuer, sofern anwendbar.",
          },
          {
            question: "Wie läuft die zinsfreie 4×-Ratenzahlung ab?",
            answer:
              "Ab einem Warenkorbwert von 1.000 € lässt sich der Gesamtbetrag in vier gleich hohe Raten zu je 25 % über zwei Monate aufteilen (25 % Anzahlung bei Freigabe und drei weitere Raten im Zwei-Wochen-Takt) — bei 0 % Zinsen und ohne Zusatzgebühren.",
          },
        ],
      },
      {
        heading: "Rückgabe, Erstattung & Gewährleistung",
        items: [
          {
            question: "Welche Regeln gelten für die 30-tägige Rückgabe und Rückerstattung?",
            answer:
              "Über das gesetzliche 14-tägige EU-Widerrufsrecht hinaus gewähren wir Ihnen freiwillig 30 Tage ab Warenerhalt für die Rückgabe ohne Angabe von Gründen. Sowohl defekte als auch einwandfreie Artikel können zurückgegeben werden, sofern sie unbenutzt, im Originalzustand und in der Originalverpackung sind. Ein direkter Warenumtausch wird nicht angeboten. Nach Eingang und Prüfung der Retoure erstatten wir den Kaufbetrag innerhalb von 7 Werktagen auf Ihr ursprüngliches Zahlungsmittel.",
          },
          {
            question: "Ist der Rückversand kostenlos und was gilt bei Transportschäden?",
            answer:
              "Ja — bei allen genehmigten Rücksendungen (egal ob mangelfrei oder defekt) übernehmen wir die Rücksendekosten, stellen ein druckfertiges Rücksendeetikett bereit und berechnen keinerlei Wiedereinlagerungsgebühren. Falls ein Paket beschädigt oder fehlerhaft bei Ihnen eintrifft, senden Sie uns bitte innerhalb von 48 Stunden Fotos, damit wir kostenfrei Ersatz oder eine Rückholung veranlassen.",
          },
          {
            question: "Welche Garantie oder Gewährleistung habe ich auf Geräte?",
            answer:
              "Alle bei uns gekauften Geräte unterliegen der gesetzlichen zweijährigen EU-Gewährleistung bei Mängeln sowie etwaigen zusätzlichen Herstellergarantien. Unser Support-Team begleitet Sie bei Diagnose, Reparatur oder Austausch.",
          },
        ],
      },
      {
        heading: "Versand & Sendungsverfolgung",
        items: [
          {
            question: "Wie kann ich den Lieferstatus meiner Bestellung einsehen?",
            link: {
              href: "/track-order",
              before:
                "Direkt nach dem Versand senden wir Ihnen die Sendungsnummer per E-Mail zu. Zusätzlich lässt sich jeder Schritt vom Zahlungseingang bis zur Zustellung über unsere ",
              label: "Sendungsverfolgung",
              after: " abrufen.",
            },
          },
          {
            question: "In welche Länder versenden Sie und mit welchen Paketdiensten?",
            answer:
              "Wir beliefern Belgien, alle weiteren Mitgliedstaaten der Europäischen Union sowie ausgewählte Nachbarstaaten (Schweiz, Norwegen, Vereinigtes Königreich). Die Zustellung erfolgt durch unseren eigenen Dienst 3DEureka Courier oder — falls die Route außerhalb unseres Direktnetzes liegt — über DHL bzw. DPD, jeweils komplett versandkostenfrei.",
          },
          {
            question: "Wie hoch sind die Versandkosten und wie lange dauert die Zustellung?",
            answer:
              "Der Standardversand ist bei jeder Bestellung kostenlos, unabhängig vom Bestellwert. Die Lagerabfertigung benötigt 0–2 Werktage (Bestellungen werktags bis 15:00 Uhr MEZ starten noch am selben Tag in die Abfertigung), die reine Transportzeit liegt bei 3–5 Werktagen — insgesamt also 3–7 Werktage.",
          },
          {
            question: "Zu welchen Geschäftszeiten arbeitet Ihr Team?",
            answer:
              "Unser Team ist montags bis freitags von 9:00 bis 18:00 Uhr MEZ im Einsatz (ausgenommen gesetzliche Feiertage in Belgien). Außerhalb dieser Zeiten eingehende Bestellungen und Nachrichten bearbeiten wir am darauffolgenden Werktag.",
          },
        ],
      },
      {
        heading: "Geräte & Kundenbetreuung",
        items: [
          {
            question: "Wie nehme ich am besten Kontakt mit dem Support auf?",
            link: {
              href: "/contact",
              before: "Schreiben Sie uns über das ",
              label: "Kontaktformular",
              after: " oder nutzen Sie den Live-Chat — wir melden uns innerhalb von 48 Stunden zu unseren Geschäftszeiten (Mo–Fr, 9:00–18:00 Uhr MEZ).",
            },
          },
          {
            question: "Kommen die 3D-Drucker bereits vormontiert an?",
            answer:
              "Das richtet sich nach dem jeweiligen Modell: Die meisten Systeme von Bambu Lab und Prusa werden betriebsbereit vormontiert ausgeliefert, während einzelne Bausatz-Modelle wenige Montageschritte erfordern. Den genauen Lieferzustand finden Sie auf der jeweiligen Produktseite.",
          },
        ],
      },
    ],
  },
  fr: {
    intro: "Des réponses claires et directes concernant nos moyens de paiement, la livraison gratuite en Europe, notre délai de retour de 30 jours, la garantie légale et l'assistance client.",
    description: "Questions fréquentes sur les paiements, les délais d'expédition, les retours sous 30 jours, la garantie UE et le support chez 3DEureka.",
    policiesHeading: "Politiques de la boutique & documents légaux",
    groups: [
      {
        heading: "Options de paiement & tarification",
        items: [
          {
            question: "Quels sont les modes de règlement proposés lors du paiement ?",
            link: {
              href: "/payment-methods",
              before:
                "Nous prenons en charge Visa et Mastercard, le paiement bancaire instantané via Open Banking (depuis votre application bancaire ou par IBAN), le virement SEPA ainsi que le règlement en 4× sans intérêt. Consultez le récapitulatif sur notre ",
              label: "page des moyens de paiement",
              after: ".",
            },
          },
          {
            question: "Les tarifs affichés comprennent-ils la TVA ?",
            answer:
              "Oui. Tous les prix figurant sur la boutique sont libellés en euros (EUR) et incluent la TVA légale applicable.",
          },
          {
            question: "Comment fonctionne l'échelonnement en 4× sans frais ?",
            answer:
              "Dès 1 000 € d'achat, le total peut être divisé en quatre versements égaux de 25 % répartis sur deux mois (un premier versement de 25 % à la validation, suivi de trois échéances toutes les deux semaines), à 0 % d'intérêt et sans aucuns frais de dossier.",
          },
        ],
      },
      {
        heading: "Retours, remboursements & garantie",
        items: [
          {
            question: "Comment s'applique votre politique de retour sous 30 jours ?",
            answer:
              "Au-delà du délai légal européen de rétractation de 14 jours sans motif, nous portons volontairement votre période de retour à 30 jours après réception. Les produits défectueux comme non défectueux sont éligibles, à condition d'être neufs, dans leur état et leur emballage d'origine. Nous n'effectuons pas d'échanges directs. Une fois le colis réceptionné et contrôlé, le remboursement est crédité sur votre mode de paiement initial sous 7 jours ouvrés.",
          },
          {
            question: "L'étiquette de retour est-elle gratuite, et que faire en cas de colis endommagé ?",
            answer:
              "Oui — les frais de retour sont intégralement pris en charge pour tout retour validé (article défectueux ou non), avec fourniture d'une étiquette prépayée à imprimer et zéro frais de restockage. Si un article arrive abîmé ou défaillant, envoyez-nous des photos dans les 48 heures suivant la livraison afin que nous organisions gratuitement un remplacement ou une reprise.",
          },
          {
            question: "De quelle garantie bénéficient les équipements vendus ?",
            answer:
              "Toutes nos machines bénéficient de la garantie légale européenne de conformité de 2 ans contre les défauts, complétée le cas échéant par la garantie commerciale du fabricant. Notre équipe technique vous accompagne pour toute réparation ou remplacement.",
          },
        ],
      },
      {
        heading: "Expédition & suivi de colis",
        items: [
          {
            question: "Comment suivre l'acheminement de ma commande ?",
            link: {
              href: "/track-order",
              before:
                "Dès le départ de votre colis, un e-mail contenant votre numéro de suivi vous est adressé. Vous pouvez également consulter chaque étape, du paiement jusqu'à la livraison finale, sur notre ",
              label: "page de suivi de commande",
              after: ".",
            },
          },
          {
            question: "Quels pays desservez-vous et avec quels transporteurs ?",
            answer:
              "Nous expédions en Belgique, dans l'ensemble de l'Union européenne ainsi que vers certains pays limitrophes (Royaume-Uni, Suisse et Norvège). L'acheminement est assuré par notre propre flotte 3DEureka Courier, ou confié à DHL ou DPD lorsque l'itinéraire sort de notre réseau direct — toujours gratuitement.",
          },
          {
            question: "Quels sont les délais et les frais de livraison ?",
            answer:
              "La livraison standard est totalement gratuite sur chaque commande, sans minimum d'achat. La préparation logistique demande 0 à 2 jours ouvrables (toute commande passée avant 15:00 CET du lundi au vendredi entre en préparation le jour même) et l'acheminement prend 3 à 5 jours ouvrables, soit 3 à 7 jours ouvrables au total.",
          },
          {
            question: "Quels sont vos horaires de traitement et d'ouverture ?",
            answer:
              "Nos équipes sont mobilisées du lundi au vendredi de 9:00 à 18:00 CET, hors jours fériés belges. Les commandes et demandes reçues en dehors de ces plages horaires sont prises en charge dès le jour ouvrable suivant.",
          },
        ],
      },
      {
        heading: "Matériel & service client",
        items: [
          {
            question: "Comment joindre votre équipe d'assistance ?",
            link: {
              href: "/contact",
              before: "Écrivez-nous via notre ",
              label: "formulaire de contact",
              after: " ou directement par chat en direct — nous répondons sous 48 heures du lundi au vendredi (9:00–18:00 CET).",
            },
          },
          {
            question: "Les imprimantes 3D sont-elles expédiées déjà assemblées ?",
            answer:
              "Cela varie selon la machine : la majorité des imprimantes Bambu Lab et Prusa sont livrées prêtes à l'emploi, tandis que certains modèles en kit demandent un assemblage rapide. Le contenu exact du carton est précisé sur chaque fiche produit.",
          },
        ],
      },
    ],
  },
  it: {
    intro: "Risposte chiare e immediate su opzioni di pagamento, consegna gratuita in Europa, reso esteso a 30 giorni, garanzia legale e assistenza clienti.",
    description: "Domande frequenti su metodi di pagamento, tempi di spedizione, resi entro 30 giorni, garanzia UE e supporto su 3DEureka.",
    policiesHeading: "Condizioni del negozio & documenti legali",
    groups: [
      {
        heading: "Metodi di pagamento & prezzi",
        items: [
          {
            question: "Quali soluzioni di pagamento sono disponibili alla cassa?",
            link: {
              href: "/payment-methods",
              before:
                "Accettiamo circuiti Visa e Mastercard, pagamento bancario istantaneo tramite Open Banking (direttamente da app bancaria o IBAN), bonifico SEPA e dilazione in 4 rate senza interessi. Scopri tutti i dettagli nella ",
              label: "pagina dei metodi di pagamento",
              after: ".",
            },
          },
          {
            question: "I prezzi indicati nel catalogo sono comprensivi di IVA?",
            answer:
              "Sì. Tutti gli importi presenti sul sito sono espressi in euro (EUR) e includono già l'IVA prevista dalla legge, ove applicabile.",
          },
          {
            question: "Come funziona la rateizzazione in 4 quote a tasso zero?",
            answer:
              "Per gli ordini a partire da 1.000 €, l'importo complessivo viene ripartito in quattro pagamenti uguali del 25% nell'arco di due mesi (25% all'approvazione e tre rate successive ogni due settimane), senza interessi (TAEG 0%) e senza costi aggiuntivi.",
          },
        ],
      },
      {
        heading: "Resi, rimborsi & garanzia",
        items: [
          {
            question: "Come funziona il diritto di reso esteso a 30 giorni?",
            answer:
              "Oltre ai 14 giorni di recesso legale previsti dalle norme UE senza obbligo di motivazione, estendiamo volontariamente la finestra di restituzione a 30 giorni dalla consegna. Accettiamo resi sia di articoli non difettosi sia di articoli difettosi, purché nuovi, integri e nella confezione originale. Non effettuiamo cambi merce diretti. Una volta ricevuto e verificato il reso, accreditiamo il rimborso sul metodo di pagamento originario entro 7 giorni lavorativi.",
          },
          {
            question: "La spedizione di rientro è gratuita? Cosa succede se il pacco arriva danneggiato?",
            answer:
              "Sì — per tutti i resi autorizzati (prodotti difettosi o meno) il rientro è gratuito: forniamo un'etichetta prepagata da scaricare e stampare e non applichiamo alcuna commissione di riassortimento. Se un articolo arriva danneggiato o guasto, inviaci delle foto entro 48 ore dalla ricezione per attivare subito la sostituzione o il ritiro gratuito.",
          },
          {
            question: "Quale copertura di garanzia accompagna le macchine?",
            answer:
              "Ogni apparecchio venduto da 3DEureka gode della garanzia legale europea di 2 anni contro i difetti di conformità, a cui si aggiunge l'eventuale garanzia commerciale del produttore. Il nostro servizio tecnico ti assiste per qualsiasi riparazione o sostituzione.",
          },
        ],
      },
      {
        heading: "Spedizioni & tracciamento",
        items: [
          {
            question: "Dove posso controllare lo stato di avanzamento del mio ordine?",
            link: {
              href: "/track-order",
              before:
                "Non appena la spedizione parte dal magazzino ricevi un'e-mail con il codice di tracciamento, e puoi monitorare ogni passaggio dal pagamento alla consegna sulla nostra ",
              label: "pagina di tracciamento ordine",
              after: ".",
            },
          },
          {
            question: "In quali Paesi consegnate e a quali corrieri vi affidate?",
            answer:
              "Consegniamo in Belgio, in tutti gli altri Paesi dell'Unione Europea e in alcune nazioni limitrofe (Svizzera, Norvegia e Regno Unito). Le spedizioni viaggiano con il nostro corriere interno 3DEureka Courier oppure tramite DHL o DPD sulle tratte non coperte direttamente — sempre a costo zero.",
          },
          {
            question: "Quali sono i tempi di consegna complessivi e i costi di spedizione?",
            answer:
              "La spedizione standard è sempre gratuita su ogni ordine, senza soglia minima. La preparazione richiede 0–2 giorni lavorativi (gli ordini ricevuti entro le 15:00 CET dal lunedì al venerdì entrano in lavorazione in giornata) e il trasporto impiega 3–5 giorni lavorativi, per un totale di 3–7 giorni lavorativi.",
          },
          {
            question: "Quali sono i vostri orari operativi?",
            answer:
              "Il nostro team è operativo dal lunedì al venerdì dalle 9:00 alle 18:00 CET, escluse le festività nazionali belghe. Gli ordini e i messaggi inviati fuori orario vengono presi in carico il giorno lavorativo successivo.",
          },
        ],
      },
      {
        heading: "Prodotti & assistenza clienti",
        items: [
          {
            question: "Come posso mettermi in contatto con il supporto?",
            link: {
              href: "/contact",
              before: "Scrivici tramite il ",
              label: "modulo di contatto",
              after: " oppure avvia una conversazione in live chat: rispondiamo entro 48 ore dal lunedì al venerdì (9:00–18:00 CET).",
            },
          },
          {
            question: "Le stampanti 3D vengono consegnate già assemblate?",
            answer:
              "Dipende dal modello scelto: la maggior parte delle unità Bambu Lab e Prusa arriva già assemblata e pronta all'uso, mentre alcuni kit richiedono un montaggio leggero. Nella scheda di ciascun prodotto trovi specificato il contenuto esatto della confezione.",
          },
        ],
      },
    ],
  },
  es: {
    intro: "Respuestas directas sobre formas de pago, envío gratuito en Europa, nuestro plazo de devolución de 30 días, garantía legal y atención al cliente.",
    description: "Preguntas frecuentes sobre pagos, plazos de entrega, devoluciones en 30 días, garantía de la UE y soporte en 3DEureka.",
    policiesHeading: "Políticas de la tienda y textos legales",
    groups: [
      {
        heading: "Formas de pago y precios",
        items: [
          {
            question: "¿Qué opciones de pago puedo utilizar al finalizar la compra?",
            link: {
              href: "/payment-methods",
              before:
                "Admitimos tarjetas Visa y Mastercard, pago bancario instantáneo mediante Open Banking (desde tu app bancaria o con IBAN), transferencia SEPA y financiación en 4 plazos sin intereses. Revisa el detalle completo en nuestra ",
              label: "página de métodos de pago",
              after: ".",
            },
          },
          {
            question: "¿Los precios del catálogo ya llevan el IVA incluido?",
            answer:
              "Sí. Todos los importes se muestran en euros (EUR) e incluyen el IVA legal correspondiente.",
          },
          {
            question: "¿En qué consiste el pago fraccionado en 4 cuotas sin intereses?",
            answer:
              "En compras a partir de 1.000 €, el importe se reparte en cuatro pagos iguales del 25 % durante dos meses (un 25 % inicial al aprobarse la solicitud y tres cuotas quincenales posteriores), con un 0 % TAE y sin comisiones.",
          },
        ],
      },
      {
        heading: "Devoluciones, reembolsos y garantía",
        items: [
          {
            question: "¿Cómo funciona vuestra política de devolución de 30 días?",
            answer:
              "Además del derecho legal europeo de desistimiento de 14 días sin necesidad de justificación, ampliamos voluntariamente el plazo hasta los 30 días desde la recepción del pedido. Admitimos devoluciones tanto de artículos defectuosos como no defectuosos, siempre que estén sin usar y se envíen en su estado y embalaje originales. No realizamos cambios directos. Una vez recibido e inspeccionado el paquete, reembolsamos el importe en tu método de pago original en un máximo de 7 días laborables.",
          },
          {
            question: "¿El envío de devolución tiene algún coste? ¿Qué hago si llega dañado?",
            answer:
              "Las devoluciones autorizadas (tanto por defecto como por desistimiento) tienen envío de retorno gratuito: te facilitamos una etiqueta prepagada lista para descargar e imprimir y no cobramos gastos de reposición. Si tu pedido llega con daños de transporte o averiado, escríbenos adjuntando fotos en las primeras 48 horas tras la entrega para gestionar sin coste un reemplazo o devolución.",
          },
          {
            question: "¿Qué garantía cubre a las máquinas que vendéis?",
            answer:
              "Todos nuestros equipos cuentan con la garantía legal europea de 2 años frente a defectos de conformidad, además de la garantía comercial adicional que ofrezca cada fabricante. Nuestro equipo técnico te ayudará a tramitar cualquier reparación o sustitución.",
          },
        ],
      },
      {
        heading: "Envíos y seguimiento de pedidos",
        items: [
          {
            question: "¿Cómo puedo consultar el estado y seguimiento de mi pedido?",
            link: {
              href: "/track-order",
              before:
                "En cuanto tu paquete sale del almacén te enviamos por correo el código de seguimiento, y puedes consultar cada etapa desde el pago hasta la entrega en nuestra ",
              label: "página de seguimiento de pedidos",
              after: ".",
            },
          },
          {
            question: "¿A qué países realizáis envíos y con qué empresas de transporte?",
            answer:
              "Repartimos en Bélgica, en el resto de la Unión Europea y en varios países vecinos (Suiza, Noruega y Reino Unido). Operamos con nuestra propia red de reparto, 3DEureka Courier, y nos apoyamos en DHL o DPD cuando la ruta queda fuera de nuestra cobertura directa, siempre con envío gratuito.",
          },
          {
            question: "¿Cuánto cuesta el envío y cuántos días tarda en llegar?",
            answer:
              "El envío estándar es totalmente gratuito en todos los pedidos, sin compra mínima. La preparación en almacén toma de 0 a 2 días laborables (los pedidos confirmados antes de las 15:00 CET de lunes a viernes entran en preparación ese mismo día) y el tránsito dura de 3 a 5 días laborables, sumando un total de 3 a 7 días laborables.",
          },
          {
            question: "¿Cuál es vuestro horario de atención al público?",
            answer:
              "Trabajamos de lunes a viernes de 9:00 a 18:00 CET, salvo los festivos oficiales de Bélgica. Las consultas y pedidos recibidos fuera de ese horario se gestionan el siguiente día laborable.",
          },
        ],
      },
      {
        heading: "Equipos y soporte técnico",
        items: [
          {
            question: "¿Cómo puedo comunicarme con el equipo de soporte?",
            link: {
              href: "/contact",
              before: "Escríbenos a través de nuestro ",
              label: "formulario de contacto",
              after: " o abre el chat en directo: respondemos en menos de 48 horas de lunes a viernes (9:00–18:00 CET).",
            },
          },
          {
            question: "¿Las impresoras 3D se entregan ya ensambladas?",
            answer:
              "Depende del modelo: la mayoría de las impresoras Bambu Lab y Prusa vienen completamente montadas de fábrica, mientras que algunos kits requieren un montaje sencillo. En la página de cada producto detallamos qué incluye la caja.",
          },
        ],
      },
    ],
  },
  nl: {
    intro: "Duidelijke antwoorden op veelgestelde vragen over betaalopties, gratis Europese levering, onze retourtermijn van 30 dagen, wettelijke garantie en klantenservice.",
    description: "Veelgestelde vragen over betalingen, levertijden, 30 dagen retourneren, EU-garantie en support bij 3DEureka.",
    policiesHeading: "Winkelbeleid & juridische documenten",
    groups: [
      {
        heading: "Betaalopties & prijzen",
        items: [
          {
            question: "Met welke betaalmethoden kan ik bij het afrekenen betalen?",
            link: {
              href: "/payment-methods",
              before:
                "Wij accepteren Visa en Mastercard, directe bankbetalingen via Open Banking (via uw bank-app of IBAN), SEPA-overschrijvingen en gespreide betaling in 4 rentevrije termijnen. Bekijk het volledige overzicht op onze ",
              label: "pagina met betaalmethoden",
              after: ".",
            },
          },
          {
            question: "Zijn alle vermelde prijzen inclusief btw?",
            answer:
              "Ja. Alle prijzen in onze webshop worden weergegeven in euro (EUR) en zijn inclusief de wettelijk verschuldigde btw.",
          },
          {
            question: "Hoe werkt gespreid betalen in 4 rentevrije termijnen?",
            answer:
              "Bij bestellingen vanaf € 1.000 wordt het totaalbedrag verdeeld over vier gelijke termijnen van 25% binnen twee maanden (25% aanbetaling bij goedkeuring en daarna drie tweewekelijkse termijnen), tegen 0% rente en zonder extra kosten.",
          },
        ],
      },
      {
        heading: "Retourneren, terugbetaling & garantie",
        items: [
          {
            question: "Hoe werkt jullie retourbeleid van 30 dagen?",
            answer:
              "Naast het wettelijke EU-herroepingsrecht van 14 dagen zonder opgave van reden, verruimen wij de retourtermijn vrijwillig naar 30 dagen na ontvangst. Zowel defecte als niet-defecte artikelen komen in aanmerking, mits ze ongebruikt zijn en in de originele staat en fabrieksverpakking worden teruggestuurd. Direct omruilen is niet mogelijk. Na ontvangst en controle van de retourzending storten wij het bedrag binnen 7 werkdagen terug via uw oorspronkelijke betaalmethode.",
          },
          {
            question: "Is retourverzending gratis en wat als mijn pakket beschadigd aankomt?",
            answer:
              "Ja — voor alle goedgekeurde retouren (zowel defecte als niet-defecte producten) is de retourzending kosteloos: u ontvangt een downloadbaar retourlabel en wij rekenen geen herbevoorradingskosten. Komt een zending beschadigd of defect aan, stuur ons dan binnen 48 uur na levering foto's zodat wij direct een gratis vervanging of retourzending regelen.",
          },
          {
            question: "Welke garantie zit er op de geleverde machines?",
            answer:
              "Op elk apparaat dat wij leveren rust de wettelijke Europese consumentengarantie van 2 jaar tegen gebreken, aangevuld met eventuele fabrieksgarantie van het merk. Ons supportteam helpt u bij het regelen van reparatie of vervanging.",
          },
        ],
      },
      {
        heading: "Levering & pakket volgen",
        items: [
          {
            question: "Hoe kan ik de status van mijn bestelling volgen?",
            link: {
              href: "/track-order",
              before:
                "Zodra uw pakket ons magazijn verlaat, ontvangt u per e-mail een trackingcode. Daarnaast volgt u elke stap van betaling tot bezorging op onze ",
              label: "pagina voor het volgen van bestellingen",
              after: ".",
            },
          },
          {
            question: "Naar welke landen leveren jullie en met welke vervoerders?",
            answer:
              "Wij bezorgen in België, de overige lidstaten van de Europese Unie en enkele omliggende landen (Verenigd Koninkrijk, Zwitserland en Noorwegen). Het vervoer gebeurt met onze eigen koeriersdienst 3DEureka Courier, of via DHL en DPD wanneer een route buiten ons eigen netwerk valt — altijd volledig gratis.",
          },
          {
            question: "Wat zijn de verzendkosten en de totale levertijd?",
            answer:
              "Standaardverzending is bij elke bestelling gratis, zonder minimumbestelbedrag. De magazijnverwerking duurt 0–2 werkdagen (bestellingen op werkdagen vóór 15:00 CET gaan dezelfde dag nog in verwerking) en het transport duurt 3–5 werkdagen, wat neerkomt op een totale levertijd van 3–7 werkdagen.",
          },
          {
            question: "Wat zijn jullie bereikbaarheids- en verwerkingstijden?",
            answer:
              "Ons team werkt van maandag tot en met vrijdag van 9:00 tot 18:00 CET, met uitzondering van officiële Belgische feestdagen. Bestellingen en berichten buiten deze uren worden op de eerstvolgende werkdag opgepakt.",
          },
        ],
      },
      {
        heading: "Apparatuur & klantenservice",
        items: [
          {
            question: "Hoe neem ik contact op met de klantenservice?",
            link: {
              href: "/contact",
              before: "Stuur ons een bericht via het ",
              label: "contactformulier",
              after: " of open de livechat — wij reageren binnen 48 uur op werkdagen (ma–vr, 9:00–18:00 CET).",
            },
          },
          {
            question: "Worden de 3D-printers kant-en-klaar gemonteerd geleverd?",
            answer:
              "Dat verschilt per toestel: de meeste printers van Bambu Lab en Prusa worden volledig voorgemonteerd geleverd, terwijl bepaalde bouwpakketten een lichte eindmontage vragen. Op iedere productpagina staat precies vermeld wat er in de doos zit.",
          },
        ],
      },
    ],
  },
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : "en"
  const dict = await getDictionary(locale)
  return {
    title: dict.footer.faq,
    description: withoutCard(locale, COPY[locale]).description,
  }
}

export default async function FaqPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : "en"
  const dict = await getDictionary(locale)
  const copy = withoutCard(locale, COPY[locale])

  const policyButtons = [
    { label: dict.footer.privacy, href: "/privacy" },
    { label: dict.footer.cookies, href: "/cookie-policy" },
    { label: dict.footer.terms, href: "/terms" },
    { label: dict.footer.instalmentAgreement, href: "/instalment-agreement" },
    { label: dict.footer.returns, href: "/returns" },
    { label: dict.footer.shipping, href: "/shipping" },
    { label: dict.footer.paymentMethods, href: "/payment-methods" },
    { label: dict.footer.impressum, href: "/impressum" },
  ]

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: copy.groups.flatMap((group) =>
      group.items.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: answerText(item) },
      })),
    ),
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumb locale={locale} items={[{ label: dict.common.home, href: "/" }, { label: dict.footer.faq }]} />
      <h1 className="mt-4 text-balance font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {dict.footer.faq}
      </h1>
      <p className="mt-2 max-w-2xl text-pretty text-muted-foreground">{copy.intro}</p>

      <div className="mt-8 space-y-8">
        {copy.groups.map((group) => (
          <section key={group.heading}>
            <h2 className="font-heading text-lg font-bold text-foreground">{group.heading}</h2>
            <Accordion className="mt-2">
              {group.items.map((item, i) => (
                <AccordionItem key={item.question} value={`${group.heading}-${i}`}>
                  <AccordionTrigger className="text-foreground">{item.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    <p>
                      {item.link ? (
                        <>
                          {item.link.before}
                          <Link
                            href={localizedPath(locale, item.link.href)}
                            className="underline underline-offset-2 hover:text-foreground"
                          >
                            {item.link.label}
                          </Link>
                          {item.link.after}
                        </>
                      ) : (
                        item.answer
                      )}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        ))}
      </div>

      <section className="mt-10 rounded-lg border border-border bg-card p-5">
        <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-foreground">
          {copy.policiesHeading}
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {policyButtons.map((btn) => (
            <Link
              key={btn.href}
              href={localizedPath(locale, btn.href)}
              className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary sm:text-sm"
            >
              {btn.label}
            </Link>
          ))}
        </div>
      </section>

      <p className="mt-8 border-t border-border pt-6 text-sm text-muted-foreground">
        {dict.legal.contactPrompt}{" "}
        <Link href={localizedPath(locale, "/contact")} className="underline underline-offset-2 hover:text-foreground">
          {dict.legal.contactLink}
        </Link>
      </p>
    </div>
  )
}
