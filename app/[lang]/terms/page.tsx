import Link from "next/link"
import { isLocale, type Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { localizedPath } from "@/lib/i18n/paths"
import { ProsePage, ProseSection } from "@/components/legal/prose-page"

type TermsCopy = {
  s1Heading: string
  s1Pre: string
  s1LinkPre: string
  s1Post: string
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
  s9Pre: string
  s9Post: string
  s10Heading: string
  s10: string
  s11Heading: string
  s11Pre: string
  s11Post: string
  s12Heading: string
  s12: string
  s13Heading: string
  s13: string
  s14Heading: string
  s14: string
}

const COPY: Record<Locale, TermsCopy> = {
  en: {
    s1Heading: "1. Contracting party",
    s1Pre:
      "The 3DJools online store is operated by Ln-Squared, Rue du Chénia 17, 7170 Manage, Hainaut, Belgium (Company No. 0564.743.304, VAT BE0564743304). References to \u201cwe\u201d, \u201cus\u201d or the \u201cSeller\u201d in these terms mean Ln-Squared. See our",
    s1LinkPre: "legal notice",
    s1Post: "for full contact details. You can also reach us directly at",
    s2Heading: "2. Definitions",
    s2: "\u201cCustomer\u201d, \u201cyou\u201d or \u201cyour\u201d means the person or business placing an order through the store. \u201cGoods\u201d means any product listed for sale on the store. \u201cOrder\u201d means a purchase request submitted and confirmed through our checkout.",
    s3Heading: "3. Scope",
    s3: "These terms and conditions govern all orders placed through the 3DJools online store by consumers and businesses within the European Union and associated territories.",
    s4Heading: "4. Prices & payment",
    s4: "All prices are in euro (EUR) and include statutory VAT where applicable. We accept SEPA bank transfer, cryptocurrency and interest-free instalments as described on our payment methods page. Card payment is temporarily unavailable.",
    s5Heading: "5. Delivery",
    s5: "Delivery times and costs are as stated on our shipping page. Risk passes to the consumer on delivery of the goods.",
    s6Heading: "6. Right of withdrawal",
    s6: "Consumers have a statutory 14-day right of withdrawal, which 3DJools voluntarily extends to a 30-day return policy as described in our returns policy, which forms part of these terms.",
    s7Heading: "7. Warranty & liability",
    s7: "Statutory warranty rights apply to all goods. Nothing in these terms limits liability for death, personal injury or any liability that cannot be excluded under applicable law.",
    s8Heading: "8. User responsibilities & restrictions",
    s8: "You agree to provide accurate order and account information, to use the store only for lawful purposes, and not to attempt to disrupt, reverse-engineer or gain unauthorised access to our systems. We may cancel orders or suspend accounts placed in breach of these terms.",
    s9Heading: "9. Cookies",
    s9Pre:
      "Our store uses cookies to operate the shopping cart, keep you signed in and understand how the site is used. Details of the cookies we use and how to manage your preferences are set out in our",
    s9Post: ".",
    s10Heading: "10. Your suggestions",
    s10: "If you send us feedback, ideas or suggestions about our products or store, you agree that we may use them without restriction or compensation to you.",
    s11Heading: "11. Your consent",
    s11Pre: "By using this store and placing an order, you consent to these terms and to our",
    s11Post: ".",
    s12Heading: "12. Links to other websites",
    s12: "Our store may link to third-party websites, such as manufacturer pages or payment providers. We are not responsible for the content, policies or practices of any third-party website.",
    s13Heading: "13. Changes to these terms",
    s13: "We may update these terms from time to time to reflect changes in our services or legal requirements. The version in force at the time you place an order applies to that order. Material changes will be reflected on this page with an updated \u201clast updated\u201d date.",
    s14Heading: "14. Governing law & disputes",
    s14: "These terms are governed by the laws of Belgium and applicable EU consumer-protection law, without prejudice to any mandatory consumer-protection provisions of the consumer's country of residence. Disputes may also be submitted to the EU Online Dispute Resolution platform referenced in our legal notice.",
  },
  de: {
    s1Heading: "1. Vertragspartner",
    s1Pre:
      "Der Online-Shop 3DJools wird betrieben von Ln-Squared, Rue du Chénia 17, 7170 Manage, Hainaut, Belgien (Unternehmensnummer 0564.743.304, USt-IdNr. BE0564743304). Verweise auf \u201cwir\u201d, \u201cuns\u201d oder den \u201cVerkäufer\u201d in diesen Bedingungen bezeichnen Ln-Squared. Vollständige Kontaktangaben finden Sie in unserem",
    s1LinkPre: "Impressum",
    s1Post: ". Sie erreichen uns auch direkt unter",
    s2Heading: "2. Begriffsbestimmungen",
    s2: "\u201cKunde\u201d, \u201cSie\u201d oder \u201cIhr\u201d bezeichnet die Person oder das Unternehmen, das über den Shop eine Bestellung aufgibt. \u201cWare\u201d bezeichnet jedes im Shop zum Verkauf angebotene Produkt. \u201cBestellung\u201d bezeichnet eine über unseren Checkout eingereichte und bestätigte Kaufanfrage.",
    s3Heading: "3. Geltungsbereich",
    s3: "Diese Allgemeinen Geschäftsbedingungen gelten für alle über den 3DJools-Online-Shop aufgegebenen Bestellungen von Verbrauchern und Unternehmen innerhalb der Europäischen Union und assoziierter Gebiete.",
    s4Heading: "4. Preise & Zahlung",
    s4: "Alle Preise sind in Euro (EUR) angegeben und enthalten die gesetzliche Mehrwertsteuer, soweit anwendbar. Wir akzeptieren SEPA-Überweisung, Kryptowährung und zinsfreie Ratenzahlung, wie auf unserer Seite zu den Zahlungsmethoden beschrieben. Die Kartenzahlung ist vorübergehend nicht verfügbar.",
    s5Heading: "5. Lieferung",
    s5: "Lieferzeiten und -kosten entsprechen den Angaben auf unserer Versandseite. Das Risiko geht mit der Lieferung der Waren auf den Verbraucher über.",
    s6Heading: "6. Widerrufsrecht",
    s6: "Verbraucher haben ein gesetzliches Widerrufsrecht von 14 Tagen, das 3DJools freiwillig auf eine 30-tägige Rückgaberegelung erweitert, wie in unserer Rückgaberichtlinie beschrieben, die Bestandteil dieser Bedingungen ist.",
    s7Heading: "7. Gewährleistung & Haftung",
    s7: "Für alle Waren gelten die gesetzlichen Gewährleistungsrechte. Keine Bestimmung dieser Bedingungen beschränkt die Haftung für Tod, Körperverletzung oder eine Haftung, die nach geltendem Recht nicht ausgeschlossen werden kann.",
    s8Heading: "8. Pflichten & Einschränkungen der Nutzer",
    s8: "Sie verpflichten sich, korrekte Bestell- und Kontoinformationen anzugeben, den Shop nur für rechtmäßige Zwecke zu nutzen und nicht zu versuchen, unsere Systeme zu stören, zurückzuentwickeln oder unbefugt darauf zuzugreifen. Wir können Bestellungen stornieren oder Konten sperren, die gegen diese Bedingungen verstoßen.",
    s9Heading: "9. Cookies",
    s9Pre:
      "Unser Shop verwendet Cookies, um den Warenkorb zu betreiben, Sie angemeldet zu halten und zu verstehen, wie die Website genutzt wird. Einzelheiten zu den verwendeten Cookies und zur Verwaltung Ihrer Einstellungen finden Sie in unserer",
    s9Post: ".",
    s10Heading: "10. Ihre Vorschläge",
    s10: "Wenn Sie uns Feedback, Ideen oder Vorschläge zu unseren Produkten oder unserem Shop senden, erklären Sie sich damit einverstanden, dass wir diese ohne Einschränkung und ohne Vergütung an Sie verwenden dürfen.",
    s11Heading: "11. Ihre Zustimmung",
    s11Pre: "Durch die Nutzung dieses Shops und die Aufgabe einer Bestellung stimmen Sie diesen Bedingungen sowie unserer",
    s11Post: "zu.",
    s12Heading: "12. Links zu anderen Websites",
    s12: "Unser Shop kann Links zu Websites Dritter enthalten, etwa Herstellerseiten oder Zahlungsanbieter. Wir sind nicht verantwortlich für Inhalte, Richtlinien oder Praktiken von Websites Dritter.",
    s13Heading: "13. Änderungen dieser Bedingungen",
    s13: "Wir können diese Bedingungen von Zeit zu Zeit aktualisieren, um Änderungen unserer Dienstleistungen oder gesetzlicher Vorgaben widerzuspiegeln. Für eine Bestellung gilt die zum Zeitpunkt der Bestellung gültige Fassung. Wesentliche Änderungen werden auf dieser Seite mit einem aktualisierten Datum \u201cZuletzt aktualisiert\u201d vermerkt.",
    s14Heading: "14. Anwendbares Recht & Streitbeilegung",
    s14: "Diese Bedingungen unterliegen dem Recht Belgiens und dem anwendbaren EU-Verbraucherschutzrecht, unbeschadet zwingender verbraucherschützender Bestimmungen des Wohnsitzlandes des Verbrauchers. Streitigkeiten können auch über die in unserem Impressum genannte Online-Streitbeilegungsplattform der EU eingereicht werden.",
  },
  fr: {
    s1Heading: "1. Partie contractante",
    s1Pre:
      "La boutique en ligne 3DJools est exploitée par Ln-Squared, Rue du Chénia 17, 7170 Manage, Hainaut, Belgique (n° d'entreprise 0564.743.304, TVA BE0564743304). Les références à \u201cnous\u201d ou au \u201cVendeur\u201d dans les présentes conditions désignent Ln-Squared. Consultez notre",
    s1LinkPre: "mention légale",
    s1Post: "pour les coordonnées complètes. Vous pouvez également nous contacter directement à",
    s2Heading: "2. Définitions",
    s2: "\u201cClient\u201d, \u201cvous\u201d désigne la personne ou l'entreprise passant une commande via la boutique. \u201cMarchandises\u201d désigne tout produit proposé à la vente sur la boutique. \u201cCommande\u201d désigne une demande d'achat soumise et confirmée via notre processus de paiement.",
    s3Heading: "3. Champ d'application",
    s3: "Les présentes conditions générales régissent toutes les commandes passées via la boutique en ligne 3DJools par des consommateurs et des entreprises au sein de l'Union européenne et des territoires associés.",
    s4Heading: "4. Prix & paiement",
    s4: "Tous les prix sont exprimés en euros (EUR) et incluent la TVA légale lorsqu'applicable. Nous acceptons le virement SEPA, la cryptomonnaie et le paiement en plusieurs fois sans intérêt, comme décrit sur notre page des moyens de paiement. Le paiement par carte est temporairement indisponible.",
    s5Heading: "5. Livraison",
    s5: "Les délais et frais de livraison sont indiqués sur notre page de livraison. Le risque est transféré au consommateur dès la livraison des marchandises.",
    s6Heading: "6. Droit de rétractation",
    s6: "Les consommateurs disposent d'un droit de rétractation légal de 14 jours, que 3DJools étend volontairement à une politique de retour de 30 jours, comme décrit dans notre politique de retour, qui fait partie intégrante des présentes conditions.",
    s7Heading: "7. Garantie & responsabilité",
    s7: "Les droits de garantie légaux s'appliquent à toutes les marchandises. Rien dans les présentes conditions ne limite la responsabilité en cas de décès, de blessure corporelle ou toute autre responsabilité qui ne peut être exclue en vertu du droit applicable.",
    s8Heading: "8. Responsabilités & restrictions de l'utilisateur",
    s8: "Vous vous engagez à fournir des informations de commande et de compte exactes, à n'utiliser la boutique qu'à des fins légales, et à ne pas tenter de perturber, décompiler ou accéder sans autorisation à nos systèmes. Nous pouvons annuler des commandes ou suspendre des comptes en cas de violation des présentes conditions.",
    s9Heading: "9. Cookies",
    s9Pre:
      "Notre boutique utilise des cookies pour faire fonctionner le panier d'achat, vous maintenir connecté et comprendre l'utilisation du site. Les détails des cookies utilisés et la gestion de vos préférences figurent dans notre",
    s9Post: ".",
    s10Heading: "10. Vos suggestions",
    s10: "Si vous nous envoyez des commentaires, idées ou suggestions concernant nos produits ou notre boutique, vous acceptez que nous puissions les utiliser sans restriction ni compensation à votre égard.",
    s11Heading: "11. Votre consentement",
    s11Pre: "En utilisant cette boutique et en passant une commande, vous consentez aux présentes conditions ainsi qu'à notre",
    s11Post: ".",
    s12Heading: "12. Liens vers d'autres sites web",
    s12: "Notre boutique peut contenir des liens vers des sites tiers, tels que les pages de fabricants ou de prestataires de paiement. Nous ne sommes pas responsables du contenu, des politiques ou des pratiques de tout site tiers.",
    s13Heading: "13. Modifications des présentes conditions",
    s13: "Nous pouvons mettre à jour ces conditions de temps à autre pour refléter des changements dans nos services ou des exigences légales. La version en vigueur au moment de votre commande s'applique à celle-ci. Les modifications substantielles seront reflétées sur cette page avec une date \u201cDernière mise à jour\u201d actualisée.",
    s14Heading: "14. Droit applicable & litiges",
    s14: "Les présentes conditions sont régies par le droit belge et le droit européen applicable en matière de protection des consommateurs, sans préjudice des dispositions impératives de protection du consommateur de son pays de résidence. Les litiges peuvent également être soumis à la plateforme européenne de règlement en ligne des litiges mentionnée dans notre mention légale.",
  },
  it: {
    s1Heading: "1. Controparte contrattuale",
    s1Pre:
      "Il negozio online 3DJools è gestito da Ln-Squared, Rue du Chénia 17, 7170 Manage, Hainaut, Belgio (numero di società 0564.743.304, P.IVA BE0564743304). I riferimenti a \u201cnoi\u201d o al \u201cVenditore\u201d in queste condizioni indicano Ln-Squared. Per i dati di contatto completi, consulta la nostra",
    s1LinkPre: "nota legale",
    s1Post: ". Puoi contattarci anche direttamente all'indirizzo",
    s2Heading: "2. Definizioni",
    s2: "\u201cCliente\u201d o \u201ctu\u201d indica la persona o l'azienda che effettua un ordine tramite il negozio. \u201cMerce\u201d indica qualsiasi prodotto in vendita sul negozio. \u201cOrdine\u201d indica una richiesta d'acquisto inviata e confermata tramite il nostro checkout.",
    s3Heading: "3. Ambito di applicazione",
    s3: "Le presenti condizioni generali regolano tutti gli ordini effettuati tramite il negozio online 3DJools da consumatori e aziende all'interno dell'Unione Europea e dei territori associati.",
    s4Heading: "4. Prezzi & pagamento",
    s4: "Tutti i prezzi sono espressi in euro (EUR) e includono l'IVA di legge, se applicabile. Accettiamo bonifico SEPA, criptovaluta e pagamento a rate senza interessi, come descritto nella pagina dei metodi di pagamento. Il pagamento con carta è temporaneamente non disponibile.",
    s5Heading: "5. Consegna",
    s5: "I tempi e i costi di consegna sono indicati nella nostra pagina di spedizione. Il rischio passa al consumatore al momento della consegna della merce.",
    s6Heading: "6. Diritto di recesso",
    s6: "I consumatori hanno un diritto di recesso legale di 14 giorni, che 3DJools estende volontariamente a una politica di restituzione di 30 giorni, come descritto nella nostra politica di restituzione, che fa parte integrante di queste condizioni.",
    s7Heading: "7. Garanzia & responsabilità",
    s7: "I diritti di garanzia legale si applicano a tutta la merce. Nulla in queste condizioni limita la responsabilità per morte, lesioni personali o qualsiasi responsabilità che non può essere esclusa secondo la legge applicabile.",
    s8Heading: "8. Responsabilità & restrizioni dell'utente",
    s8: "L'utente si impegna a fornire informazioni accurate su ordine e account, a utilizzare il negozio solo per scopi legali e a non tentare di interrompere, decompilare o accedere senza autorizzazione ai nostri sistemi. Possiamo annullare ordini o sospendere account in caso di violazione di queste condizioni.",
    s9Heading: "9. Cookie",
    s9Pre:
      "Il nostro negozio utilizza cookie per far funzionare il carrello, mantenerti collegato e capire come viene utilizzato il sito. I dettagli sui cookie utilizzati e su come gestire le preferenze sono indicati nella nostra",
    s9Post: ".",
    s10Heading: "10. I tuoi suggerimenti",
    s10: "Se ci inviate feedback, idee o suggerimenti sui nostri prodotti o sul negozio, accettate che possiamo utilizzarli senza restrizioni né compenso nei vostri confronti.",
    s11Heading: "11. Il tuo consenso",
    s11Pre: "Utilizzando questo negozio ed effettuando un ordine, acconsenti a queste condizioni e alla nostra",
    s11Post: ".",
    s12Heading: "12. Link ad altri siti web",
    s12: "Il nostro negozio può contenere link a siti web di terze parti, come pagine dei produttori o fornitori di pagamento. Non siamo responsabili per il contenuto, le politiche o le pratiche di siti web di terze parti.",
    s13Heading: "13. Modifiche a queste condizioni",
    s13: "Possiamo aggiornare periodicamente queste condizioni per riflettere modifiche ai nostri servizi o requisiti legali. La versione in vigore al momento dell'ordine si applica a quell'ordine. Le modifiche sostanziali saranno riportate in questa pagina con una data \u201cultimo aggiornamento\u201d aggiornata.",
    s14Heading: "14. Legge applicabile & controversie",
    s14: "Queste condizioni sono regolate dalla legge belga e dal diritto UE applicabile in materia di protezione dei consumatori, senza pregiudizio per eventuali disposizioni imperative di tutela del consumatore del suo paese di residenza. Le controversie possono anche essere sottoposte alla piattaforma UE di risoluzione online delle controversie indicata nella nostra nota legale.",
  },
  es: {
    s1Heading: "1. Parte contratante",
    s1Pre:
      "La tienda online 3DJools está operada por Ln-Squared, Rue du Chénia 17, 7170 Manage, Hainaut, Bélgica (n.º de empresa 0564.743.304, IVA BE0564743304). Las referencias a \u201cnosotros\u201d o al \u201cVendedor\u201d en estas condiciones significan Ln-Squared. Consulta nuestro",
    s1LinkPre: "aviso legal",
    s1Post: "para los datos de contacto completos. También puedes contactarnos directamente en",
    s2Heading: "2. Definiciones",
    s2: "\u201cCliente\u201d o \u201custed\u201d significa la persona o empresa que realiza un pedido a través de la tienda. \u201cBienes\u201d significa cualquier producto puesto a la venta en la tienda. \u201cPedido\u201d significa una solicitud de compra enviada y confirmada a través de nuestro proceso de pago.",
    s3Heading: "3. Ámbito de aplicación",
    s3: "Estas condiciones generales rigen todos los pedidos realizados a través de la tienda online 3DJools por consumidores y empresas dentro de la Unión Europea y territorios asociados.",
    s4Heading: "4. Precios & pago",
    s4: "Todos los precios están en euros (EUR) e incluyen el IVA legal cuando corresponda. Aceptamos transferencia SEPA, criptomoneda y pago a plazos sin intereses, tal como se describe en nuestra página de métodos de pago. El pago con tarjeta no está disponible temporalmente.",
    s5Heading: "5. Entrega",
    s5: "Los plazos y costes de entrega son los indicados en nuestra página de envíos. El riesgo se transfiere al consumidor en el momento de la entrega de los bienes.",
    s6Heading: "6. Derecho de desistimiento",
    s6: "Los consumidores tienen un derecho legal de desistimiento de 14 días, que 3DJools amplía voluntariamente a una política de devolución de 30 días, según se describe en nuestra política de devoluciones, que forma parte de estas condiciones.",
    s7Heading: "7. Garantía & responsabilidad",
    s7: "Los derechos de garantía legal se aplican a todos los bienes. Nada en estas condiciones limita la responsabilidad por muerte, lesiones personales o cualquier responsabilidad que no pueda excluirse conforme a la legislación aplicable.",
    s8Heading: "8. Responsabilidades & restricciones del usuario",
    s8: "Usted se compromete a proporcionar información precisa de pedido y cuenta, a utilizar la tienda únicamente con fines lícitos y a no intentar interrumpir, aplicar ingeniería inversa ni acceder sin autorización a nuestros sistemas. Podemos cancelar pedidos o suspender cuentas que incumplan estas condiciones.",
    s9Heading: "9. Cookies",
    s9Pre:
      "Nuestra tienda utiliza cookies para operar el carrito de compra, mantenerle conectado y entender cómo se utiliza el sitio. Los detalles de las cookies que utilizamos y cómo gestionar sus preferencias se detallan en nuestra",
    s9Post: ".",
    s10Heading: "10. Sus sugerencias",
    s10: "Si nos envía comentarios, ideas o sugerencias sobre nuestros productos o tienda, acepta que podamos utilizarlos sin restricción ni compensación alguna hacia usted.",
    s11Heading: "11. Su consentimiento",
    s11Pre: "Al utilizar esta tienda y realizar un pedido, usted consiente estas condiciones y nuestra",
    s11Post: ".",
    s12Heading: "12. Enlaces a otros sitios web",
    s12: "Nuestra tienda puede contener enlaces a sitios web de terceros, como páginas de fabricantes o proveedores de pago. No somos responsables del contenido, políticas o prácticas de ningún sitio web de terceros.",
    s13Heading: "13. Cambios en estas condiciones",
    s13: "Podemos actualizar estas condiciones periódicamente para reflejar cambios en nuestros servicios o requisitos legales. La versión vigente en el momento de realizar su pedido se aplicará a dicho pedido. Los cambios sustanciales se reflejarán en esta página con una fecha de \u201cúltima actualización\u201d renovada.",
    s14Heading: "14. Ley aplicable & disputas",
    s14: "Estas condiciones se rigen por las leyes de Bélgica y el derecho de protección al consumidor de la UE aplicable, sin perjuicio de cualquier disposición imperativa de protección al consumidor del país de residencia del consumidor. Las disputas también pueden presentarse en la plataforma de resolución de disputas en línea de la UE mencionada en nuestro aviso legal.",
  },
  nl: {
    s1Heading: "1. Contractpartij",
    s1Pre:
      "De webshop 3DJools wordt beheerd door Ln-Squared, Rue du Chénia 17, 7170 Manage, Hainaut, België (ondernemingsnummer 0564.743.304, btw-nummer BE0564743304). Verwijzingen naar \u201cwij\u201d, \u201cons\u201d of de \u201cVerkoper\u201d in deze voorwaarden betekenen Ln-Squared. Raadpleeg ons",
    s1LinkPre: "impressum",
    s1Post: "voor volledige contactgegevens. U kunt ons ook rechtstreeks bereiken via",
    s2Heading: "2. Definities",
    s2: "\u201cKlant\u201d of \u201cu\u201d betekent de persoon of onderneming die via de webshop een bestelling plaatst. \u201cGoederen\u201d betekent elk product dat te koop wordt aangeboden op de webshop. \u201cBestelling\u201d betekent een aankoopverzoek dat via onze checkout is ingediend en bevestigd.",
    s3Heading: "3. Toepassingsgebied",
    s3: "Deze algemene voorwaarden zijn van toepassing op alle bestellingen die via de webshop van 3DJools worden geplaatst door consumenten en ondernemingen binnen de Europese Unie en aanverwante gebieden.",
    s4Heading: "4. Prijzen & betaling",
    s4: "Alle prijzen zijn in euro (EUR) en zijn inclusief wettelijke btw waar van toepassing. Wij aanvaarden SEPA-overschrijving, cryptovaluta en rentevrije gespreide betaling zoals beschreven op onze pagina met betaalmethoden. Betalen met kaart is momenteel niet beschikbaar.",
    s5Heading: "5. Levering",
    s5: "Levertijden en -kosten staan vermeld op onze verzendpagina. Het risico gaat over op de consument bij levering van de goederen.",
    s6Heading: "6. Herroepingsrecht",
    s6: "Consumenten hebben een wettelijk herroepingsrecht van 14 dagen, dat 3DJools vrijwillig uitbreidt tot een retourbeleid van 30 dagen zoals beschreven in ons retourbeleid, dat deel uitmaakt van deze voorwaarden.",
    s7Heading: "7. Garantie & aansprakelijkheid",
    s7: "Op alle goederen zijn de wettelijke garantierechten van toepassing. Niets in deze voorwaarden beperkt de aansprakelijkheid voor overlijden, persoonlijk letsel of enige aansprakelijkheid die niet kan worden uitgesloten onder toepasselijk recht.",
    s8Heading: "8. Verantwoordelijkheden & beperkingen van de gebruiker",
    s8: "U stemt ermee in juiste bestel- en accountgegevens te verstrekken, de webshop alleen voor rechtmatige doeleinden te gebruiken en niet te proberen onze systemen te verstoren, te reverse-engineeren of ongeoorloofd toegang te verkrijgen. Wij kunnen bestellingen annuleren of accounts opschorten die deze voorwaarden overtreden.",
    s9Heading: "9. Cookies",
    s9Pre:
      "Onze webshop gebruikt cookies om het winkelwagentje te laten werken, u ingelogd te houden en te begrijpen hoe de site wordt gebruikt. Details over de cookies die we gebruiken en hoe u uw voorkeuren beheert, staan in ons",
    s9Post: ".",
    s10Heading: "10. Uw suggesties",
    s10: "Als u ons feedback, ideeën of suggesties stuurt over onze producten of webshop, gaat u ermee akkoord dat wij deze zonder beperking en zonder vergoeding aan u mogen gebruiken.",
    s11Heading: "11. Uw toestemming",
    s11Pre: "Door deze webshop te gebruiken en een bestelling te plaatsen, stemt u in met deze voorwaarden en met ons",
    s11Post: ".",
    s12Heading: "12. Links naar andere websites",
    s12: "Onze webshop kan links bevatten naar websites van derden, zoals fabrikantenpagina's of betalingsdienstverleners. Wij zijn niet verantwoordelijk voor de inhoud, het beleid of de praktijken van websites van derden.",
    s13Heading: "13. Wijzigingen in deze voorwaarden",
    s13: "Wij kunnen deze voorwaarden van tijd tot tijd bijwerken om wijzigingen in onze diensten of wettelijke vereisten te weerspiegelen. De versie die geldt op het moment dat u een bestelling plaatst, is van toepassing op die bestelling. Materiële wijzigingen worden op deze pagina weergegeven met een bijgewerkte datum \u201claatst bijgewerkt\u201d.",
    s14Heading: "14. Toepasselijk recht & geschillen",
    s14: "Deze voorwaarden worden beheerst door het Belgische recht en het toepasselijke EU-consumentenbeschermingsrecht, onverminderd dwingende consumentenbeschermingsbepalingen van het land van verblijf van de consument. Geschillen kunnen ook worden voorgelegd aan het EU-platform voor onlinegeschillenbeslechting, vermeld in ons impressum.",
  },
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : "en"
  const dict = await getDictionary(locale)
  return { title: dict.footer.terms }
}

export default async function TermsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : "en"
  const dict = await getDictionary(locale)
  const t = COPY[locale]

  return (
    <ProsePage
      locale={locale}
      dict={dict}
      title={dict.footer.terms}
      crumbs={[{ label: dict.common.home, href: "/" }, { label: dict.footer.terms }]}
    >
      <ProseSection heading={t.s1Heading}>
        <p>
          {t.s1Pre}{" "}
          <Link href={localizedPath(locale, "/impressum")} className="underline underline-offset-2">
            {dict.footer.impressum}
          </Link>{" "}
          {t.s1Post}{" "}
          <a href="mailto:info@3djools.com" className="underline underline-offset-2 hover:text-foreground">
            info@3djools.com
          </a>
          .
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
        <p>
          {t.s9Pre}{" "}
          <Link href={localizedPath(locale, "/cookie-policy")} className="underline underline-offset-2">
            {dict.footer.cookies}
          </Link>
          {t.s9Post}
        </p>
      </ProseSection>
      <ProseSection heading={t.s10Heading}>
        <p>{t.s10}</p>
      </ProseSection>
      <ProseSection heading={t.s11Heading}>
        <p>
          {t.s11Pre}{" "}
          <Link href={localizedPath(locale, "/privacy")} className="underline underline-offset-2">
            {dict.footer.privacy}
          </Link>
          {t.s11Post}
        </p>
      </ProseSection>
      <ProseSection heading={t.s12Heading}>
        <p>{t.s12}</p>
      </ProseSection>
      <ProseSection heading={t.s13Heading}>
        <p>{t.s13}</p>
      </ProseSection>
      <ProseSection heading={t.s14Heading}>
        <p>{t.s14}</p>
      </ProseSection>
    </ProsePage>
  )
}
