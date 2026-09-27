/**
 * One-off: rewrite the shared filament boilerplate in six languages.
 * Facts come only from the backed-up name, colour, material, diameter, and weight.
 * Delete after the run.
 */
import pg from "pg"

const apply = process.argv.includes("--apply")
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 2 })
const LOCALES = ["en", "de", "fr", "it", "es", "nl"]
const COLOR_RE = {
  en: /filament in (.+?),/i,
  de: /Filament in (.+?),/i,
  fr: / en (.+?), diamètre/i,
  it: / in (.+?), diametro/i,
  es: / en (.+?), diámetro/i,
  nl: /filament in (.+?),/i,
}
const BANNED = [
  "genuine",
  "precision-manufactured",
  "präzisionsgefertigt",
  "precisiegefabriceerd",
  "fabriqué avec précision",
  "prodotto con precisione",
  "fabricado con precisión",
  "consistent extrusion",
  "gleichmäßige extrusion",
  "extrusion constante",
  "estrusione costante",
  "extrusión constante",
  "consistente extrusie",
  "reliable prints",
  "zuverlässige drucke",
  "impressions fiables",
  "stampe affidabili",
  "impresiones fiables",
  "betrouwbare prints",
]
const HIGHLIGHT_MAP = {
  en: {
    "Low warping": "Limited warp",
    "Vacuum sealed": "Vacuum-packed",
    "Wide colour range": "Broad colour range",
    "Impact resistant": "Impact-resistant grade",
    "Water & UV resistant": "Resists water and UV",
  },
  de: {
    "Low warping": "Geringer Verzug",
    "Vacuum sealed": "Vakuumverpackt",
    "Wide colour range": "Breite Farbauswahl",
    "Impact resistant": "Schlagzähe Ausführung",
    "Water & UV resistant": "Beständig gegen Wasser und UV",
  },
  fr: {
    "Low warping": "Faible gauchissement",
    "Vacuum sealed": "Emballé sous vide",
    "Wide colour range": "Large choix de couleurs",
    "Impact resistant": "Qualité résistante aux chocs",
    "Water & UV resistant": "Résiste à l'eau et aux UV",
  },
  it: {
    "Low warping": "Bassa deformazione",
    "Vacuum sealed": "Confezionato sottovuoto",
    "Wide colour range": "Ampia gamma di colori",
    "Impact resistant": "Grado resistente agli urti",
    "Water & UV resistant": "Resiste ad acqua e UV",
  },
  es: {
    "Low warping": "Baja deformación",
    "Vacuum sealed": "Envasado al vacío",
    "Wide colour range": "Amplia gama de colores",
    "Impact resistant": "Grado resistente a impactos",
    "Water & UV resistant": "Resiste el agua y los UV",
  },
  nl: {
    "Low warping": "Weinig krimp",
    "Vacuum sealed": "Vacuüm verpakt",
    "Wide colour range": "Breed kleurbereik",
    "Impact resistant": "Slagvaste uitvoering",
    "Water & UV resistant": "Bestand tegen water en UV",
  },
}

function hash(slug) {
  let h = 0
  for (const char of slug) h = (h * 33 + char.charCodeAt(0)) >>> 0
  return h % 3
}

function parseWeight(name) {
  const kg = String(name || "").match(/(\d+(?:[.,]\d+)?)\s*kg/i)
  if (kg) return { kind: "kg", n: Number(kg[1].replace(",", ".")) }
  const grams = String(name || "").match(/(\d+(?:[.,]\d+)?)\s*g\b/i)
  if (!grams) return null
  const n = Number(grams[1].replace(",", "."))
  if (n >= 1000 && n % 1000 === 0) return { kind: "kg", n: n / 1000 }
  return { kind: "g", n }
}

function formatWeight(weight, comma) {
  if (!weight) return ""
  const raw = Number.isInteger(weight.n) ? String(weight.n) : String(weight.n)
  const shown = comma ? raw.replace(".", ",") : raw
  return `${shown} ${weight.kind}`
}

function diameterOf(short, comma) {
  const match = String(short || "").match(/(\d+(?:[.,]\d+)?)\s*mm/i)
  if (!match) return ""
  const n = match[1].replace(",", ".")
  return `${comma ? n.replace(".", ",") : n} mm`
}

function materialOf(highlights, name) {
  const first = String(highlights?.[0] || "")
  if (first && !/mm|warping|resistant|sealed|range|filament/i.test(first)) return first
  const match = String(name || "").match(/\b(PLA|PETG|ABS|ASA|TPU|PC|PA6-CF|PAHT-CF|PVA|HIPS|PET)\b/i)
  return match ? match[0] : ""
}

function brandOf(short) {
  const match = String(short || "").match(/^(.+?) filament in /i)
  return match ? match[1].trim() : ""
}

function colorOf(locale, translations, fallbackShort) {
  const short = locale === "en" ? fallbackShort : translations?.[locale]?.shortDescription
  const match = String(short || "").match(COLOR_RE[locale])
  return match ? match[1].trim() : ""
}

function highlightsFor(locale, source) {
  return (source || []).map((item) => HIGHLIGHT_MAP[locale][item] || item)
}

function copyFor(locale, facts, variant) {
  const { brand, material, color, diameter, weight, spool } = facts
  const noun = { en: "filament", de: "Filament", fr: "filament", it: "filamento", es: "filamento", nl: "filament" }[locale]
  const line = material ? `${brand} ${material}` : `${brand} ${noun}`
  const comma = locale !== "en"
  const weightText = formatWeight(weight, comma)
  const weightSentence = {
    en: weightText ? ` Listed fill weight: ${weightText}.` : "",
    de: weightText ? ` Angegebenes Füllgewicht: ${weightText}.` : "",
    fr: weightText ? ` Poids net indiqué : ${weightText}.` : "",
    it: weightText ? ` Peso netto indicato: ${weightText}.` : "",
    es: weightText ? ` Peso neto indicado: ${weightText}.` : "",
    nl: weightText ? ` Vermeld vulgewicht: ${weightText}.` : "",
  }[locale]
  const spoolSentence = spool
    ? {
        en: " Supplied on a spool.",
        de: " Wird auf einer Spule geliefert.",
        fr: " Livré sur une bobine.",
        it: " Fornito su una bobina.",
        es: " Se suministra en una bobina.",
        nl: " Geleverd op een spoel.",
      }[locale]
    : ""
  const tail = `${weightSentence}${spoolSentence}`
  const short = {
    en: material ? `${material} by ${brand}, ${color}, ${diameter}.` : `${brand} filament, ${color}, ${diameter}.`,
    de: material ? `${material} von ${brand}, ${color}, ${diameter}.` : `${brand}-Filament, ${color}, ${diameter}.`,
    fr: material ? `${material} ${brand}, ${color}, ${diameter}.` : `Filament ${brand}, ${color}, ${diameter}.`,
    it: material ? `${material} ${brand}, ${color}, ${diameter}.` : `Filamento ${brand}, ${color}, ${diameter}.`,
    es: material ? `${material} de ${brand}, ${color}, ${diameter}.` : `Filamento ${brand}, ${color}, ${diameter}.`,
    nl: material ? `${material} van ${brand}, ${color}, ${diameter}.` : `${brand}-filament, ${color}, ${diameter}.`,
  }[locale]
  const descriptions = {
    en: [
      `${line} in ${color}. The strand diameter is ${diameter}, for FDM printers set to that size.${tail}`,
      `This listing is ${color} ${line}. Diameter: ${diameter}.${tail}`,
      `${color} ${line}, ${diameter}. Use it on an FDM printer that accepts this diameter.${tail}`,
    ],
    de: [
      `${line} in ${color}. Der Filamentdurchmesser beträgt ${diameter}; der Drucker wird auf dieses Maß eingestellt.${tail}`,
      `Dieses Angebot ist ${line} in ${color}. Durchmesser: ${diameter}.${tail}`,
      `${color}, ${line}, ${diameter}. Für FDM-Drucker, die diesen Durchmesser verarbeiten.${tail}`,
    ],
    fr: [
      `${line} en ${color}. Le diamètre du filament est de ${diameter}, pour une imprimante FDM réglée sur cette valeur.${tail}`,
      `Cette fiche concerne ${line} en ${color}. Diamètre : ${diameter}.${tail}`,
      `${color}, ${line}, ${diameter}. Pour les imprimantes FDM qui acceptent ce diamètre.${tail}`,
    ],
    it: [
      `${line} in ${color}. Il diametro del filamento è ${diameter}; la stampante va impostata su questa misura.${tail}`,
      `Questa scheda riguarda ${line} in ${color}. Diametro: ${diameter}.${tail}`,
      `${color}, ${line}, ${diameter}. Per stampanti FDM che accettano questo diametro.${tail}`,
    ],
    es: [
      `${line} en ${color}. El diámetro del filamento es ${diameter}; la impresora se configura en esa medida.${tail}`,
      `Esta ficha es ${line} en ${color}. Diámetro: ${diameter}.${tail}`,
      `${color}, ${line}, ${diameter}. Para impresoras FDM que aceptan este diámetro.${tail}`,
    ],
    nl: [
      `${line} in ${color}. De filamentdiameter is ${diameter}; de printer wordt op die maat gezet.${tail}`,
      `Dit artikel is ${line} in ${color}. Diameter: ${diameter}.${tail}`,
      `${color}, ${line}, ${diameter}. Voor FDM-printers die deze diameter aannemen.${tail}`,
    ],
  }
  return { shortDescription: short, description: descriptions[locale][variant], highlights: facts.highlights[locale] }
}

function validate(row, locales) {
  const blob = LOCALES.map((locale) => `${locales[locale].shortDescription} ${locales[locale].description}`).join("\n")
  const lower = blob.toLowerCase()
  for (const phrase of BANNED) {
    if (lower.includes(phrase)) throw new Error(`${row.slug}: banned ${phrase}`)
  }
  for (const locale of LOCALES) {
    const text = `${locales[locale].shortDescription} ${locales[locale].description}`
    if (!text.includes(locales[locale].color)) throw new Error(`${row.slug} ${locale}: missing color`)
    if (!text.includes(locales[locale].diameter)) throw new Error(`${row.slug} ${locale}: missing diameter`)
    if (row.weight) {
      const shown = formatWeight(row.weight, locale !== "en")
      if (!text.includes(shown)) throw new Error(`${row.slug} ${locale}: missing weight ${shown}`)
    }
  }
}

const rows = (
  await pool.query(`
    SELECT p.slug, p.name, p.translations AS current_translations, b.short_description, b.highlights, b.translations
    FROM products p
    JOIN product_copy_backup b ON b.slug = p.slug
    WHERE p.archived = false AND p.category = 'filaments'
    ORDER BY p.slug
  `)
).rows

let ready = 0
const updates = []
const problems = []
for (const row of rows) {
  try {
    const brand = brandOf(row.short_description)
    const material = materialOf(row.highlights, row.name)
    const weight = parseWeight(row.name)
    const spool = /spool|spule/i.test(row.name)
    const variant = hash(row.slug)
    if (!brand) throw new Error("no brand")
    const locales = {}
    for (const locale of LOCALES) {
      const color = colorOf(locale, row.translations, row.short_description)
      const diameter = diameterOf(
        locale === "en" ? row.short_description : row.translations?.[locale]?.shortDescription,
        locale !== "en",
      )
      if (!color) throw new Error(`${locale} color`)
      if (!diameter) throw new Error(`${locale} diameter`)
      const facts = {
        brand,
        material,
        color,
        diameter,
        weight,
        spool,
        highlights: { [locale]: highlightsFor(locale, row.translations?.[locale]?.highlights || row.highlights) },
      }
      const copy = copyFor(locale, facts, variant)
      locales[locale] = { ...copy, color, diameter }
    }
    validate(row, locales)
    updates.push({ slug: row.slug, locales, currentTranslations: row.current_translations })
    ready++
  } catch (error) {
    problems.push(`${row.slug}: ${error.message}`)
  }
}

console.log({ ready, problems: problems.length, apply })
for (const item of problems.slice(0, 20)) console.log("problem", item)
for (const sample of [updates[0], updates[Math.floor(updates.length / 2)], updates[updates.length - 1]].filter(Boolean)) {
  console.log("\n==", sample.slug)
  console.log("EN", sample.locales.en.shortDescription)
  console.log(sample.locales.en.description)
  console.log("DE", sample.locales.de.shortDescription)
  console.log(sample.locales.de.description)
  console.log("FR", sample.locales.fr.description)
}

if (apply) {
  const client = await pool.connect()
  try {
    await client.query("BEGIN")
    for (const item of updates) {
      const translations = { ...(item.currentTranslations || {}) }
      for (const locale of LOCALES) {
        translations[locale] = {
          ...(translations[locale] || {}),
          shortDescription: item.locales[locale].shortDescription,
          description: item.locales[locale].description,
          highlights: item.locales[locale].highlights,
        }
      }
      await client.query(
        `UPDATE products
         SET short_description = $2,
             description = $3,
             highlights = $4::jsonb,
             translations = translations || $5::jsonb
         WHERE slug = $1`,
        [
          item.slug,
          item.locales.en.shortDescription,
          item.locales.en.description,
          JSON.stringify(item.locales.en.highlights),
          JSON.stringify(translations),
        ],
      )
    }
    await client.query("COMMIT")
    console.log("applied", updates.length)
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.release()
  }
}

await pool.end()
