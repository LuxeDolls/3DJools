import Link from "next/link"
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
  groups: { heading: string; items: FaqItem[] }[]
}

function answerText(item: FaqItem) {
  if (!item.link) return item.answer ?? ""
  return `${item.link.before}${item.link.label}${item.link.after}`
}

const COPY: Record<Locale, FaqCopy> = {
  en: {
    intro: "Answers to the questions we get asked most about orders, shipping, returns and payments.",
    description: "Answers to common questions about orders, shipping, returns, warranty and payments at 3DJools.",
    groups: [
      {
        heading: "Orders & shipping",
        items: [
          {
            question: "How long does delivery take, and how much does it cost?",
            answer:
              "Standard shipping takes 3–6 business days in total and is completely free on every order, to every destination we deliver to — no minimum spend required. Handling takes 0–1 business day and transit takes 3–5 business days. Orders placed by 15:00 CET Monday to Friday enter the handling window that day.",
          },
          {
            question: "What are your business hours?",
            answer:
              "Our team is available Monday to Friday, 9:00–18:00 CET, excluding Belgian public holidays. Orders and messages received outside these hours are handled on the next business day.",
          },
          {
            question: "Which countries do you ship to?",
            answer:
              "We ship to Belgium and to the rest of the European Union plus a few neighbouring countries (Switzerland, Norway, United Kingdom), and to Qatar, with trusted carriers (DPD, GLS, DHL and UPS). Shipping is free to every one of these destinations.",
          },
          {
            question: "Can I track my order?",
            link: {
              href: "/track-order",
              before:
                "Yes. You'll receive an email with a tracking number once your order ships, and you can follow every order from payment to delivery on our ",
              label: "order tracking page",
              after: ".",
            },
          },
        ],
      },
      {
        heading: "Returns & warranty",
        items: [
          {
            question: "What is your return policy?",
            answer:
              "As a consumer in the EU you can withdraw within 14 days of receiving the goods, without giving a reason. We accept returns of both non-defective and defective products. Items must be new and returned in their original condition and packaging. Exchanges are not accepted. Once we receive and inspect the return, we refund your original payment method within 14 days.",
          },
          {
            question: "Who pays for return shipping?",
            answer:
              "Return shipping is free for accepted returns, including non-defective and defective products. We provide a return label to download and print, and there is no restocking fee. If an item arrives damaged or faulty, contact us within 48 hours with photos and we will arrange a free replacement or return.",
          },
          {
            question: "Do you offer a warranty?",
            answer:
              "Every machine we sell is covered by the EU statutory 2-year consumer guarantee against defects. Many manufacturers also provide their own additional warranty. Our support team helps arrange any repair or replacement.",
          },
        ],
      },
      {
        heading: "Payments",
        items: [
          {
            question: "What payment methods do you accept?",
            link: {
              href: "/payment-methods",
              before:
                "SEPA bank transfer, cryptocurrency and interest-free instalments. Card payment is temporarily unavailable. Details are on our ",
              label: "payment methods page",
              after: ".",
            },
          },
          {
            question: "How do interest-free instalments work?",
            answer: "For orders of €1,000 or more, the order is split into four equal payments over two months, with no interest and no fees.",
          },
          {
            question: "Are prices shown with VAT?",
            answer: "Yes. All prices are shown in euro (EUR) and include statutory VAT where applicable.",
          },
        ],
      },
      {
        heading: "Products & support",
        items: [
          {
            question: "Do your printers come fully assembled?",
            answer:
              "It depends on the model — most Bambu Lab and Prusa machines ship fully assembled, while some kits require light assembly. Each product page states exactly what's included.",
          },
          {
            question: "How can I contact support?",
            link: {
              href: "/contact",
              before: "Use our ",
              label: "contact form",
              after: " or live chat — we reply within 48 hours, Monday to Friday, 9:00–18:00 CET.",
            },
          },
        ],
      },
    ],
  },
  de: {
    intro: "Antworten auf die Fragen, die uns zu Bestellungen, Versand, Rückgabe und Zahlung am häufigsten gestellt werden.",
    description: "Antworten auf häufige Fragen zu Bestellungen, Versand, Rückgabe, Garantie und Zahlung bei 3DJools.",
    groups: [
      {
        heading: "Bestellungen und Versand",
        items: [
          {
            question: "Wie lange dauert die Lieferung und was kostet sie?",
            answer:
              "Der Standardversand dauert insgesamt 3–6 Werktage und ist bei jeder Bestellung und in jedes Lieferland vollständig kostenlos — ohne Mindestbestellwert. Die Bearbeitung dauert 0–1 Werktag, der Transport 3–5 Werktage. Bestellungen, die montags bis freitags bis 15:00 Uhr MEZ eingehen, werden noch am selben Tag bearbeitet.",
          },
          {
            question: "Wann sind Sie erreichbar?",
            answer:
              "Unser Team ist montags bis freitags von 9:00 bis 18:00 Uhr MEZ erreichbar, ausgenommen belgische Feiertage. Bestellungen und Nachrichten außerhalb dieser Zeiten bearbeiten wir am nächsten Werktag.",
          },
          {
            question: "In welche Länder liefern Sie?",
            answer:
              "Wir liefern nach Belgien und in die übrige Europäische Union sowie in einige Nachbarländer (Schweiz, Norwegen, Vereinigtes Königreich) und nach Katar mit zuverlässigen Versanddienstleistern (DPD, GLS, DHL und UPS). Der Versand ist in jedes dieser Länder kostenlos.",
          },
          {
            question: "Kann ich meine Bestellung verfolgen?",
            link: {
              href: "/track-order",
              before:
                "Ja. Sobald Ihre Bestellung versendet wird, erhalten Sie eine E-Mail mit einer Sendungsnummer. Jede Bestellung können Sie von der Zahlung bis zur Lieferung auf unserer ",
              label: "Sendungsverfolgung",
              after: " verfolgen.",
            },
          },
        ],
      },
      {
        heading: "Rückgabe und Garantie",
        items: [
          {
            question: "Wie lauten Ihre Rückgabebedingungen?",
            answer:
              "Als Verbraucher in der EU können Sie den Kauf innerhalb von 14 Tagen nach Erhalt der Ware ohne Angabe von Gründen widerrufen. Wir nehmen sowohl mangelfreie als auch mangelhafte Produkte zurück. Die Artikel müssen neu sein und im ursprünglichen Zustand sowie in der Originalverpackung zurückgesendet werden. Ein Umtausch ist nicht möglich. Nach Erhalt und Prüfung erstatten wir den Betrag innerhalb von 14 Tagen auf Ihre ursprüngliche Zahlungsmethode.",
          },
          {
            question: "Wer trägt die Kosten der Rücksendung?",
            answer:
              "Die Rücksendung ist bei angenommenen Rückgaben kostenlos, sowohl bei mangelfreien als auch bei mangelhaften Produkten. Wir stellen ein Rücksendeetikett zum Herunterladen und Ausdrucken bereit, und es fällt keine Wiedereinlagerungsgebühr an. Wenn ein Artikel beschädigt oder fehlerhaft ankommt, kontaktieren Sie uns innerhalb von 48 Stunden mit Fotos. Wir organisieren dann einen kostenlosen Ersatz oder eine Rückgabe.",
          },
          {
            question: "Gibt es eine Garantie?",
            answer:
              "Jede von uns verkaufte Maschine ist durch die gesetzliche zweijährige EU-Verbrauchergarantie gegen Mängel abgedeckt. Viele Hersteller gewähren zusätzlich eine eigene Garantie. Unser Support hilft bei Reparatur oder Ersatz.",
          },
        ],
      },
      {
        heading: "Zahlungen",
        items: [
          {
            question: "Welche Zahlungsarten akzeptieren Sie?",
            link: {
              href: "/payment-methods",
              before:
                "SEPA-Überweisung, Kryptowährung und zinsfreie Ratenzahlung. Die Kartenzahlung ist vorübergehend nicht verfügbar. Einzelheiten stehen auf unserer Seite ",
              label: "Zahlungsarten",
              after: ".",
            },
          },
          {
            question: "Wie funktioniert die zinsfreie Ratenzahlung?",
            answer: "Ab einem Bestellwert von 1.000 € wird die Bestellung in vier gleiche Zahlungen über zwei Monate aufgeteilt, ohne Zinsen und ohne Gebühren.",
          },
          {
            question: "Sind die Preise inklusive MwSt.?",
            answer: "Ja. Alle Preise werden in Euro (EUR) angezeigt und enthalten die gesetzliche Mehrwertsteuer, soweit sie anfällt.",
          },
        ],
      },
      {
        heading: "Produkte und Support",
        items: [
          {
            question: "Werden die Drucker fertig montiert geliefert?",
            answer:
              "Das hängt vom Modell ab. Die meisten Geräte von Bambu Lab und Prusa werden fertig montiert geliefert, einige Bausätze erfordern eine leichte Montage. Auf jeder Produktseite steht genau, was enthalten ist.",
          },
          {
            question: "Wie erreiche ich den Support?",
            link: {
              href: "/contact",
              before: "Nutzen Sie unser ",
              label: "Kontaktformular",
              after: " oder den Live-Chat. Wir antworten innerhalb von 48 Stunden, montags bis freitags von 9:00 bis 18:00 Uhr MEZ.",
            },
          },
        ],
      },
    ],
  },
  fr: {
    intro: "Réponses aux questions que l'on nous pose le plus souvent sur les commandes, la livraison, les retours et le paiement.",
    description: "Réponses aux questions fréquentes sur les commandes, la livraison, les retours, la garantie et le paiement chez 3DJools.",
    groups: [
      {
        heading: "Commandes et livraison",
        items: [
          {
            question: "Combien de temps prend la livraison et combien coûte-t-elle ?",
            answer:
              "La livraison standard prend 3 à 6 jours ouvrables au total et est entièrement gratuite pour chaque commande, vers toutes les destinations que nous desservons, sans montant minimum. Le traitement prend 0 à 1 jour ouvrable et le transport 3 à 5 jours ouvrables. Les commandes passées avant 15:00 CET du lundi au vendredi entrent dans le délai de traitement le jour même.",
          },
          {
            question: "Quels sont vos horaires ?",
            answer:
              "Notre équipe est disponible du lundi au vendredi, de 9:00 à 18:00 CET, hors jours fériés belges. Les commandes et messages reçus en dehors de ces horaires sont traités le jour ouvrable suivant.",
          },
          {
            question: "Vers quels pays livrez-vous ?",
            answer:
              "Nous livrons en Belgique et dans le reste de l'Union européenne, ainsi que dans quelques pays voisins (Suisse, Norvège, Royaume-Uni) et au Qatar, avec des transporteurs fiables (DPD, GLS, DHL et UPS). La livraison est gratuite vers chacune de ces destinations.",
          },
          {
            question: "Puis-je suivre ma commande ?",
            link: {
              href: "/track-order",
              before:
                "Oui. Vous recevrez un e-mail avec un numéro de suivi dès l'expédition. Vous pouvez suivre chaque commande, du paiement à la livraison, sur notre ",
              label: "page de suivi de commande",
              after: ".",
            },
          },
        ],
      },
      {
        heading: "Retours et garantie",
        items: [
          {
            question: "Quelle est votre politique de retour ?",
            answer:
              "En tant que consommateur dans l'UE, vous pouvez vous rétracter dans les 14 jours suivant la réception des marchandises, sans avoir à justifier de motif. Nous acceptons les retours de produits non défectueux et défectueux. Les articles doivent être neufs et renvoyés dans leur état et leur emballage d'origine. Les échanges ne sont pas acceptés. Dès réception et contrôle du retour, nous remboursons votre moyen de paiement d'origine sous 14 jours.",
          },
          {
            question: "Qui paie les frais de retour ?",
            answer:
              "Le retour est gratuit pour les retours acceptés, qu'il s'agisse de produits non défectueux ou défectueux. Nous fournissons une étiquette de retour à télécharger et à imprimer, et aucun frais de restockage n'est facturé. Si un article arrive endommagé ou défectueux, contactez-nous dans les 48 heures avec des photos et nous organiserons un remplacement ou un retour gratuit.",
          },
          {
            question: "Proposez-vous une garantie ?",
            answer:
              "Chaque machine que nous vendons est couverte par la garantie légale européenne de 2 ans contre les défauts. De nombreux fabricants ajoutent leur propre garantie. Notre équipe d'assistance organise toute réparation ou tout remplacement.",
          },
        ],
      },
      {
        heading: "Paiements",
        items: [
          {
            question: "Quels moyens de paiement acceptez-vous ?",
            link: {
              href: "/payment-methods",
              before:
                "Virement SEPA, cryptomonnaie et paiement en plusieurs fois sans intérêt. Le paiement par carte est temporairement indisponible. Les détails figurent sur notre ",
              label: "page des moyens de paiement",
              after: ".",
            },
          },
          {
            question: "Comment fonctionne le paiement en plusieurs fois sans intérêt ?",
            answer: "Pour les commandes de 1 000 € ou plus, la commande est répartie en quatre versements égaux sur deux mois, sans intérêt et sans frais.",
          },
          {
            question: "Les prix incluent-ils la TVA ?",
            answer: "Oui. Tous les prix sont indiqués en euros (EUR) et incluent la TVA légale lorsqu'elle s'applique.",
          },
        ],
      },
      {
        heading: "Produits et assistance",
        items: [
          {
            question: "Les imprimantes sont-elles livrées entièrement montées ?",
            answer:
              "Cela dépend du modèle. La plupart des machines Bambu Lab et Prusa sont livrées entièrement montées, tandis que certains kits demandent un montage léger. Chaque fiche produit indique exactement ce qui est inclus.",
          },
          {
            question: "Comment contacter l'assistance ?",
            link: {
              href: "/contact",
              before: "Utilisez notre ",
              label: "formulaire de contact",
              after: " ou le chat en direct. Nous répondons sous 48 heures, du lundi au vendredi, de 9:00 à 18:00 CET.",
            },
          },
        ],
      },
    ],
  },
  it: {
    intro: "Risposte alle domande che ci vengono poste più spesso su ordini, spedizione, resi e pagamenti.",
    description: "Risposte alle domande frequenti su ordini, spedizione, resi, garanzia e pagamenti su 3DJools.",
    groups: [
      {
        heading: "Ordini e spedizione",
        items: [
          {
            question: "Quanto tempo richiede la consegna e quanto costa?",
            answer:
              "La spedizione standard richiede in totale 3–6 giorni lavorativi ed è completamente gratuita per ogni ordine, verso ogni destinazione che serviamo, senza importo minimo. La preparazione richiede 0–1 giorno lavorativo e il trasporto 3–5 giorni lavorativi. Gli ordini effettuati entro le 15:00 CET dal lunedì al venerdì entrano nella finestra di preparazione lo stesso giorno.",
          },
          {
            question: "Quali sono gli orari?",
            answer:
              "Il nostro team è disponibile dal lunedì al venerdì, dalle 9:00 alle 18:00 CET, esclusi i giorni festivi belgi. Ordini e messaggi ricevuti fuori da questi orari vengono gestiti il giorno lavorativo successivo.",
          },
          {
            question: "In quali Paesi spedite?",
            answer:
              "Spediamo in Belgio e nel resto dell'Unione europea, oltre ad alcuni Paesi vicini (Svizzera, Norvegia, Regno Unito) e in Qatar, con corrieri affidabili (DPD, GLS, DHL e UPS). La spedizione è gratuita verso ciascuna di queste destinazioni.",
          },
          {
            question: "Posso tracciare il mio ordine?",
            link: {
              href: "/track-order",
              before:
                "Sì. Riceverai un'e-mail con un numero di tracciamento appena l'ordine viene spedito e puoi seguire ogni ordine, dal pagamento alla consegna, sulla nostra ",
              label: "pagina di tracciamento ordine",
              after: ".",
            },
          },
        ],
      },
      {
        heading: "Resi e garanzia",
        items: [
          {
            question: "Qual è la vostra politica di reso?",
            answer:
              "Come consumatore nell'UE puoi recedere entro 14 giorni dalla ricezione della merce, senza fornire alcuna motivazione. Accettiamo resi sia di prodotti non difettosi sia di prodotti difettosi. Gli articoli devono essere nuovi e restituiti nelle condizioni e nella confezione originali. I cambi non sono accettati. Dopo aver ricevuto e controllato il reso, rimborsiamo il metodo di pagamento originale entro 14 giorni.",
          },
          {
            question: "Chi paga la spedizione di reso?",
            answer:
              "La spedizione di reso è gratuita per i resi accettati, sia per prodotti non difettosi sia per prodotti difettosi. Forniamo un'etichetta di reso da scaricare e stampare e non applichiamo costi di ricarico. Se un articolo arriva danneggiato o difettoso, contattaci entro 48 ore con delle foto e organizzeremo una sostituzione o un reso gratuito.",
          },
          {
            question: "Offrite una garanzia?",
            answer:
              "Ogni macchina che vendiamo è coperta dalla garanzia legale UE di 2 anni contro i difetti. Molti produttori aggiungono una propria garanzia. Il nostro supporto aiuta a organizzare riparazione o sostituzione.",
          },
        ],
      },
      {
        heading: "Pagamenti",
        items: [
          {
            question: "Quali metodi di pagamento accettate?",
            link: {
              href: "/payment-methods",
              before:
                "Bonifico SEPA, criptovaluta e rate senza interessi. Il pagamento con carta è temporaneamente non disponibile. I dettagli sono sulla nostra ",
              label: "pagina dei metodi di pagamento",
              after: ".",
            },
          },
          {
            question: "Come funzionano le rate senza interessi?",
            answer: "Per ordini da 1.000 € in su, l'ordine viene suddiviso in quattro pagamenti uguali nell'arco di due mesi, senza interessi e senza commissioni.",
          },
          {
            question: "I prezzi includono l'IVA?",
            answer: "Sì. Tutti i prezzi sono indicati in euro (EUR) e includono l'IVA di legge, ove applicabile.",
          },
        ],
      },
      {
        heading: "Prodotti e assistenza",
        items: [
          {
            question: "Le stampanti arrivano già montate?",
            answer:
              "Dipende dal modello. La maggior parte delle macchine Bambu Lab e Prusa viene spedita già montata, mentre alcuni kit richiedono un montaggio leggero. Ogni scheda prodotto indica esattamente cosa è incluso.",
          },
          {
            question: "Come posso contattare l'assistenza?",
            link: {
              href: "/contact",
              before: "Usa il nostro ",
              label: "modulo di contatto",
              after: " o la chat dal vivo. Rispondiamo entro 48 ore, dal lunedì al venerdì, dalle 9:00 alle 18:00 CET.",
            },
          },
        ],
      },
    ],
  },
  es: {
    intro: "Respuestas a las preguntas que más nos hacen sobre pedidos, envío, devoluciones y pagos.",
    description: "Respuestas a preguntas frecuentes sobre pedidos, envío, devoluciones, garantía y pagos en 3DJools.",
    groups: [
      {
        heading: "Pedidos y envío",
        items: [
          {
            question: "¿Cuánto tarda la entrega y cuánto cuesta?",
            answer:
              "El envío estándar tarda de 3 a 6 días laborables en total y es completamente gratuito en todos los pedidos y a todos los destinos a los que enviamos, sin pedido mínimo. La preparación tarda de 0 a 1 día laborable y el tránsito de 3 a 5 días laborables. Los pedidos realizados antes de las 15:00 CET de lunes a viernes entran en la ventana de preparación ese mismo día.",
          },
          {
            question: "¿Cuál es vuestro horario?",
            answer:
              "Nuestro equipo está disponible de lunes a viernes, de 9:00 a 18:00 CET, excepto festivos belgas. Los pedidos y mensajes recibidos fuera de este horario se atienden el siguiente día laborable.",
          },
          {
            question: "¿A qué países enviáis?",
            answer:
              "Enviamos a Bélgica y al resto de la Unión Europea, además de a algunos países vecinos (Suiza, Noruega y Reino Unido) y a Catar, con transportistas de confianza (DPD, GLS, DHL y UPS). El envío es gratuito a todos estos destinos.",
          },
          {
            question: "¿Puedo seguir mi pedido?",
            link: {
              href: "/track-order",
              before:
                "Sí. Recibirás un correo con un número de seguimiento cuando se envíe el pedido, y puedes seguir cada pedido, desde el pago hasta la entrega, en nuestra ",
              label: "página de seguimiento de pedidos",
              after: ".",
            },
          },
        ],
      },
      {
        heading: "Devoluciones y garantía",
        items: [
          {
            question: "¿Cuál es vuestra política de devoluciones?",
            answer:
              "Como consumidor en la UE puede desistir en los 14 días siguientes a la recepción de los bienes, sin necesidad de justificar el motivo. Aceptamos devoluciones de productos no defectuosos y defectuosos. Los artículos deben ser nuevos y devolverse en su estado y embalaje originales. No aceptamos cambios. Una vez recibida y revisada la devolución, reembolsamos su método de pago original en un plazo de 14 días.",
          },
          {
            question: "¿Quién paga el envío de la devolución?",
            answer:
              "El envío de devolución es gratuito para las devoluciones aceptadas, tanto de productos no defectuosos como defectuosos. Facilitamos una etiqueta de devolución para descargar e imprimir, y no hay coste de reposición. Si un artículo llega dañado o defectuoso, contáctanos en un plazo de 48 horas con fotos y organizaremos un reemplazo o una devolución gratuitos.",
          },
          {
            question: "¿Ofrecéis garantía?",
            answer:
              "Cada máquina que vendemos está cubierta por la garantía legal de la UE de 2 años contra defectos. Muchos fabricantes añaden su propia garantía. Nuestro equipo de soporte ayuda a gestionar cualquier reparación o reemplazo.",
          },
        ],
      },
      {
        heading: "Pagos",
        items: [
          {
            question: "¿Qué métodos de pago aceptáis?",
            link: {
              href: "/payment-methods",
              before:
                "Transferencia SEPA, criptomoneda y plazos sin intereses. El pago con tarjeta no está disponible temporalmente. Los detalles están en nuestra ",
              label: "página de métodos de pago",
              after: ".",
            },
          },
          {
            question: "¿Cómo funcionan los plazos sin intereses?",
            answer: "Para pedidos de 1.000 € o más, el pedido se divide en cuatro pagos iguales a lo largo de dos meses, sin intereses y sin comisiones.",
          },
          {
            question: "¿Los precios incluyen el IVA?",
            answer: "Sí. Todos los precios se muestran en euros (EUR) e incluyen el IVA legal cuando corresponde.",
          },
        ],
      },
      {
        heading: "Productos y asistencia",
        items: [
          {
            question: "¿Las impresoras llegan montadas?",
            answer:
              "Depende del modelo. La mayoría de las máquinas Bambu Lab y Prusa se envían montadas, mientras que algunos kits requieren un montaje sencillo. Cada ficha de producto indica exactamente qué incluye.",
          },
          {
            question: "¿Cómo puedo contactar con el soporte?",
            link: {
              href: "/contact",
              before: "Usa nuestro ",
              label: "formulario de contacto",
              after: " o el chat en directo. Respondemos en un plazo de 48 horas, de lunes a viernes, de 9:00 a 18:00 CET.",
            },
          },
        ],
      },
    ],
  },
  nl: {
    intro: "Antwoorden op de vragen die we het vaakst krijgen over bestellingen, verzending, retourneren en betaling.",
    description: "Antwoorden op veelgestelde vragen over bestellingen, verzending, retourneren, garantie en betaling bij 3DJools.",
    groups: [
      {
        heading: "Bestellingen en verzending",
        items: [
          {
            question: "Hoe lang duurt de levering en wat kost die?",
            answer:
              "De standaardverzending duurt in totaal 3–6 werkdagen en is volledig gratis bij elke bestelling, naar elke bestemming die we bedienen, zonder minimumbedrag. De verwerking duurt 0–1 werkdag en het transport 3–5 werkdagen. Bestellingen die maandag tot vrijdag vóór 15:00 CET worden geplaatst, vallen die dag nog binnen het verwerkingstijdvenster.",
          },
          {
            question: "Wat zijn jullie openingstijden?",
            answer:
              "Ons team is bereikbaar van maandag tot vrijdag, van 9:00 tot 18:00 CET, met uitzondering van Belgische feestdagen. Bestellingen en berichten buiten deze uren worden de volgende werkdag behandeld.",
          },
          {
            question: "Naar welke landen verzenden jullie?",
            answer:
              "We verzenden naar België en de rest van de Europese Unie, plus enkele buurlanden (Zwitserland, Noorwegen, Verenigd Koninkrijk) en naar Qatar, met betrouwbare vervoerders (DPD, GLS, DHL en UPS). Verzending is gratis naar elk van deze bestemmingen.",
          },
          {
            question: "Kan ik mijn bestelling volgen?",
            link: {
              href: "/track-order",
              before:
                "Ja. Zodra je bestelling is verzonden, ontvang je een e-mail met een trackingnummer. Je kunt elke bestelling van betaling tot levering volgen op onze ",
              label: "pagina voor het volgen van bestellingen",
              after: ".",
            },
          },
        ],
      },
      {
        heading: "Retourneren en garantie",
        items: [
          {
            question: "Wat is jullie retourbeleid?",
            answer:
              "Als consument in de EU kunt u binnen 14 dagen na ontvangst van de goederen herroepen, zonder opgave van reden. We aanvaarden retouren van zowel niet-defecte als defecte producten. Artikelen moeten nieuw zijn en in de oorspronkelijke staat en verpakking worden teruggestuurd. Ruilen is niet mogelijk. Zodra we de retour hebben ontvangen en gecontroleerd, betalen we binnen 14 dagen terug op uw oorspronkelijke betaalmethode.",
          },
          {
            question: "Wie betaalt de retourzending?",
            answer:
              "Retourzending is gratis voor aanvaarde retouren, zowel voor niet-defecte als defecte producten. We bieden een retouretiket om te downloaden en af te drukken, en er zijn geen herinvoerkosten. Als een artikel beschadigd of defect aankomt, neem dan binnen 48 uur contact met ons op met foto's. We regelen dan een gratis vervanging of retour.",
          },
          {
            question: "Bieden jullie garantie?",
            answer:
              "Elke machine die wij verkopen valt onder de wettelijke EU-consumentengarantie van 2 jaar tegen gebreken. Veel fabrikanten voegen daar een eigen garantie aan toe. Onze support helpt bij reparatie of vervanging.",
          },
        ],
      },
      {
        heading: "Betalingen",
        items: [
          {
            question: "Welke betaalmethoden accepteren jullie?",
            link: {
              href: "/payment-methods",
              before:
                "SEPA-overschrijving, cryptovaluta en renteloze termijnen. Betalen met kaart is momenteel niet beschikbaar. De details staan op onze ",
              label: "pagina met betaalmethoden",
              after: ".",
            },
          },
          {
            question: "Hoe werken de renteloze termijnen?",
            answer: "Voor bestellingen vanaf € 1.000 wordt de bestelling verdeeld in vier gelijke betalingen over twee maanden, zonder rente en zonder kosten.",
          },
          {
            question: "Zijn de prijzen inclusief btw?",
            answer: "Ja. Alle prijzen worden in euro (EUR) getoond en zijn inclusief de wettelijke btw waar die van toepassing is.",
          },
        ],
      },
      {
        heading: "Producten en support",
        items: [
          {
            question: "Worden de printers volledig gemonteerd geleverd?",
            answer:
              "Dat hangt van het model af. De meeste machines van Bambu Lab en Prusa worden volledig gemonteerd verzonden, terwijl sommige kits een lichte montage vragen. Op elke productpagina staat precies wat is inbegrepen.",
          },
          {
            question: "Hoe kan ik support bereiken?",
            link: {
              href: "/contact",
              before: "Gebruik ons ",
              label: "contactformulier",
              after: " of de livechat. We antwoorden binnen 48 uur, van maandag tot vrijdag, van 9:00 tot 18:00 CET.",
            },
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
    description: COPY[locale].description,
  }
}

export default async function FaqPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : "en"
  const dict = await getDictionary(locale)
  const copy = COPY[locale]

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

      <p className="mt-10 border-t border-border pt-6 text-sm text-muted-foreground">
        {dict.legal.contactPrompt}{" "}
        <Link href={localizedPath(locale, "/contact")} className="underline underline-offset-2 hover:text-foreground">
          {dict.legal.contactLink}
        </Link>
      </p>
    </div>
  )
}
