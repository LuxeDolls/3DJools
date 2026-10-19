import type { Locale } from "@/lib/i18n/config"
import { getAllProducts } from "@/lib/catalog"
import type { Product } from "@/lib/catalog/types"
import { SITE_ORIGIN } from "@/lib/catalog/image-urls"
import { ALL_SHIPPING_COUNTRIES, DOMESTIC_COUNTRY, DOMESTIC_RATE_CENTS, INTERNATIONAL_RATE_CENTS } from "@/lib/shipping/rates"

const BASE_URL = SITE_ORIGIN
const STORE_NAME = "DnD3D"

function absoluteUrl(value: string | undefined): string {
  if (!value) return ""
  if (value.startsWith("https://") || value.startsWith("http://")) return value
  return `${BASE_URL}${value.startsWith("/") ? value : `/${value}`}`
}
const DESCRIPTION_LIMIT = 5000

// Machines and accessories. Spare parts, filaments and resins stay on the site.
// Russian is not a storefront language and must never appear in a feed.
const FEED_CATEGORIES = new Set(["printers", "scanners", "laser-engravers", "accessories"])
const CYRILLIC = /[\u0400-\u04FF]/

const GOOGLE_CATEGORY = {
  printers: "6865",
  scanners: "306",
  "laser-engravers": "504642",
  accessories: "499682",
} as const

const PCB_PRINTER_SLUG = "voltera-voltera-v1-pcb-printer"
const PCB_CATEGORY = "3889"

const FEED_DESCRIPTION: Record<Locale, string> = {
  en: "3D printers, 3D scanners, laser engravers and accessories",
  de: "3D-Drucker, 3D-Scanner, Lasergravierer und Zubehör",
  fr: "Imprimantes 3D, scanners 3D, graveurs laser et accessoires",
  es: "Impresoras 3D, escáneres 3D, grabadores láser y accesorios",
  it: "Stampanti 3D, scanner 3D, incisori laser e accessori",
  nl: "3D-printers, 3D-scanners, lasergravers en accessoires",
}

// Imported accessory names start with a category label. That label is not the product.
const TITLE_PREFIX = /^(?:3d print(?:ing)?|3d printer|3d-druck|3d-drucker|impression 3d|imprimante 3d|impresión 3d|impresora 3d|stampa 3d|stampante 3d|3d-printen|3d-printer|3d-print)\s*,\s*/i
const PROMOTION = /\b(?:\d+\s*%|autumn sale|herbst(?:aktion|sale|-sale)|promotion d'automne|descuento de otoño|sconto d'autunno|herfstkorting|rabatt|soldes|korting)\b/i

const PRODUCT_TYPE: Record<Locale, Record<string, string>> = {
  en: { printers: "3D printers", scanners: "3D scanners", "laser-engravers": "Laser engravers", accessories: "Accessories", pcb: "PCB printers" },
  de: { printers: "3D-Drucker", scanners: "3D-Scanner", "laser-engravers": "Lasergravierer", accessories: "Zubehör", pcb: "Leiterplatten-Drucker" },
  fr: { printers: "Imprimantes 3D", scanners: "Scanners 3D", "laser-engravers": "Graveurs laser", accessories: "Accessoires", pcb: "Imprimantes PCB" },
  it: { printers: "Stampanti 3D", scanners: "Scanner 3D", "laser-engravers": "Incisori laser", accessories: "Accessori", pcb: "Stampanti PCB" },
  es: { printers: "Impresoras 3D", scanners: "Escáneres 3D", "laser-engravers": "Grabadores láser", accessories: "Accesorios", pcb: "Impresoras PCB" },
  nl: { printers: "3D-printers", scanners: "3D-scanners", "laser-engravers": "Lasergravers", accessories: "Accessoires", pcb: "PCB-printers" },
}

const SPEC_INTRO: Record<Locale, string> = {
  en: "Specifications:",
  de: "Technische Daten:",
  fr: "Caractéristiques :",
  it: "Specifiche:",
  es: "Especificaciones:",
  nl: "Specificaties:",
}

const SPEC_LABELS: Record<string, Record<Exclude<Locale, "en">, string>> = {
  Connectivity: { de: "Anschluss", fr: "Connectivité", it: "Connettività", es: "Conectividad", nl: "Connectiviteit" },
  Technology: { de: "Technologie", fr: "Technologie", it: "Tecnologia", es: "Tecnología", nl: "Technologie" },
  "Machine dimensions": { de: "Geräteabmessungen", fr: "Dimensions de la machine", it: "Dimensioni della macchina", es: "Dimensiones de la máquina", nl: "Machineafmetingen" },
  "Net weight": { de: "Nettogewicht", fr: "Poids net", it: "Peso netto", es: "Peso neto", nl: "Nettogewicht" },
  "Max speed": { de: "Höchstgeschwindigkeit", fr: "Vitesse max.", it: "Velocità max.", es: "Velocidad máx.", nl: "Max. snelheid" },
  "Build volume": { de: "Bauvolumen", fr: "Volume d'impression", it: "Volume di stampa", es: "Volumen de impresión", nl: "Bouwvolume" },
  Nozzle: { de: "Düse", fr: "Buse", it: "Ugello", es: "Boquilla", nl: "Nozzle" },
  "Max nozzle temp": { de: "Max. Düsentemperatur", fr: "Temp. max. de la buse", it: "Temp. max. ugello", es: "Temp. máx. de la boquilla", nl: "Max. nozzletemperatuur" },
  "Max bed temp": { de: "Max. Betttemperatur", fr: "Temp. max. du plateau", it: "Temp. max. del piano", es: "Temp. máx. de la cama", nl: "Max. bedtemperatuur" },
  "Bed levelling": { de: "Bettnivellierung", fr: "Nivellement du plateau", it: "Livellamento del piano", es: "Nivelación de la cama", nl: "Bednivellering" },
  "Filament types": { de: "Filamenttypen", fr: "Types de filament", it: "Tipi di filamento", es: "Tipos de filamento", nl: "Filamenttypes" },
  Type: { de: "Typ", fr: "Type", it: "Tipo", es: "Tipo", nl: "Type" },
  Sensor: { de: "Sensor", fr: "Capteur", it: "Sensore", es: "Sensor", nl: "Sensor" },
  Accuracy: { de: "Genauigkeit", fr: "Précision", it: "Precisione", es: "Precisión", nl: "Nauwkeurigheid" },
  "Scan range": { de: "Scanbereich", fr: "Plage de scan", it: "Intervallo di scansione", es: "Rango de escaneo", nl: "Scanbereik" },
  Weight: { de: "Gewicht", fr: "Poids", it: "Peso", es: "Peso", nl: "Gewicht" },
  Screen: { de: "Display", fr: "Écran", it: "Schermo", es: "Pantalla", nl: "Scherm" },
  Camera: { de: "Kamera", fr: "Caméra", it: "Fotocamera", es: "Cámara", nl: "Camera" },
  "Laser power": { de: "Laserleistung", fr: "Puissance laser", it: "Potenza laser", es: "Potencia láser", nl: "Laservermogen" },
  "Engraving area": { de: "Gravurfläche", fr: "Surface de gravure", it: "Area di incisione", es: "Área de grabado", nl: "Graveeroppervlak" },
  Width: { de: "Breite", fr: "Largeur", it: "Larghezza", es: "Ancho", nl: "Breedte" },
  Depth: { de: "Tiefe", fr: "Profondeur", it: "Profondità", es: "Profundidad", nl: "Diepte" },
  Height: { de: "Höhe", fr: "Hauteur", it: "Altezza", es: "Altura", nl: "Hoogte" },
  USB: { de: "USB", fr: "USB", it: "USB", es: "USB", nl: "USB" },
  "Light source": { de: "Lichtquelle", fr: "Source lumineuse", it: "Sorgente luminosa", es: "Fuente de luz", nl: "Lichtbron" },
  "Output formats": { de: "Ausgabeformate", fr: "Formats de sortie", it: "Formati di output", es: "Formatos de salida", nl: "Uitvoerformaten" },
  Software: { de: "Software", fr: "Logiciel", it: "Software", es: "Software", nl: "Software" },
  "Max working speed": { de: "Max. Arbeitsgeschwindigkeit", fr: "Vitesse de travail max.", it: "Velocità di lavoro max.", es: "Velocidad de trabajo máx.", nl: "Max. werksnelheid" },
  "Air filtration": { de: "Luftfilterung", fr: "Filtration de l'air", it: "Filtrazione dell'aria", es: "Filtración de aire", nl: "Luchtfiltering" },
  Frame: { de: "Rahmen", fr: "Châssis", it: "Telaio", es: "Bastidor", nl: "Frame" },
  "Air assist": { de: "Luftunterstützung", fr: "Assistance d'air", it: "Assistenza ad aria", es: "Asistencia de aire", nl: "Luchtondersteuning" },
  Wavelength: { de: "Wellenlänge", fr: "Longueur d'onde", it: "Lunghezza d'onda", es: "Longitud de onda", nl: "Golflengte" },
  Function: { de: "Funktion", fr: "Fonction", it: "Funzione", es: "Función", nl: "Functie" },
  "Working distance": { de: "Arbeitsabstand", fr: "Distance de travail", it: "Distanza di lavoro", es: "Distancia de trabajo", nl: "Werkafstand" },
  "Full scan cycle": { de: "Vollständiger Scanzyklus", fr: "Cycle de scan complet", it: "Ciclo di scansione completo", es: "Ciclo de escaneo completo", nl: "Volledige scancyclus" },
  Turntable: { de: "Drehteller", fr: "Plateau tournant", it: "Piatto rotante", es: "Plato giratorio", nl: "Draaitafel" },
  "Best for": { de: "Geeignet für", fr: "Idéal pour", it: "Ideale per", es: "Ideal para", nl: "Geschikt voor" },
  "Wi-Fi": { de: "WLAN", fr: "Wi-Fi", it: "Wi-Fi", es: "Wi-Fi", nl: "Wi-Fi" },
  Battery: { de: "Akku", fr: "Batterie", it: "Batteria", es: "Batería", nl: "Accu" },
  "Scan speed": { de: "Scangeschwindigkeit", fr: "Vitesse de scan", it: "Velocità di scansione", es: "Velocidad de escaneo", nl: "Scansnelheid" },
  Safety: { de: "Sicherheit", fr: "Sécurité", it: "Sicurezza", es: "Seguridad", nl: "Veiligheid" },
  "Scan modes": { de: "Scanmodi", fr: "Modes de scan", it: "Modalità di scansione", es: "Modos de escaneo", nl: "Scanmodi" },
  "Color capture": { de: "Farberfassung", fr: "Capture des couleurs", it: "Acquisizione del colore", es: "Captura de color", nl: "Kleurregistratie" },
  "Compatible materials": { de: "Kompatible Materialien", fr: "Matériaux compatibles", it: "Materiali compatibili", es: "Materiales compatibles", nl: "Compatibele materialen" },
  "Laser spot size": { de: "Laserpunktgröße", fr: "Taille du spot laser", it: "Dimensione dello spot laser", es: "Tamaño del punto láser", nl: "Laserpuntgrootte" },
  Positioning: { de: "Positionierung", fr: "Positionnement", it: "Posizionamento", es: "Posicionamiento", nl: "Positionering" },
  "Module swap time": { de: "Modulwechselzeit", fr: "Temps de changement de module", it: "Tempo di cambio modulo", es: "Tiempo de cambio de módulo", nl: "Modulewisseltijd" },
  "Bundle contents": { de: "Lieferumfang", fr: "Contenu du pack", it: "Contenuto del bundle", es: "Contenido del pack", nl: "Inhoud van de bundel" },
  "Engraving accuracy": { de: "Gravurgenauigkeit", fr: "Précision de gravure", it: "Precisione di incisione", es: "Precisión de grabado", nl: "Graveernauwkeurigheid" },
  "Battery life": { de: "Akkulaufzeit", fr: "Autonomie", it: "Autonomia", es: "Autonomía", nl: "Accuduur" },
  Design: { de: "Bauform", fr: "Conception", it: "Design", es: "Diseño", nl: "Ontwerp" },
  Laser: { de: "Laser", fr: "Laser", it: "Laser", es: "Láser", nl: "Laser" },
  "Motion system": { de: "Bewegungssystem", fr: "Système de mouvement", it: "Sistema di movimento", es: "Sistema de movimiento", nl: "Bewegingssysteem" },
  "Positioning accuracy": { de: "Positioniergenauigkeit", fr: "Précision de positionnement", it: "Precisione di posizionamento", es: "Precisión de posicionamiento", nl: "Positioneernauwkeurigheid" },
  "Power consumption": { de: "Leistungsaufnahme", fr: "Consommation", it: "Consumo energetico", es: "Consumo de energía", nl: "Stroomverbruik" },
  "Filament diameter": { de: "Filamentdurchmesser", fr: "Diamètre du filament", it: "Diametro del filamento", es: "Diámetro del filamento", nl: "Filamentdiameter" },
}

const SHIPPING_BLOCKS = ALL_SHIPPING_COUNTRIES
  .map(({ code }) => {
    const cents = code === DOMESTIC_COUNTRY.code ? DOMESTIC_RATE_CENTS : INTERNATIONAL_RATE_CENTS
    return `\n      <g:shipping>\n        <g:country>${code}</g:country>\n        <g:price>${(cents / 100).toFixed(2)} EUR</g:price>\n      </g:shipping>`
  })
  .join("")

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;")
}

function formatPrice(cents: number): string {
  return `${(cents / 100).toFixed(2)} EUR`
}

function availability(value: string): string {
  if (value === "out_of_stock") return "out of stock"
  if (value === "preorder") return "preorder"
  return "in stock"
}

function hashForGoogleId(value: string): string {
  let first = 2166136261
  let second = 16777619

  for (const character of value) {
    const codePoint = character.codePointAt(0) ?? 0
    first = Math.imul(first ^ codePoint, 16777619) >>> 0
    second = Math.imul(second ^ codePoint, 2246822519) >>> 0
  }

  return `${first.toString(16).padStart(8, "0")}${second.toString(16).padStart(8, "0")}`
}

function googleProductId(product: { id: string; slug: string }): string {
  if (product.id.length <= 50) return product.id

  const readableSlug = product.slug.replace(/[^a-zA-Z0-9-]/g, "-").slice(0, 31)
  return `p-${hashForGoogleId(product.id)}-${readableSlug}`.slice(0, 50)
}

function wordCount(value: string): number {
  return value.trim().split(/\s+/).filter(Boolean).length
}

function clip(value: string): string {
  const compact = value.replace(/\s+/g, " ").trim()
  if (compact.length <= DESCRIPTION_LIMIT) return compact
  return compact.slice(0, DESCRIPTION_LIMIT).replace(/\s+\S*$/, "")
}

function specLabel(label: string, locale: Locale): string | undefined {
  if (locale === "en") return label
  return SPEC_LABELS[label]?.[locale]
}

function feedTitle(product: Product): string {
  const brand = product.brandName ?? product.brandSlug
  const stripped = product.name.replace(TITLE_PREFIX, "").trim()
  let title = stripped || product.name.trim()
  if (brand && !title.toLowerCase().includes(brand.toLowerCase())) title = `${brand} ${title}`
  return title.replace(/\s+/g, " ").trim().slice(0, 150)
}

function withoutPromotion(value: string): string {
  return value
    .split(/(?<=[.!?])\s+/)
    .filter((sentence) => !PROMOTION.test(sentence))
    .join(" ")
}

function feedDescription(product: Product, locale: Locale): string {
  const highlights = product.highlights.filter(Boolean).join(" ")
  const base = withoutPromotion([product.description, highlights].filter(Boolean).join(" "))
  if (wordCount(base) >= 100) return clip(base)

  const specs = product.specs
    .map((spec) => {
      const label = specLabel(spec.label, locale)
      if (!label || !spec.value) return ""
      return `${label}: ${spec.value}`
    })
    .filter(Boolean)

  if (specs.length === 0) return clip(base)
  return clip(`${base} ${SPEC_INTRO[locale]} ${specs.join(". ")}.`)
}

function containsRussian(value: string | undefined): boolean {
  return Boolean(value && CYRILLIC.test(value))
}

function productContainsRussian(product: Product): boolean {
  return [
    product.name,
    product.shortDescription,
    product.description,
    product.brandName,
    product.brandSlug,
    product.mpn,
    ...product.highlights,
    ...product.specs.flatMap((spec) => [spec.label, spec.value]),
  ].some((value) => containsRussian(value))
}

function enoughImages(product: Product): boolean {
  const minimum = product.category === "accessories" ? 1 : 2
  return product.images.length >= minimum
}

function googleCategory(product: Product): string {
  if (product.slug === PCB_PRINTER_SLUG) return PCB_CATEGORY
  return GOOGLE_CATEGORY[product.category as keyof typeof GOOGLE_CATEGORY] ?? ""
}

function productType(product: Product, locale: Locale): string {
  if (product.slug === PCB_PRINTER_SLUG) return PRODUCT_TYPE[locale].pcb
  return PRODUCT_TYPE[locale][product.category] ?? product.category
}

function validGtin(value: string | undefined): string | undefined {
  const digits = value?.replace(/\s/g, "")
  if (!digits || !/^\d{8}$|^\d{12}$|^\d{13}$|^\d{14}$/.test(digits)) return undefined
  return digits
}

export async function createGoogleShoppingFeed(locale: Locale): Promise<string> {
  const products = (await getAllProducts(locale)).filter(
    (product) =>
      FEED_CATEGORIES.has(product.category) &&
      product.priceCents > 0 &&
      enoughImages(product) &&
      !product.slug.startsWith("test-") &&
      !productContainsRussian(product),
  )
  const items = products.map((product) => {
    const brand = product.brandName ?? product.brandSlug
    const gtin = validGtin(product.ean ?? product.gtin)
    const mpn = product.mpn.trim()
    const hasIdentifier = Boolean(gtin || mpn)
    const imageLink = absoluteUrl(product.images[0])
    const extraImages = product.images.slice(1, 11).map((image) => absoluteUrl(image)).filter(Boolean)
    const productUrl = `${BASE_URL}/${locale}/product/${encodeURIComponent(product.slug)}`
    const priceBlock = `\n      <g:price>${formatPrice(product.priceCents)}</g:price>`
    const category = googleCategory(product)

    return `
    <item>
      <g:id>${escapeXml(googleProductId(product))}</g:id>
      <g:title>${escapeXml(feedTitle(product))}</g:title>
      <g:description>${escapeXml(feedDescription(product, locale))}</g:description>
      <g:link>${escapeXml(productUrl)}</g:link>
      ${imageLink ? `<g:image_link>${escapeXml(imageLink)}</g:image_link>` : ""}
      ${extraImages.map((image) => `<g:additional_image_link>${escapeXml(image)}</g:additional_image_link>`).join("\n      ")}
      <g:availability>${availability(product.availability)}</g:availability>${priceBlock}
      <g:brand>${escapeXml(brand)}</g:brand>
      ${mpn ? `<g:mpn>${escapeXml(mpn)}</g:mpn>` : ""}
      ${gtin ? `<g:gtin>${escapeXml(gtin)}</g:gtin>` : ""}
      ${hasIdentifier ? "" : "<g:identifier_exists>no</g:identifier_exists>"}
      <g:condition>new</g:condition>
      ${category ? `<g:google_product_category>${category}</g:google_product_category>` : ""}
      <g:product_type>${escapeXml(productType(product, locale))}</g:product_type>
      <g:custom_label_0>${STORE_NAME}</g:custom_label_0>${SHIPPING_BLOCKS}
    </item>`
  }).join("")

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0" xml:lang="${locale}">
  <channel>
    <title>${STORE_NAME} (${locale})</title>
    <link>${BASE_URL}/${locale}</link>
    <description>${escapeXml(FEED_DESCRIPTION[locale])}</description>${items}
  </channel>
</rss>`

  return xml.replace(/[\u0400-\u04FF]+/g, "")
}

export function xmlResponse(xml: string): Response {
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  })
}
