import { readFileSync, writeFileSync, existsSync } from "fs"
import path from "path"
import sharp from "sharp"
import { get } from "@vercel/blob"

const targets = [
  "creality-ender-3-v3-se",
  "creality-k1",
  "creality-k1-max",
  "flashforge-adventurer-5m",
  "flashforge-adventurer-5m-pro",
  "prusa-core-one",
  "creality-ender-3-v2-se",
  "bambu-lab-x1-carbon",
]

const TILE = 300
const LABEL_H = 26
const COLS = 6

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
  const rows = JSON.parse(readFileSync("/tmp/all-target-images.json", "utf-8"))
  const items = []
  for (const r of rows) {
    if (!targets.includes(r.slug)) continue
    for (let i = 0; i < r.images.length; i++) {
      try {
        const buf = await loadImageBuffer(r.images[i])
        const resized = await sharp(buf)
          .resize(TILE, TILE - LABEL_H, { fit: "contain", background: { r: 255, g: 255, b: 255 } })
          .toBuffer()
        items.push({ label: `${r.slug} [${i}]`, buf: resized })
        console.log("OK", r.slug, i)
      } catch (e) {
        console.log("FAILED", r.slug, i, e.message)
      }
    }
  }

  const perSheet = 24
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
          <text x="4" y="18" font-size="12" fill="white" font-family="KaTeX_Typewriter">${slice[i].label}</text>
        </svg>`,
      )
      composites.push({ input: svgLabel, left: x, top: y })
    }
    await sharp({ create: { width: sheetW, height: sheetH, channels: 3, background: { r: 255, g: 255, b: 255 } } })
      .composite(composites)
      .jpeg({ quality: 90 })
      .toFile(`/tmp/alt_sheet_${String(s).padStart(2, "0")}.jpg`)
    console.log("wrote sheet", s)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
