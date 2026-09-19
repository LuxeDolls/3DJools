import Link from "next/link"
import { isLocale, type Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { localizedPath } from "@/lib/i18n/paths"
import { ProsePage, ProseSection } from "@/components/legal/prose-page"

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
    sectionWhoWeAre: "Who we are",
    whoWeAre:
      "The 3DJools online store is operated by Ln-Squared, Rue du Chénia 17, 7170 Manage, Hainaut, Belgium (Company No. 0564.743.304, VAT BE0564743304), which acts as the data controller for the purposes of this policy. This privacy policy explains how we collect, use and protect your personal data in accordance with the EU General Data Protection Regulation (GDPR).",
    sectionDataWeCollect: "Data we collect",
    dataWeCollect:
      "We collect the information you provide when placing an order or contacting us (name, address, email, phone, payment details) and technical data such as cookies necessary to run the store and understand how it is used.",
    sectionHowWeUse: "How we use your data",
    howWeUse:
      "Your data is used to process orders, arrange delivery, provide support, and — with your consent — to send you marketing communications. We never sell your personal data.",
    sectionLegalBasis: "Legal basis for processing",
    legalBasisIntro: "We only process your personal data where we have a valid legal basis to do so:",
    legalBasis: [
      { title: "Contract performance", text: "processing your order, payment and delivery details to fulfil a purchase or instalment agreement" },
      { title: "Legal obligation", text: "retaining invoicing and tax records as required by Belgian and EU law" },
      { title: "Legitimate interest", text: "preventing fraud, securing our systems, and running essential store functionality" },
      { title: "Consent", text: "sending marketing communications and using non-essential analytics cookies, which you can withdraw at any time" },
    ],
    sectionProviders: "Service providers we use",
    providersIntro:
      "We share personal data with a limited number of service providers who process it on our behalf, strictly to operate the store:",
    providers: [
      { title: "Vercel", text: "application hosting and infrastructure" },
      { title: "Neon", text: "database hosting for order and account records" },
      { title: "Vercel Blob", text: "storage of product images and uploaded files" },
      { title: "Zoho Mail / Titan Email", text: "sending transactional emails such as order confirmations and support replies" },
    ],
    providersClosing:
      "Each provider is bound by a data processing agreement and may only use your data to provide the service we have engaged them for.",
    sectionRetention: "Data retention",
    retention:
      "We keep order and invoicing data for as long as required by tax and commercial law (generally up to 10 years), account data for as long as your account is active, and marketing data until you withdraw your consent. Data no longer needed for these purposes is securely deleted or anonymised.",
    sectionTransfers: "International transfers",
    transfers:
      "Your data is primarily processed within the European Economic Area. Where a service provider we use (such as a payment or logistics partner) is located outside the EEA, we rely on adequacy decisions or standard contractual clauses to ensure your data remains protected to EU standards.",
    sectionRights: "Your rights",
    rightsIntro: "Under the GDPR, you have the right to:",
    rights: [
      "Access the personal data we hold about you",
      "Correct inaccurate or incomplete data",
      "Request deletion of your data (\u201cright to be forgotten\u201d)",
      "Port your data to another provider in a machine-readable format",
      "Object to or restrict certain processing, including direct marketing",
      "Opt out of marketing communications at any time",
      "Lodge a complaint with your local data protection authority",
    ],
    rightsContactBefore: "To exercise any of these rights, contact us at ",
    rightsContactAfter: ".",
    dpaBefore:
      "As our company is established in Belgium, you also have the right to lodge a complaint directly with the Belgian Data Protection Authority (Autorité de protection des données / Gegevensbeschermingsautoriteit), ",
    dpaAddress: "Rue de la Presse 35, 1000 Brussels, Belgium",
    dpaAfter: " — ",
    sectionCookies: "Cookies",
    cookiesBefore:
      "We use essential cookies to run the store and, with your consent, analytics cookies to improve it. You can manage your preferences at any time in our ",
    cookiesLinkLabel: "cookie policy",
    cookiesAfter: ".",
    sectionChanges: "Changes to this policy",
    changes:
      "We may update this privacy policy from time to time to reflect changes in our practices or legal requirements. Material changes will be reflected on this page with an updated \u201clast updated\u201d date.",
    sectionContact: "Contact us",
    contactBefore: "For any question about this policy or your data, contact Ln-Squared at ",
    contactPhoneLabel: ", by phone at +49 30 1234 5678, or by post at Rue du Chénia 17, 7170 Manage, Hainaut, Belgium.",
    contactAfter: "",
  },
  de: {
    sectionWhoWeAre: "Wer wir sind",
    whoWeAre:
      "Der 3DJools-Onlineshop wird betrieben von Ln-Squared, Rue du Chénia 17, 7170 Manage, Hainaut, Belgien (Unternehmensnr. 0564.743.304, USt-IdNr. BE0564743304), das als Verantwortlicher im Sinne dieser Richtlinie handelt. Diese Datenschutzerklärung erläutert, wie wir Ihre personenbezogenen Daten gemäß der EU-Datenschutz-Grundverordnung (DSGVO) erheben, verwenden und schützen.",
    sectionDataWeCollect: "Von uns erhobene Daten",
    dataWeCollect:
      "Wir erheben die Informationen, die Sie bei einer Bestellung oder Kontaktaufnahme angeben (Name, Adresse, E-Mail, Telefon, Zahlungsdaten) sowie technische Daten wie Cookies, die für den Betrieb des Shops und das Verständnis seiner Nutzung erforderlich sind.",
    sectionHowWeUse: "Wie wir Ihre Daten verwenden",
    howWeUse:
      "Ihre Daten werden zur Bearbeitung von Bestellungen, zur Organisation der Lieferung, zur Bereitstellung von Support und — mit Ihrer Einwilligung — zum Versand von Marketingmitteilungen verwendet. Wir verkaufen Ihre personenbezogenen Daten niemals.",
    sectionLegalBasis: "Rechtsgrundlage der Verarbeitung",
    legalBasisIntro: "Wir verarbeiten Ihre personenbezogenen Daten nur, wenn eine gültige Rechtsgrundlage vorliegt:",
    legalBasis: [
      { title: "Vertragserfüllung", text: "Verarbeitung Ihrer Bestell-, Zahlungs- und Lieferdaten zur Erfüllung eines Kauf- oder Ratenzahlungsvertrags" },
      { title: "Rechtliche Verpflichtung", text: "Aufbewahrung von Rechnungs- und Steuerunterlagen gemäß belgischem und EU-Recht" },
      { title: "Berechtigtes Interesse", text: "Betrugsprävention, Absicherung unserer Systeme und Aufrechterhaltung wesentlicher Shop-Funktionen" },
      { title: "Einwilligung", text: "Versand von Marketingmitteilungen und Verwendung nicht essenzieller Analyse-Cookies, die Sie jederzeit widerrufen können" },
    ],
    sectionProviders: "Von uns genutzte Dienstleister",
    providersIntro:
      "Wir geben personenbezogene Daten an eine begrenzte Anzahl von Dienstleistern weiter, die diese in unserem Auftrag ausschließlich zum Betrieb des Shops verarbeiten:",
    providers: [
      { title: "Vercel", text: "Hosting und Infrastruktur der Anwendung" },
      { title: "Neon", text: "Datenbank-Hosting für Bestell- und Kontodaten" },
      { title: "Vercel Blob", text: "Speicherung von Produktbildern und hochgeladenen Dateien" },
      { title: "Zoho Mail / Titan Email", text: "Versand von Transaktions-E-Mails wie Bestellbestätigungen und Support-Antworten" },
    ],
    providersClosing:
      "Jeder Dienstleister ist durch eine Auftragsverarbeitungsvereinbarung gebunden und darf Ihre Daten nur für die von uns beauftragte Leistung verwenden.",
    sectionRetention: "Aufbewahrungsfrist",
    retention:
      "Wir bewahren Bestell- und Rechnungsdaten so lange auf, wie es das Steuer- und Handelsrecht erfordert (in der Regel bis zu 10 Jahre), Kontodaten so lange, wie Ihr Konto aktiv ist, und Marketingdaten bis zum Widerruf Ihrer Einwilligung. Nicht mehr benötigte Daten werden sicher gelöscht oder anonymisiert.",
    sectionTransfers: "Internationale Übermittlungen",
    transfers:
      "Ihre Daten werden hauptsächlich innerhalb des Europäischen Wirtschaftsraums verarbeitet. Befindet sich ein von uns genutzter Dienstleister (z. B. ein Zahlungs- oder Logistikpartner) außerhalb des EWR, stützen wir uns auf Angemessenheitsbeschlüsse oder Standardvertragsklauseln, um den Schutz Ihrer Daten nach EU-Standards zu gewährleisten.",
    sectionRights: "Ihre Rechte",
    rightsIntro: "Gemäß der DSGVO haben Sie das Recht:",
    rights: [
      "Auf die von uns über Sie gespeicherten personenbezogenen Daten zuzugreifen",
      "Unrichtige oder unvollständige Daten zu berichtigen",
      "Die Löschung Ihrer Daten zu verlangen („Recht auf Vergessenwerden“)",
      "Ihre Daten in einem maschinenlesbaren Format zu einem anderen Anbieter zu übertragen",
      "Bestimmten Verarbeitungen zu widersprechen oder deren Einschränkung zu verlangen, einschließlich Direktwerbung",
      "Marketingmitteilungen jederzeit abzubestellen",
      "Bei Ihrer örtlichen Datenschutzbehörde Beschwerde einzulegen",
    ],
    rightsContactBefore: "Um eines dieser Rechte auszuüben, kontaktieren Sie uns unter ",
    rightsContactAfter: ".",
    dpaBefore:
      "Da unser Unternehmen in Belgien niedergelassen ist, haben Sie außerdem das Recht, sich direkt bei der belgischen Datenschutzbehörde (Autorité de protection des données / Gegevensbeschermingsautoriteit), ",
    dpaAddress: "Rue de la Presse 35, 1000 Brüssel, Belgien",
    dpaAfter: ", zu beschweren — ",
    sectionCookies: "Cookies",
    cookiesBefore:
      "Wir verwenden essenzielle Cookies für den Betrieb des Shops und, mit Ihrer Einwilligung, Analyse-Cookies zur Verbesserung. Sie können Ihre Einstellungen jederzeit in unserer ",
    cookiesLinkLabel: "Cookie-Richtlinie",
    cookiesAfter: " verwalten.",
    sectionChanges: "Änderungen dieser Richtlinie",
    changes:
      "Wir können diese Datenschutzerklärung von Zeit zu Zeit aktualisieren, um Änderungen unserer Praktiken oder rechtlicher Anforderungen widerzuspiegeln. Wesentliche Änderungen werden auf dieser Seite mit einem aktualisierten „zuletzt aktualisiert“-Datum angezeigt.",
    sectionContact: "Kontakt",
    contactBefore: "Bei Fragen zu dieser Richtlinie oder Ihren Daten kontaktieren Sie Ln-Squared unter ",
    contactPhoneLabel: ", telefonisch unter +49 30 1234 5678 oder postalisch unter Rue du Chénia 17, 7170 Manage, Hainaut, Belgien.",
    contactAfter: "",
  },
  fr: {
    sectionWhoWeAre: "Qui nous sommes",
    whoWeAre:
      "La boutique en ligne 3DJools est exploitée par Ln-Squared, Rue du Chénia 17, 7170 Manage, Hainaut, Belgique (n° d'entreprise 0564.743.304, TVA BE0564743304), qui agit en tant que responsable du traitement au sens de la présente politique. Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos données personnelles conformément au Règlement général sur la protection des données (RGPD).",
    sectionDataWeCollect: "Données que nous collectons",
    dataWeCollect:
      "Nous collectons les informations que vous fournissez lors d'une commande ou d'un contact (nom, adresse, e-mail, téléphone, informations de paiement), ainsi que des données techniques telles que les cookies nécessaires au fonctionnement de la boutique et à la compréhension de son utilisation.",
    sectionHowWeUse: "Comment nous utilisons vos données",
    howWeUse:
      "Vos données sont utilisées pour traiter les commandes, organiser la livraison, fournir une assistance et — avec votre consentement — vous envoyer des communications marketing. Nous ne vendons jamais vos données personnelles.",
    sectionLegalBasis: "Base légale du traitement",
    legalBasisIntro: "Nous ne traitons vos données personnelles que lorsque nous disposons d'une base légale valable :",
    legalBasis: [
      { title: "Exécution du contrat", text: "traitement de vos informations de commande, de paiement et de livraison pour honorer un achat ou un contrat de paiement échelonné" },
      { title: "Obligation légale", text: "conservation des données de facturation et fiscales conformément au droit belge et européen" },
      { title: "Intérêt légitime", text: "prévention de la fraude, sécurisation de nos systèmes et fonctionnement essentiel de la boutique" },
      { title: "Consentement", text: "envoi de communications marketing et utilisation de cookies analytiques non essentiels, que vous pouvez retirer à tout moment" },
    ],
    sectionProviders: "Prestataires de services que nous utilisons",
    providersIntro:
      "Nous partageons des données personnelles avec un nombre limité de prestataires de services qui les traitent en notre nom, strictement pour exploiter la boutique :",
    providers: [
      { title: "Vercel", text: "hébergement et infrastructure de l'application" },
      { title: "Neon", text: "hébergement de la base de données pour les enregistrements de commandes et de comptes" },
      { title: "Vercel Blob", text: "stockage des images de produits et des fichiers téléchargés" },
      { title: "Zoho Mail / Titan Email", text: "envoi d'e-mails transactionnels tels que les confirmations de commande et les réponses du support" },
    ],
    providersClosing:
      "Chaque prestataire est lié par un accord de traitement des données et ne peut utiliser vos données que pour fournir le service pour lequel nous l'avons engagé.",
    sectionRetention: "Conservation des données",
    retention:
      "Nous conservons les données de commande et de facturation aussi longtemps que l'exigent le droit fiscal et commercial (généralement jusqu'à 10 ans), les données de compte tant que votre compte est actif, et les données marketing jusqu'au retrait de votre consentement. Les données qui ne sont plus nécessaires à ces fins sont supprimées ou anonymisées en toute sécurité.",
    sectionTransfers: "Transferts internationaux",
    transfers:
      "Vos données sont principalement traitées au sein de l'Espace économique européen. Lorsqu'un prestataire de services que nous utilisons (comme un partenaire de paiement ou de logistique) est situé hors de l'EEE, nous nous appuyons sur des décisions d'adéquation ou des clauses contractuelles types pour garantir que vos données restent protégées selon les normes de l'UE.",
    sectionRights: "Vos droits",
    rightsIntro: "En vertu du RGPD, vous avez le droit de :",
    rights: [
      "Accéder aux données personnelles que nous détenons à votre sujet",
      "Corriger des données inexactes ou incomplètes",
      "Demander la suppression de vos données (« droit à l'oubli »)",
      "Transférer vos données vers un autre fournisseur dans un format lisible par machine",
      "Vous opposer à certains traitements ou en demander la limitation, y compris le marketing direct",
      "Vous désinscrire des communications marketing à tout moment",
      "Déposer une plainte auprès de votre autorité locale de protection des données",
    ],
    rightsContactBefore: "Pour exercer l'un de ces droits, contactez-nous à ",
    rightsContactAfter: ".",
    dpaBefore:
      "Notre société étant établie en Belgique, vous avez également le droit de déposer une plainte directement auprès de l'Autorité de protection des données belge, ",
    dpaAddress: "Rue de la Presse 35, 1000 Bruxelles, Belgique",
    dpaAfter: " — ",
    sectionCookies: "Cookies",
    cookiesBefore:
      "Nous utilisons des cookies essentiels pour faire fonctionner la boutique et, avec votre consentement, des cookies analytiques pour l'améliorer. Vous pouvez gérer vos préférences à tout moment dans notre ",
    cookiesLinkLabel: "politique de cookies",
    cookiesAfter: ".",
    sectionChanges: "Modifications de cette politique",
    changes:
      "Nous pouvons mettre à jour cette politique de confidentialité de temps à autre pour refléter les changements de nos pratiques ou des exigences légales. Les modifications substantielles seront reflétées sur cette page avec une date de « dernière mise à jour » actualisée.",
    sectionContact: "Nous contacter",
    contactBefore: "Pour toute question concernant cette politique ou vos données, contactez Ln-Squared à ",
    contactPhoneLabel: ", par téléphone au +49 30 1234 5678, ou par courrier à Rue du Chénia 17, 7170 Manage, Hainaut, Belgique.",
    contactAfter: "",
  },
  it: {
    sectionWhoWeAre: "Chi siamo",
    whoWeAre:
      "Il negozio online 3DJools è gestito da Ln-Squared, Rue du Chénia 17, 7170 Manage, Hainaut, Belgio (n. società 0564.743.304, P.IVA BE0564743304), che agisce come titolare del trattamento ai fini della presente informativa. Questa informativa sulla privacy spiega come raccogliamo, utilizziamo e proteggiamo i tuoi dati personali in conformità al Regolamento generale sulla protezione dei dati dell'UE (GDPR).",
    sectionDataWeCollect: "Dati che raccogliamo",
    dataWeCollect:
      "Raccogliamo le informazioni che fornisci al momento dell'ordine o del contatto (nome, indirizzo, e-mail, telefono, dettagli di pagamento) e dati tecnici come i cookie necessari per far funzionare il negozio e comprenderne l'utilizzo.",
    sectionHowWeUse: "Come utilizziamo i tuoi dati",
    howWeUse:
      "I tuoi dati vengono utilizzati per elaborare gli ordini, organizzare la consegna, fornire assistenza e — con il tuo consenso — inviarti comunicazioni di marketing. Non vendiamo mai i tuoi dati personali.",
    sectionLegalBasis: "Base giuridica del trattamento",
    legalBasisIntro: "Trattiamo i tuoi dati personali solo quando disponiamo di una base giuridica valida:",
    legalBasis: [
      { title: "Esecuzione del contratto", text: "trattamento dei dati di ordine, pagamento e consegna per adempiere a un acquisto o a un contratto di rateizzazione" },
      { title: "Obbligo legale", text: "conservazione dei registri di fatturazione e fiscali come richiesto dalla legge belga e dell'UE" },
      { title: "Interesse legittimo", text: "prevenzione delle frodi, protezione dei nostri sistemi e funzionamento essenziale del negozio" },
      { title: "Consenso", text: "invio di comunicazioni di marketing e utilizzo di cookie analitici non essenziali, che puoi revocare in qualsiasi momento" },
    ],
    sectionProviders: "Fornitori di servizi che utilizziamo",
    providersIntro:
      "Condividiamo i dati personali con un numero limitato di fornitori di servizi che li trattano per nostro conto, esclusivamente per gestire il negozio:",
    providers: [
      { title: "Vercel", text: "hosting e infrastruttura dell'applicazione" },
      { title: "Neon", text: "hosting del database per i dati di ordini e account" },
      { title: "Vercel Blob", text: "archiviazione di immagini dei prodotti e file caricati" },
      { title: "Zoho Mail / Titan Email", text: "invio di e-mail transazionali come conferme d'ordine e risposte dell'assistenza" },
    ],
    providersClosing:
      "Ogni fornitore è vincolato da un accordo di trattamento dei dati e può utilizzare i tuoi dati solo per fornire il servizio per cui lo abbiamo incaricato.",
    sectionRetention: "Conservazione dei dati",
    retention:
      "Conserviamo i dati di ordini e fatturazione per il tempo richiesto dalla normativa fiscale e commerciale (generalmente fino a 10 anni), i dati dell'account finché il tuo account è attivo e i dati di marketing fino alla revoca del tuo consenso. I dati non più necessari a questi fini vengono cancellati o resi anonimi in modo sicuro.",
    sectionTransfers: "Trasferimenti internazionali",
    transfers:
      "I tuoi dati vengono trattati principalmente all'interno dello Spazio economico europeo. Quando un fornitore di servizi che utilizziamo (come un partner di pagamento o logistico) si trova al di fuori dello SEE, ci basiamo su decisioni di adeguatezza o clausole contrattuali standard per garantire che i tuoi dati rimangano protetti secondo gli standard dell'UE.",
    sectionRights: "I tuoi diritti",
    rightsIntro: "Ai sensi del GDPR, hai il diritto di:",
    rights: [
      "Accedere ai dati personali che conserviamo su di te",
      "Correggere dati inesatti o incompleti",
      "Richiedere la cancellazione dei tuoi dati (\u201cdiritto all'oblio\u201d)",
      "Trasferire i tuoi dati a un altro fornitore in un formato leggibile da computer",
      "Opporti o limitare determinati trattamenti, incluso il marketing diretto",
      "Annullare l'iscrizione alle comunicazioni di marketing in qualsiasi momento",
      "Presentare un reclamo alla tua autorità locale di protezione dei dati",
    ],
    rightsContactBefore: "Per esercitare uno di questi diritti, contattaci all'indirizzo ",
    rightsContactAfter: ".",
    dpaBefore:
      "Poiché la nostra azienda è stabilita in Belgio, hai anche il diritto di presentare un reclamo direttamente all'Autorità belga per la protezione dei dati (Autorité de protection des données / Gegevensbeschermingsautoriteit), ",
    dpaAddress: "Rue de la Presse 35, 1000 Bruxelles, Belgio",
    dpaAfter: " — ",
    sectionCookies: "Cookie",
    cookiesBefore:
      "Utilizziamo cookie essenziali per far funzionare il negozio e, con il tuo consenso, cookie analitici per migliorarlo. Puoi gestire le tue preferenze in qualsiasi momento nella nostra ",
    cookiesLinkLabel: "informativa sui cookie",
    cookiesAfter: ".",
    sectionChanges: "Modifiche a questa informativa",
    changes:
      "Potremmo aggiornare questa informativa sulla privacy di tanto in tanto per riflettere modifiche alle nostre pratiche o ai requisiti legali. Le modifiche sostanziali saranno riportate in questa pagina con una data di \u201cultimo aggiornamento\u201d aggiornata.",
    sectionContact: "Contattaci",
    contactBefore: "Per qualsiasi domanda su questa informativa o sui tuoi dati, contatta Ln-Squared all'indirizzo ",
    contactPhoneLabel: ", per telefono al +49 30 1234 5678, o per posta a Rue du Chénia 17, 7170 Manage, Hainaut, Belgio.",
    contactAfter: "",
  },
  es: {
    sectionWhoWeAre: "Quiénes somos",
    whoWeAre:
      "La tienda online 3DJools está operada por Ln-Squared, Rue du Chénia 17, 7170 Manage, Hainaut, Bélgica (N.º de empresa 0564.743.304, IVA BE0564743304), que actúa como responsable del tratamiento a efectos de esta política. Esta política de privacidad explica cómo recopilamos, utilizamos y protegemos tus datos personales de conformidad con el Reglamento General de Protección de Datos de la UE (RGPD).",
    sectionDataWeCollect: "Datos que recopilamos",
    dataWeCollect:
      "Recopilamos la información que proporcionas al realizar un pedido o contactarnos (nombre, dirección, correo electrónico, teléfono, datos de pago) y datos técnicos como cookies necesarias para el funcionamiento de la tienda y para entender su uso.",
    sectionHowWeUse: "Cómo usamos tus datos",
    howWeUse:
      "Tus datos se utilizan para procesar pedidos, organizar la entrega, ofrecer soporte y — con tu consentimiento — enviarte comunicaciones de marketing. Nunca vendemos tus datos personales.",
    sectionLegalBasis: "Base legal del tratamiento",
    legalBasisIntro: "Solo tratamos tus datos personales cuando contamos con una base legal válida para hacerlo:",
    legalBasis: [
      { title: "Ejecución del contrato", text: "tratamiento de los datos de tu pedido, pago y entrega para cumplir una compra o un contrato de financiación a plazos" },
      { title: "Obligación legal", text: "conservación de registros de facturación e impuestos según lo exige la legislación belga y de la UE" },
      { title: "Interés legítimo", text: "prevención del fraude, protección de nuestros sistemas y funcionamiento esencial de la tienda" },
      { title: "Consentimiento", text: "envío de comunicaciones de marketing y uso de cookies analíticas no esenciales, que puedes retirar en cualquier momento" },
    ],
    sectionProviders: "Proveedores de servicios que utilizamos",
    providersIntro:
      "Compartimos datos personales con un número limitado de proveedores de servicios que los tratan en nuestro nombre, exclusivamente para operar la tienda:",
    providers: [
      { title: "Vercel", text: "alojamiento e infraestructura de la aplicación" },
      { title: "Neon", text: "alojamiento de la base de datos para registros de pedidos y cuentas" },
      { title: "Vercel Blob", text: "almacenamiento de imágenes de productos y archivos subidos" },
      { title: "Zoho Mail / Titan Email", text: "envío de correos transaccionales como confirmaciones de pedido y respuestas de soporte" },
    ],
    providersClosing:
      "Cada proveedor está sujeto a un acuerdo de tratamiento de datos y solo puede utilizar tus datos para prestar el servicio para el que lo hemos contratado.",
    sectionRetention: "Retención de datos",
    retention:
      "Conservamos los datos de pedidos y facturación durante el tiempo exigido por la legislación fiscal y comercial (generalmente hasta 10 años), los datos de la cuenta mientras esta esté activa, y los datos de marketing hasta que retires tu consentimiento. Los datos que ya no son necesarios para estos fines se eliminan o anonimizan de forma segura.",
    sectionTransfers: "Transferencias internacionales",
    transfers:
      "Tus datos se procesan principalmente dentro del Espacio Económico Europeo. Cuando un proveedor de servicios que utilizamos (como un socio de pagos o logística) se encuentra fuera del EEE, nos basamos en decisiones de adecuación o cláusulas contractuales tipo para garantizar que tus datos permanezcan protegidos conforme a los estándares de la UE.",
    sectionRights: "Tus derechos",
    rightsIntro: "Conforme al RGPD, tienes derecho a:",
    rights: [
      "Acceder a los datos personales que conservamos sobre ti",
      "Corregir datos inexactos o incompletos",
      "Solicitar la eliminación de tus datos (\u201cderecho al olvido\u201d)",
      "Transferir tus datos a otro proveedor en un formato legible por máquina",
      "Oponerte o restringir determinados tratamientos, incluido el marketing directo",
      "Darte de baja de las comunicaciones de marketing en cualquier momento",
      "Presentar una reclamación ante tu autoridad local de protección de datos",
    ],
    rightsContactBefore: "Para ejercer cualquiera de estos derechos, contáctanos en ",
    rightsContactAfter: ".",
    dpaBefore:
      "Dado que nuestra empresa está establecida en Bélgica, también tienes derecho a presentar una reclamación directamente ante la Autoridad Belga de Protección de Datos (Autorité de protection des données / Gegevensbeschermingsautoriteit), ",
    dpaAddress: "Rue de la Presse 35, 1000 Bruselas, Bélgica",
    dpaAfter: " — ",
    sectionCookies: "Cookies",
    cookiesBefore:
      "Utilizamos cookies esenciales para el funcionamiento de la tienda y, con tu consentimiento, cookies analíticas para mejorarla. Puedes gestionar tus preferencias en cualquier momento en nuestra ",
    cookiesLinkLabel: "política de cookies",
    cookiesAfter: ".",
    sectionChanges: "Cambios en esta política",
    changes:
      "Podemos actualizar esta política de privacidad de vez en cuando para reflejar cambios en nuestras prácticas o requisitos legales. Los cambios sustanciales se reflejarán en esta página con una fecha de \u201cúltima actualización\u201d actualizada.",
    sectionContact: "Contáctanos",
    contactBefore: "Para cualquier pregunta sobre esta política o tus datos, contacta con Ln-Squared en ",
    contactPhoneLabel: ", por teléfono al +49 30 1234 5678, o por correo postal a Rue du Chénia 17, 7170 Manage, Hainaut, Bélgica.",
    contactAfter: "",
  },
  nl: {
    sectionWhoWeAre: "Wie wij zijn",
    whoWeAre:
      "De 3DJools-webshop wordt beheerd door Ln-Squared, Rue du Chénia 17, 7170 Manage, Hainaut, België (ondernemingsnr. 0564.743.304, btw BE0564743304), dat optreedt als verwerkingsverantwoordelijke in de zin van dit beleid. Dit privacybeleid legt uit hoe wij uw persoonsgegevens verzamelen, gebruiken en beschermen in overeenstemming met de Algemene Verordening Gegevensbescherming (AVG).",
    sectionDataWeCollect: "Gegevens die wij verzamelen",
    dataWeCollect:
      "Wij verzamelen de informatie die u verstrekt bij het plaatsen van een bestelling of bij contact met ons (naam, adres, e-mail, telefoon, betaalgegevens) en technische gegevens zoals cookies die nodig zijn om de winkel te laten werken en te begrijpen hoe deze wordt gebruikt.",
    sectionHowWeUse: "Hoe wij uw gegevens gebruiken",
    howWeUse:
      "Uw gegevens worden gebruikt om bestellingen te verwerken, levering te regelen, ondersteuning te bieden en — met uw toestemming — u marketingcommunicatie te sturen. Wij verkopen uw persoonsgegevens nooit.",
    sectionLegalBasis: "Rechtsgrond voor verwerking",
    legalBasisIntro: "Wij verwerken uw persoonsgegevens alleen wanneer wij hiervoor een geldige rechtsgrond hebben:",
    legalBasis: [
      { title: "Uitvoering van de overeenkomst", text: "verwerking van uw bestel-, betaal- en leveringsgegevens om een aankoop of afbetalingsovereenkomst na te komen" },
      { title: "Wettelijke verplichting", text: "het bewaren van facturerings- en belastinggegevens zoals vereist door Belgisch en EU-recht" },
      { title: "Gerechtvaardigd belang", text: "fraudepreventie, beveiliging van onze systemen en essentiële werking van de winkel" },
      { title: "Toestemming", text: "het versturen van marketingcommunicatie en het gebruik van niet-essentiële analytische cookies, die u op elk moment kunt intrekken" },
    ],
    sectionProviders: "Dienstverleners die wij gebruiken",
    providersIntro:
      "Wij delen persoonsgegevens met een beperkt aantal dienstverleners die deze namens ons verwerken, uitsluitend om de winkel te laten functioneren:",
    providers: [
      { title: "Vercel", text: "hosting en infrastructuur van de applicatie" },
      { title: "Neon", text: "database-hosting voor bestel- en accountgegevens" },
      { title: "Vercel Blob", text: "opslag van productafbeeldingen en geüploade bestanden" },
      { title: "Zoho Mail / Titan Email", text: "het verzenden van transactionele e-mails zoals bestelbevestigingen en supportreacties" },
    ],
    providersClosing:
      "Elke dienstverlener is gebonden aan een verwerkersovereenkomst en mag uw gegevens uitsluitend gebruiken om de dienst te leveren waarvoor wij hen hebben ingeschakeld.",
    sectionRetention: "Bewaartermijn",
    retention:
      "Wij bewaren bestel- en factureringsgegevens zolang de belasting- en handelswetgeving dit vereist (doorgaans tot 10 jaar), accountgegevens zolang uw account actief is, en marketinggegevens totdat u uw toestemming intrekt. Gegevens die niet langer nodig zijn voor deze doeleinden worden veilig verwijderd of geanonimiseerd.",
    sectionTransfers: "Internationale overdrachten",
    transfers:
      "Uw gegevens worden voornamelijk verwerkt binnen de Europese Economische Ruimte. Wanneer een door ons gebruikte dienstverlener (zoals een betaal- of logistieke partner) buiten de EER is gevestigd, vertrouwen wij op adequaatheidsbesluiten of modelcontractbepalingen om ervoor te zorgen dat uw gegevens beschermd blijven volgens EU-normen.",
    sectionRights: "Uw rechten",
    rightsIntro: "Onder de AVG heeft u het recht om:",
    rights: [
      "Toegang te krijgen tot de persoonsgegevens die wij over u bewaren",
      "Onjuiste of onvolledige gegevens te corrigeren",
      "Verwijdering van uw gegevens te vragen (\u201crecht op vergetelheid\u201d)",
      "Uw gegevens in een machineleesbaar formaat over te dragen aan een andere aanbieder",
      "Bezwaar te maken tegen of beperking te vragen van bepaalde verwerkingen, waaronder directe marketing",
      "U op elk moment af te melden voor marketingcommunicatie",
      "Een klacht in te dienen bij uw lokale gegevensbeschermingsautoriteit",
    ],
    rightsContactBefore: "Om een van deze rechten uit te oefenen, neemt u contact met ons op via ",
    rightsContactAfter: ".",
    dpaBefore:
      "Aangezien ons bedrijf in België is gevestigd, heeft u ook het recht om rechtstreeks een klacht in te dienen bij de Belgische Gegevensbeschermingsautoriteit (Autorité de protection des données / Gegevensbeschermingsautoriteit), ",
    dpaAddress: "Rue de la Presse 35, 1000 Brussel, België",
    dpaAfter: " — ",
    sectionCookies: "Cookies",
    cookiesBefore:
      "Wij gebruiken essentiële cookies om de winkel te laten werken en, met uw toestemming, analytische cookies om deze te verbeteren. U kunt uw voorkeuren op elk moment beheren in ons ",
    cookiesLinkLabel: "cookiebeleid",
    cookiesAfter: ".",
    sectionChanges: "Wijzigingen in dit beleid",
    changes:
      "Wij kunnen dit privacybeleid van tijd tot tijd bijwerken om wijzigingen in onze praktijken of wettelijke vereisten weer te geven. Materiële wijzigingen worden op deze pagina weergegeven met een bijgewerkte datum van \u201claatst bijgewerkt\u201d.",
    sectionContact: "Contact",
    contactBefore: "Voor vragen over dit beleid of uw gegevens, neem contact op met Ln-Squared via ",
    contactPhoneLabel: ", telefonisch op +49 30 1234 5678, of per post op Rue du Chénia 17, 7170 Manage, Hainaut, België.",
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
  const c = COPY[locale]

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
          <InlineEmail email="info@3djools.com" />
          {c.rightsContactAfter}
        </p>
        <p>
          {c.dpaBefore}
          {c.dpaAddress}
          {c.dpaAfter}
          <InlineEmail email="contact@apd-gba.be" />
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
          <InlineEmail email="info@3djools.com" />
          {c.contactPhoneLabel}
        </p>
      </ProseSection>
    </ProsePage>
  )
}
