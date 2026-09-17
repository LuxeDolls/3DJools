// Imports real product photos into Vercel Blob and writes photo URLs + EAN codes
// into the products table. Runs end-to-end in a single process so it does not
// depend on /tmp surviving between shell invocations.
//
// Usage: node scripts/import-media.mjs [path-to-map.json]
// Map entry shape: { "slug": string, "imageUrl": string, "ean": string }
// Any field except slug is optional; only provided fields are updated.

import { readFileSync } from "node:fs"
import { put } from "@vercel/blob"
import pg from "pg"

const mapPath = process.argv[2] || new URL("./media-map.json", import.meta.url).pathname
const entries = JSON.parse(readFileSync(mapPath, "utf8"))

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36",
  Accept: "image/avif,image/webp,image/png,image/*,*/*;q=0.8",
}

function extFromContentType(ct, url) {
  if (ct?.includes("png")) return "png"
  if (ct?.includes("webp")) return "webp"
  if (ct?.includes("avif")) return "avif"
  if (ct?.includes("jpeg") || ct?.includes("jpg")) return "jpg"
  const m = url.split("?")[0].match(/\.(png|webp|avif|jpe?g)$/i)
  return m ? m[1].toLowerCase().replace("jpeg", "jpg") : "jpg"
}

async function downloadAndUpload(slug, imageUrl, referer) {
  const res = await fetch(imageUrl, {
    headers: referer ? { ...BROWSER_HEADERS, Referer: referer } : BROWSER_HEADERS,
  })
  if (!res.ok) throw new Error(`fetch ${imageUrl} -> HTTP ${res.status}`)
  const ct = res.headers.get("content-type") || ""
  if (!ct.startsWith("image/")) {
    const buf = Buffer.from(await res.arrayBuffer())
    throw new Error(`not an image (content-type=${ct}, ${buf.length} bytes)`)
  }
  const buf = Buffer.from(await res.arrayBuffer())
  if (buf.length < 3000) throw new Error(`image too small (${buf.length} bytes) — likely a placeholder`)
  const ext = extFromContentType(ct, imageUrl)
  const blob = await put(`products/${slug}.${ext}`, buf, {
    access: "private",
    contentType: ct,
    allowOverwrite: true,
    addRandomSuffix: false,
  })
  // Private blobs are not publicly reachable by URL — render them through our
  // own serving route, which streams the blob with long-lived CDN caching.
  const servingUrl = `/api/product-image?pathname=${encodeURIComponent(blob.pathname)}`
  return { url: servingUrl, bytes: buf.length }
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })

let ok = 0
let failed = 0
const failures = []

for (const entry of entries) {
  const { slug, imageUrl, ean, referer } = entry
  if (!slug) {
    console.log("[v0] skipping entry with no slug:", JSON.stringify(entry))
    continue
  }
  try {
    const sets = []
    const values = []
    let i = 1

    if (imageUrl) {
      const { url, bytes } = await downloadAndUpload(slug, imageUrl, referer)
      sets.push(`images = $${i++}::jsonb`)
      values.push(JSON.stringify([url]))
      console.log(`[v0] ${slug}: uploaded ${bytes} bytes -> ${url}`)
    }
    if (ean) {
      sets.push(`ean = $${i++}`)
      values.push(ean)
    }
    if (sets.length === 0) {
      console.log(`[v0] ${slug}: nothing to update`)
      continue
    }
    values.push(slug)
    const result = await pool.query(
      `UPDATE products SET ${sets.join(", ")}, updated_at = now() WHERE slug = $${i} RETURNING id`,
      values,
    )
    if (result.rowCount === 0) {
      throw new Error(`no product row matched slug "${slug}"`)
    }
    ok++
  } catch (err) {
    failed++
    failures.push({ slug, error: String(err.message || err) })
    console.log(`[v0] ${slug}: FAILED — ${err.message || err}`)
  }
}

await pool.end()

console.log(`\n[v0] done: ${ok} updated, ${failed} failed`)
if (failures.length) {
  console.log("[v0] failures:")
  for (const f of failures) console.log(`  - ${f.slug}: ${f.error}`)
  process.exitCode = 1
}
