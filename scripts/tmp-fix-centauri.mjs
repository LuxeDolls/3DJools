import { readFileSync } from "node:fs"
import { put } from "@vercel/blob"
import pg from "pg"

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })

const files = ["1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg"]
const urls = []
for (const f of files) {
  const buf = readFileSync(`/tmp/elegoo-centauri-2/${f}`)
  const blob = await put(`products/elegoo-centauri-2/${f}`, buf, {
    access: "private",
    contentType: "image/jpeg",
    allowOverwrite: true,
    addRandomSuffix: false,
  })
  const servingUrl = `/api/product-image?pathname=${encodeURIComponent(blob.pathname)}`
  urls.push(servingUrl)
  console.log(`[v0] uploaded ${f} -> ${servingUrl}`)
}

const result = await pool.query(
  `update products set
     slug = $1,
     name = $2,
     brand_slug = $3,
     gtin = $4,
     ean = $4,
     mpn = $5,
     price_cents = $6,
     compare_at_cents = $7,
     short_description = $8,
     description = $9,
     images = $10::jsonb,
     updated_at = now()
   where id = 'prod_creality_centauri_2'
   returning id, slug, name, brand_slug`,
  [
    "elegoo-centauri-2",
    "Elegoo Centauri 2",
    "elegoo",
    "6932704932964",
    "SPUS-EL-3DF-C2",
    25900,
    29900,
    "High-speed CoreXY FDM printer with a 256 x 256 x 256 mm bed and 500 mm/s top speed.",
    "The Centauri 2 brings Elegoo's fast-printing CoreXY platform to a 256 x 256 x 256 mm build, reaching 500 mm/s without sacrificing the fine 0.1–0.4 mm layer control needed for detailed prints. A 350-degree nozzle opens up PLA-CF and TPU alongside standard PLA and PETG, and Wi-Fi connectivity with a 5-inch touchscreen keeps slicing-to-print workflows simple. At 13.7 kg it's light enough to move between a desk and a workshop bench, making it a strong all-rounder for makers who print a mix of decorative and functional parts.",
    JSON.stringify(urls),
  ],
)
console.log("[v0] updated row:", JSON.stringify(result.rows))
await pool.end()
