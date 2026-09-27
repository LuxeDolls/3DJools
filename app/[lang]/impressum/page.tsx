import { isLocale, type Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { ProsePage, ProseSection } from "@/components/legal/prose-page"

type ImpressumCopy = {
  companyHeading: string
  tradingName: string
  legalFormHeading: string
  legalFormLabel: string
  legalForm: string
  incorporatedLabel: string
  incorporated: string
  capitalLabel: string
  managementHeading: string
  management: string
  foundersHeading: string
  founders: string
  contactHeading: string
  emailLabel: string
  phoneLabel: string
  registrationHeading: string
  companyNumberLabel: string
  safeNumberLabel: string
  vatLabel: string
  odrHeading: string
  odr: string
}

const COPY: Record<Locale, ImpressumCopy> = {
  en: {
    companyHeading: "Company details",
    tradingName: "3DJools (trading name)",
    legalFormHeading: "Legal form & incorporation",
    legalFormLabel: "Legal form",
    legalForm: "Société privée à responsabilité limitée (SPRL)",
    incorporatedLabel: "Incorporated",
    incorporated: "15 October 2014, by deed of notary Léopold Derbaix",
    capitalLabel: "Registered share capital",
    managementHeading: "Management",
    management: "Sole manager: Xavier Nyssen, appointed for an indefinite term at incorporation.",
    foundersHeading: "Founders",
    founders:
      "Xavier Jean Georges Nyssen and Elodie Claudine Ghislaine Godefroid, founding shareholders, both domiciled at Rue des Quatre Jalouses 4, 7181 Seneffe, Belgium at the time of incorporation.",
    contactHeading: "Contact",
    emailLabel: "Email",
    phoneLabel: "Phone",
    registrationHeading: "Registration & VAT",
    companyNumberLabel: "Company number",
    safeNumberLabel: "Safe number",
    vatLabel: "VAT identification number",
    odrHeading: "Online dispute resolution",
    odr: "The European Commission provides a platform for online dispute resolution (ODR): https://ec.europa.eu/consumers/odr. We are neither obliged nor willing to participate in dispute resolution proceedings before a consumer arbitration board.",
  },
  de: {
    companyHeading: "Unternehmensangaben",
    tradingName: "3DJools (Handelsname)",
    legalFormHeading: "Rechtsform & Gründung",
    legalFormLabel: "Rechtsform",
    legalForm: "Société privée à responsabilité limitée (SPRL)",
    incorporatedLabel: "Gegründet",
    incorporated: "15. Oktober 2014, durch notarielle Urkunde von Notar Léopold Derbaix",
    capitalLabel: "Eingetragenes Stammkapital",
    managementHeading: "Geschäftsführung",
    management: "Alleiniger Geschäftsführer: Xavier Nyssen, bei Gründung auf unbestimmte Zeit bestellt.",
    foundersHeading: "Gründer",
    founders:
      "Xavier Jean Georges Nyssen und Elodie Claudine Ghislaine Godefroid, Gründungsgesellschafter, beide zum Zeitpunkt der Gründung wohnhaft in Rue des Quatre Jalouses 4, 7181 Seneffe, Belgien.",
    contactHeading: "Kontakt",
    emailLabel: "E-Mail",
    phoneLabel: "Telefon",
    registrationHeading: "Registrierung & USt-IdNr.",
    companyNumberLabel: "Unternehmensnummer",
    safeNumberLabel: "Safe-Nummer",
    vatLabel: "Umsatzsteuer-Identifikationsnummer",
    odrHeading: "Online-Streitbeilegung",
    odr: "Die Europäische Kommission stellt eine Plattform für Online-Streitbeilegung (OS) bereit: https://ec.europa.eu/consumers/odr. Wir sind weder verpflichtet noch bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.",
  },
  fr: {
    companyHeading: "Informations sur l'entreprise",
    tradingName: "3DJools (nom commercial)",
    legalFormHeading: "Forme juridique & constitution",
    legalFormLabel: "Forme juridique",
    legalForm: "Société privée à responsabilité limitée (SPRL)",
    incorporatedLabel: "Constituée le",
    incorporated: "15 octobre 2014, par acte du notaire Léopold Derbaix",
    capitalLabel: "Capital social enregistré",
    managementHeading: "Gestion",
    management: "Gérant unique : Xavier Nyssen, nommé pour une durée indéterminée lors de la constitution.",
    foundersHeading: "Fondateurs",
    founders:
      "Xavier Jean Georges Nyssen et Elodie Claudine Ghislaine Godefroid, actionnaires fondateurs, tous deux domiciliés Rue des Quatre Jalouses 4, 7181 Seneffe, Belgique au moment de la constitution.",
    contactHeading: "Contact",
    emailLabel: "E-mail",
    phoneLabel: "Téléphone",
    registrationHeading: "Immatriculation & TVA",
    companyNumberLabel: "Numéro d'entreprise",
    safeNumberLabel: "Numéro Safe",
    vatLabel: "Numéro de TVA intracommunautaire",
    odrHeading: "Règlement en ligne des litiges",
    odr: "La Commission européenne met à disposition une plateforme de règlement en ligne des litiges (RLL) : https://ec.europa.eu/consumers/odr. Nous ne sommes ni tenus ni disposés à participer à une procédure de règlement des litiges devant un organe de médiation à la consommation.",
  },
  it: {
    companyHeading: "Dati aziendali",
    tradingName: "3DJools (nome commerciale)",
    legalFormHeading: "Forma giuridica & costituzione",
    legalFormLabel: "Forma giuridica",
    legalForm: "Société privée à responsabilité limitée (SPRL)",
    incorporatedLabel: "Costituita il",
    incorporated: "15 ottobre 2014, con atto del notaio Léopold Derbaix",
    capitalLabel: "Capitale sociale registrato",
    managementHeading: "Amministrazione",
    management: "Amministratore unico: Xavier Nyssen, nominato a tempo indeterminato al momento della costituzione.",
    foundersHeading: "Fondatori",
    founders:
      "Xavier Jean Georges Nyssen ed Elodie Claudine Ghislaine Godefroid, azionisti fondatori, entrambi domiciliati in Rue des Quatre Jalouses 4, 7181 Seneffe, Belgio al momento della costituzione.",
    contactHeading: "Contatto",
    emailLabel: "E-mail",
    phoneLabel: "Telefono",
    registrationHeading: "Registrazione & P.IVA",
    companyNumberLabel: "Numero di società",
    safeNumberLabel: "Numero Safe",
    vatLabel: "Numero identificativo IVA",
    odrHeading: "Risoluzione delle controversie online",
    odr: "La Commissione europea offre una piattaforma per la risoluzione delle controversie online (ODR): https://ec.europa.eu/consumers/odr. Non siamo obbligati né disposti a partecipare a procedure di risoluzione delle controversie dinanzi a un organismo di conciliazione dei consumatori.",
  },
  es: {
    companyHeading: "Datos de la empresa",
    tradingName: "3DJools (nombre comercial)",
    legalFormHeading: "Forma jurídica & constitución",
    legalFormLabel: "Forma jurídica",
    legalForm: "Société privée à responsabilité limitée (SPRL)",
    incorporatedLabel: "Constituida el",
    incorporated: "15 de octubre de 2014, mediante escritura del notario Léopold Derbaix",
    capitalLabel: "Capital social registrado",
    managementHeading: "Administración",
    management: "Administrador único: Xavier Nyssen, nombrado por tiempo indefinido en el momento de la constitución.",
    foundersHeading: "Fundadores",
    founders:
      "Xavier Jean Georges Nyssen y Elodie Claudine Ghislaine Godefroid, socios fundadores, ambos domiciliados en Rue des Quatre Jalouses 4, 7181 Seneffe, Bélgica en el momento de la constitución.",
    contactHeading: "Contacto",
    emailLabel: "Correo electrónico",
    phoneLabel: "Teléfono",
    registrationHeading: "Registro & IVA",
    companyNumberLabel: "Número de empresa",
    safeNumberLabel: "Número Safe",
    vatLabel: "Número de identificación fiscal (IVA)",
    odrHeading: "Resolución de litigios en línea",
    odr: "La Comisión Europea ofrece una plataforma de resolución de litigios en línea (RLL): https://ec.europa.eu/consumers/odr. No estamos obligados ni dispuestos a participar en procedimientos de resolución de litigios ante un órgano de arbitraje de consumo.",
  },
  nl: {
    companyHeading: "Bedrijfsgegevens",
    tradingName: "3DJools (handelsnaam)",
    legalFormHeading: "Rechtsvorm & oprichting",
    legalFormLabel: "Rechtsvorm",
    legalForm: "Société privée à responsabilité limitée (SPRL)",
    incorporatedLabel: "Opgericht",
    incorporated: "15 oktober 2014, bij notariële akte van notaris Léopold Derbaix",
    capitalLabel: "Geregistreerd maatschappelijk kapitaal",
    managementHeading: "Bestuur",
    management: "Enige zaakvoerder: Xavier Nyssen, bij oprichting benoemd voor onbepaalde tijd.",
    foundersHeading: "Oprichters",
    founders:
      "Xavier Jean Georges Nyssen en Elodie Claudine Ghislaine Godefroid, oprichtende aandeelhouders, beiden woonachtig op Rue des Quatre Jalouses 4, 7181 Seneffe, België op het moment van oprichting.",
    contactHeading: "Contact",
    emailLabel: "E-mail",
    phoneLabel: "Telefoon",
    registrationHeading: "Registratie & btw",
    companyNumberLabel: "Ondernemingsnummer",
    safeNumberLabel: "Safe-nummer",
    vatLabel: "Btw-identificatienummer",
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
  const t = COPY[locale]

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
          LN-SQUARED
          <br />
          Rue du Chénia 17
          <br />
          7170 Manage, Hainaut, Belgium
        </p>
      </ProseSection>
      <ProseSection heading={t.legalFormHeading}>
        <p>
          {t.legalFormLabel}: {t.legalForm}
          <br />
          {t.incorporatedLabel}: {t.incorporated}
          <br />
          {t.capitalLabel}: €18,600
        </p>
      </ProseSection>
      <ProseSection heading={t.managementHeading}>
        <p>{t.management}</p>
      </ProseSection>
      <ProseSection heading={t.foundersHeading}>
        <p>{t.founders}</p>
      </ProseSection>
      <ProseSection heading={t.contactHeading}>
        <p>
          {t.emailLabel}:{" "}
          <a href="mailto:info@3djools.com" className="underline underline-offset-2 hover:text-foreground">
            info@3djools.com
          </a>
          <br />
          {t.phoneLabel}: +32 460 00 80 70
        </p>
      </ProseSection>
      <ProseSection heading={t.registrationHeading}>
        <p>
          {t.companyNumberLabel}: 0564.743.304
          <br />
          {t.vatLabel}: BE0564743304
        </p>
      </ProseSection>
      <ProseSection heading={t.odrHeading}>
        <p>{t.odr}</p>
      </ProseSection>
    </ProsePage>
  )
}
