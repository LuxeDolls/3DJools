import Link from "next/link"
import { isLocale, type Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { localizedPath } from "@/lib/i18n/paths"
import { ProsePage, ProseSection } from "@/components/legal/prose-page"

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
    h1Heading: "Serious machines, honest prices",
    h1: "3DJools is a European store dedicated to 3D printing. We hand-pick the machines, filament, resin and accessories that makers actually rely on — from proven bestsellers to the latest CoreXY flagships — and offer them at prices that make sense.",
    h2Heading: "Built for makers across Europe",
    h2: "We ship fast across the EU, speak your language in six countries, and back every purchase with expert support and the EU 2-year consumer guarantee. Whether you're printing your first benchy or running a small production farm, we're here before and after the sale.",
    h3Heading: "The brands we trust",
    h3: "Bambu Lab, Prusa, Creality, Anycubic, Elegoo, Flashforge and Snapmaker — we stock the brands with the track record, the community and the spare-part availability to keep you printing for years.",
    h4Heading: "Company & contact details",
    h4Intro: "3DJools is operated by LN-SQUARED, Rue du Chénia 17, 7170 Manage, Hainaut, Belgium (Company No. 0564.743.304, VAT BE0564743304).",
    emailLabel: "Email",
    phoneLabel: "Phone",
    hoursLabel: "Business hours",
    h4Dispatch: "Orders are handled within 0–1 business day Monday to Friday, with 3–5 business days transit for a total estimated delivery time of 3–6 business days. We reply to every enquiry within 48 hours.",
    h4ReachPre: "Reach us anytime on our",
    h4ContactLink: "contact page",
    h4Mid: ", or see full registration details in our",
    h4LegalLink: "legal notice",
    h4Post: ".",
  },
  de: {
    h1Heading: "Seriöse Maschinen, faire Preise",
    h1: "3DJools ist ein europäischer Shop für 3D-Druck. Wir wählen die Maschinen, Filamente, Resins und Zubehörteile aus, auf die Maker wirklich vertrauen — von bewährten Bestsellern bis zu den neuesten CoreXY-Flaggschiffen — und bieten sie zu Preisen an, die Sinn ergeben.",
    h2Heading: "Gemacht für Maker in ganz Europa",
    h2: "Wir versenden schnell in die gesamte EU, sprechen Ihre Sprache in sechs Ländern und unterstützen jeden Kauf mit fachkundigem Support und der gesetzlichen 2-jährigen EU-Verbrauchergarantie. Egal ob Sie Ihren ersten Benchy drucken oder eine kleine Produktionsfarm betreiben — wir sind vor und nach dem Kauf für Sie da.",
    h3Heading: "Die Marken, denen wir vertrauen",
    h3: "Bambu Lab, Prusa, Creality, Anycubic, Elegoo, Flashforge und Snapmaker — wir führen die Marken mit der Erfahrung, der Community und der Ersatzteilverfügbarkeit, die Sie jahrelang zum Drucken brauchen.",
    h4Heading: "Unternehmens- & Kontaktdaten",
    h4Intro: "3DJools wird betrieben von LN-SQUARED, Rue du Chénia 17, 7170 Manage, Hainaut, Belgien (Unternehmensnummer 0564.743.304, USt-IdNr. BE0564743304).",
    emailLabel: "E-Mail",
    phoneLabel: "Telefon",
    hoursLabel: "Geschäftszeiten",
    h4Dispatch: "Bestellungen werden von Montag bis Freitag innerhalb von 0–1 Werktag bearbeitet; der Transport dauert 3–5 Werktage, die geschätzte Gesamtlieferzeit beträgt 3–6 Werktage. Wir beantworten jede Anfrage innerhalb von 48 Stunden.",
    h4ReachPre: "Erreichen Sie uns jederzeit über unsere",
    h4ContactLink: "Kontaktseite",
    h4Mid: ", oder finden Sie die vollständigen Registrierungsdaten in unserem",
    h4LegalLink: "Impressum",
    h4Post: ".",
  },
  fr: {
    h1Heading: "Des machines sérieuses, des prix honnêtes",
    h1: "3DJools est une boutique européenne dédiée à l'impression 3D. Nous sélectionnons avec soin les machines, filaments, résines et accessoires sur lesquels les makers comptent réellement — des best-sellers éprouvés aux derniers modèles phares CoreXY — et les proposons à des prix cohérents.",
    h2Heading: "Conçu pour les makers à travers l'Europe",
    h2: "Nous livrons rapidement dans toute l'UE, parlons votre langue dans six pays, et accompagnons chaque achat d'un support expert et de la garantie légale européenne de 2 ans. Que vous imprimiez votre premier benchy ou gériez une petite ferme de production, nous sommes là avant et après la vente.",
    h3Heading: "Les marques auxquelles nous faisons confiance",
    h3: "Bambu Lab, Prusa, Creality, Anycubic, Elegoo, Flashforge et Snapmaker — nous proposons les marques qui ont l'expérience, la communauté et la disponibilité de pièces détachées pour vous faire imprimer pendant des années.",
    h4Heading: "Informations sur l'entreprise & contact",
    h4Intro: "3DJools est exploitée par LN-SQUARED, Rue du Chénia 17, 7170 Manage, Hainaut, Belgique (n° d'entreprise 0564.743.304, TVA BE0564743304).",
    emailLabel: "E-mail",
    phoneLabel: "Téléphone",
    hoursLabel: "Horaires d'ouverture",
    h4Dispatch: "Les commandes sont traitées sous 0 à 1 jour ouvré du lundi au vendredi ; le transport prend 3 à 5 jours ouvrés, pour un délai total estimé de 3 à 6 jours ouvrés. Nous répondons à chaque demande dans les 48 heures.",
    h4ReachPre: "Contactez-nous à tout moment via notre",
    h4ContactLink: "page de contact",
    h4Mid: ", ou consultez les coordonnées complètes d'enregistrement dans notre",
    h4LegalLink: "mention légale",
    h4Post: ".",
  },
  it: {
    h1Heading: "Macchine serie, prezzi onesti",
    h1: "3DJools è un negozio europeo dedicato alla stampa 3D. Selezioniamo con cura le macchine, i filamenti, le resine e gli accessori su cui i maker fanno davvero affidamento — dai bestseller consolidati agli ultimi modelli di punta CoreXY — offrendoli a prezzi sensati.",
    h2Heading: "Pensato per i maker in tutta Europa",
    h2: "Spediamo velocemente in tutta l'UE, parliamo la tua lingua in sei paesi e affianchiamo ogni acquisto con assistenza esperta e la garanzia legale UE di 2 anni. Che tu stia stampando il tuo primo benchy o gestendo una piccola farm di produzione, siamo qui prima e dopo la vendita.",
    h3Heading: "I marchi di cui ci fidiamo",
    h3: "Bambu Lab, Prusa, Creality, Anycubic, Elegoo, Flashforge e Snapmaker — proponiamo i marchi con l'esperienza, la community e la disponibilità di ricambi che ti permettono di stampare per anni.",
    h4Heading: "Dati aziendali & contatti",
    h4Intro: "3DJools è gestito da LN-SQUARED, Rue du Chénia 17, 7170 Manage, Hainaut, Belgio (numero di società 0564.743.304, P.IVA BE0564743304).",
    emailLabel: "E-mail",
    phoneLabel: "Telefono",
    hoursLabel: "Orari di apertura",
    h4Dispatch: "Ogni ordine viene gestito entro 0–1 giorno lavorativo dal lunedì al venerdì; il trasporto richiede 3–5 giorni lavorativi, per un tempo totale stimato di consegna di 3–6 giorni lavorativi. Rispondiamo a ogni richiesta entro 48 ore.",
    h4ReachPre: "Contattaci in qualsiasi momento tramite la nostra",
    h4ContactLink: "pagina di contatto",
    h4Mid: ", oppure consulta i dati di registrazione completi nella nostra",
    h4LegalLink: "nota legale",
    h4Post: ".",
  },
  es: {
    h1Heading: "Máquinas serias, precios honestos",
    h1: "3DJools es una tienda europea dedicada a la impresión 3D. Seleccionamos cuidadosamente las máquinas, filamentos, resinas y accesorios en los que los makers realmente confían — desde los best-sellers consolidados hasta los últimos modelos insignia CoreXY — y los ofrecemos a precios razonables.",
    h2Heading: "Creado para makers en toda Europa",
    h2: "Enviamos rápido a toda la UE, hablamos su idioma en seis países y respaldamos cada compra con soporte experto y la garantía legal de la UE de 2 años. Ya sea que esté imprimiendo su primer benchy o gestionando una pequeña granja de producción, estamos aquí antes y después de la venta.",
    h3Heading: "Las marcas en las que confiamos",
    h3: "Bambu Lab, Prusa, Creality, Anycubic, Elegoo, Flashforge y Snapmaker — trabajamos con las marcas que tienen el historial, la comunidad y la disponibilidad de repuestos para mantenerlo imprimiendo durante años.",
    h4Heading: "Datos de la empresa & contacto",
    h4Intro: "3DJools está operada por LN-SQUARED, Rue du Chénia 17, 7170 Manage, Hainaut, Bélgica (n.º de empresa 0564.743.304, IVA BE0564743304).",
    emailLabel: "Correo electrónico",
    phoneLabel: "Teléfono",
    hoursLabel: "Horario comercial",
    h4Dispatch: "Cada pedido se gestiona en un plazo de 0–1 día laborable de lunes a viernes; el transporte tarda 3–5 días laborables, con un plazo total estimado de entrega de 3–6 días laborables. Respondemos a cada consulta en un plazo de 48 horas.",
    h4ReachPre: "Contáctenos en cualquier momento a través de nuestra",
    h4ContactLink: "página de contacto",
    h4Mid: ", o consulte los datos de registro completos en nuestro",
    h4LegalLink: "aviso legal",
    h4Post: ".",
  },
  nl: {
    h1Heading: "Serieuze machines, eerlijke prijzen",
    h1: "3DJools is een Europese webshop gewijd aan 3D-printen. Wij selecteren met zorg de machines, filament, resin en accessoires waarop makers echt vertrouwen — van bewezen bestsellers tot de nieuwste CoreXY-topmodellen — en bieden ze aan tegen prijzen die kloppen.",
    h2Heading: "Gemaakt voor makers in heel Europa",
    h2: "Wij verzenden snel door de hele EU, spreken uw taal in zes landen en ondersteunen elke aankoop met deskundige hulp en de wettelijke EU-consumentengarantie van 2 jaar. Of u nu uw eerste benchy print of een kleine productiefarm runt, wij staan voor en na de verkoop voor u klaar.",
    h3Heading: "De merken die we vertrouwen",
    h3: "Bambu Lab, Prusa, Creality, Anycubic, Elegoo, Flashforge en Snapmaker — wij voeren de merken met de trackrecord, de community en de beschikbaarheid van onderdelen om u jarenlang te laten printen.",
    h4Heading: "Bedrijfs- & contactgegevens",
    h4Intro: "3DJools wordt beheerd door LN-SQUARED, Rue du Chénia 17, 7170 Manage, Hainaut, België (ondernemingsnummer 0564.743.304, btw-nummer BE0564743304).",
    emailLabel: "E-mail",
    phoneLabel: "Telefoon",
    hoursLabel: "Openingstijden",
    h4Dispatch: "Bestellingen worden van maandag tot vrijdag binnen 0–1 werkdag verwerkt; het transport duurt 3–5 werkdagen, met een totale geschatte levertijd van 3–6 werkdagen. Wij beantwoorden elke vraag binnen 48 uur.",
    h4ReachPre: "U kunt ons altijd bereiken via onze",
    h4ContactLink: "contactpagina",
    h4Mid: ", of raadpleeg de volledige registratiegegevens in ons",
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
  const t = COPY[locale]

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
          <a href="mailto:info@3djools.com" className="underline underline-offset-2 hover:text-foreground">
            info@3djools.com
          </a>
          <br />
          {t.phoneLabel}: +32 460 00 80 70
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
