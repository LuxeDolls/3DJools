import { createHash } from "node:crypto"
import { cache } from "react"
import { generateText, Output } from "ai"
import { z } from "zod"
import { pool } from "@/lib/db"
import { locales, type Locale } from "@/lib/i18n/config"
import { loadStampedReviews, type StampedReview } from "@/lib/reviews/stamped-reviews"

// Newer Gemini models need paid AI Gateway credits; this one is on the free tier.
const MODEL = "google/gemini-2.5-flash"
const BATCH_SIZE = 12
const CONCURRENCY = 4

const TARGET_LANGUAGE: Record<Locale, string> = {
  en: "English",
  de: "German",
  it: "Italian",
  fr: "French",
  nl: "Dutch",
  es: "Spanish",
}

interface TranslationRow {
  review_id: string
  source_lang: string
  source_hash: string
  title: string
  message: string
  reply: string
}

export function reviewSourceHash(review: Pick<StampedReview, "title" | "message" | "reply">) {
  return createHash("sha1").update(JSON.stringify([review.title, review.message, review.reply])).digest("hex")
}

const getTranslationRows = cache(async (locale: Locale): Promise<Map<string, TranslationRow>> => {
  try {
    const { rows } = await pool.query<TranslationRow>(
      "select review_id, source_lang, source_hash, title, message, reply from review_translations where locale = $1",
      [locale],
    )
    return new Map(rows.map((row) => [row.review_id, row]))
  } catch (error) {
    console.error("[reviews] Could not load review translations:", error)
    return new Map()
  }
})

/**
 * Swaps review text for the stored translation into `locale`. Reviews already
 * written in that language, or not translated yet, keep their original text
 * and get no translation marker.
 */
export async function localizeReviews(reviews: StampedReview[], locale: Locale): Promise<StampedReview[]> {
  if (reviews.length === 0) return reviews
  const rows = await getTranslationRows(locale)
  return reviews.map((review) => {
    const row = rows.get(review.id)
    if (!row || row.source_lang === locale || row.source_hash !== reviewSourceHash(review)) return review
    return {
      ...review,
      title: row.title || review.title,
      message: row.message || review.message,
      reply: row.reply || review.reply,
      translation: {
        from: row.source_lang,
        original: { title: review.title, message: review.message, reply: review.reply },
      },
    }
  })
}

const batchSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      sourceLanguage: z.string().describe("ISO 639-1 code of the language the review was written in, e.g. en, de, cs"),
      title: z.string(),
      message: z.string(),
      reply: z.string(),
    }),
  ),
})

async function translateBatch(reviews: StampedReview[], locale: Locale) {
  const input = reviews.map((r) => ({ id: r.id, title: r.title, message: r.message, reply: r.reply }))
  const { output } = await generateText({
    model: MODEL,
    output: Output.object({ schema: batchSchema }),
    system: [
      `You translate customer reviews of a 3D printing shop into ${TARGET_LANGUAGE[locale]}.`,
      "For every item, detect the language it was written in and translate title, message and reply.",
      "Keep the meaning, tone, star-related wording and level of formality. Do not add, remove, soften or embellish anything.",
      "Keep product names, brand names, model numbers, units and numbers exactly as written.",
      "If a field is empty, return an empty string. If an item is already in the target language, return its text unchanged.",
      "Return every item with the same id.",
    ].join(" "),
    prompt: JSON.stringify(input),
  })

  const byId = new Map(reviews.map((r) => [r.id, r]))
  const rows = output.items.filter((item) => byId.has(item.id))
  if (rows.length === 0) return 0

  const values: unknown[] = []
  const placeholders = rows.map((item, i) => {
    const review = byId.get(item.id)!
    const lang = item.sourceLanguage.trim().toLowerCase().slice(0, 2) || "en"
    values.push(item.id, locale, lang, reviewSourceHash(review), item.title, item.message, item.reply)
    const o = i * 7
    return `($${o + 1}, $${o + 2}, $${o + 3}, $${o + 4}, $${o + 5}, $${o + 6}, $${o + 7}, now())`
  })
  await pool.query(
    `insert into review_translations (review_id, locale, source_lang, source_hash, title, message, reply, updated_at)
     values ${placeholders.join(", ")}
     on conflict (review_id, locale) do update set
       source_lang = excluded.source_lang, source_hash = excluded.source_hash, title = excluded.title,
       message = excluded.message, reply = excluded.reply, updated_at = now()`,
    values,
  )
  return rows.length
}

/**
 * Translates reviews that have no stored translation, or whose text changed
 * on Stamped since it was translated. Stops starting new batches once the
 * time budget runs out; the next run picks up the rest.
 */
export async function translateMissingReviews({ budgetMs = 45_000 } = {}) {
  const deadline = Date.now() + budgetMs
  const reviews = (await loadStampedReviews(true)).filter((r) => r.title || r.message || r.reply)
  const { rows } = await pool.query<{ review_id: string; locale: string; source_hash: string }>(
    "select review_id, locale, source_hash from review_translations",
  )
  const done = new Set(rows.map((r) => `${r.review_id}:${r.locale}:${r.source_hash}`))

  const jobs: { locale: Locale; reviews: StampedReview[] }[] = []
  let pending = 0
  for (const locale of locales) {
    const todo = reviews.filter((r) => !done.has(`${r.id}:${locale}:${reviewSourceHash(r)}`))
    pending += todo.length
    for (let i = 0; i < todo.length; i += BATCH_SIZE) jobs.push({ locale, reviews: todo.slice(i, i + BATCH_SIZE) })
  }

  let translated = 0
  let failed = 0
  let next = 0
  async function worker() {
    while (next < jobs.length && Date.now() < deadline) {
      const job = jobs[next++]
      try {
        translated += await translateBatch(job.reviews, job.locale)
      } catch (error) {
        failed += job.reviews.length
        console.error(`[reviews] Translation batch into ${job.locale} failed:`, error)
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker))

  return { pending, translated, failed, remaining: Math.max(0, pending - translated) }
}
