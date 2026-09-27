/**
 * One-off: rewrite product copy so it is not the same wording as source shops.
 * Keeps names, numbers, and facts. Backs up the previous copy first.
 * Delete after the run.
 */
import fs from "fs"
import { generateText } from "ai"
import pg from "pg"

const { Pool } = pg
const MODEL = "google/gemini-2.5-flash"
const LOCALES = ["de", "fr", "it", "es", "nl"]
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 4 })

const only = (process.argv.find((a) => a.startsWith("--only=")) || "").slice(7).split(",").filter(Boolean)
const limit = Number((process.argv.find((a) => a.startsWith("--limit=")) || "").slice(8)) || 0
const category = (process.argv.find((a) => a.startsWith("--category=")) || "").slice(11)

function words(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9äöüßéèêàáíóúñ.]+/gi, " ")
    .split(/\s+/)
    .filter(Boolean)
}

function shingles(text, n) {
  const list = words(text)
  const set = new Set()
  for (let i = 0; i <= list.length - n; i++) set.add(list.slice(i, i + n).join(" "))
  return set
}

function sharedCount(a, b, n) {
  const A = shingles(a, n)
  const B = shingles(b, n)
  let nShared = 0
  for (const item of A) if (B.has(item)) nShared++
  return nShared
}

function numbersIn(text) {
  return [...String(text || "").matchAll(/\d+(?:[.,]\d+)?/g)].map((m) => m[0].replace(",", "."))
}

function extractJson(text) {
  const raw = String(text || "").trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim()
  const start = raw.indexOf("{")
  const end = raw.lastIndexOf("}")
  if (start < 0 || end < start) throw new Error("no json")
  return JSON.parse(raw.slice(start, end + 1))
}

function banned(text) {
  const value = String(text || "")
  const rules = [
    /\b(best|unbeatable|cheapest|number one|#1)\b/i,
    /\b(free shipping|kostenloser versand|livraison gratuite|env[ií]o gratis|spedizione gratuita|gratis verzending)\b/i,
    /\b(3djake|matterhackers|printedsolid|igo3d|amazon)\b/i,
    /!/,
  ]
  return rules.find((rule) => rule.test(value))?.toString() || ""
}

function validateCopy(sourceText, copy, label, { translation = false } = {}) {
  const description = String(copy?.description || "").trim()
  const shortDescription = String(copy?.shortDescription || "").trim()
  const highlights = copy?.highlights
  if (!description || !shortDescription) throw new Error(`${label}: empty copy`)
  if (!Array.isArray(highlights)) throw new Error(`${label}: highlights`)
  const sourceHighlights = sourceText.highlights || []
  if (highlights.length !== sourceHighlights.length) throw new Error(`${label}: highlight count`)
  if (highlights.some((item) => typeof item !== "string" || !item.trim())) throw new Error(`${label}: blank highlight`)
  if (!translation && Array.isArray(sourceText.highlights)) {
    sourceText.highlights.forEach((item, index) => {
      const next = String(highlights[index] || "")
      if (!/\d/.test(item) && item.length > 8 && item.trim().toLowerCase() === next.trim().toLowerCase()) {
        throw new Error(`${label}: highlight unchanged ${item}`)
      }
    })
  }
  if (!translation && sourceText.category === "filaments") {
    for (const item of sourceText.highlights || []) {
      if (item.length < 42 && !shortDescription.toLowerCase().includes(String(item).toLowerCase())) {
        throw new Error(`${label}: short missing ${item}`)
      }
    }
  }
  const blob = `${shortDescription}\n${description}\n${highlights.join(" ")}`
  const promo = banned(blob)
  if (promo) throw new Error(`${label}: banned ${promo}`)
  const allowed = new Set(numbersIn(`${sourceText.name} ${sourceText.short} ${sourceText.description} ${(sourceText.highlights || []).join(" ")}`))
  const outNums = new Set(numbersIn(blob))
  for (const n of outNums) {
    if (!allowed.has(n)) throw new Error(`${label}: new number ${n}`)
  }
  if (!translation) {
    for (const n of numbersIn(`${sourceText.short} ${sourceText.description} ${(sourceText.highlights || []).join(" ")}`)) {
      if (!outNums.has(n)) throw new Error(`${label}: dropped number ${n}`)
    }
  }
  const sourceLen = String(sourceText.description || "").length
  const maxRatio = translation ? 1.8 : 1.45
  if (sourceLen > 180 && (description.length < sourceLen * 0.5 || description.length > sourceLen * maxRatio)) {
    throw new Error(`${label}: length ${description.length} vs ${sourceLen}`)
  }
  if (!translation) {
    const n = sourceLen > 500 ? 12 : 9
    if (words(sourceText.description).length >= n + 2 && sharedCount(sourceText.description, description, n) > 1) {
      throw new Error(`${label}: still shares a ${n}-word sequence`)
    }
  }
  if (/\bprecision-manufactured\b/i.test(description) || /^\s*genuine\b/i.test(description)) {
    throw new Error(`${label}: kept source boilerplate`)
  }
  return {
    shortDescription,
    description,
    highlights: highlights.map((item) => item.trim()),
  }
}

async function ask(prompt) {
  let lastError
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const { text } = await generateText({ model: MODEL, prompt })
      return extractJson(text)
    } catch (error) {
      lastError = error
      const message = String(error?.message || error)
      if (attempt === 4 || !/429|rate|timeout|overloaded|503|fetch failed/i.test(message)) throw error
      await new Promise((resolve) => setTimeout(resolve, 1500 * attempt))
    }
  }
  throw lastError
}

async function rewriteOne(product) {
  const source = {
    name: product.name,
    short: product.short_description,
    description: product.description,
    highlights: product.highlights || [],
    category: product.category,
  }
  let lastError = ""
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const en = await ask(`Rewrite this product copy into original catalog wording for an independent shop. Return JSON only, no markdown.
Schema: {"shortDescription": string, "description": string, "highlights": string[]}

Rules:
- Keep the brand, model, color, material, weight, diameter, compatibility, and every number exactly as given.
- Do not add specs, awards, prices, shipping, discounts, or claims that are not in the source.
- Change the sentence structure. Do not reuse any 6-word sequence from the source description.
- Do not start with "Genuine". Do not use the phrase "precision-manufactured".
- No exclamation marks. No "best", "unbeatable", or shop names.
- shortDescription is one or two factual sentences for a product feed, similar length to the source.
- For filaments, shortDescription must contain each highlight string exactly, including the material line, color, and diameter.
- description keeps the same facts and a similar length. Same number of highlights. Reword every highlight that is not only a number and a unit. Keep product-line names.
- Do not add intensifiers that are not in the source, such as harmful, perfect, generous, premium, or professional.
- If the source color or refill note is cut off ("ohne...", "..."), complete it only from the product name.
${lastError ? `\nPrevious attempt failed: ${lastError}. Fix that.` : ""}

Product name: ${product.name}
Category: ${product.category}
Short: ${product.short_description}
Description: ${product.description}
Highlights: ${JSON.stringify(product.highlights || [])}`)
      const english = validateCopy(source, en, "en")
      const translated = await ask(`Translate this catalog copy. Return JSON only.
Schema: {"de":{"shortDescription":string,"description":string,"highlights":string[]},"fr":{...},"it":{...},"es":{...},"nl":{...}}

Rules:
- Faithful translation of the English below, not a new rewrite.
- Keep brand names, model names, and numbers unchanged.
- highlights must stay the same count.
- No exclamation marks, no promotional claims, no shop names.
- Natural catalog language for each locale.

English short: ${english.shortDescription}
English description: ${english.description}
English highlights: ${JSON.stringify(english.highlights)}`)
      const locales = { en: english }
      for (const locale of LOCALES) {
        locales[locale] = validateCopy(
          { ...source, description: english.description, short: english.shortDescription, highlights: english.highlights },
          translated[locale],
          locale,
          { translation: true },
        )
        if (locales[locale].description === english.description) throw new Error(`${locale}: not translated`)
      }
      return locales
    } catch (error) {
      lastError = error.message
      if (attempt === 3) throw error
    }
  }
}

async function save(product, locales) {
  const translations = { ...(product.translations || {}) }
  for (const [locale, copy] of Object.entries(locales)) {
    translations[locale] = {
      ...(translations[locale] || {}),
      shortDescription: copy.shortDescription,
      description: copy.description,
      highlights: copy.highlights,
    }
  }
  const en = locales.en
  await pool.query(
    `UPDATE products
     SET short_description = $1,
         description = $2,
         highlights = $3::jsonb,
         translations = $4::jsonb,
         updated_at = now()
     WHERE slug = $5`,
    [en.shortDescription, en.description, JSON.stringify(en.highlights), JSON.stringify(translations), product.slug],
  )
}

async function mapLimit(items, limitN, fn) {
  let index = 0
  async function worker() {
    while (index < items.length) {
      const current = index++
      await fn(items[current], current)
    }
  }
  await Promise.all(Array.from({ length: Math.min(limitN, items.length) }, worker))
}

async function main() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS product_copy_backup (
      slug text PRIMARY KEY,
      short_description text,
      description text,
      highlights jsonb,
      translations jsonb,
      backed_up_at timestamptz DEFAULT now()
    )
  `)
  await pool.query(`
    INSERT INTO product_copy_backup (slug, short_description, description, highlights, translations)
    SELECT slug, short_description, description, highlights, translations
    FROM products
    WHERE archived = false
    ON CONFLICT (slug) DO NOTHING
  `)

  const params = []
  let where = `p.archived = false AND p.slug NOT LIKE 'test-%'
    AND EXISTS (
      SELECT 1 FROM product_copy_backup b
      WHERE b.slug = p.slug
        AND p.description IS NOT DISTINCT FROM b.description
        AND p.short_description IS NOT DISTINCT FROM b.short_description
    )
    AND p.category <> 'filaments'`
  if (only.length) {
    params.push(only)
    where += ` AND p.slug = ANY($${params.length})`
  }
  if (category) {
    params.push(category)
    where += ` AND p.category = $${params.length}`
  }
  const result = await pool.query(
    `SELECT slug, name, category, brand_slug, short_description, description, highlights, translations
     FROM products p
     WHERE ${where}
     ORDER BY CASE category
       WHEN 'printers' THEN 1
       WHEN 'laser-engravers' THEN 2
       WHEN 'scanners' THEN 3
       WHEN 'resins' THEN 4
       WHEN 'accessories' THEN 5
       WHEN 'spare-parts' THEN 6
       ELSE 7 END, slug`,
    params,
  )
  const rows = limit ? result.rows.slice(0, limit) : result.rows
  console.log("todo", rows.length)
  let ok = 0
  let failed = 0
  await mapLimit(rows, 8, async (product) => {
    try {
      let locales
      let lastError
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          locales = await rewriteOne(product)
          break
        } catch (error) {
          lastError = error
          if (attempt === 2) throw error
        }
      }
      if (!locales) throw lastError
      await save(product, locales)
      ok++
      const line = `ok ${ok + failed}/${rows.length} ${product.slug}`
      console.log(line)
      fs.appendFileSync("/tmp/rephrase-progress.log", line + "\n")
      if (only.length || limit) {
        console.log("EN SHORT:", locales.en.shortDescription)
        console.log("EN DESC:", locales.en.description.slice(0, 500))
        console.log("DE DESC:", locales.de.description.slice(0, 280))
      }
    } catch (error) {
      failed++
      const line = `fail ${product.slug} ${error.message}`
      console.log(line)
      fs.appendFileSync("/tmp/rephrase-progress.log", line + "\n")
    }
  })
  console.log("DONE", { ok, failed, todo: rows.length })
  await pool.end()
}

main().catch(async (error) => {
  console.error(error)
  await pool.end()
  process.exit(1)
})
