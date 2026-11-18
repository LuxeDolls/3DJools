export const SCAMADVISER_DOMAIN = "3deureka.com"
export const scamAdviserUrl = `https://www.scamadviser.com/check-website/${SCAMADVISER_DOMAIN}`

/** Last score read manually from the report (18.11.2026), used if the live page can't be read. */
const LAST_VERIFIED_SCORE = 100

/** Reads the current Trust Score for our domain from the public ScamAdviser report, cached for a day. */
export async function getScamAdviserScore(): Promise<number> {
  try {
    const res = await fetch(scamAdviserUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; 3DEurekaBot/1.0)", Accept: "text/html" },
      next: { revalidate: 86400, tags: ["scamadviser-score"] },
    })
    if (!res.ok) return LAST_VERIFIED_SCORE
    const html = await res.text()
    const match = html.match(/ratingScore(?:&quot;|")\s*:\s*(\d{1,3})/)
    const score = match ? Number(match[1]) : Number.NaN
    return Number.isFinite(score) && score >= 0 && score <= 100 ? score : LAST_VERIFIED_SCORE
  } catch {
    return LAST_VERIFIED_SCORE
  }
}
