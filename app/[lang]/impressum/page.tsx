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
    companyHeading: "Company details",
    tradingName: "DnD3D (trading name)",
    visitAddressLabel: "Visit address",
    legalFormHeading: "Legal form & incorporation",
    legalFormLabel: "Legal form",
    legalForm: "Besloten vennootschap (B.V.)",
    incorporatedLabel: "Incorporated",
    incorporated: "15 December 2020, by deed of incorporation. First entry in the Dutch Trade Register on the same date. Statutory seat: Amsterdam.",
    activitiesHeading: "Registered activities",
    activities: "SBI 46180 — wholesale intermediation in other goods. SBI 47120 — other non-specialised retail. The establishment imports goods and sells them to customers in the EU.",
    managementHeading: "Directors",
    management: "Thomas Hamish Mckenzie, born 25 January 1967, and Angela Min Zhang, born 5 July 1966. Each was appointed on 15 December 2020 and is independently authorised to represent the company.",
    shareholderHeading: "Sole shareholder",
    shareholder: "BJX BUSINESS GROUP LIMITED, 17 St. Peters Place, Fleetwood, Lancashire FY7 6EB, United Kingdom, registered in England and Wales under number 07547438. Sole shareholder since 15 December 2020.",
    contactHeading: "Contact",
    emailLabel: "Email",
    phoneLabel: "Phone",
    registrationHeading: "Registration & VAT",
    companyNumberLabel: "KvK number",
    establishmentLabel: "Establishment number",
    rsinLabel: "RSIN",
    vatLabel: "VAT identification number",
    accounts: "The annual accounts for financial year 2025 were filed on 19 June 2026.",
    odrHeading: "Online dispute resolution",
    odr: "The European Commission provides a platform for online dispute resolution (ODR): https://ec.europa.eu/consumers/odr. We are neither obliged nor willing to participate in dispute resolution proceedings before a consumer arbitration board.",
  },
  de: {
    companyHeading: "Unternehmensangaben",
    tradingName: "DnD3D (Handelsname)",
    visitAddressLabel: "Besuchsadresse",
    legalFormHeading: "Rechtsform & Gründung",
    legalFormLabel: "Rechtsform",
    legalForm: "Besloten vennootschap (B.V.)",
    incorporatedLabel: "Gegründet",
    incorporated: "15. Dezember 2020 durch Gründungsurkunde. Ersteintragung im niederländischen Handelsregister am selben Tag. Satzungssitz: Amsterdam.",
    activitiesHeading: "Eingetragene Tätigkeiten",
    activities: "SBI 46180 — Handelsvermittlung im Großhandel mit sonstigen Waren. SBI 47120 — sonstiger nicht spezialisierter Einzelhandel. Die Niederlassung importiert Waren und verkauft sie an Kunden in der EU.",
    managementHeading: "Geschäftsführung",
    management: "Thomas Hamish Mckenzie, geboren am 25. Januar 1967, und Angela Min Zhang, geboren am 5. Juli 1966. Beide sind seit dem 15. Dezember 2020 als bestuurder bestellt und jeweils allein vertretungsberechtigt.",
    shareholderHeading: "Einziger Gesellschafter",
    shareholder: "BJX BUSINESS GROUP LIMITED, 17 St. Peters Place, Fleetwood, Lancashire FY7 6EB, Vereinigtes Königreich, eingetragen in England und Wales unter der Nummer 07547438. Einziger Gesellschafter seit dem 15. Dezember 2020.",
    contactHeading: "Kontakt",
    emailLabel: "E-Mail",
    phoneLabel: "Telefon",
    registrationHeading: "Registrierung & USt-IdNr.",
    companyNumberLabel: "KvK-Nummer",
    establishmentLabel: "Niederlassungsnummer",
    rsinLabel: "RSIN",
    vatLabel: "Umsatzsteuer-Identifikationsnummer",
    accounts: "Der Jahresabschluss für das Geschäftsjahr 2025 wurde am 19. Juni 2026 hinterlegt.",
    odrHeading: "Online-Streitbeilegung",
    odr: "Die Europäische Kommission stellt eine Plattform für Online-Streitbeilegung (OS) bereit: https://ec.europa.eu/consumers/odr. Wir sind weder verpflichtet noch bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.",
  },
  fr: {
    companyHeading: "Informations sur l'entreprise",
    tradingName: "DnD3D (nom commercial)",
    visitAddressLabel: "Adresse de visite",
    legalFormHeading: "Forme juridique & constitution",
    legalFormLabel: "Forme juridique",
    legalForm: "Besloten vennootschap (B.V.)",
    incorporatedLabel: "Constituée le",
    incorporated: "15 décembre 2020, par acte de constitution. Première inscription au registre du commerce néerlandais le même jour. Siège statutaire : Amsterdam.",
    activitiesHeading: "Activités enregistrées",
    activities: "SBI 46180 — intermédiation en gros d'autres marchandises. SBI 47120 — autre commerce de détail non spécialisé. L'établissement importe des marchandises et les vend à des clients dans l'UE.",
    managementHeading: "Administrateurs",
    management: "Thomas Hamish Mckenzie, né le 25 janvier 1967, et Angela Min Zhang, née le 5 juillet 1966. Chacun est administrateur depuis le 15 décembre 2020 et peut représenter seul la société.",
    shareholderHeading: "Actionnaire unique",
    shareholder: "BJX BUSINESS GROUP LIMITED, 17 St. Peters Place, Fleetwood, Lancashire FY7 6EB, Royaume-Uni, immatriculée en Angleterre et au pays de Galles sous le numéro 07547438. Actionnaire unique depuis le 15 décembre 2020.",
    contactHeading: "Contact",
    emailLabel: "E-mail",
    phoneLabel: "Téléphone",
    registrationHeading: "Immatriculation & TVA",
    companyNumberLabel: "Numéro KvK",
    establishmentLabel: "Numéro d'établissement",
    rsinLabel: "RSIN",
    vatLabel: "Numéro de TVA intracommunautaire",
    accounts: "Les comptes annuels de l'exercice 2025 ont été déposés le 19 juin 2026.",
    odrHeading: "Règlement en ligne des litiges",
    odr: "La Commission européenne met à disposition une plateforme de règlement en ligne des litiges (RLL) : https://ec.europa.eu/consumers/odr. Nous ne sommes ni tenus ni disposés à participer à une procédure de règlement des litiges devant un organe de médiation à la consommation.",
  },
  it: {
    companyHeading: "Dati aziendali",
    tradingName: "DnD3D (nome commerciale)",
    visitAddressLabel: "Indirizzo di visita",
    legalFormHeading: "Forma giuridica e costituzione",
    legalFormLabel: "Forma giuridica",
    legalForm: "Besloten vennootschap (B.V.)",
    incorporatedLabel: "Costituita il",
    incorporated: "15 dicembre 2020, con atto costitutivo. Prima iscrizione nel registro delle imprese olandese lo stesso giorno. Sede legale: Amsterdam.",
    activitiesHeading: "Attività registrate",
    activities: "SBI 46180 — intermediazione all'ingrosso di altri beni. SBI 47120 — altro commercio al dettaglio non specializzato. La sede importa beni e li vende a clienti nell'UE.",
    managementHeading: "Amministratori",
    management: "Thomas Hamish Mckenzie, nato il 25 gennaio 1967, e Angela Min Zhang, nata il 5 luglio 1966. Ciascuno è amministratore dal 15 dicembre 2020 ed è autorizzato a rappresentare la società da solo.",
    shareholderHeading: "Socio unico",
    shareholder: "BJX BUSINESS GROUP LIMITED, 17 St. Peters Place, Fleetwood, Lancashire FY7 6EB, Regno Unito, iscritta in Inghilterra e Galles al numero 07547438. Socio unico dal 15 dicembre 2020.",
    contactHeading: "Contatto",
    emailLabel: "E-mail",
    phoneLabel: "Telefono",
    registrationHeading: "Registrazione e IVA",
    companyNumberLabel: "Numero KvK",
    establishmentLabel: "Numero di stabilimento",
    rsinLabel: "RSIN",
    vatLabel: "Numero identificativo IVA",
    accounts: "Il bilancio dell'esercizio 2025 è stato depositato il 19 giugno 2026.",
    odrHeading: "Risoluzione delle controversie online",
    odr: "La Commissione europea offre una piattaforma per la risoluzione delle controversie online (ODR): https://ec.europa.eu/consumers/odr. Non siamo obbligati né disposti a partecipare a procedure di risoluzione delle controversie dinanzi a un organismo di conciliazione dei consumatori.",
  },
  es: {
    companyHeading: "Datos de la empresa",
    tradingName: "DnD3D (nombre comercial)",
    visitAddressLabel: "Dirección de visita",
    legalFormHeading: "Forma jurídica y constitución",
    legalFormLabel: "Forma jurídica",
    legalForm: "Besloten vennootschap (B.V.)",
    incorporatedLabel: "Constituida el",
    incorporated: "15 de diciembre de 2020, por escritura de constitución. Primera inscripción en el registro mercantil neerlandés el mismo día. Domicilio social: Ámsterdam.",
    activitiesHeading: "Actividades registradas",
    activities: "SBI 46180 — intermediación mayorista de otros bienes. SBI 47120 — otro comercio minorista no especializado. El establecimiento importa bienes y los vende a clientes de la UE.",
    managementHeading: "Administradores",
    management: "Thomas Hamish Mckenzie, nacido el 25 de enero de 1967, y Angela Min Zhang, nacida el 5 de julio de 1966. Cada uno es administrador desde el 15 de diciembre de 2020 y puede representar a la sociedad por sí solo.",
    shareholderHeading: "Accionista único",
    shareholder: "BJX BUSINESS GROUP LIMITED, 17 St. Peters Place, Fleetwood, Lancashire FY7 6EB, Reino Unido, inscrita en Inglaterra y Gales con el número 07547438. Accionista único desde el 15 de diciembre de 2020.",
    contactHeading: "Contacto",
    emailLabel: "Correo electrónico",
    phoneLabel: "Teléfono",
    registrationHeading: "Registro e IVA",
    companyNumberLabel: "Número KvK",
    establishmentLabel: "Número de establecimiento",
    rsinLabel: "RSIN",
    vatLabel: "Número de identificación fiscal (IVA)",
    accounts: "Las cuentas anuales del ejercicio 2025 se depositaron el 19 de junio de 2026.",
    odrHeading: "Resolución de litigios en línea",
    odr: "La Comisión Europea ofrece una plataforma de resolución de litigios en línea (RLL): https://ec.europa.eu/consumers/odr. No estamos obligados ni dispuestos a participar en procedimientos de resolución de litigios ante un órgano de arbitraje de consumo.",
  },
  nl: {
    companyHeading: "Bedrijfsgegevens",
    tradingName: "DnD3D (handelsnaam)",
    visitAddressLabel: "Bezoekadres",
    legalFormHeading: "Rechtsvorm en oprichting",
    legalFormLabel: "Rechtsvorm",
    legalForm: "Besloten vennootschap",
    incorporatedLabel: "Opgericht",
    incorporated: "15 december 2020, bij akte van oprichting. Eerste inschrijving in het Handelsregister op dezelfde datum. Statutaire zetel: Amsterdam.",
    activitiesHeading: "Geregistreerde activiteiten",
    activities: "SBI-code 46180 — handelsbemiddeling in de groothandel in overige goederen. SBI-code 47120 — overige niet-gespecialiseerde detailhandel. De vestiging importeert goederen en verkoopt deze aan EU-klanten.",
    managementHeading: "Bestuurders",
    management: "Thomas Hamish Mckenzie, geboren 25 januari 1967, en Angela Min Zhang, geboren 5 juli 1966. Beiden zijn sinds 15 december 2020 bestuurder en ieder alleen/zelfstandig bevoegd.",
    shareholderHeading: "Enig aandeelhouder",
    shareholder: "BJX BUSINESS GROUP LIMITED, 17 St. Peters Place, Fleetwood, Lancashire FY7 6EB, Verenigd Koninkrijk, ingeschreven bij Companies House (England and Wales) onder nummer 07547438. Enig aandeelhouder sinds 15 december 2020.",
    contactHeading: "Contact",
    emailLabel: "E-mail",
    phoneLabel: "Telefoon",
    registrationHeading: "Registratie en btw",
    companyNumberLabel: "KvK-nummer",
    establishmentLabel: "Vestigingsnummer",
    rsinLabel: "RSIN",
    vatLabel: "Btw-identificatienummer",
    accounts: "De jaarrekening over boekjaar 2025 is gedeponeerd op 19 juni 2026.",
    odrHeading: "Online geschillenbeslechting",
    odr: "De Europese Commissie biedt een platform voor online geschillenbeslechting (ODR): https://ec.europa.eu/consumers/odr. Wij zijn niet verplicht en ook niet bereid deel te nemen aan geschillenbeslechtingsprocedures voor een consumentenarbitrage-instantie.",
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
      <ProseSection heading={t.legalFormHeading}>
        <p>
          {t.legalFormLabel}: {t.legalForm}
          <br />
          {t.incorporatedLabel}: {t.incorporated}
        </p>
      </ProseSection>
      <ProseSection heading={t.activitiesHeading}>
        <p>{t.activities}</p>
      </ProseSection>
      <ProseSection heading={t.managementHeading}>
        <p>{t.management}</p>
      </ProseSection>
      <ProseSection heading={t.shareholderHeading}>
        <p>{t.shareholder}</p>
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
      <ProseSection heading={t.odrHeading}>
        <p>{t.odr}</p>
      </ProseSection>
    </ProsePage>
  )
}
