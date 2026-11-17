import Link from "next/link"
import { CARD_CHECKOUT_ENABLED } from "@/lib/payments/cardholder"
import { BANK_TRANSFER_CHECKOUT_ENABLED } from "@/lib/payments/bank-transfer"
import { isLocale, type Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { localizedPath } from "@/lib/i18n/paths"
import { ProsePage, ProseSection } from "@/components/legal/prose-page"
import { COMPANY, fillCompany } from "@/lib/company"

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
    s1Heading: "1. Seller & operator",
    s1Pre:
      "The DnD3D online storefront is owned and operated by {legalName}, registered at {street}, {postalCode} {city}, Netherlands (KvK {companyNumber}, VAT {vat}). Throughout these terms, \u201cwe\u201d, \u201cus\u201d, and the \u201cSeller\u201d refer to {legalName}. Full corporate registry entries are published in our",
    s1LinkPre: "legal notice",
    s1Post: "and you may contact our team directly at",
    s2Heading: "2. Key definitions",
    s2: "\u201cCustomer\u201d, \u201cyou\u201d, or \u201cyour\u201d designates any consumer or business entity submitting an order on this website. \u201cGoods\u201d refers to any hardware, consumable, or accessory offered in our catalogue. \u201cOrder\u201d means a binding purchase request completed and confirmed through our checkout.",
    s3Heading: "3. Applicability",
    s3: "These general terms and conditions apply to every purchase made on the DnD3D online store by private consumers and commercial buyers located in the European Union and supported neighbouring countries.",
    s4Heading: "4. Pricing & accepted payment methods",
    s4: "Every price listed in the store is stated in euro (EUR) and includes applicable statutory VAT. We accept Visa and Mastercard, instant bank payments via Open Banking, SEPA bank transfers, and 4\u00d7 interest-free instalments as outlined on our payment methods page.",
    s5Heading: "5. Shipping & transfer of risk",
    s5: "Preparation windows, transit estimates, and free delivery terms are set out on our shipping page. For consumer purchases, the risk of accidental loss or damage passes to you once the parcel is delivered to your address.",
    s6Heading: "6. Right of withdrawal & 30-day return guarantee",
    s6: "Consumers enjoy a mandatory 14-day EU right of withdrawal without giving a reason, which we voluntarily extend to 30 calendar days from delivery in accordance with our returns policy (forming an integral part of these terms). We accept returns of both defective and non-defective items in new, original condition and packaging; direct exchanges are not offered. Approved returns are refunded to the original payment method within 7 working days of receipt and inspection.",
    s7Heading: "7. Statutory warranty & liability",
    s7: "All Goods are covered by the mandatory EU statutory 2-year warranty against lack of conformity. Nothing in these terms excludes or restricts liability for death, personal injury, or any other statutory liability that cannot be waived under applicable law.",
    s8Heading: "8. Acceptable use & customer obligations",
    s8: "By using this store, you undertake to supply accurate billing, delivery, and account details, to use the platform strictly for lawful purposes, and not to interfere with, scrape, reverse-engineer, or attempt unauthorised access to our infrastructure. We reserve the right to cancel orders or restrict accounts that breach these rules.",
    s9Heading: "9. Use of cookies",
    s9Pre:
      "We rely on essential cookies to keep your shopping basket and sign-in session working, and optional analytics cookies (only with your consent) to improve the store. Full details and preference controls are available in our",
    s9Post: ".",
    s10Heading: "10. Product feedback & suggestions",
    s10: "Where you voluntarily submit reviews, product ideas, or store feedback to us, you grant us permission to use and implement those suggestions without restriction or financial compensation.",
    s11Heading: "11. Acceptance of terms & privacy notice",
    s11Pre: "By browsing the store and completing an order at checkout, you confirm your agreement to these terms and acknowledge our",
    s11Post: ".",
    s12Heading: "12. External links",
    s12: "Product pages and support articles may reference external websites operated by hardware manufacturers, couriers, or payment institutions. We have no control over — and accept no responsibility for — the content or privacy practices of third-party sites.",
    s13Heading: "13. Updates to these terms",
    s13: "We may revise these terms periodically to reflect operational changes or new legal requirements. Each order is governed by the version in force at the moment checkout is completed. Substantive updates will appear on this page together with a revised \u201clast updated\u201d date.",
    s14Heading: "14. Governing law & dispute resolution",
    s14: "These terms and any contract formed under them are governed by the laws of the Netherlands and applicable EU consumer protection law, without limiting any mandatory consumer rights of your country of residence. You may also access the European Commission's Online Dispute Resolution portal linked in our legal notice.",
  },
  de: {
    s1Heading: "1. Verkäufer & Betreiber",
    s1Pre:
      "Der Onlineshop DnD3D wird betrieben von der {legalName}, {street}, {postalCode} {city}, Niederlande (KvK {companyNumber}, USt-IdNr. {vat}). Soweit in diesen Bedingungen von \u201cwir\u201d, \u201cuns\u201d oder dem \u201cVerkäufer\u201d die Rede ist, ist damit die {legalName} gemeint. Sämtliche Registerangaben finden Sie in unserem",
    s1LinkPre: "Impressum",
    s1Post: "; direkt erreichen Sie uns zudem unter",
    s2Heading: "2. Begriffsdefinitionen",
    s2: "\u201cKunde\u201d oder \u201cSie\u201d bezeichnet jede Privatperson oder jedes Unternehmen, das über diesen Shop bestellt. \u201cWare\u201d umfasst sämtliche im Katalog angebotenen Geräte, Materialien und Zubehörteile. \u201cBestellung\u201d meint einen über den Checkout verbindlich abgeschlossenen Kaufauftrag.",
    s3Heading: "3. Geltungsbereich",
    s3: "Diese Allgemeinen Geschäftsbedingungen regeln sämtliche Einkäufe, die Verbraucher und Geschäftskunden innerhalb der Europäischen Union sowie unterstützter Nachbarstaaten über den DnD3D-Onlineshop tätigen.",
    s4Heading: "4. Preise & Zahlungsmöglichkeiten",
    s4: "Alle Katalogpreise lauten auf Euro (EUR) und verstehen sich inklusive der gesetzlichen Mehrwertsteuer, sofern anwendbar. Wir akzeptieren Visa und Mastercard, Direktzahlungen per Open Banking, SEPA-Banküberweisungen sowie die 4\u00d7 zinsfreie Ratenzahlung.",
    s5Heading: "5. Versand & Gefahrübergang",
    s5: "Bearbeitungszeiten, Lieferfristen und die Bedingungen unseres kostenlosen Versands sind auf unserer Versandseite erläutert. Bei Verbraucherkäufen geht die Gefahr des zufälligen Untergangs oder der Verschlechterung erst mit der Übergabe der Sendung an Sie über.",
    s6Heading: "6. Widerrufsrecht & 30-Tage-Rückgabegarantie",
    s6: "Verbrauchern steht das gesetzliche 14-tägige EU-Widerrufsrecht zu, das wir freiwillig auf 30 Tage ab Warenerhalt erweitern — nähere Einzelheiten regelt unsere Rückgaberichtlinie, die Teil dieser Bedingungen ist. Zurückgenommen werden sowohl mangelfreie als auch defekte Artikel im unbenutzten Originalzustand samt Originalverpackung; ein direkter Umtausch erfolgt nicht. Nach Eingang und Prüfung der Retoure erstatten wir den Betrag innerhalb von 7 Werktagen.",
    s7Heading: "7. Gesetzliche Gewährleistung & Haftung",
    s7: "Auf sämtliche Waren finden die gesetzlichen zweijährigen EU-Gewährleistungsrechte Anwendung. Keine Regelung dieser Bedingungen schließt die Haftung für Schäden aus der Verletzung des Lebens, des Körpers oder der Gesundheit oder sonstige gesetzlich zwingende Haftungsansprüche aus.",
    s8Heading: "8. Nutzungsregeln & Pflichten des Kunden",
    s8: "Sie verpflichten sich, bei der Registrierung und Bestellung wahrheitsgemäße Angaben zu machen, den Shop ausschließlich im Rahmen der Gesetze zu nutzen und keinerlei Eingriffe, Reverse Engineering oder unbefugte Zugriffe auf unsere technischen Systeme vorzunehmen. Bei Verstößen sind wir berechtigt, Bestellungen zu stornieren oder Benutzerkonten zu sperren.",
    s9Heading: "9. Einsatz von Cookies",
    s9Pre:
      "Wir setzen technisch notwendige Cookies für Warenkorb, Sitzung und Sicherheit sowie — nach Ihrer ausdrücklichen Einwilligung — Analyse-Cookies zur Optimierung des Shops ein. Alle Details und Einstellungsmöglichkeiten finden Sie in unserer",
    s9Post: ".",
    s10Heading: "10. Feedback & Verbesserungsvorschläge",
    s10: "Übermitteln Sie uns freiwillig Ideen, Bewertungen oder Anregungen zu unserem Sortiment oder Shop, räumen Sie uns das Recht ein, diese unentgeltlich und ohne zeitliche oder räumliche Beschränkung zu nutzen.",
    s11Heading: "11. Einverständnis mit AGB & Datenschutz",
    s11Pre: "Mit der Nutzung unseres Onlineshops und dem Abschluss einer Bestellung akzeptieren Sie diese Geschäftsbedingungen und nehmen unsere",
    s11Post: " zur Kenntnis.",
    s12Heading: "12. Verweise auf Drittwebsites",
    s12: "Unser Angebot kann Links zu externen Seiten Dritter enthalten, etwa zu Herstellerdokumentationen oder Zahlungsdienstleistern. Für Inhalte, Verfügbarkeit und Datenschutzpraktiken fremder Websites übernehmen wir keine Haftung.",
    s13Heading: "13. Anpassung dieser Bedingungen",
    s13: "Wir behalten uns vor, diese Bedingungen bei geänderten Abläufen oder neuen gesetzlichen Vorgaben anzupassen. Maßgeblich für Ihren Einkauf ist stets die zum Zeitpunkt des Bestellabschlusses gültige Fassung. Wesentliche Änderungen werden mit aktualisiertem Stand-Datum auf dieser Seite veröffentlicht.",
    s14Heading: "14. Anwendbares Recht & Gerichtsstand",
    s14: "Es gilt das Recht der Niederlande sowie das einschlägige EU-Verbraucherschutzrecht, wobei zwingende Schutzvorschriften Ihres Wohnsitzstaates unberührt bleiben. Hinweise zur EU-Plattform für Online-Streitbeilegung entnehmen Sie bitte unserem Impressum.",
  },
  fr: {
    s1Heading: "1. Identité du vendeur",
    s1Pre:
      "La boutique en ligne DnD3D est éditée et exploitée par {legalName}, sise {street}, {postalCode} {city}, Pays-Bas (KvK {companyNumber}, TVA {vat}). Dans les présentes conditions, les termes \u201cnous\u201d ou le \u201cVendeur\u201d désignent {legalName}. L'ensemble des informations légales figure dans notre",
    s1LinkPre: "mention légale",
    s1Post: "et vous pouvez nous écrire directement à",
    s2Heading: "2. Définitions clés",
    s2: "\u201cClient\u201d ou \u201cvous\u201d désigne toute personne physique ou morale passant commande sur le site. \u201cMarchandises\u201d désigne tout équipement, consommable ou accessoire proposé au catalogue. \u201cCommande\u201d désigne tout achat validé et confirmé à l'issue du parcours de paiement.",
    s3Heading: "3. Champ d'application",
    s3: "Les présentes conditions générales s'appliquent à l'ensemble des commandes passées sur la boutique DnD3D par des consommateurs particuliers ou des acheteurs professionnels établis dans l'Union européenne et les pays voisins desservis.",
    s4Heading: "4. Tarifs & modalités de paiement",
    s4: "Les prix affichés sur le site sont libellés en euros (EUR) et incluent la TVA légale applicable. Nous acceptons les cartes Visa et Mastercard, le paiement bancaire instantané Open Banking, le virement SEPA et le paiement en 4\u00d7 sans frais.",
    s5Heading: "5. Expédition & transfert des risques",
    s5: "Les délais de préparation, d'acheminement et la gratuité des frais de port sont précisés sur notre page de livraison. Pour les consommateurs, le risque de perte ou d'endommagement est transféré au moment de la remise physique du colis.",
    s6Heading: "6. Droit de rétractation & retour sous 30 jours",
    s6: "Tout consommateur bénéficie du délai légal européen de rétractation de 14 jours sans justification, que nous portons volontairement à 30 jours calendaires après réception conformément à notre politique de retour (qui fait partie intégrante des présentes conditions). Les retours de produits défectueux comme non défectueux sont acceptés s'ils sont neufs et dans leur emballage d'origine ; les échanges ne sont pas proposés. Le remboursement intervient sous 7 jours ouvrés après réception et vérification du retour.",
    s7Heading: "7. Garanties légales & responsabilité",
    s7: "Toutes les Marchandises bénéficient de la garantie légale européenne de conformité de 2 ans. Aucune stipulation des présentes n'exclut ou ne limite notre responsabilité en cas de décès, de dommage corporel ou dans tout cas où la loi interdit une telle limitation.",
    s8Heading: "8. Obligations de l'utilisateur & usage conforme",
    s8: "Vous vous engagez à communiquer des informations exactes lors de vos commandes, à utiliser la boutique dans le respect des lois en vigueur et à ne pas tenter d'altérer, de décompiler ou d'accéder de manière non autorisée à nos systèmes. Nous pouvons annuler toute commande ou suspendre tout compte contrevenant à ces règles.",
    s9Heading: "9. Gestion des cookies",
    s9Pre:
      "Nous utilisons des cookies indispensables au fonctionnement du panier et de votre session, ainsi que des cookies analytiques soumis à votre consentement. Le détail des traceurs et le gestionnaire de préférences sont accessibles dans notre",
    s9Post: ".",
    s10Heading: "10. Avis & suggestions",
    s10: "Si vous nous transmettez spontanément des idées, retours d'expérience ou suggestions concernant nos produits ou notre site, vous acceptez que nous puissions les exploiter librement et sans contrepartie financière.",
    s11Heading: "11. Acceptation des conditions & confidentialité",
    s11Pre: "En naviguant sur la boutique et en validant une commande, vous acceptez les présentes conditions générales ainsi que notre",
    s11Post: ".",
    s12Heading: "12. Liens hypertextes externes",
    s12: "Notre site peut renvoyer vers des pages tierces, notamment celles de fabricants ou de prestataires de paiement. Nous déclinons toute responsabilité quant au contenu ou aux pratiques de ces sites externes.",
    s13Heading: "13. Révision des conditions générales",
    s13: "Nous pouvons faire évoluer les présentes conditions afin de tenir compte des changements réglementaires ou techniques. Les conditions applicables à une commande restent celles en vigueur au jour de sa validation. Toute modification majeure sera accompagnée d'une mise à jour de la date figurant en haut de page.",
    s14Heading: "14. Droit applicable & règlement des litiges",
    s14: "Les présentes conditions sont soumises au droit des Pays-Bas et au droit européen de la consommation, sans préjudice des dispositions impératives protectrices du pays de résidence du consommateur. Les litiges peuvent également être portés sur la plateforme européenne de règlement en ligne des litiges mentionnée dans notre mention légale.",
  },
  it: {
    s1Heading: "1. Identità del venditore",
    s1Pre:
      "Lo store online DnD3D è gestito da {legalName}, con sede in {street}, {postalCode} {city}, Paesi Bassi (KvK {companyNumber}, P.IVA {vat}). Nei presenti termini, i pronomi \u201cnoi\u201d o il termine \u201cVenditore\u201d indicano {legalName}. I dati societari completi sono consultabili nella nostra",
    s1LinkPre: "nota legale",
    s1Post: "ed è possibile scriverci direttamente a",
    s2Heading: "2. Definizioni principali",
    s2: "\u201cCliente\u201d o \u201ctu\u201d indica la persona fisica o giuridica che invia un ordine sul sito. \u201cMerce\u201d indica qualsiasi stampante, materiale di consumo o accessorio offerto nel catalogo. \u201cOrdine\u201d indica una proposta d'acquisto completata e confermata tramite la procedura di checkout.",
    s3Heading: "3. Ambito di validità",
    s3: "Le presenti condizioni generali disciplinano tutti gli acquisti effettuati sullo store online DnD3D da consumatori e clienti aziendali situati nell'Unione Europea e nei Paesi limitrofi serviti.",
    s4Heading: "4. Prezzi & modalità di pagamento",
    s4: "Tutti i prezzi sono espressi in euro (EUR) e comprendono l'IVA di legge, ove applicabile. Accettiamo carte Visa e Mastercard, pagamento bancario istantaneo Open Banking, bonifico SEPA e rateizzazione in 4\u00d7 senza interessi.",
    s5Heading: "5. Spedizione & passaggio del rischio",
    s5: "I tempi di preparazione, di consegna e la gratuità della spedizione sono illustrati nella pagina dedicata alle spedizioni. Nei contratti con i consumatori, il rischio di perdita o danneggiamento si trasferisce all'acquirente al momento della consegna fisica dei beni.",
    s6Heading: "6. Diritto di recesso & reso esteso a 30 giorni",
    s6: "Ai consumatori spetta il diritto legale UE di recesso entro 14 giorni senza obbligo di motivazione, che estendiamo volontariamente a 30 giorni dalla consegna secondo la nostra politica di restituzione (parte integrante di queste condizioni). Accettiamo resi sia di articoli difettosi sia non difettosi, purché nuovi e nell'imballo originale; non si effettuano cambi. Il rimborso viene erogato entro 7 giorni lavorativi dal ricevimento e dal controllo del reso.",
    s7Heading: "7. Garanzia legale & responsabilità",
    s7: "Tutta la Merce è coperta dalla garanzia legale europea di 2 anni contro i difetti di conformità. Nessuna clausola delle presenti condizioni limita o esclude la responsabilità per morte, lesioni personali o altre ipotesi inderogabili per legge.",
    s8Heading: "8. Obblighi dell'utente & corretto utilizzo",
    s8: "L'utente si impegna a fornire dati veritieri in fase di registrazione e ordine, a utilizzare il sito esclusivamente per finalità lecite e a non tentare di compromettere, decompilare o violare la sicurezza dei nostri sistemi. Ci riserviamo la facoltà di annullare gli ordini o sospendere gli account che violino tali regole.",
    s9Heading: "9. Utilizzo dei cookie",
    s9Pre:
      "Questo sito impiega cookie tecnici necessari al funzionamento del carrello e dell'autenticazione, oltre a cookie analitici attivati solo previo consenso. Per maggiori informazioni e per modificare le scelte, consulta la nostra",
    s9Post: ".",
    s10Heading: "10. Suggerimenti & commenti",
    s10: "Qualora ci invii spontaneamente idee, recensioni o suggerimenti relativi ai prodotti o al negozio, accetti che possiamo utilizzarli liberamente senza alcun obbligo di compenso.",
    s11Heading: "11. Accettazione dei termini & privacy",
    s11Pre: "Navigando sullo store e confermando un ordine, dichiari di accettare le presenti condizioni generali e di aver preso visione della nostra",
    s11Post: ".",
    s12Heading: "12. Collegamenti a siti esterni",
    s12: "Le pagine dello store possono includere link a siti di terze parti, come portali dei produttori o istituti di pagamento. Non rispondiamo dei contenuti né delle informative adottate da tali siti esterni.",
    s13Heading: "13. Aggiornamento delle condizioni",
    s13: "Potremo modificare periodicamente le presenti condizioni per adeguarle a novità operative o normative. A ciascun ordine si applica il testo in vigore al momento dell'invio dell'ordine stesso. Le modifiche rilevanti saranno segnalate aggiornando la data di revisione in pagina.",
    s14Heading: "14. Legge applicabile & foro competente",
    s14: "Le presenti condizioni sono regolate dal diritto dei Paesi Bassi e dalla normativa UE sulla tutela dei consumatori, fatte salve le disposizioni inderogabili vigenti nel Paese di residenza del consumatore. È inoltre disponibile la piattaforma ODR della Commissione europea indicata nella nostra nota legale.",
  },
  es: {
    s1Heading: "1. Identificación del vendedor",
    s1Pre:
      "La tienda online DnD3D es titularidad de y está gestionada por {legalName}, con domicilio en {street}, {postalCode} {city}, Países Bajos (KvK {companyNumber}, IVA {vat}). En adelante, cualquier mención a \u201cnosotros\u201d o al \u201cVendedor\u201d se refiere a {legalName}. Puedes consultar todos los datos registrales en nuestro",
    s1LinkPre: "aviso legal",
    s1Post: "o escribirnos directamente a",
    s2Heading: "2. Definiciones",
    s2: "\u201cCliente\u201d o \u201ctú/usted\u201d designa a la persona física o jurídica que realiza una compra en la tienda. \u201cBienes\u201d abarca cualquier equipo, consumible o accesorio publicado en el catálogo. \u201cPedido\u201d significa una solicitud de compra completada y confirmada a través del proceso de pago.",
    s3Heading: "3. Ámbito de aplicación",
    s3: "Las presentes condiciones generales regulan todas las compras realizadas en la tienda online DnD3D tanto por consumidores particulares como por empresas dentro de la Unión Europea y países vecinos habilitados.",
    s4Heading: "4. Precios y medios de pago",
    s4: "Todos los precios figuran en euros (EUR) e incluyen el IVA legalmente aplicable. Admitimos pago con tarjeta Visa y Mastercard, pago bancario instantáneo Open Banking, transferencia SEPA y fraccionamiento en 4\u00d7 sin intereses.",
    s5Heading: "5. Entrega y transmisión del riesgo",
    s5: "Los plazos de preparación, tiempos de tránsito y la gratuidad del envío se detallan en nuestra página de envíos. En ventas a consumidores, el riesgo de pérdida o deterioro se transmite en el momento en que recibes físicamente el paquete.",
    s6Heading: "6. Derecho de desistimiento y devolución en 30 días",
    s6: "Los consumidores disponen del derecho legal europeo de desistimiento de 14 días sin necesidad de alegar motivo, plazo que ampliamos voluntariamente a 30 días naturales desde la entrega conforme a nuestra política de devoluciones (que forma parte integrante de estas condiciones). Se aceptan devoluciones de artículos defectuosos y no defectuosos en estado nuevo y con su embalaje original; no se realizan cambios directos. El reembolso se abona en un máximo de 7 días laborables tras recibir e inspeccionar la devolución.",
    s7Heading: "7. Garantía legal y responsabilidad",
    s7: "Todos los Bienes cuentan con la garantía legal europea de 2 años frente a faltas de conformidad. Ninguna cláusula de estas condiciones excluye ni limita la responsabilidad por fallecimiento, daños personales o cualquier otra responsabilidad que no pueda excluirse por ley.",
    s8Heading: "8. Uso permitido y obligaciones del usuario",
    s8: "Te comprometes a facilitar datos veraces de contacto, facturación y entrega, a utilizar la tienda únicamente con fines lícitos y a no intentar interferir, aplicar ingeniería inversa ni acceder sin autorización a nuestros sistemas. Podremos cancelar pedidos o suspender cuentas que vulneren estas normas.",
    s9Heading: "9. Uso de cookies",
    s9Pre:
      "Empleamos cookies técnicas necesarias para mantener activo el carrito y la sesión, así como cookies analíticas sujetas a tu consentimiento previo. Encontrarás toda la información y el panel de configuración en nuestra",
    s9Post: ".",
    s10Heading: "10. Comentarios y sugerencias",
    s10: "Si nos remites voluntariamente ideas, valoraciones o sugerencias sobre el catálogo o la tienda, aceptas que podamos implementarlas sin restricción ni compensación económica.",
    s11Heading: "11. Conformidad con las condiciones y privacidad",
    s11Pre: "Al navegar por la tienda y confirmar un pedido, manifiestas tu conformidad con estas condiciones generales y con nuestra",
    s11Post: ".",
    s12Heading: "12. Enlaces a sitios de terceros",
    s12: "La tienda puede incluir enlaces a páginas externas de fabricantes, transportistas o entidades de pago. No asumimos responsabilidad alguna por los contenidos ni las políticas de privacidad de dichos sitios de terceros.",
    s13Heading: "13. Modificación de las condiciones",
    s13: "Podremos actualizar estas condiciones para adaptarlas a mejoras operativas o cambios normativos. A cada pedido se le aplicará el texto vigente en el instante de su confirmación. Los cambios relevantes se publicarán en esta página actualizando la fecha de revisión.",
    s14Heading: "14. Legislación aplicable y resolución de litigios",
    s14: "Estas condiciones se rigen por la legislación de los Países Bajos y la normativa europea de protección al consumidor, respetando en todo caso las normas imperativas del país de residencia del consumidor. Asimismo, puedes acudir a la plataforma europea de resolución de litigios en línea indicada en nuestro aviso legal.",
  },
  nl: {
    s1Heading: "1. Verkoper & exploitant",
    s1Pre:
      "De online winkel DnD3D wordt geëxploiteerd door {legalName}, gevestigd te {street}, {postalCode} {city}, Nederland (KvK {companyNumber}, btw-nummer {vat}). Waar in deze voorwaarden wordt gesproken over \u201cwij\u201d, \u201cons\u201d of de \u201cVerkoper\u201d, wordt {legalName} bedoeld. Alle formele bedrijfsgegevens staan in ons",
    s1LinkPre: "impressum",
    s1Post: "en u kunt rechtstreeks contact opnemen via",
    s2Heading: "2. Kernbegrippen",
    s2: "\u201cKlant\u201d of \u201cu\u201d verwijst naar iedere consument of zakelijke koper die via de webshop een bestelling plaatst. \u201cGoederen\u201d omvat alle in de catalogus aangeboden apparaten, verbruiksmaterialen en accessoires. \u201cBestelling\u201d betekent een via de checkout ingediende en bevestigde aankoopopdracht.",
    s3Heading: "3. Toepasselijkheid",
    s3: "Deze algemene voorwaarden zijn van toepassing op alle aankopen die via de webshop van DnD3D worden gedaan door consumenten en bedrijven binnen de Europese Unie en ondersteunde buurlanden.",
    s4Heading: "4. Prijzen & betaalmethoden",
    s4: "Alle vermelde prijzen luiden in euro (EUR) en zijn inclusief de wettelijk geldende btw. Wij accepteren Visa en Mastercard, directe bankbetalingen via Open Banking, SEPA-bankoverschrijvingen en gespreide betaling in 4\u00d7 zonder rente.",
    s5Heading: "5. Verzending & risico-overgang",
    s5: "Verwerkingstijden, levertijden en de voorwaarden voor gratis verzending staan beschreven op onze verzendpagina. Bij consumentenkoop gaat het risico van beschadiging of verlies pas op u over zodra de goederen bij u zijn afgeleverd.",
    s6Heading: "6. Herroepingsrecht & 30 dagen retourgarantie",
    s6: "Consumenten hebben een wettelijke EU-bedenktijd van 14 dagen zonder opgave van reden, die wij vrijwillig verruimen naar 30 kalenderdagen na ontvangst volgens ons retourbeleid (dat onlosmakelijk deel uitmaakt van deze voorwaarden). Zowel niet-defecte als defecte producten kunnen worden geretourneerd mits nieuw en in de originele verpakking; direct omruilen is niet mogelijk. Na ontvangst en controle van de retourzending betalen wij het bedrag binnen 7 werkdagen terug.",
    s7Heading: "7. Wettelijke garantie & aansprakelijkheid",
    s7: "Op alle Goederen rust de wettelijke Europese garantie van 2 jaar op conformiteit. Niets in deze voorwaarden beperkt of sluit onze aansprakelijkheid uit voor overlijden, lichamelijk letsel of enige andere aansprakelijkheid die wettelijk niet kan worden uitgesloten.",
    s8Heading: "8. Verplichtingen van de gebruiker",
    s8: "U verklaart bij bestelling en registratie correcte gegevens aan te leveren, de webshop uitsluitend voor rechtmatige doeleinden te gebruiken en geen pogingen te ondernemen om onze systemen te verstoren, te decompileren of ongeautoriseerd te benaderen. Bij misbruik kunnen wij bestellingen annuleren of accounts blokkeren.",
    s9Heading: "9. Gebruik van cookies",
    s9Pre:
      "Wij plaatsen noodzakelijke cookies voor het functioneren van de winkelwagen en inlogsessie, en — na uw toestemming — analytische cookies om de webshop te verbeteren. Meer uitleg en uw instellingen vindt u in ons",
    s9Post: ".",
    s10Heading: "10. Feedback & suggesties",
    s10: "Wanneer u ons op eigen initiatief ideeën, beoordelingen of verbetersuggesties stuurt over ons assortiment of onze webshop, mogen wij deze vrij en zonder vergoeding toepassen.",
    s11Heading: "11. Instemming met voorwaarden & privacybeleid",
    s11Pre: "Door gebruik te maken van deze webshop en een bestelling te plaatsen, gaat u akkoord met deze voorwaarden en ons",
    s11Post: ".",
    s12Heading: "12. Verwijzingen naar externe websites",
    s12: "Onze winkel kan links bevatten naar websites van derden, zoals fabrikanten of betaaldienstverleners. Wij zijn niet verantwoordelijk voor de inhoud, beschikbaarheid of het beleid van externe websites.",
    s13Heading: "13. Wijziging van deze voorwaarden",
    s13: "Wij kunnen deze voorwaarden aanpassen wanneer onze dienstverlening of wet- en regelgeving verandert. Op uw bestelling zijn steeds de voorwaarden van toepassing die golden op het moment van bestellen. Belangrijke wijzigingen worden op deze pagina gepubliceerd met een nieuwe revisiedatum.",
    s14Heading: "14. Toepasselijk recht & geschillen",
    s14: "Op deze voorwaarden en elke overeenkomst is het Nederlands recht en het toepasselijke EU-consumentenrecht van toepassing, onverminderd dwingendrechtelijke consumentenbescherming in uw woonland. Geschillen kunnen tevens worden aangemeld via het Europese ODR-platform dat in ons impressum wordt genoemd.",
  },
}

const CARD_OFF_TERMS: Record<Locale, string> = {
  en: "Every price listed in the store is stated in euro (EUR) and includes applicable statutory VAT. Card checkout is temporarily offline. We currently accept SEPA bank transfers and 4× interest-free instalments as outlined on our payment methods page.",
  de: "Alle Katalogpreise lauten auf Euro (EUR) und verstehen sich inklusive der gesetzlichen Mehrwertsteuer, sofern anwendbar. Die Kartenzahlung ist vorübergehend deaktiviert. Wir akzeptieren derzeit SEPA-Banküberweisungen sowie die 4× zinsfreie Ratenzahlung gemäß unserer Seite zu den Zahlungsarten.",
  fr: "Les prix affichés sur le site sont libellés en euros (EUR) et incluent la TVA légale applicable. Le paiement par carte est momentanément indisponible. Nous acceptons le virement SEPA et le paiement en 4× sans frais, détaillés sur notre page des moyens de paiement.",
  it: "Tutti i prezzi sono espressi in euro (EUR) e comprendono l'IVA di legge, ove applicabile. Il pagamento con carta è temporaneamente sospeso. Accettiamo bonifico SEPA e rateizzazione in 4× senza interessi, come descritto nella pagina dei metodi di pagamento.",
  es: "Todos los precios figuran en euros (EUR) e incluyen el IVA legalmente aplicable. El pago con tarjeta está temporalmente inactivo. Aceptamos transferencia SEPA y fraccionamiento en 4× sin intereses según se detalla en nuestra página de métodos de pago.",
  nl: "Alle vermelde prijzen luiden in euro (EUR) en zijn inclusief de wettelijk geldende btw. Betalen met kaart is tijdelijk niet beschikbaar. Wij accepteren SEPA-bankoverschrijvingen en gespreide betaling in 4× zonder rente zoals toegelicht op onze pagina met betaalmethoden.",
}

const CARD_TERMS: Record<Locale, string> = {
  en: BANK_TRANSFER_CHECKOUT_ENABLED
    ? "Every price listed in the store is stated in euro (EUR) and includes applicable statutory VAT. We accept Visa and Mastercard, instant bank payments via Open Banking, SEPA bank transfers, and 4× interest-free instalments as outlined on our payment methods page. Card and Open Banking transactions are completed on encrypted payment pages, and we never have access to your card number."
    : "Every price listed in the store is stated in euro (EUR) and includes applicable statutory VAT. We accept Visa and Mastercard, instant bank payments via Open Banking, and 4× interest-free instalments as outlined on our payment methods page. Card and Open Banking transactions are completed on encrypted payment pages, and we never have access to your card number.",
  de: BANK_TRANSFER_CHECKOUT_ENABLED
    ? "Alle Katalogpreise lauten auf Euro (EUR) und verstehen sich inklusive der gesetzlichen Mehrwertsteuer, sofern anwendbar. Wir akzeptieren Visa und Mastercard, Sofortzahlungen über Open Banking, SEPA-Banküberweisungen sowie die 4× zinsfreie Ratenzahlung gemäß unserer Seite zu den Zahlungsarten. Karten- und Open-Banking-Zahlungen erfolgen über verschlüsselte Zahlungsseiten; wir erhalten niemals Einblick in Ihre Kartennummer."
    : "Alle Katalogpreise lauten auf Euro (EUR) und verstehen sich inklusive der gesetzlichen Mehrwertsteuer, sofern anwendbar. Wir akzeptieren Visa und Mastercard, Sofortzahlungen über Open Banking sowie die 4× zinsfreie Ratenzahlung gemäß unserer Seite zu den Zahlungsarten. Karten- und Open-Banking-Zahlungen erfolgen über verschlüsselte Zahlungsseiten; wir erhalten niemals Einblick in Ihre Kartennummer.",
  fr: BANK_TRANSFER_CHECKOUT_ENABLED
    ? "Les prix affichés sur le site sont libellés en euros (EUR) et incluent la TVA légale applicable. Nous acceptons les cartes Visa et Mastercard, le paiement bancaire instantané Open Banking, le virement SEPA et le paiement en 4× sans frais, détaillés sur notre page des moyens de paiement. Les transactions par carte et Open Banking s'effectuent sur des pages sécurisées et nous n'avons jamais accès à votre numéro de carte."
    : "Les prix affichés sur le site sont libellés en euros (EUR) et incluent la TVA légale applicable. Nous acceptons les cartes Visa et Mastercard, le paiement bancaire instantané Open Banking et le paiement en 4× sans frais, détaillés sur notre page des moyens de paiement. Les transactions par carte et Open Banking s'effectuent sur des pages sécurisées et nous n'avons jamais accès à votre numéro de carte.",
  it: BANK_TRANSFER_CHECKOUT_ENABLED
    ? "Tutti i prezzi sono espressi in euro (EUR) e comprendono l'IVA di legge, ove applicabile. Accettiamo carte Visa e Mastercard, pagamento bancario istantaneo Open Banking, bonifico SEPA e rateizzazione in 4× senza interessi, come descritto nella pagina dei metodi di pagamento. Le operazioni con carta e Open Banking avvengono su pagine protette e non visualizziamo mai il numero della tua carta."
    : "Tutti i prezzi sono espressi in euro (EUR) e comprendono l'IVA di legge, ove applicabile. Accettiamo carte Visa e Mastercard, pagamento bancario istantaneo Open Banking e rateizzazione in 4× senza interessi, come descritto nella pagina dei metodi di pagamento. Le operazioni con carta e Open Banking avvengono su pagine protette e non visualizziamo mai il numero della tua carta.",
  es: BANK_TRANSFER_CHECKOUT_ENABLED
    ? "Todos los precios figuran en euros (EUR) e incluyen el IVA legalmente aplicable. Admitimos pago con tarjeta Visa y Mastercard, pago bancario instantáneo Open Banking, transferencia SEPA y fraccionamiento en 4× sin intereses según se detalla en nuestra página de métodos de pago. Los pagos con tarjeta y Open Banking se procesan en pasarelas cifradas y nunca vemos el número de tu tarjeta."
    : "Todos los precios figuran en euros (EUR) e incluyen el IVA legalmente aplicable. Admitimos pago con tarjeta Visa y Mastercard, pago bancario instantáneo Open Banking y fraccionamiento en 4× sin intereses según se detalla en nuestra página de métodos de pago. Los pagos con tarjeta y Open Banking se procesan en pasarelas cifradas y nunca vemos el número de tu tarjeta.",
  nl: BANK_TRANSFER_CHECKOUT_ENABLED
    ? "Alle vermelde prijzen luiden in euro (EUR) en zijn inclusief de wettelijk geldende btw. Wij accepteren Visa en Mastercard, directe bankbetalingen via Open Banking, SEPA-bankoverschrijvingen en gespreide betaling in 4× zonder rente zoals toegelicht op onze pagina met betaalmethoden. Kaart- en Open Banking-transacties verlopen via beveiligde betaalpagina's en wij krijgen uw kaartnummer nooit te zien."
    : "Alle vermelde prijzen luiden in euro (EUR) en zijn inclusief de wettelijk geldende btw. Wij accepteren Visa en Mastercard, directe bankbetalingen via Open Banking en gespreide betaling in 4× zonder rente zoals toegelicht op onze pagina met betaalmethoden. Kaart- en Open Banking-transacties verlopen via beveiligde betaalpagina's en wij krijgen uw kaartnummer nooit te zien.",
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
  const source = COPY[locale]
  const t = fillCompany({
    ...source,
    s4: CARD_CHECKOUT_ENABLED ? CARD_TERMS[locale] : CARD_OFF_TERMS[locale],
  })

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
          <a href={`mailto:${COMPANY.email}`} className="underline underline-offset-2 hover:text-foreground">
            {COMPANY.email}
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
