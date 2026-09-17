import { readFileSync, writeFileSync, existsSync } from "fs"
import path from "path"
import sharp from "sharp"
import { get } from "@vercel/blob"

const rows = JSON.parse(readFileSync("/tmp/printer-hero-list.json", "utf-8"))

const TILE = 360
const LABEL_H = 30
const COLS = 4

function decodeBlobPathname(heroUrl) {
  const m = heroUrl.match(/pathname=([^&]+)/)
  if (!m) return null
  return decodeURIComponent(m[1])
}

async function loadImageBuffer(heroUrl) {
  if (heroUrl.startsWith("/api/product-image")) {
    const pathname = decodeBlobPathname(heroUrl)
    const result = await get(pathname, { access: "private", token: process.env.BLOB_READ_WRITE_TOKEN })
    const chunks = []
    for await (const chunk of result.stream) chunks.push(chunk)
    return Buffer.concat(chunks)
  } else {
    const localPath = path.join("/vercel/share/v0-project/public", heroUrl)
    if (!existsSync(localPath)) throw new Error("local file not found: " + localPath)
    return readFileSync(localPath)
  }
}

async function main() {
  const items = []
  for (const r of rows) {
    const hero = (r.images || [])[0]
    if (!hero) {
      console.log("NO HERO", r.slug)
      continue
    }
    try {
      const buf = await loadImageBuffer(hero)
      const resized = await sharp(buf)
        .resize(TILE, TILE - LABEL_H, { fit: "contain", background: { r: 255, g: 255, b: 255 } })
        .toBuffer()
      items.push({ slug: r.slug, buf: resized })
      console.log("OK", r.slug)
    } catch (e) {
      console.log("FAILED", r.slug, e.message)
    }
  }

  writeFileSync("/tmp/printer-review-manifest.json", JSON.stringify(items.map((i) => i.slug), null, 2))

  const perSheet = 12 // 3 rows x 4 cols
  const rowsPerSheet = Math.ceil(perSheet / COLS)
  const sheetW = COLS * TILE
  const sheetH = rowsPerSheet * TILE

  for (let s = 0; s * perSheet < items.length; s++) {
    const slice = items.slice(s * perSheet, s * perSheet + perSheet)
    const composites = []
    for (let i = 0; i < slice.length; i++) {
      const col = i % COLS
      const row = Math.floor(i / COLS)
      const x = col * TILE
      const y = row * TILE
      composites.push({ input: slice[i].buf, left: x, top: y + LABEL_H })
      const svgLabel = Buffer.from(
        `<svg width="${TILE}" height="${LABEL_H}" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="black"/>
          <text x="4" y="20" font-size="14" fill="white" font-family="KaTeX_Typewriter">${s * perSheet + i}:${slice[i].slug}</text>
        </svg>`,
      )
      composites.push({ input: svgLabel, left: x, top: y })
    }
    await sharp({ create: { width: sheetW, height: sheetH, channels: 3, background: { r: 255, g: 255, b: 255 } } })
      .composite(composites)
      .jpeg({ quality: 90 })
      .toFile(`/tmp/printer_sheet_${String(s).padStart(2, "0")}.jpg`)
    console.log("wrote sheet", s)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
