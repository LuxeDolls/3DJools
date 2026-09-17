import { readFileSync, writeFileSync, mkdirSync } from "fs"
import pg from "pg"
import { get } from "@vercel/blob"
import sharp from "sharp"

const env = readFileSync(".env.development.local", "utf8")
for (const line of env.split("\n")) {
  const m = line.match(/^([A-Z_0-9]+)=(.*)$/)
  if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "")
}

const OUT_DIR = "/tmp/sheets_review"
mkdirSync(OUT_DIR, { recursive: true })

const TILE = 220
const LABEL_H = 26
const COLS = 6
const ROWS = 5
const PER_SHEET = COLS * ROWS

const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
await client.connect()
const res = await client.query(
  "SELECT slug, category, images FROM products WHERE archived = false ORDER BY category, slug",
)
await client.end()

const products = res.rows
  .map((r) => ({ slug: r.slug, category: r.category, hero: (r.images || [])[0] }))
  .filter((p) => !!p.hero)

console.log("Total products with hero image:", products.length)

function extractPathname(heroUrl) {
  const m = heroUrl.match(/pathname=([^&]+)/)
  if (!m) return null
  return decodeURIComponent(m[1])
}

async function fetchImageBuffer(hero) {
  if (hero.startsWith("/api/product-image")) {
    const pathname = extractPathname(hero)
    if (!pathname) return null
    try {
      const result = await get(pathname, { access: "private", token: process.env.BLOB_READ_WRITE_TOKEN })
      if (!result) return null
      const chunks = []
      for await (const chunk of result.stream) chunks.push(chunk)
      return Buffer.concat(chunks)
    } catch (e) {
      console.error("blob fetch failed", pathname, e.message)
      return null
    }
  }
  // static file served from /public
  try {
    return readFileSync(`public${hero}`)
  } catch (e) {
    console.error("static read failed", hero, e.message)
    return null
  }
}

function labelSvg(text) {
  const safe = text.length > 30 ? text.slice(0, 28) + "…" : text
  const escaped = safe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  return Buffer.from(
    `<svg width="${TILE}" height="${LABEL_H}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="black"/>
      <text x="4" y="18" font-size="13" fill="white" font-family="KaTeX_Typewriter">${escaped}</text>
    </svg>`,
  )
}

async function makeTile(product, idx) {
  const buf = await fetchImageBuffer(product.hero)
  let img
  if (buf) {
    try {
      img = await sharp(buf)
        .resize(TILE, TILE, { fit: "contain", background: { r: 255, g: 255, b: 255 } })
        .toBuffer()
    } catch (e) {
      console.error("decode failed", product.slug, e.message)
      img = await sharp({
        create: { width: TILE, height: TILE, channels: 3, background: { r: 255, g: 0, b: 0 } },
      })
        .png()
        .toBuffer()
    }
  } else {
    img = await sharp({
      create: { width: TILE, height: TILE, channels: 3, background: { r: 255, g: 0, b: 0 } },
    })
      .png()
      .toBuffer()
  }

  const composed = await sharp({
    create: { width: TILE, height: TILE + LABEL_H, channels: 3, background: { r: 255, g: 255, b: 255 } },
  })
    .composite([
      { input: img, top: 0, left: 0 },
      { input: labelSvg(`${idx}:${product.slug}`), top: TILE, left: 0 },
    ])
    .png()
    .toBuffer()

  return composed
}

const manifest = []
let sheetIdx = 0
for (let start = 0; start < products.length; start += PER_SHEET) {
  const batch = products.slice(start, start + PER_SHEET)
  console.log(`Building sheet ${sheetIdx} with ${batch.length} products (${start}..${start + batch.length})`)

  const tiles = []
  for (let i = 0; i < batch.length; i++) {
    const tile = await makeTile(batch[i], start + i)
    tiles.push(tile)
    manifest.push({ globalIdx: start + i, slug: batch[i].slug, category: batch[i].category, sheet: sheetIdx, hero: batch[i].hero })
  }

  const sheetW = COLS * TILE
  const sheetH = ROWS * (TILE + LABEL_H)
  const composite = []
  for (let i = 0; i < tiles.length; i++) {
    const col = i % COLS
    const row = Math.floor(i / COLS)
    composite.push({ input: tiles[i], left: col * TILE, top: row * (TILE + LABEL_H) })
  }

  await sharp({
    create: { width: sheetW, height: sheetH, channels: 3, background: { r: 240, g: 240, b: 240 } },
  })
    .composite(composite)
    .jpeg({ quality: 82 })
    .toFile(`${OUT_DIR}/sheet-${String(sheetIdx).padStart(3, "0")}.jpg`)

  sheetIdx++
}

writeFileSync(`${OUT_DIR}/manifest.json`, JSON.stringify(manifest, null, 2))
console.log("Done. Sheets:", sheetIdx, "Manifest entries:", manifest.length)
