import Link from "next/link"
import { isLocale, type Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { localizedPath } from "@/lib/i18n/paths"
import { ProsePage, ProseSection } from "@/components/legal/prose-page"
import { COMPANY, fillCompany } from "@/lib/company"

type AboutCopy = {
  h1Heading: string
  h1: string
  h2Heading: string
  h2: string
  h3Heading: string
  h3: string
  h4Heading: string
  h4Intro: string
  emailLabel: string
  phoneLabel: string
  hoursLabel: string
  h4Dispatch: string
  h4ReachPre: string
  h4ContactLink: string
  h4Mid: string
  h4LegalLink: string
  h4Post: string
}

const COPY: Record<Locale, AboutCopy> = {
  en: {
    h1Heading: "Precision 3D printing gear, straightforward pricing",
    h1: "DnD3D is an Amsterdam-based European specialist store for additive manufacturing. We curate high-performance 3D printers, laser engravers, 3D scanners, filaments, photopolymer resins, and genuine accessories — ranging from dependable entry-level workhorses to enclosed multi-material CoreXY systems.",
    h2Heading: "Tailored for workshops and makers across Europe",
    h2: "Every order ships free across the EU and neighbouring countries, our storefront is available in six languages, and every machine is backed by knowledgeable customer care plus the mandatory 2-year EU consumer warranty. Whether you are prototyping a single part or scaling a print farm, our team supports you before and after checkout.",
    h3Heading: "Manufacturers with proven reliability",
    h3: "We partner with established brands — including Bambu Lab, Prusa, Creality, Anycubic, Elegoo, Flashforge, and Snapmaker — chosen for consistent print quality, active user ecosystems, and long-term consumable support.",
    h4Heading: "Corporate & contact details",
    h4Intro: "The DnD3D online store is operated by {legalName}, {street}, {postalCode} {city}, Netherlands (KvK {companyNumber}, VAT {vat}).",
    emailLabel: "Email",
    phoneLabel: "Phone",
    hoursLabel: "Operating hours",
    h4Dispatch: "Warehouse preparation takes 0–2 business days (Monday to Friday) and courier transit takes 3–5 business days, giving an overall delivery window of 3–7 business days. Our team responds to all customer enquiries within 48 hours.",
    h4ReachPre: "Get in touch with us anytime via our",
    h4ContactLink: "contact page",
    h4Mid: ", or review our complete corporate registry entries in the",
    h4LegalLink: "legal notice",
    h4Post: ".",
  },
  de: {
    h1Heading: "Präzise 3D-Drucktechnik zu transparenten Konditionen",
    h1: "DnD3D ist ein in Amsterdam ansässiger europäischer Fachshop für additive Fertigung. Wir bündeln leistungsstarke 3D-Drucker, Lasergravierer, 3D-Scanner, Filamente, Photopolymer-Harze und Originalzubehör — vom zuverlässigen Einstiegsgerät bis zum geschlossenen Mehrfarben-CoreXY-System.",
    h2Heading: "Für Werkstätten, Studios und Maker in ganz Europa",
    h2: "Wir liefern jede Bestellung versandkostenfrei in die gesamte EU und ausgewählte Nachbarländer, betreuen unsere Kunden in sechs Sprachen und sichern jedes Gerät mit der gesetzlichen 2-jährigen EU-Gewährleistung ab. Vom ersten Prototyp bis zur Serienproduktion begleiten wir Sie vor und nach dem Kauf.",
    h3Heading: "Bewährte Hersteller im Sortiment",
    h3: "Mit Marken wie Bambu Lab, Prusa, Creality, Anycubic, Elegoo, Flashforge und Snapmaker setzen wir gezielt auf Hersteller mit ausgereifter Technik, starker Community und langfristiger Materialverfügbarkeit.",
    h4Heading: "Unternehmens- & Kontaktangaben",
    h4Intro: "Betreiber des Onlineshops DnD3D ist die {legalName}, {street}, {postalCode} {city}, Niederlande (KvK {companyNumber}, USt-IdNr. {vat}).",
    emailLabel: "E-Mail",
    phoneLabel: "Telefon",
    hoursLabel: "Geschäftszeiten",
    h4Dispatch: "Die Lagerabfertigung erfolgt montags bis freitags innerhalb von 0–2 Werktagen, die Transportlaufzeit beträgt 3–5 Werktage — insgesamt also 3–7 Werktage bis zur Zustellung. Anfragen beantworten wir innerhalb von 48 Stunden.",
    h4ReachPre: "Schreiben Sie uns jederzeit über unsere",
    h4ContactLink: "Kontaktseite",
    h4Mid: ", oder lesen Sie sämtliche Handelsregisterangaben in unserem",
    h4LegalLink: "Impressum",
    h4Post: ".",
  },
  fr: {
    h1Heading: "L'équipement d'impression 3D de précision, au prix juste",
    h1: "Basée à Amsterdam, DnD3D est une boutique européenne spécialisée dans la fabrication additive. Nous réunissons des imprimantes 3D performantes, graveurs laser, scanners 3D, filaments, résines photopolymères et accessoires d'origine — des modèles d'atelier éprouvés aux systèmes CoreXY multi-matériaux.",
    h2Heading: "Au service des ateliers et makers européens",
    h2: "Chaque commande profite de la livraison gratuite dans toute l'UE et plusieurs pays voisins, d'une interface en six langues et de la garantie légale européenne de 2 ans. Que vous lanciez votre premier prototype ou exploitiez une ferme d'impression, notre équipe vous accompagne avant et après votre achat.",
    h3Heading: "Des constructeurs reconnus pour leur fiabilité",
    h3: "Bambu Lab, Prusa, Creality, Anycubic, Elegoo, Flashforge et Snapmaker : nous sélectionnons des fabricants dotés d'un solide suivi technique, d'une communauté active et d'un approvisionnement durable en consommables.",
    h4Heading: "Identité de la société & coordonnées",
    h4Intro: "La boutique DnD3D est exploitée par {legalName}, {street}, {postalCode} {city}, Pays-Bas (KvK {companyNumber}, TVA {vat}).",
    emailLabel: "E-mail",
    phoneLabel: "Téléphone",
    hoursLabel: "Heures d'ouverture",
    h4Dispatch: "La préparation des commandes prend 0 à 2 jours ouvrés (du lundi au vendredi) et le transport 3 à 5 jours ouvrés, soit un délai global estimé de 3 à 7 jours ouvrés. Nous répondons à chaque message sous 48 heures.",
    h4ReachPre: "Écrivez-nous à tout moment depuis notre",
    h4ContactLink: "page de contact",
    h4Mid: ", ou consultez l'intégralité de nos mentions d'immatriculation dans notre",
    h4LegalLink: "mention légale",
    h4Post: ".",
  },
  it: {
    h1Heading: "Tecnologia di stampa 3D selezionata, prezzi trasparenti",
    h1: "Con sede ad Amsterdam, DnD3D è uno store europeo specializzato nella manifattura additiva. Selezioniamo stampanti 3D, incisori laser, scanner 3D, filamenti, resine fotopolimeriche e accessori originali — dalle macchine più collaudate ai sistemi CoreXY multimateriale di ultima generazione.",
    h2Heading: "Al fianco di laboratori e maker in tutta Europa",
    h2: "Spediamo gratuitamente in tutta l'Unione Europea e nei Paesi limitrofi, offriamo assistenza in sei lingue e tuteliamo ogni acquisto con la garanzia legale UE di 2 anni. Dal primo prototipo fino alle piccole serie produttive, il nostro team resta a tua disposizione prima e dopo l'ordine.",
    h3Heading: "Marchi scelti per affidabilità e continuità",
    h3: "Trattiamo costruttori affermati come Bambu Lab, Prusa, Creality, Anycubic, Elegoo, Flashforge e Snapmaker, scelti per qualità costruttiva, supporto software e reperibilità nel tempo dei materiali di consumo.",
    h4Heading: "Dati societari & recapiti",
    h4Intro: "Lo store online DnD3D è gestito da {legalName}, {street}, {postalCode} {city}, Paesi Bassi (KvK {companyNumber}, P.IVA {vat}).",
    emailLabel: "E-mail",
    phoneLabel: "Telefono",
    hoursLabel: "Orari operativi",
    h4Dispatch: "L'allestimento dell'ordine richiede 0–2 giorni lavorativi (lunedì–venerdì) e il trasporto 3–5 giorni lavorativi, con una consegna complessiva stimata in 3–7 giorni lavorativi. Rispondiamo a tutte le richieste entro 48 ore.",
    h4ReachPre: "Puoi scriverci in qualsiasi momento tramite la nostra",
    h4ContactLink: "pagina di contatto",
    h4Mid: ", oppure verificare tutti gli estremi di registrazione nella",
    h4LegalLink: "nota legale",
    h4Post: ".",
  },
  es: {
    h1Heading: "Equipos de impresión 3D de precisión a precios claros",
    h1: "Con sede en Ámsterdam, DnD3D es una tienda europea especializada en fabricación aditiva. Seleccionamos impresoras 3D, grabadoras láser, escáneres 3D, filamentos, resinas fotopoliméricas y accesorios originales — desde equipos fiables para empezar hasta sistemas CoreXY multimaterial.",
    h2Heading: "Pensado para talleres y creadores de toda Europa",
    h2: "Enviamos gratis a toda la UE y países vecinos, atendemos en seis idiomas y respaldamos cada máquina con la garantía legal europea de 2 años. Tanto si imprimes tu primer prototipo como si gestionas una granja de producción, te acompañamos antes y después de la compra.",
    h3Heading: "Fabricantes con trayectoria contrastada",
    h3: "Trabajamos con marcas de referencia como Bambu Lab, Prusa, Creality, Anycubic, Elegoo, Flashforge y Snapmaker, elegidas por su fiabilidad mecánica, su comunidad activa y la continuidad de sus consumibles.",
    h4Heading: "Información societaria y de contacto",
    h4Intro: "La tienda online DnD3D está gestionada por {legalName}, {street}, {postalCode} {city}, Países Bajos (KvK {companyNumber}, IVA {vat}).",
    emailLabel: "Correo electrónico",
    phoneLabel: "Teléfono",
    hoursLabel: "Horario de atención",
    h4Dispatch: "La preparación en almacén toma de 0 a 2 días laborables (de lunes a viernes) y el tránsito de 3 a 5 días laborables, sumando un plazo total estimado de 3 a 7 días laborables. Respondemos a todas las consultas en un máximo de 48 horas.",
    h4ReachPre: "Escríbenos cuando quieras desde nuestra",
    h4ContactLink: "página de contacto",
    h4Mid: ", o consulta los datos registrales completos en nuestro",
    h4LegalLink: "aviso legal",
    h4Post: ".",
  },
  nl: {
    h1Heading: "Hoogwaardige 3D-printapparatuur tegen heldere prijzen",
    h1: "Vanuit Amsterdam levert DnD3D als Europese speciaalzaak alles voor additive manufacturing. Wij selecteren betrouwbare 3D-printers, lasergraveerders, 3D-scanners, filamenten, fotopolymeerharsen en originele accessoires — van solide instapmodellen tot gesloten CoreXY-systemen.",
    h2Heading: "Voor werkplaatsen en makers in heel Europa",
    h2: "Elke bestelling wordt gratis verzonden binnen de EU en omliggende landen, onze winkel is beschikbaar in zes talen en elk toestel valt onder de wettelijke Europese garantie van 2 jaar. Of u nu één prototype maakt of een printfarm beheert, wij ondersteunen u vóór en na uw aankoop.",
    h3Heading: "Merken met bewezen betrouwbaarheid",
    h3: "Met Bambu Lab, Prusa, Creality, Anycubic, Elegoo, Flashforge en Snapmaker kiest u voor fabrikanten met een sterke reputatie, een actieve community en duurzame beschikbaarheid van verbruiksmaterialen.",
    h4Heading: "Bedrijfs- & contactgegevens",
    h4Intro: "De webshop DnD3D wordt geëxploiteerd door {legalName}, {street}, {postalCode} {city}, Nederland (KvK {companyNumber}, btw-nummer {vat}).",
    emailLabel: "E-mail",
    phoneLabel: "Telefoon",
    hoursLabel: "Openingstijden",
    h4Dispatch: "De magazijnverwerking duurt van maandag tot en met vrijdag 0–2 werkdagen en het transport 3–5 werkdagen, wat zorgt voor een totale geschatte levertijd van 3–7 werkdagen. Wij beantwoorden elke vraag binnen 48 uur.",
    h4ReachPre: "Neem gerust contact met ons op via onze",
    h4ContactLink: "contactpagina",
    h4Mid: ", of bekijk alle formele registratiegegevens in ons",
    h4LegalLink: "impressum",
    h4Post: ".",
  },
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : "en"
  const dict = await getDictionary(locale)
  return { title: dict.footer.about }
}

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : "en"
  const dict = await getDictionary(locale)
  const t = fillCompany(COPY[locale])

  return (
    <ProsePage
      locale={locale}
      dict={dict}
      title={dict.footer.about}
      crumbs={[{ label: dict.common.home, href: "/" }, { label: dict.footer.about }]}
    >
      <ProseSection heading={t.h1Heading}>
        <p>{t.h1}</p>
      </ProseSection>
      <ProseSection heading={t.h2Heading}>
        <p>{t.h2}</p>
      </ProseSection>
      <ProseSection heading={t.h3Heading}>
        <p>{t.h3}</p>
      </ProseSection>
      <ProseSection heading={t.h4Heading}>
        <p>{t.h4Intro}</p>
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
          <br />
          {t.hoursLabel}: Monday–Friday, 9:00–18:00 CET
        </p>
        <p>{t.h4Dispatch}</p>
        <p>
          {t.h4ReachPre}{" "}
          <Link href={localizedPath(locale, "/contact")} className="underline underline-offset-2">
            {t.h4ContactLink}
          </Link>
          {t.h4Mid}{" "}
          <Link href={localizedPath(locale, "/impressum")} className="underline underline-offset-2">
            {t.h4LegalLink}
          </Link>
          {t.h4Post}
        </p>
      </ProseSection>
    </ProsePage>
  )
}
