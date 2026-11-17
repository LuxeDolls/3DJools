import Link from "next/link"
import { isLocale, type Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { localizedPath } from "@/lib/i18n/paths"
import { ProsePage, ProseSection } from "@/components/legal/prose-page"
import { COMPANY, fillCompany } from "@/lib/company"

const LINK_CLASS = "underline underline-offset-2 hover:text-foreground"

type ListItem = { title: string; text: string }

type PrivacyCopy = {
  sectionWhoWeAre: string
  whoWeAre: string
  sectionDataWeCollect: string
  dataWeCollect: string
  sectionHowWeUse: string
  howWeUse: string
  sectionLegalBasis: string
  legalBasisIntro: string
  legalBasis: ListItem[]
  sectionProviders: string
  providersIntro: string
  providers: ListItem[]
  providersClosing: string
  sectionRetention: string
  retention: string
  sectionTransfers: string
  transfers: string
  sectionRights: string
  rightsIntro: string
  rights: string[]
  rightsContactBefore: string
  rightsContactAfter: string
  dpaBefore: string
  dpaAddress: string
  dpaAfter: string
  sectionCookies: string
  cookiesBefore: string
  cookiesLinkLabel: string
  cookiesAfter: string
  sectionChanges: string
  changes: string
  sectionContact: string
  contactBefore: string
  contactPhoneLabel: string
  contactAfter: string
}

const COPY: Record<Locale, PrivacyCopy> = {
  en: {
    sectionWhoWeAre: "Data controller",
    whoWeAre:
      "The DnD3D online store is managed by {legalName}, located at {street}, {postalCode} {city}, Netherlands (KvK {companyNumber}, VAT {vat}), acting as the data controller under applicable data-protection law. This notice sets out what personal information we gather, why we process it, and how we safeguard it in full compliance with the EU General Data Protection Regulation (GDPR).",
    sectionDataWeCollect: "Categories of personal data we collect",
    dataWeCollect:
      "When you place an order, apply for an instalment plan, open a support chat, or message us, we collect the details you supply — including your full name, delivery and billing addresses, email address, phone number, date of birth and billing region where required for card verification, and payment transaction references — together with technical identifiers such as IP address and cookies needed to operate and secure the storefront.",
    sectionHowWeUse: "Purposes of processing",
    howWeUse:
      "We process your information to fulfil and deliver your orders, verify payments, handle returns and warranty claims, respond to customer-support enquiries, and — only where you have opted in — send occasional store updates. We never sell or rent your personal data to third parties.",
    sectionLegalBasis: "GDPR legal bases",
    legalBasisIntro: "Every processing activity relies on one of the following lawful bases under Article 6 of the GDPR:",
    legalBasis: [
      { title: "Performance of a contract", text: "handling your order, payment verification, parcel delivery, or instalment sale agreement" },
      { title: "Compliance with a legal obligation", text: "archiving commercial invoices and accounting records under Dutch and EU tax regulations" },
      { title: "Legitimate interests", text: "protecting our checkout against fraud, maintaining network security, and running core site features" },
      { title: "Your consent", text: "delivering optional marketing messages and activating non-essential analytics cookies (withdrawable at any moment)" },
    ],
    sectionProviders: "Sub-processors & infrastructure partners",
    providersIntro:
      "To run the store reliably, we entrust limited personal data to vetted technical providers acting strictly under our instructions:",
    providers: [
      { title: "Vercel", text: "web application hosting and edge delivery" },
      { title: "Neon", text: "managed PostgreSQL database for customer accounts and order records" },
      { title: "Vercel Blob", text: "cloud object storage for catalogue media and uploaded documents" },
      { title: "Zoho Mail / Titan Email", text: "delivery of transactional emails, order receipts, and support correspondence" },
    ],
    providersClosing:
      "Every sub-processor is bound by a GDPR-compliant data processing agreement and is prohibited from using your information for its own purposes.",
    sectionRetention: "How long we retain data",
    retention:
      "Order and invoicing records are retained for the statutory period mandated by Dutch tax and commercial law (typically up to 10 years). Customer account profiles remain stored while your account is active, and consent-based analytics or marketing data is kept for up to 14 months or until you withdraw consent. Once a retention period expires, the data is permanently erased or anonymised.",
    sectionTransfers: "Cross-border data transfers",
    transfers:
      "Personal data is processed primarily within the European Economic Area (EEA). Whenever a technical, payment, or logistics partner processes data outside the EEA, we protect the transfer through European Commission adequacy decisions or Standard Contractual Clauses (SCCs).",
    sectionRights: "Your data-protection rights",
    rightsIntro: "Under the GDPR, you are entitled at any time to:",
    rights: [
      "Request a copy of the personal data we hold about you (right of access)",
      "Have inaccurate or incomplete details rectified",
      "Ask for your personal data to be erased (\u201cright to be forgotten\u201d), subject to statutory retention duties",
      "Receive your data in a structured, machine-readable format (data portability)",
      "Object to or request a restriction of specific processing activities, including direct marketing",
      "Withdraw any previously granted consent at any time with future effect",
      "Submit a formal complaint to a supervisory data-protection authority",
    ],
    rightsContactBefore: "To exercise any of these rights, simply email us at ",
    rightsContactAfter: ".",
    dpaBefore:
      "Because our company is incorporated in the Netherlands, our lead supervisory authority is the Dutch Data Protection Authority (Autoriteit Persoonsgegevens), ",
    dpaAddress: "Postbus 93374, 2509 AJ The Hague, Netherlands",
    dpaAfter: " — ",
    sectionCookies: "Cookies & tracking technologies",
    cookiesBefore:
      "We use strictly necessary cookies to keep the storefront functional and, only after your opt-in, analytics cookies to measure site performance. You can review or change your preferences at any time in our ",
    cookiesLinkLabel: "cookie policy",
    cookiesAfter: ".",
    sectionChanges: "Updates to this privacy notice",
    changes:
      "We may revise this privacy policy periodically to reflect changes in our technical setup or applicable privacy laws. Any significant update will be published on this page with a new revision date.",
    sectionContact: "Privacy contact details",
    contactBefore: "For any privacy-related enquiry or data request, reach {legalName} by email at ",
    contactPhoneLabel: ", by telephone on {phone}, or by post at {street}, {postalCode} {city}, Netherlands.",
    contactAfter: "",
  },
  de: {
    sectionWhoWeAre: "Verantwortliche Stelle",
    whoWeAre:
      "Verantwortlicher für die Datenverarbeitung im Onlineshop DnD3D ist die {legalName}, {street}, {postalCode} {city}, Niederlande (KvK {companyNumber}, USt-IdNr. {vat}). In dieser Datenschutzerklärung erläutern wir, welche personenbezogenen Daten wir erheben, zu welchen Zwecken wir sie nutzen und wie wir sie nach den Vorgaben der EU-Datenschutz-Grundverordnung (DSGVO) schützen.",
    sectionDataWeCollect: "Welche Daten wir erfassen",
    dataWeCollect:
      "Wenn Sie eine Bestellung aufgeben, einen Ratenkauf beantragen, den Live-Chat starten oder uns schreiben, erfassen wir die von Ihnen eingegebenen Angaben — darunter Name, Liefer- und Rechnungsanschrift, E-Mail-Adresse, Telefonnummer, Geburtsdatum und Region bei Kartenzahlungen sowie Zahlungsreferenzen — ergänzt um technische Verbindungsdaten wie Ihre IP-Adresse und notwendige Cookies.",
    sectionHowWeUse: "Verwendungszwecke Ihrer Daten",
    howWeUse:
      "Wir nutzen Ihre Angaben zur Vertrags- und Versandabwicklung, zur Zahlungsprüfung, zur Bearbeitung von Retouren und Gewährleistungsfällen, für den Kundensupport sowie — ausschließlich nach Ihrer Einwilligung — für optionale Shop-Informationen. Eine Veräußerung Ihrer Daten an Dritte findet niemals statt.",
    sectionLegalBasis: "Rechtsgrundlagen nach DSGVO",
    legalBasisIntro: "Jede Verarbeitung stützt sich auf eine der folgenden Rechtsgrundlagen gemäß Art. 6 DSGVO:",
    legalBasis: [
      { title: "Vertragserfüllung", text: "Abwicklung Ihrer Bestellung, Zahlungsabgleich, Paketzustellung oder Durchführung eines Ratenkaufvertrags" },
      { title: "Gesetzliche Pflicht", text: "Aufbewahrung von Buchungs- und Rechnungsbelegen nach niederländischem und europäischem Steuer- und Handelsrecht" },
      { title: "Berechtigtes Interesse", text: "Schutz vor Zahlungsbetrug, Absicherung unserer IT-Infrastruktur und stabiler Betrieb des Onlineshops" },
      { title: "Einwilligung", text: "Versand optionaler Marketing-E-Mails und Einsatz nicht notwendiger Analyse-Cookies (jederzeit mit Wirkung für die Zukunft widerrufbar)" },
    ],
    sectionProviders: "Eingesetzte Auftragsverarbeiter",
    providersIntro:
      "Für den technischen Betrieb arbeiten wir mit sorgfältig ausgewählten Dienstleistern zusammen, die Daten streng weisungsgebunden in unserem Auftrag verarbeiten:",
    providers: [
      { title: "Vercel", text: "Bereitstellung und Hosting der Webplattform" },
      { title: "Neon", text: "Datenbankbetrieb für Bestell- und Kundenkontodaten" },
      { title: "Vercel Blob", text: "Speicherung von Katalogbildern und hochgeladenen Dokumenten" },
      { title: "Zoho Mail / Titan Email", text: "Zustellung von Bestellbestätigungen und Support-E-Mails" },
    ],
    providersClosing:
      "Mit jedem Dienstleister besteht ein DSGVO-konformer Auftragsverarbeitungsvertrag; eine Nutzung Ihrer Daten zu eigenen Zwecken ist ausgeschlossen.",
    sectionRetention: "Speicherdauer",
    retention:
      "Bestell- und Rechnungsunterlagen speichern wir entsprechend den handels- und steuerrechtlichen Aufbewahrungsfristen (in der Regel bis zu 10 Jahre). Kontodaten bleiben für die Dauer Ihres aktiven Kundenkontos gespeichert; auf Einwilligung beruhende Analyse- oder Marketingdaten werden maximal 14 Monate bzw. bis zum Widerruf aufbewahrt und anschließend gelöscht oder anonymisiert.",
    sectionTransfers: "Drittlandübermittlungen",
    transfers:
      "Die Verarbeitung erfolgt vorrangig innerhalb des Europäischen Wirtschaftsraums (EWR). Soweit einzelne Zahlungs-, Logistik- oder Technikpartner außerhalb des EWR ansässig sind, stellen wir ein angemessenes Datenschutzniveau über Angemessenheitsbeschlüsse der EU-Kommission oder EU-Standardvertragsklauseln sicher.",
    sectionRights: "Ihre Betroffenenrechte",
    rightsIntro: "Nach der DSGVO stehen Ihnen jederzeit folgende Rechte zu:",
    rights: [
      "Auskunft über die bei uns gespeicherten personenbezogenen Daten zu erhalten",
      "Die Berichtigung unrichtiger oder unvollständiger Angaben zu verlangen",
      "Die Löschung Ihrer Daten zu fordern („Recht auf Vergessenwerden“), sofern keine gesetzlichen Aufbewahrungspflichten entgegenstehen",
      "Ihre Daten in einem strukturierten, maschinenlesbaren Format zu erhalten oder übertragen zu lassen",
      "Widerspruch gegen bestimmte Verarbeitungen einzulegen oder deren Einschränkung zu verlangen",
      "Eine erteilte Einwilligung jederzeit für die Zukunft zu widerrufen",
      "Beschwerde bei einer Datenschutz-Aufsichtsbehörde einzureichen",
    ],
    rightsContactBefore: "Zur Ausübung Ihrer Rechte genügt eine Nachricht an ",
    rightsContactAfter: ".",
    dpaBefore:
      "Da unser Unternehmenssitz in den Niederlanden liegt, können Sie sich zudem an die zuständige niederländische Aufsichtsbehörde (Autoriteit Persoonsgegevens) wenden: ",
    dpaAddress: "Postbus 93374, 2509 AJ Den Haag, Niederlande",
    dpaAfter: " — ",
    sectionCookies: "Cookies & Analyse-Technologien",
    cookiesBefore:
      "Für die Grundfunktionen des Shops nutzen wir technisch notwendige Cookies sowie — erst nach Ihrer Zustimmung — Analyse-Cookies. Ihre Auswahl können Sie jederzeit in unserer ",
    cookiesLinkLabel: "Cookie-Richtlinie",
    cookiesAfter: " anpassen.",
    sectionChanges: "Aktualisierungen dieser Erklärung",
    changes:
      "Wir passen diese Datenschutzerklärung bei technischen oder rechtlichen Neuerungen an. Maßgebliche Änderungen werden auf dieser Seite mit aktualisiertem Datum ausgewiesen.",
    sectionContact: "Datenschutz-Kontakt",
    contactBefore: "Bei Fragen zum Datenschutz erreichen Sie die {legalName} per E-Mail unter ",
    contactPhoneLabel: ", telefonisch unter {phone} oder per Post unter {street}, {postalCode} {city}, Niederlande.",
    contactAfter: "",
  },
  fr: {
    sectionWhoWeAre: "Responsable du traitement",
    whoWeAre:
      "La boutique en ligne DnD3D est exploitée par {legalName}, établie {street}, {postalCode} {city}, Pays-Bas (KvK {companyNumber}, TVA {vat}), agissant en qualité de responsable du traitement. La présente politique détaille la manière dont nous collectons, traitons et protégeons vos données personnelles dans le respect du Règlement général sur la protection des données (RGPD).",
    sectionDataWeCollect: "Catégories de données collectées",
    dataWeCollect:
      "Lorsque vous passez commande, sollicitez un paiement échelonné, utilisez le chat en direct ou nous écrivez, nous recueillons les informations que vous nous transmettez (nom, adresses de livraison et de facturation, e-mail, téléphone, date de naissance et région pour les paiements par carte, références de transaction) ainsi que des données techniques telles que l'adresse IP et les cookies indispensables au fonctionnement de la boutique.",
    sectionHowWeUse: "Finalités du traitement",
    howWeUse:
      "Vos informations servent à préparer et livrer vos commandes, valider les paiements, gérer les retours et la garantie, assurer le support client et — uniquement avec votre accord explicite — vous adresser nos actualités. Nous ne vendons ni ne louons jamais vos données personnelles.",
    sectionLegalBasis: "Bases juridiques du traitement",
    legalBasisIntro: "Chaque traitement repose sur l'un des fondements prévus par l'article 6 du RGPD :",
    legalBasis: [
      { title: "Exécution contractuelle", text: "gestion de votre commande, du règlement, de l'expédition ou de votre contrat de vente à tempérament" },
      { title: "Obligation légale", text: "archivage des pièces comptables et fiscales conformément au droit néerlandais et européen" },
      { title: "Intérêt légitime", text: "lutte contre la fraude, sécurisation de notre infrastructure et maintien des fonctions essentielles du site" },
      { title: "Consentement", text: "envoi de communications marketing et dépôt de cookies analytiques non essentiels (révocable à tout moment)" },
    ],
    sectionProviders: "Sous-traitants & partenaires techniques",
    providersIntro:
      "L'exploitation technique de la boutique implique le recours à un nombre restreint de prestataires agissant exclusivement sur nos instructions :",
    providers: [
      { title: "Vercel", text: "hébergement de l'application web et réseau de diffusion" },
      { title: "Neon", text: "hébergement de la base de données des commandes et des comptes clients" },
      { title: "Vercel Blob", text: "stockage sécurisé des visuels du catalogue et des pièces jointes" },
      { title: "Zoho Mail / Titan Email", text: "acheminement des e-mails transactionnels et des réponses du support" },
    ],
    providersClosing:
      "Chaque sous-traitant est lié par un accord de protection des données conforme au RGPD et ne peut traiter vos informations que pour la mission qui lui est confiée.",
    sectionRetention: "Durées de conservation",
    retention:
      "Les pièces relatives aux commandes et à la facturation sont conservées pendant la durée imposée par le droit fiscal et commercial (généralement jusqu'à 10 ans). Les données de compte sont gardées tant que le compte reste actif, et les données liées au consentement (cookies analytiques ou marketing) jusqu'à 14 mois ou jusqu'au retrait de votre accord, avant d'être supprimées ou anonymisées.",
    sectionTransfers: "Transferts hors de l'EEE",
    transfers:
      "Vos données sont traitées principalement au sein de l'Espace économique européen (EEE). Si un partenaire logistique, technique ou de paiement intervient hors de l'EEE, le transfert est encadré par une décision d'adéquation de la Commission européenne ou par des clauses contractuelles types (CCT).",
    sectionRights: "Vos droits RGPD",
    rightsIntro: "Conformément au RGPD, vous disposez à tout moment des droits suivants :",
    rights: [
      "Obtenir l'accès et une copie des données personnelles vous concernant",
      "Demander la rectification de toute donnée inexacte ou incomplète",
      "Solliciter l'effacement de vos données (« droit à l'oubli »), sous réserve des obligations légales de conservation",
      "Recevoir vos données dans un format structuré et lisible par machine (portabilité)",
      "Vous opposer à certains traitements ou en demander la limitation, y compris la prospection",
      "Retirer votre consentement à tout moment pour l'avenir",
      "Introduire une réclamation auprès d'une autorité de contrôle compétente",
    ],
    rightsContactBefore: "Pour exercer l'un de ces droits, écrivez-nous à ",
    rightsContactAfter: ".",
    dpaBefore:
      "Notre société ayant son siège aux Pays-Bas, vous pouvez également saisir l'autorité néerlandaise de protection des données (Autoriteit Persoonsgegevens), ",
    dpaAddress: "Postbus 93374, 2509 AJ La Haye, Pays-Bas",
    dpaAfter: " — ",
    sectionCookies: "Cookies & traceurs",
    cookiesBefore:
      "Nous déposons des cookies strictement nécessaires au fonctionnement du site et, uniquement après votre accord, des cookies de mesure d'audience. Vous pouvez modifier votre choix à tout instant depuis notre ",
    cookiesLinkLabel: "politique de cookies",
    cookiesAfter: ".",
    sectionChanges: "Évolution de la présente politique",
    changes:
      "Nous pouvons actualiser cette notice de confidentialité pour refléter nos évolutions techniques ou réglementaires. Toute mise à jour substantielle sera publiée sur cette page avec une nouvelle date d'effet.",
    sectionContact: "Nous contacter au sujet de vos données",
    contactBefore: "Pour toute question relative à vos données personnelles, contactez {legalName} par e-mail à ",
    contactPhoneLabel: ", par téléphone au {phone}, ou par courrier au {street}, {postalCode} {city}, Pays-Bas.",
    contactAfter: "",
  },
  it: {
    sectionWhoWeAre: "Titolare del trattamento",
    whoWeAre:
      "Lo store online DnD3D è gestito da {legalName}, con sede in {street}, {postalCode} {city}, Paesi Bassi (KvK {companyNumber}, P.IVA {vat}), che opera in qualità di titolare del trattamento dei dati personali. La presente informativa illustra quali dati raccogliamo, per quali finalità li trattiamo e come li proteggiamo in conformità al Regolamento generale sulla protezione dei dati dell'UE (GDPR).",
    sectionDataWeCollect: "Tipologie di dati raccolti",
    dataWeCollect:
      "Quando invii un ordine, richiedi un piano rateale, avvii la live chat o ci contatti, raccogliamo i dati da te forniti — tra cui nome, indirizzo di spedizione e fatturazione, e-mail, numero di telefono, data di nascita e regione per i pagamenti con carta e riferimenti di pagamento — unitamente a dati tecnici quali indirizzo IP e cookie necessari al funzionamento e alla sicurezza dello store.",
    sectionHowWeUse: "Finalità del trattamento",
    howWeUse:
      "I tuoi dati vengono trattati per evadere e consegnare gli ordini, verificare i pagamenti, gestire resi e garanzie, fornire supporto tecnico e — esclusivamente previo tuo consenso — inviare comunicazioni promozionali. Non cediamo né vendiamo mai i tuoi dati personali a terzi.",
    sectionLegalBasis: "Basi giuridiche del trattamento",
    legalBasisIntro: "Ogni attività di trattamento si fonda su una delle basi di liceità previste dall'art. 6 del GDPR:",
    legalBasis: [
      { title: "Esecuzione contrattuale", text: "gestione dell'ordine, verifica del pagamento, spedizione della merce o esecuzione del contratto rateale" },
      { title: "Obbligo di legge", text: "conservazione delle scritture contabili e fiscali secondo la normativa olandese ed europea" },
      { title: "Legittimo interesse", text: "prevenzione delle frodi nei pagamenti, tutela della sicurezza informatica e operatività essenziale del sito" },
      { title: "Consenso dell'interessato", text: "invio di comunicazioni di marketing e attivazione dei cookie analitici non essenziali (revocabile in qualsiasi momento)" },
    ],
    sectionProviders: "Responsabili esterni & partner tecnologici",
    providersIntro:
      "Per garantire il funzionamento dello store condividiamo i dati strettamente necessari con fornitori qualificati che operano per nostro conto:",
    providers: [
      { title: "Vercel", text: "infrastruttura cloud e hosting dell'applicazione web" },
      { title: "Neon", text: "gestione del database per ordini e profili utente" },
      { title: "Vercel Blob", text: "archiviazione cloud per le immagini del catalogo e i file caricati" },
      { title: "Zoho Mail / Titan Email", text: "invio di notifiche d'ordine e comunicazioni del servizio clienti" },
    ],
    providersClosing:
      "Ciascun fornitore ha sottoscritto un accordo sul trattamento dei dati conforme al GDPR ed è vincolato a utilizzare le informazioni solo per erogare il servizio richiesto.",
    sectionRetention: "Tempi di conservazione",
    retention:
      "I documenti fiscali e d'ordine vengono conservati per il periodo imposto dalla legge fiscale e commerciale (di norma fino a 10 anni). I dati del profilo restano attivi finché l'account rimane aperto, mentre i dati basati sul consenso (cookie analitici o marketing) sono conservati fino a 14 mesi o fino alla revoca del consenso, dopodiché vengono cancellati o anonimizzati.",
    sectionTransfers: "Trasferimenti verso Paesi extra-SEE",
    transfers:
      "Il trattamento avviene prevalentemente all'interno dello Spazio Economico Europeo (SEE). Qualora un partner tecnologico, logistico o di pagamento operi al di fuori dello SEE, il trasferimento è tutelato tramite decisioni di adeguatezza della Commissione europea o Clausole Contrattuali Standard (SCC).",
    sectionRights: "I tuoi diritti ai sensi del GDPR",
    rightsIntro: "In qualità di interessato hai il diritto di:",
    rights: [
      "Ottenere conferma e copia dei dati personali che ti riguardano (diritto di accesso)",
      "Chiedere la rettifica dei dati inesatti o l'integrazione di quelli incompleti",
      "Richiedere la cancellazione dei tuoi dati (\u201cdiritto all'oblio\u201d), fatti salvi gli obblighi legali di conservazione",
      "Ricevere i tuoi dati in formato strutturato e leggibile da dispositivo automatico (portabilità)",
      "Opporti a determinati trattamenti o chiederne la limitazione, incluso il marketing diretto",
      "Revocare in ogni momento il consenso prestato",
      "Proporre reclamo all'autorità garante per la protezione dei dati personali",
    ],
    rightsContactBefore: "Per esercitare i tuoi diritti puoi scriverci in qualsiasi momento a ",
    rightsContactAfter: ".",
    dpaBefore:
      "Essendo la nostra società stabilita nei Paesi Bassi, puoi inoltre rivolgerti all'Autorità olandese per la protezione dei dati (Autoriteit Persoonsgegevens), ",
    dpaAddress: "Postbus 93374, 2509 AJ L'Aia, Paesi Bassi",
    dpaAfter: " — ",
    sectionCookies: "Cookie & tecnologie similari",
    cookiesBefore:
      "Impieghiamo cookie tecnici indispensabili al funzionamento dello store e, solo con il tuo consenso, cookie statistici per migliorare il servizio. Puoi rivedere le tue preferenze in qualsiasi momento nella nostra ",
    cookiesLinkLabel: "informativa sui cookie",
    cookiesAfter: ".",
    sectionChanges: "Modifiche alla presente informativa",
    changes:
      "Potremo aggiornare periodicamente questa informativa per recepire novità tecniche o normative. Eventuali modifiche rilevanti saranno pubblicate su questa pagina con la data di ultimo aggiornamento.",
    sectionContact: "Contatti per la privacy",
    contactBefore: "Per chiarimenti sul trattamento dei tuoi dati personali, contatta {legalName} via e-mail a ",
    contactPhoneLabel: ", telefonicamente al {phone}, oppure per posta presso {street}, {postalCode} {city}, Paesi Bassi.",
    contactAfter: "",
  },
  es: {
    sectionWhoWeAre: "Responsable del tratamiento",
    whoWeAre:
      "La tienda online DnD3D está gestionada por {legalName}, con domicilio en {street}, {postalCode} {city}, Países Bajos (KvK {companyNumber}, IVA {vat}), que actúa como responsable del tratamiento de tus datos personales. En esta política detallamos qué información recogemos, con qué fines la tratamos y cómo la protegemos de acuerdo con el Reglamento General de Protección de Datos de la UE (RGPD).",
    sectionDataWeCollect: "Categorías de datos que recopilamos",
    dataWeCollect:
      "Cuando realizas un pedido, solicitas financiación a plazos, inicias el chat en vivo o nos escribes, recogemos los datos que nos facilitas — nombre completo, dirección de envío y facturación, correo electrónico, teléfono, fecha de nacimiento y región para la verificación de pagos con tarjeta, así como referencias de pago — junto con datos técnicos como la dirección IP y las cookies necesarias para que la tienda funcione de forma segura.",
    sectionHowWeUse: "Finalidad del tratamiento",
    howWeUse:
      "Utilizamos tus datos para tramitar y entregar tus pedidos, verificar los cobros, gestionar devoluciones y garantías, atender consultas de soporte y — únicamente si nos das tu consentimiento — enviarte comunicaciones comerciales. Jamás vendemos ni alquilamos tus datos personales a terceros.",
    sectionLegalBasis: "Base jurídica según el RGPD",
    legalBasisIntro: "Todo tratamiento de datos se ampara en una de las bases de legitimación del artículo 6 del RGPD:",
    legalBasis: [
      { title: "Ejecución de un contrato", text: "gestión de tu compra, comprobación del pago, entrega del paquete o cumplimiento del contrato de venta a plazos" },
      { title: "Cumplimiento de una obligación legal", text: "conservación de facturas y documentación contable exigida por la normativa fiscal neerlandesa y europea" },
      { title: "Interés legítimo", text: "prevención del fraude en pagos, seguridad informática y mantenimiento operativo de la tienda" },
      { title: "Consentimiento", text: "envío de boletines comerciales y activación de cookies analíticas opcionales (revocable en cualquier momento)" },
    ],
    sectionProviders: "Encargados del tratamiento y proveedores técnicos",
    providersIntro:
      "Para operar la plataforma contamos con proveedores tecnológicos de confianza que tratan los datos siguiendo estrictamente nuestras instrucciones:",
    providers: [
      { title: "Vercel", text: "alojamiento de la aplicación web e infraestructura en la nube" },
      { title: "Neon", text: "alojamiento de base de datos para pedidos y cuentas de clientes" },
      { title: "Vercel Blob", text: "almacenamiento de imágenes del catálogo y documentos adjuntos" },
      { title: "Zoho Mail / Titan Email", text: "envío de correos transaccionales, confirmaciones de compra y soporte" },
    ],
    providersClosing:
      "Todos los proveedores han suscrito un contrato de encargo de tratamiento conforme al RGPD y tienen prohibido emplear tus datos para fines propios.",
    sectionRetention: "Plazos de conservación",
    retention:
      "Los datos de pedidos y facturación se conservan durante los plazos exigidos por la legislación mercantil y tributaria (habitualmente hasta 10 años). La información de tu cuenta se mantiene mientras permanezca activa, y los datos basados en el consentimiento (cookies analíticas o marketing) se guardan un máximo de 14 meses o hasta que retires tu autorización, tras lo cual se suprimen o anonimizan.",
    sectionTransfers: "Transferencias internacionales de datos",
    transfers:
      "Tus datos se alojan y procesan principalmente dentro del Espacio Económico Europeo (EEE). Cuando algún proveedor técnico, de pago o logístico opera fuera del EEE, garantizamos la protección de los datos mediante decisiones de adecuación de la Comisión Europea o Cláusulas Contractuales Tipo (CCT).",
    sectionRights: "Tus derechos de protección de datos",
    rightsIntro: "De conformidad con el RGPD, puedes ejercer en cualquier momento los siguientes derechos:",
    rights: [
      "Acceder a los datos personales que tratamos sobre ti y obtener copia de los mismos",
      "Solicitar la rectificación de datos inexactos o incompletos",
      "Pedir la supresión de tus datos (\u201cderecho al olvido\u201d) cuando ya no sean necesarios o retires tu consentimiento",
      "Recibir tus datos en un formato estructurado y de lectura mecánica (portabilidad)",
      "Oponerte a determinados tratamientos o solicitar su limitación, incluido el envío de publicidad",
      "Retirar en cualquier momento el consentimiento otorgado",
      "Presentar una reclamación ante una autoridad de control de protección de datos",
    ],
    rightsContactBefore: "Para ejercer cualquiera de estos derechos, escríbenos a ",
    rightsContactAfter: ".",
    dpaBefore:
      "Al estar nuestra sociedad registrada en los Países Bajos, también puedes dirigirte a la Autoridad Neerlandesa de Protección de Datos (Autoriteit Persoonsgegevens), ",
    dpaAddress: "Postbus 93374, 2509 AJ La Haya, Países Bajos",
    dpaAfter: " — ",
    sectionCookies: "Política de cookies",
    cookiesBefore:
      "Utilizamos cookies técnicas imprescindibles para el funcionamiento de la tienda y, solo tras tu aceptación, cookies analíticas para mejorar la experiencia. Puedes cambiar tus preferencias cuando quieras desde nuestra ",
    cookiesLinkLabel: "política de cookies",
    cookiesAfter: ".",
    sectionChanges: "Actualizaciones de esta política",
    changes:
      "Podemos modificar esta política de privacidad para adaptarla a novedades técnicas o legales. Cualquier cambio relevante se publicará en esta página actualizando la fecha de revisión.",
    sectionContact: "Contacto de privacidad",
    contactBefore: "Para cualquier consulta sobre privacidad o protección de datos, contacta con {legalName} en ",
    contactPhoneLabel: ", por teléfono en el {phone}, o por correo postal en {street}, {postalCode} {city}, Países Bajos.",
    contactAfter: "",
  },
  nl: {
    sectionWhoWeAre: "Verwerkingsverantwoordelijke",
    whoWeAre:
      "De DnD3D-webshop wordt beheerd door {legalName}, gevestigd aan de {street}, {postalCode} {city}, Nederland (KvK {companyNumber}, btw-nummer {vat}), die optreedt als verwerkingsverantwoordelijke. In deze privacyverklaring leggen wij uit welke persoonsgegevens wij verzamelen, voor welke doeleinden wij deze gebruiken en hoe wij uw gegevens beveiligen conform de Algemene Verordening Gegevensbescherming (AVG).",
    sectionDataWeCollect: "Welke persoonsgegevens wij verzamelen",
    dataWeCollect:
      "Wanneer u een bestelling plaatst, gespreid betalen aanvraagt, een chatsessie start of contact met ons opneemt, verwerken wij de gegevens die u invult — waaronder uw naam, bezorg- en factuuradres, e-mailadres, telefoonnummer, geboortedatum en regio bij kaartbetalingen en betaalreferenties — aangevuld met technische gegevens zoals uw IP-adres en noodzakelijke cookies.",
    sectionHowWeUse: "Waarvoor wij uw gegevens gebruiken",
    howWeUse:
      "Wij gebruiken uw gegevens om bestellingen uit te voeren en te bezorgen, betalingen te verifiëren, retouren en garantieclaims af te handelen, klantenservice te verlenen en — uitsluitend na uw toestemming — nieuwsbrieven te sturen. Wij verkopen uw persoonsgegevens nooit aan derden.",
    sectionLegalBasis: "Wettelijke grondslagen onder de AVG",
    legalBasisIntro: "Elke gegevensverwerking is gebaseerd op een van de rechtmatige grondslagen uit artikel 6 van de AVG:",
    legalBasis: [
      { title: "Uitvoering van een overeenkomst", text: "het verwerken van uw bestelling, betaling, levering of overeenkomst voor gespreide betaling" },
      { title: "Wettelijke verplichting", text: "het bewaren van facturen en boekhoudkundige stukken volgens de Nederlandse en Europese belastingwetgeving" },
      { title: "Gerechtvaardigd belang", text: "fraudepreventie bij betalingen, beveiliging van onze IT-systemen en een stabiele werking van de webshop" },
      { title: "Toestemming", text: "het verzenden van marketingberichten en het plaatsen van niet-essentiële analytische cookies (op elk moment in te trekken)" },
    ],
    sectionProviders: "Verwerkers & technische dienstverleners",
    providersIntro:
      "Voor de technische uitvoering van onze webshop maken wij gebruik van een beperkt aantal gespecialiseerde dienstverleners die uitsluitend in onze opdracht handelen:",
    providers: [
      { title: "Vercel", text: "hosting en netwerkinfrastructuur van de webapplicatie" },
      { title: "Neon", text: "databasebeheer voor bestellingen en klantaccounts" },
      { title: "Vercel Blob", text: "cloudopslag voor productafbeeldingen en geüploade documenten" },
      { title: "Zoho Mail / Titan Email", text: "verzending van orderbevestigingen en klantenservice-e-mails" },
    ],
    providersClosing:
      "Met iedere dienstverlener is een AVG-conforme verwerkersovereenkomst gesloten; zij mogen uw gegevens uitsluitend gebruiken voor de door ons opgedragen dienst.",
    sectionRetention: "Bewaartermijnen",
    retention:
      "Bestel- en factuurgegevens bewaren wij gedurende de wettelijke fiscale bewaartermijn (doorgaans tot 10 jaar). Accountgegevens blijven bewaard zolang uw account actief is, en gegevens op basis van toestemming (zoals analytische cookies of marketing) maximaal 14 maanden of totdat u uw toestemming intrekt. Daarna worden de gegevens veilig gewist of geanonimiseerd.",
    sectionTransfers: "Doorgifte buiten de EER",
    transfers:
      "Uw persoonsgegevens worden hoofdzakelijk binnen de Europese Economische Ruimte (EER) verwerkt. Wanneer een betaal-, logistieke of technische partner buiten de EER is gevestigd, waarborgen wij een passend beschermingsniveau via adequaatheidsbesluiten van de Europese Commissie of modelcontractbepalingen (SCC's).",
    sectionRights: "Uw privacyrechten",
    rightsIntro: "Op grond van de AVG heeft u te allen tijde het recht om:",
    rights: [
      "Inzage te vragen in de persoonsgegevens die wij van u verwerken",
      "Onjuiste of onvolledige persoonsgegevens te laten rectificeren",
      "Verwijdering van uw gegevens te verzoeken (\u201crecht op vergetelheid\u201d), voor zover geen wettelijke bewaarplicht geldt",
      "Uw gegevens in een gestructureerd, machineleesbaar formaat te ontvangen (dataportabiliteit)",
      "Bezwaar te maken tegen bepaalde verwerkingen of beperking daarvan te vragen, waaronder direct marketing",
      "Een eerder gegeven toestemming op elk moment in te trekken",
      "Een klacht in te dienen bij de bevoegde toezichthoudende autoriteit",
    ],
    rightsContactBefore: "Om gebruik te maken van uw rechten kunt u een e-mail sturen naar ",
    rightsContactAfter: ".",
    dpaBefore:
      "Omdat onze vennootschap in Nederland is gevestigd, kunt u daarnaast een klacht indienen bij de Autoriteit Persoonsgegevens, ",
    dpaAddress: "Postbus 93374, 2509 AJ Den Haag",
    dpaAfter: " — ",
    sectionCookies: "Cookies & voorkeuren",
    cookiesBefore:
      "Wij gebruiken functionele cookies om de webshop te laten werken en, uitsluitend na uw akkoord, analytische cookies om het gebruik te meten. U kunt uw cookievoorkeuren op elk moment aanpassen via ons ",
    cookiesLinkLabel: "cookiebeleid",
    cookiesAfter: ".",
    sectionChanges: "Wijzigingen in deze privacyverklaring",
    changes:
      "Wij kunnen deze privacyverklaring aanpassen wanneer onze werkwijze of de wetgeving verandert. Belangrijke wijzigingen worden op deze pagina vermeld met een bijgewerkte datum.",
    sectionContact: "Contact opnemen over privacy",
    contactBefore: "Voor vragen over deze verklaring of uw persoonsgegevens bereikt u {legalName} via ",
    contactPhoneLabel: ", telefonisch op {phone}, of per post op {street}, {postalCode} {city}, Nederland.",
    contactAfter: "",
  },
}

function InlineEmail({ email }: { email: string }) {
  return (
    <a href={`mailto:${email}`} className={LINK_CLASS}>
      {email}
    </a>
  )
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : "en"
  const dict = await getDictionary(locale)
  return { title: dict.footer.privacy }
}

export default async function PrivacyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : "en"
  const dict = await getDictionary(locale)
  const c = fillCompany(COPY[locale])

  return (
    <ProsePage
      locale={locale}
      dict={dict}
      title={dict.footer.privacy}
      crumbs={[{ label: dict.common.home, href: "/" }, { label: dict.footer.privacy }]}
    >
      <ProseSection heading={c.sectionWhoWeAre}>
        <p>{c.whoWeAre}</p>
      </ProseSection>
      <ProseSection heading={c.sectionDataWeCollect}>
        <p>{c.dataWeCollect}</p>
      </ProseSection>
      <ProseSection heading={c.sectionHowWeUse}>
        <p>{c.howWeUse}</p>
      </ProseSection>
      <ProseSection heading={c.sectionLegalBasis}>
        <p>{c.legalBasisIntro}</p>
        <ul className="ml-5 list-disc space-y-1">
          {c.legalBasis.map((item) => (
            <li key={item.title}>
              <strong>{item.title}</strong> — {item.text}
            </li>
          ))}
        </ul>
      </ProseSection>
      <ProseSection heading={c.sectionProviders}>
        <p>{c.providersIntro}</p>
        <ul className="ml-5 list-disc space-y-1">
          {c.providers.map((item) => (
            <li key={item.title}>
              <strong>{item.title}</strong> — {item.text}
            </li>
          ))}
        </ul>
        <p>{c.providersClosing}</p>
      </ProseSection>
      <ProseSection heading={c.sectionRetention}>
        <p>{c.retention}</p>
      </ProseSection>
      <ProseSection heading={c.sectionTransfers}>
        <p>{c.transfers}</p>
      </ProseSection>
      <ProseSection heading={c.sectionRights}>
        <p>{c.rightsIntro}</p>
        <ul className="ml-5 list-disc space-y-1">
          {c.rights.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>
          {c.rightsContactBefore}
          <InlineEmail email={COMPANY.email} />
          {c.rightsContactAfter}
        </p>
        <p>
          {c.dpaBefore}
          {c.dpaAddress}
          {c.dpaAfter}
          <a href="https://www.autoriteitpersoonsgegevens.nl/contact" className={LINK_CLASS}>
            autoriteitpersoonsgegevens.nl
          </a>
        </p>
      </ProseSection>
      <ProseSection heading={c.sectionCookies}>
        <p>
          {c.cookiesBefore}
          <Link href={localizedPath(locale, "/cookie-policy")} className={LINK_CLASS}>
            {c.cookiesLinkLabel}
          </Link>
          {c.cookiesAfter}
        </p>
      </ProseSection>
      <ProseSection heading={c.sectionChanges}>
        <p>{c.changes}</p>
      </ProseSection>
      <ProseSection heading={c.sectionContact}>
        <p>
          {c.contactBefore}
          <InlineEmail email={COMPANY.email} />
          {c.contactPhoneLabel}
        </p>
      </ProseSection>
    </ProsePage>
  )
}
