import { isLocale, type Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { ProsePage, ProseSection } from "@/components/legal/prose-page"
import { COMPANY, fillCompany } from "@/lib/company"

type ImpressumCopy = {
  companyHeading: string
  tradingName: string
  visitAddressLabel: string
  legalFormHeading: string
  legalFormLabel: string
  legalForm: string
  incorporatedLabel: string
  incorporated: string
  activitiesHeading: string
  activities: string
  managementHeading: string
  management: string
  shareholderHeading: string
  shareholder: string
  contactHeading: string
  emailLabel: string
  phoneLabel: string
  registrationHeading: string
  companyNumberLabel: string
  establishmentLabel: string
  rsinLabel: string
  vatLabel: string
  accounts: string
  odrHeading: string
  odr: string
}

const COPY: Record<Locale, ImpressumCopy> = {
  en: {
    companyHeading: "Corporate identity & office address",
    tradingName: "DnD3D (commercial trading name)",
    visitAddressLabel: "Registered office & visiting address",
    legalFormHeading: "Corporate structure & date of formation",
    legalFormLabel: "Entity type",
    legalForm: "Besloten vennootschap (B.V.)",
    incorporatedLabel: "Date of incorporation",
    incorporated: "Formed by notarial deed on 15 December 2020 and entered into the Dutch Trade Register on the same date. Statutory seat: Amsterdam.",
    activitiesHeading: "Registered business classifications",
    activities: "SBI 46180 — wholesale trade intermediation in miscellaneous goods. SBI 47120 — non-specialised retail trade. The company imports merchandise and distributes it to customers across the European Union.",
    managementHeading: "Managing directors (Bestuurders)",
    management: "Thomas Hamish Mckenzie (born 25 January 1967) and Angela Min Zhang (born 5 July 1966). Both directors took office on 15 December 2020 and each holds sole, independent authority to represent the company.",
    shareholderHeading: "Sole shareholder",
    shareholder: "BJX BUSINESS GROUP LIMITED, 17 St. Peters Place, Fleetwood, Lancashire FY7 6EB, United Kingdom (registered with Companies House for England and Wales under number 07547438), acting as sole shareholder since 15 December 2020.",
    contactHeading: "Direct communication channels",
    emailLabel: "Electronic mail",
    phoneLabel: "Telephone",
    registrationHeading: "Trade Register & tax identifiers",
    companyNumberLabel: "KvK registration number",
    establishmentLabel: "Establishment number (Vestigingsnummer)",
    rsinLabel: "RSIN",
    vatLabel: "EU VAT identification number",
    accounts: "Annual financial statements for the 2025 fiscal year were filed on 19 June 2026.",
    odrHeading: "EU Online Dispute Resolution",
    odr: "The European Commission hosts an Online Dispute Resolution (ODR) portal at https://ec.europa.eu/consumers/odr. We are neither legally required nor willing to take part in dispute settlement proceedings before a consumer arbitration body.",
  },
  de: {
    companyHeading: "Unternehmensidentität & Anschrift",
    tradingName: "DnD3D (Geschäftsbezeichnung / Handelsname)",
    visitAddressLabel: "Geschäfts- und Besuchsadresse",
    legalFormHeading: "Gesellschaftsform & Gründung",
    legalFormLabel: "Rechtsform",
    legalForm: "Besloten vennootschap (B.V.)",
    incorporatedLabel: "Gründungsdatum",
    incorporated: "Errichtet durch notarielle Gründungsurkunde am 15. Dezember 2020 und am selben Tag im niederländischen Handelsregister eingetragen. Satzungssitz: Amsterdam.",
    activitiesHeading: "Eingetragene Geschäftstätigkeiten",
    activities: "SBI 46180 — Handelsvermittlung im Großhandel mit sonstigen Waren. SBI 47120 — sonstiger nicht spezialisierter Einzelhandel. Das Unternehmen importiert Waren und vertreibt sie an Kunden in der Europäischen Union.",
    managementHeading: "Vertretungsberechtigte Geschäftsführer",
    management: "Thomas Hamish Mckenzie (geb. 25. Januar 1967) und Angela Min Zhang (geb. 5. Juli 1966). Beide wurden am 15. Dezember 2020 bestellt und sind jeweils einzeln und selbstständig zur Vertretung der Gesellschaft befugt.",
    shareholderHeading: "Alleingesellschafter",
    shareholder: "BJX BUSINESS GROUP LIMITED, 17 St. Peters Place, Fleetwood, Lancashire FY7 6EB, Vereinigtes Königreich (eingetragen beim Companies House für England und Wales unter der Nummer 07547438), Alleingesellschafterin seit dem 15. Dezember 2020.",
    contactHeading: "Direkte Kontaktwege",
    emailLabel: "E-Mail",
    phoneLabel: "Telefon",
    registrationHeading: "Handelsregister- & Steuerkennnummern",
    companyNumberLabel: "KvK-Registernummer",
    establishmentLabel: "Niederlassungsnummer",
    rsinLabel: "RSIN",
    vatLabel: "Umsatzsteuer-Identifikationsnummer",
    accounts: "Der Jahresabschluss für das Geschäftsjahr 2025 wurde am 19. Juni 2026 hinterlegt.",
    odrHeading: "EU-Online-Streitbeilegung",
    odr: "Die Europäische Kommission betreibt unter https://ec.europa.eu/consumers/odr eine Plattform zur Online-Streitbeilegung (OS). Zur Teilnahme an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle sind wir weder verpflichtet noch bereit.",
  },
  fr: {
    companyHeading: "Identité de l'entreprise & siège",
    tradingName: "DnD3D (enseigne commerciale)",
    visitAddressLabel: "Adresse professionnelle et de visite",
    legalFormHeading: "Statut juridique & constitution",
    legalFormLabel: "Forme sociale",
    legalForm: "Besloten vennootschap (B.V.)",
    incorporatedLabel: "Date de constitution",
    incorporated: "Société constituée par acte notarié le 15 décembre 2020 et immatriculée le même jour au registre du commerce néerlandais. Siège statutaire : Amsterdam.",
    activitiesHeading: "Activités déclarées au registre",
    activities: "SBI 46180 — intermédiation du commerce de gros en produits divers. SBI 47120 — autre commerce de détail non spécialisé. L'établissement importe des équipements et les commercialise auprès des clients de l'Union européenne.",
    managementHeading: "Direction générale (Bestuurders)",
    management: "Thomas Hamish Mckenzie (né le 25 janvier 1967) et Angela Min Zhang (née le 5 juillet 1966). Nommés le 15 décembre 2020, chacun dispose du pouvoir individuel et autonome d'engager la société.",
    shareholderHeading: "Associé unique",
    shareholder: "BJX BUSINESS GROUP LIMITED, 17 St. Peters Place, Fleetwood, Lancashire FY7 6EB, Royaume-Uni (enregistrée au Companies House d'Angleterre et du pays de Galles sous le numéro 07547438), actionnaire unique depuis le 15 décembre 2020.",
    contactHeading: "Coordonnées de contact",
    emailLabel: "Courrier électronique",
    phoneLabel: "Téléphone",
    registrationHeading: "Immatriculations & numéro de TVA",
    companyNumberLabel: "Numéro KvK",
    establishmentLabel: "Numéro d'établissement",
    rsinLabel: "RSIN",
    vatLabel: "Numéro de TVA intracommunautaire",
    accounts: "Les comptes annuels relatifs à l'exercice 2025 ont été déposés le 19 juin 2026.",
    odrHeading: "Médiation et règlement en ligne des litiges",
    odr: "La Commission européenne met à disposition un portail de règlement en ligne des litiges (RLL) accessible sur https://ec.europa.eu/consumers/odr. Nous ne sommes ni tenus ni disposés à prendre part à une procédure devant un organisme d'arbitrage de la consommation.",
  },
  it: {
    companyHeading: "Identità societaria & sede",
    tradingName: "DnD3D (denominazione commerciale)",
    visitAddressLabel: "Sede operativa e indirizzo di visita",
    legalFormHeading: "Natura giuridica & costituzione",
    legalFormLabel: "Forma societaria",
    legalForm: "Besloten vennootschap (B.V.)",
    incorporatedLabel: "Data di costituzione",
    incorporated: "Costituita con atto notarile il 15 dicembre 2020 e iscritta in pari data nel registro delle imprese dei Paesi Bassi. Sede statutaria: Amsterdam.",
    activitiesHeading: "Attività economiche registrate",
    activities: "SBI 46180 — intermediazione nel commercio all'ingrosso di altri prodotti. SBI 47120 — altro commercio al dettaglio non specializzato. L'azienda importa merci e le distribuisce ai clienti nell'Unione Europea.",
    managementHeading: "Consiglio di amministrazione",
    management: "Thomas Hamish Mckenzie (nato il 25 gennaio 1967) e Angela Min Zhang (nata il 5 luglio 1966). Entrambi in carica dal 15 dicembre 2020 con potere di firma e rappresentanza disgiunta e autonoma.",
    shareholderHeading: "Socio unico",
    shareholder: "BJX BUSINESS GROUP LIMITED, 17 St. Peters Place, Fleetwood, Lancashire FY7 6EB, Regno Unito (iscritta presso la Companies House per l'Inghilterra e il Galles al n. 07547438), socio unico dal 15 dicembre 2020.",
    contactHeading: "Recapiti diretti",
    emailLabel: "Posta elettronica",
    phoneLabel: "Telefono",
    registrationHeading: "Estremi di iscrizione & partita IVA",
    companyNumberLabel: "Numero KvK",
    establishmentLabel: "Numero di unità locale",
    rsinLabel: "RSIN",
    vatLabel: "Partita IVA comunitaria",
    accounts: "Il bilancio d'esercizio relativo all'anno finanziario 2025 è stato depositato il 19 giugno 2026.",
    odrHeading: "Risoluzione online delle controversie (ODR)",
    odr: "La Commissione europea mette a disposizione la piattaforma ODR per la risoluzione online delle controversie all'indirizzo https://ec.europa.eu/consumers/odr. Non siamo obbligati né intenzionati a partecipare a procedure dinanzi a organismi di conciliazione dei consumatori.",
  },
  es: {
    companyHeading: "Identidad corporativa y domicilio",
    tradingName: "DnD3D (marca comercial)",
    visitAddressLabel: "Dirección comercial y de visita",
    legalFormHeading: "Naturaleza jurídica y constitución",
    legalFormLabel: "Forma societaria",
    legalForm: "Besloten vennootschap (B.V.)",
    incorporatedLabel: "Fecha de constitución",
    incorporated: "Constituida mediante escritura pública el 15 de diciembre de 2020 e inscrita ese mismo día en el Registro Mercantil de los Países Bajos. Domicilio estatutario: Ámsterdam.",
    activitiesHeading: "Actividades económicas inscritas",
    activities: "SBI 46180 — intermediación en el comercio mayorista de mercancías diversas. SBI 47120 — otro comercio minorista no especializado. La sociedad importa bienes y los comercializa a clientes dentro de la Unión Europea.",
    managementHeading: "Órgano de administración",
    management: "Thomas Hamish Mckenzie (nacido el 25 de enero de 1967) y Angela Min Zhang (nacida el 5 de julio de 1966). Ambos nombrados el 15 de diciembre de 2020, ostentando cada uno facultades plenas e independientes de representación.",
    shareholderHeading: "Socio único",
    shareholder: "BJX BUSINESS GROUP LIMITED, 17 St. Peters Place, Fleetwood, Lancashire FY7 6EB, Reino Unido (inscrita en el Registro Mercantil de Inglaterra y Gales con el número 07547438), accionista único desde el 15 de diciembre de 2020.",
    contactHeading: "Canales de contacto",
    emailLabel: "Correo electrónico",
    phoneLabel: "Teléfono",
    registrationHeading: "Datos registrales e identificación fiscal",
    companyNumberLabel: "Número KvK",
    establishmentLabel: "Número de establecimiento",
    rsinLabel: "RSIN",
    vatLabel: "Número de IVA intracomunitario",
    accounts: "Las cuentas anuales correspondientes al ejercicio 2025 quedaron depositadas el 19 de junio de 2026.",
    odrHeading: "Plataforma europea de resolución de litigios",
    odr: "La Comisión Europea facilita una plataforma de resolución de litigios en línea (RLL) disponible en https://ec.europa.eu/consumers/odr. No estamos obligados ni dispuestos a intervenir en procedimientos ante juntas arbitrales de consumo.",
  },
  nl: {
    companyHeading: "Bedrijfsidentiteit & kantooradres",
    tradingName: "DnD3D (handelsnaam)",
    visitAddressLabel: "Bezoek- en vestigingsadres",
    legalFormHeading: "Rechtsvorm & oprichtingsdatum",
    legalFormLabel: "Rechtsvorm",
    legalForm: "Besloten vennootschap (B.V.)",
    incorporatedLabel: "Datum van oprichting",
    incorporated: "Opgericht bij notariële akte op 15 december 2020 en op dezelfde dag ingeschreven in het Nederlandse Handelsregister. Statutaire zetel: Amsterdam.",
    activitiesHeading: "Geregistreerde bedrijfsactiviteiten",
    activities: "SBI-code 46180 — handelsbemiddeling in de groothandel in overige goederen. SBI-code 47120 — overige niet-gespecialiseerde detailhandel. De onderneming importeert goederen en levert deze aan afnemers binnen de Europese Unie.",
    managementHeading: "Bestuurders",
    management: "Thomas Hamish Mckenzie (geboren 25 januari 1967) en Angela Min Zhang (geboren 5 juli 1966). Beiden zijn op 15 december 2020 aangesteld als bestuurder en ieder is alleen en zelfstandig bevoegd om de vennootschap te vertegenwoordigen.",
    shareholderHeading: "Enig aandeelhouder",
    shareholder: "BJX BUSINESS GROUP LIMITED, 17 St. Peters Place, Fleetwood, Lancashire FY7 6EB, Verenigd Koninkrijk (ingeschreven bij Companies House voor England and Wales onder nummer 07547438), enig aandeelhouder sinds 15 december 2020.",
    contactHeading: "Directe contactgegevens",
    emailLabel: "E-mailadres",
    phoneLabel: "Telefoonnummer",
    registrationHeading: "Handelsregister- & btw-gegevens",
    companyNumberLabel: "KvK-nummer",
    establishmentLabel: "Vestigingsnummer",
    rsinLabel: "RSIN",
    vatLabel: "Btw-identificatienummer",
    accounts: "De jaarrekening over het boekjaar 2025 is gedeponeerd op 19 juni 2026.",
    odrHeading: "Online geschillenbeslechting (ODR)",
    odr: "De Europese Commissie biedt via https://ec.europa.eu/consumers/odr een platform voor online geschillenbeslechting aan. Wij zijn noch wettelijk verplicht, noch bereid om deel te nemen aan geschillenprocedures bij een consumentenarbitragecommissie.",
  },
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : "en"
  const dict = await getDictionary(locale)
  return { title: dict.footer.impressum }
}

export default async function ImpressumPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : "en"
  const dict = await getDictionary(locale)
  const t = fillCompany(COPY[locale])

  return (
    <ProsePage
      locale={locale}
      dict={dict}
      title={dict.footer.impressum}
      crumbs={[{ label: dict.common.home, href: "/" }, { label: dict.footer.impressum }]}
    >
      <ProseSection heading={t.companyHeading}>
        <p>
          {t.tradingName}
          <br />
          {COMPANY.legalName}
          <br />
          {t.visitAddressLabel}: {COMPANY.street}
          <br />
          {COMPANY.postalCode} {COMPANY.city}, {COMPANY.country}
        </p>
      </ProseSection>
      <ProseSection heading={t.registrationHeading}>
        <p>
          {t.companyNumberLabel}: {COMPANY.companyNumber}
          <br />
          {t.establishmentLabel}: {COMPANY.establishmentNumber}
          <br />
          {t.rsinLabel}: {COMPANY.rsin}
          <br />
          {t.vatLabel}: {COMPANY.vat}
          <br />
          {t.accounts}
        </p>
      </ProseSection>
      <ProseSection heading={t.legalFormHeading}>
        <p>
          {t.legalFormLabel}: {t.legalForm}
          <br />
          {t.incorporatedLabel}: {t.incorporated}
        </p>
      </ProseSection>
      <ProseSection heading={t.managementHeading}>
        <p>{t.management}</p>
      </ProseSection>
      <ProseSection heading={t.shareholderHeading}>
        <p>{t.shareholder}</p>
      </ProseSection>
      <ProseSection heading={t.activitiesHeading}>
        <p>{t.activities}</p>
      </ProseSection>
      <ProseSection heading={t.contactHeading}>
        <p>
          {t.emailLabel}:{" "}
          <a href={`mailto:${COMPANY.email}`} className="underline underline-offset-2 hover:text-foreground">
            {COMPANY.email}
          </a>
          <br />
          {t.phoneLabel}: <a href={`tel:${COMPANY.phoneTel}`} className="underline underline-offset-2 hover:text-foreground">{COMPANY.phoneDisplay}</a>
          <br />
          WhatsApp:{" "}
          <a href={COMPANY.whatsappUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground">
            {COMPANY.whatsappDisplay}
          </a>
        </p>
      </ProseSection>
      <ProseSection heading={t.odrHeading}>
        <p>{t.odr}</p>
      </ProseSection>
    </ProsePage>
  )
}
