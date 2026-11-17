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
  capitalLabel: string
  capital: string
  activitiesHeading: string
  activities: string
  managementHeading: string
  management: string
  partnersHeading: string
  partners: string
  contactHeading: string
  emailLabel: string
  phoneLabel: string
  registrationHeading: string
  companyNumberLabel: string
  vatLabel: string
  accounts: string
  odrHeading: string
  odr: string
}

const COPY: Record<Locale, ImpressumCopy> = {
  en: {
    companyHeading: "Corporate identity & office address",
    tradingName: "3DEureka (commercial trading name)",
    visitAddressLabel: "Registered office & visiting address",
    legalFormHeading: "Corporate structure, formation & capital",
    legalFormLabel: "Entity type",
    legalForm: "Commanditaire vennootschap (CommV / SComm)",
    incorporatedLabel: "Date of formation",
    incorporated:
      "Incorporated in Antwerp on 1 February 2024, filed with the Enterprise Court Registry on 8 February 2024, and published in the Annexes to the Belgian Official Gazette (Bijlagen bij het Belgisch Staatsblad, ref. 24357554) on 12 February 2024. Registered as an active entity in the Crossroads Bank for Enterprises (KBO/BCE) since 8 February 2024. Statutory seat: Flemish Region (Turnhoutsebaan 243, 2100 Deurne / Antwerpen).",
    capitalLabel: "Contributed capital",
    capital: "EUR 2,000.00, paid in full in cash and represented by 200 registered shares without nominal value.",
    activitiesHeading: "Registered business classifications",
    activities:
      "NACE-BEL 62.100 — computer programming activities. NACE-BEL 62.200 — computer consultancy and management of computer facilities. Under Article 4 of the articles of association, the company's corporate purpose also encompasses wholesale, retail, and intermediary trade in ICT and technical hardware products as well as commercial transactions in movable goods.",
    managementHeading: "Managing director (Zaakvoerder)",
    management:
      "Adam El Fikri (born 7 December 1986), appointed as sole manager (zaakvoerder) for an indefinite term on 1 February 2024, holding sole and independent authority to represent the company in and out of court.",
    partnersHeading: "Partners (Vennoten)",
    partners:
      "General / managing partner (gecommanditeerde vennoot): Adam El Fikri (born 7 December 1986, holding 199 shares). Limited partner (commanditaire vennoot): Bouchra Dahmani (born 14 November 1987, holding 1 share).",
    contactHeading: "Direct communication channels",
    emailLabel: "Electronic mail",
    phoneLabel: "Telephone",
    registrationHeading: "Enterprise Register (KBO/BCE) & tax identifiers",
    companyNumberLabel: "KBO / BCE enterprise number",
    vatLabel: "EU VAT identification number",
    accounts:
      "The company's financial year runs from 1 January to 31 December each year (with the first extended financial year ending on 31 December 2025). The annual general meeting of partners is held each June.",
    odrHeading: "EU Online Dispute Resolution",
    odr: "The European Commission hosts an Online Dispute Resolution (ODR) portal at https://ec.europa.eu/consumers/odr. We are neither legally required nor willing to take part in dispute settlement proceedings before a consumer arbitration body.",
  },
  de: {
    companyHeading: "Unternehmensidentität & Anschrift",
    tradingName: "3DEureka (Geschäftsbezeichnung / Handelsname)",
    visitAddressLabel: "Eingetragener Sitz & Besuchsadresse",
    legalFormHeading: "Gesellschaftsform, Gründung & Kapital",
    legalFormLabel: "Rechtsform",
    legalForm: "Commanditaire vennootschap (CommV — belgische Kommanditgesellschaft)",
    incorporatedLabel: "Gründungsdatum",
    incorporated:
      "Errichtet durch Gründungsurkunde in Antwerpen am 1. Februar 2024, hinterlegt bei der Kanzlei des Unternehmensgerichts am 8. Februar 2024 und veröffentlicht in den Anlagen zum Belgischen Staatsblatt (Bijlagen bij het Belgisch Staatsblad, Nr. 24357554) am 12. Februar 2024. Seit dem 8. Februar 2024 aktiv in der Zentralen Datenbank der Unternehmen (KBO/BCE) eingetragen. Satzungssitz: Flämische Region (Turnhoutsebaan 243, 2100 Deurne / Antwerpen).",
    capitalLabel: "Gesellschaftskapital / Einlagen",
    capital: "2.000,00 EUR, vollständig bar eingezahlt und eingeteilt in 200 Namensanteile ohne Nennwert.",
    activitiesHeading: "Eingetragene Geschäftstätigkeiten",
    activities:
      "NACE-BEL 62.100 — Programmierungstätigkeiten. NACE-BEL 62.200 — Erbringung von Beratungsleistungen auf dem Gebiet der Informationstechnologie und Betrieb von Datenverarbeitungseinrichtungen. Gemäß Artikel 4 der Satzung umfasst der Unternehmensgegenstand darüber hinaus den Groß-, Einzel- und Zwischenhandel mit IKT- und Technikprodukten sowie Handelsgeschäfte mit beweglichen Gütern.",
    managementHeading: "Vertretungsberechtigter Geschäftsführer (Zaakvoerder)",
    management:
      "Adam El Fikri (geb. 7. Dezember 1986), am 1. Februar 2024 auf unbestimmte Zeit zum alleinigen Geschäftsführer bestellt und einzeln sowie selbstständig zur gerichtlichen und außergerichtlichen Vertretung der Gesellschaft befugt.",
    partnersHeading: "Gesellschafter (Vennoten)",
    partners:
      "Komplementär (gecommanditeerde vennoot): Adam El Fikri (geb. 7. Dezember 1986, 199 Anteile). Kommanditistin (commanditaire vennoot): Bouchra Dahmani (geb. 14. November 1987, 1 Anteil).",
    contactHeading: "Direkte Kontaktwege",
    emailLabel: "E-Mail",
    phoneLabel: "Telefon",
    registrationHeading: "Unternehmensregister (KBO/BCE) & Steuerkennnummern",
    companyNumberLabel: "KBO-/BCE-Unternehmensnummer",
    vatLabel: "Umsatzsteuer-Identifikationsnummer",
    accounts:
      "Das Geschäftsjahr läuft vom 1. Januar bis zum 31. Dezember (erstes verlängertes Geschäftsjahr bis zum 31. Dezember 2025). Die ordentliche Gesellschafterversammlung findet jährlich im Juni statt.",
    odrHeading: "EU-Online-Streitbeilegung",
    odr: "Die Europäische Kommission betreibt unter https://ec.europa.eu/consumers/odr eine Plattform zur Online-Streitbeilegung (OS). Zur Teilnahme an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle sind wir weder verpflichtet noch bereit.",
  },
  fr: {
    companyHeading: "Identité de l'entreprise & siège social",
    tradingName: "3DEureka (enseigne commerciale)",
    visitAddressLabel: "Siège social et adresse de visite",
    legalFormHeading: "Statut juridique, constitution & capital",
    legalFormLabel: "Forme sociale",
    legalForm: "Société en commandite / Commanditaire vennootschap (SComm / CommV)",
    incorporatedLabel: "Date de constitution",
    incorporated:
      "Société constituée à Anvers le 1er février 2024, déposée au greffe du tribunal de l'entreprise le 8 février 2024 et publiée aux Annexes du Moniteur belge (Bijlagen bij het Belgisch Staatsblad, réf. 24357554) le 12 février 2024. Immatriculée à la Banque-Carrefour des Entreprises (BCE/KBO) depuis le 8 février 2024. Siège statutaire : Région flamande (Turnhoutsebaan 243, 2100 Deurne / Anvers).",
    capitalLabel: "Apports / fonds propres",
    capital: "2 000,00 EUR intégralement libérés en numéraire, représentés par 200 parts nominatives sans mention de valeur nominale.",
    activitiesHeading: "Activités déclarées au registre",
    activities:
      "NACE-BEL 62.100 — programmation informatique. NACE-BEL 62.200 — conseil informatique et gestion d'installations informatiques. Conformément à l'article 4 des statuts, l'objet social couvre également le commerce de gros, de détail et d'intermédiaire en produits TIC et équipements techniques ainsi que toutes opérations commerciales portant sur des biens mobiliers.",
    managementHeading: "Gérance (Zaakvoerder)",
    management:
      "Adam El Fikri (né le 7 décembre 1986), nommé gérant unique pour une durée indéterminée le 1er février 2024, disposant du pouvoir individuel d'engager et de représenter seul la société tant en justice qu'en dehors.",
    partnersHeading: "Associés (Vennoten)",
    partners:
      "Associé commandité (gecommanditeerde vennoot) : Adam El Fikri (né le 7 décembre 1986, 199 parts). Associée commanditaire (commanditaire vennoot) : Bouchra Dahmani (née le 14 novembre 1987, 1 part).",
    contactHeading: "Coordonnées de contact",
    emailLabel: "Courrier électronique",
    phoneLabel: "Téléphone",
    registrationHeading: "Immatriculation BCE/KBO & numéro de TVA",
    companyNumberLabel: "Numéro d'entreprise (BCE / KBO)",
    vatLabel: "Numéro de TVA intracommunautaire",
    accounts:
      "L'exercice social commence le 1er janvier et se clôture le 31 décembre de chaque année (premier exercice prolongé jusqu'au 31 décembre 2025). L'assemblée générale annuelle se tient au mois de juin.",
    odrHeading: "Médiation et règlement en ligne des litiges",
    odr: "La Commission européenne met à disposition un portail de règlement en ligne des litiges (RLL) accessible sur https://ec.europa.eu/consumers/odr. Nous ne sommes ni tenus ni disposés à prendre part à une procédure devant un organisme d'arbitrage de la consommation.",
  },
  it: {
    companyHeading: "Identità societaria & sede legale",
    tradingName: "3DEureka (denominazione commerciale)",
    visitAddressLabel: "Sede legale e indirizzo di visita",
    legalFormHeading: "Natura giuridica, costituzione & capitale",
    legalFormLabel: "Forma societaria",
    legalForm: "Commanditaire vennootschap (CommV — società in accomandita di diritto belga)",
    incorporatedLabel: "Data di costituzione",
    incorporated:
      "Costituita ad Anversa il 1° febbraio 2024, depositata presso la cancelleria del tribunale delle imprese l'8 febbraio 2024 e pubblicata negli Allegati della Gazzetta ufficiale belga (Bijlagen bij het Belgisch Staatsblad, rif. 24357554) il 12 febbraio 2024. Iscritta nella Banca-Crocevia delle Imprese (KBO/BCE) dall'8 febbraio 2024. Sede statutaria: Regione fiamminga (Turnhoutsebaan 243, 2100 Deurne / Anversa).",
    capitalLabel: "Capitale conferito",
    capital: "2.000,00 EUR interamente versati in contanti e rappresentati da 200 quote nominative prive di valore nominale.",
    activitiesHeading: "Attività economiche registrate",
    activities:
      "NACE-BEL 62.100 — progettazione di programmi informatici. NACE-BEL 62.200 — consulenza informatica e gestione di strutture informatiche. Ai sensi dell'articolo 4 dello statuto, l'oggetto sociale comprende inoltre il commercio all'ingrosso, al dettaglio e l'intermediazione di prodotti ICT e apparecchiature tecniche, nonché qualsiasi operazione commerciale su beni mobili.",
    managementHeading: "Amministratore / Gerente (Zaakvoerder)",
    management:
      "Adam El Fikri (nato il 7 dicembre 1986), nominato amministratore unico a tempo indeterminato il 1° febbraio 2024 con potere di rappresentanza individuale e autonomo in giudizio e stragiudizialmente.",
    partnersHeading: "Soci (Vennoten)",
    partners:
      "Socio accomandatario (gecommanditeerde vennoot): Adam El Fikri (nato il 7 dicembre 1986, 199 quote). Socia accomandante (commanditaire vennoot): Bouchra Dahmani (nata il 14 novembre 1987, 1 quota).",
    contactHeading: "Recapiti diretti",
    emailLabel: "Posta elettronica",
    phoneLabel: "Telefono",
    registrationHeading: "Estremi di iscrizione KBO/BCE & partita IVA",
    companyNumberLabel: "Numero d'impresa (KBO / BCE)",
    vatLabel: "Partita IVA comunitaria",
    accounts:
      "L'esercizio finanziario decorre dal 1° gennaio al 31 dicembre di ogni anno (primo esercizio prolungato fino al 31 dicembre 2025). L'assemblea generale annuale si riunisce nel mese di giugno.",
    odrHeading: "Risoluzione online delle controversie (ODR)",
    odr: "La Commissione europea mette a disposizione la piattaforma ODR per la risoluzione online delle controversie all'indirizzo https://ec.europa.eu/consumers/odr. Non siamo obbligati né intenzionati a partecipare a procedure dinanzi a organismi di conciliazione dei consumatori.",
  },
  es: {
    companyHeading: "Identidad corporativa y domicilio social",
    tradingName: "3DEureka (marca comercial)",
    visitAddressLabel: "Domicilio social y dirección de visita",
    legalFormHeading: "Naturaleza jurídica, constitución y capital",
    legalFormLabel: "Forma societaria",
    legalForm: "Commanditaire vennootschap (CommV — sociedad comanditaria de derecho belga)",
    incorporatedLabel: "Fecha de constitución",
    incorporated:
      "Constituida en Amberes el 1 de febrero de 2024, depositada en la secretaría del tribunal de empresa el 8 de febrero de 2024 y publicada en los Anexos del Boletín Oficial de Bélgica (Bijlagen bij het Belgisch Staatsblad, ref. 24357554) el 12 de febrero de 2024. Inscrita y activa en el Banco-Encrucijada de Empresas (KBO/BCE) desde el 8 de febrero de 2024. Sede estatutaria: Región Flamenca (Turnhoutsebaan 243, 2100 Deurne / Amberes).",
    capitalLabel: "Aportaciones / recursos propios",
    capital: "2.000,00 EUR íntegramente desembolsados en efectivo y representados por 200 participaciones nominativas sin valor nominal.",
    activitiesHeading: "Actividades económicas inscritas",
    activities:
      "NACE-BEL 62.100 — actividades de programación informática. NACE-BEL 62.200 — consultoría informática y gestión de instalaciones informáticas. Conforme al artículo 4 de los estatutos, el objeto social abarca igualmente el comercio mayorista, minorista y la intermediación de productos TIC y equipos técnicos, así como toda clase de operaciones comerciales sobre bienes muebles.",
    managementHeading: "Administración (Zaakvoerder)",
    management:
      "Adam El Fikri (nacido el 7 de diciembre de 1986), nombrado administrador único por tiempo indefinido el 1 de febrero de 2024, con facultades individuales y plenas para representar a la sociedad judicial y extrajudicialmente.",
    partnersHeading: "Socios (Vennoten)",
    partners:
      "Socio colectivo (gecommanditeerde vennoot): Adam El Fikri (nacido el 7 de diciembre de 1986, 199 participaciones). Socia comanditaria (commanditaire vennoot): Bouchra Dahmani (nacida el 14 de noviembre de 1987, 1 participación).",
    contactHeading: "Canales de contacto",
    emailLabel: "Correo electrónico",
    phoneLabel: "Teléfono",
    registrationHeading: "Datos registrales KBO/BCE e identificación fiscal",
    companyNumberLabel: "Número de empresa (KBO / BCE)",
    vatLabel: "Número de IVA intracomunitario",
    accounts:
      "El ejercicio económico transcurre del 1 de enero al 31 de diciembre de cada año (primer ejercicio prolongado hasta el 31 de diciembre de 2025). La junta general ordinaria se celebra anualmente en junio.",
    odrHeading: "Plataforma europea de resolución de litigios",
    odr: "La Comisión Europea facilita una plataforma de resolución de litigios en línea (RLL) disponible en https://ec.europa.eu/consumers/odr. No estamos obligados ni dispuestos a intervenir en procedimientos ante juntas arbitrales de consumo.",
  },
  nl: {
    companyHeading: "Bedrijfsidentiteit & maatschappelijke zetel",
    tradingName: "3DEureka (handelsnaam)",
    visitAddressLabel: "Maatschappelijke zetel & bezoekadres",
    legalFormHeading: "Rechtsvorm, oprichting & inbreng",
    legalFormLabel: "Rechtsvorm",
    legalForm: "Commanditaire vennootschap (CommV)",
    incorporatedLabel: "Datum van oprichting",
    incorporated:
      "Opgericht te Antwerpen op 1 februari 2024, neergelegd ter griffie op 8 februari 2024 en bekendgemaakt in de Bijlagen bij het Belgisch Staatsblad (ref. 24357554) op 12 februari 2024. Ingeschreven in de Kruispuntbank van Ondernemingen (KBO) met ingang van 8 februari 2024. Zetel gevestigd in het Vlaams Gewest (Turnhoutsebaan 243, 2100 Deurne / Antwerpen).",
    capitalLabel: "Eigen middelen / inbrengen",
    capital: "2.000,00 EUR, volledig volgestort in geld en vertegenwoordigd door 200 aandelen op naam zonder vermelding van nominale waarde.",
    activitiesHeading: "Geregistreerde bedrijfsactiviteiten",
    activities:
      "NACE-BEL 62.100 — ontwerpen van computerprogramma's. NACE-BEL 62.200 — activiteiten op het gebied van computerconsultancy en beheer van computerfaciliteiten. Overeenkomstig artikel 4 van de statuten omvat het voorwerp tevens de handel in ICT-producten (zowel groothandel, kleinhandel als tussenpersoon) en alle commerciële verrichtingen van roerende aard.",
    managementHeading: "Zaakvoerder",
    management:
      "Adam El Fikri (geboren op 7 december 1986), benoemd tot enige zaakvoerder voor onbepaalde duur op 1 februari 2024 en alleen bevoegd om de vennootschap in en buiten rechte te vertegenwoordigen.",
    partnersHeading: "Vennoten",
    partners:
      "Gecommanditeerde vennoot: Adam El Fikri (geboren op 7 december 1986, 199 aandelen). Commanditaire vennoot: Bouchra Dahmani (geboren op 14 november 1987, 1 aandeel).",
    contactHeading: "Directe contactgegevens",
    emailLabel: "E-mailadres",
    phoneLabel: "Telefoonnummer",
    registrationHeading: "KBO-inschrijving & btw-identificatie",
    companyNumberLabel: "Ondernemingsnummer (KBO)",
    vatLabel: "Btw-identificatienummer",
    accounts:
      "Het boekjaar loopt telkens van 1 januari tot en met 31 december (eerste verlengd boekjaar tot en met 31 december 2025). De jaarvergadering vindt plaats in juni.",
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
          <br />
          {t.capitalLabel}: {t.capital}
        </p>
      </ProseSection>
      <ProseSection heading={t.managementHeading}>
        <p>{t.management}</p>
      </ProseSection>
      <ProseSection heading={t.partnersHeading}>
        <p>{t.partners}</p>
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
        </p>
      </ProseSection>
      <ProseSection heading={t.odrHeading}>
        <p>{t.odr}</p>
      </ProseSection>
    </ProsePage>
  )
}
