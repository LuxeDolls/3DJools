import { readFileSync } from "fs"
import pg from "pg"

const env = readFileSync(new URL("../.env.development.local", import.meta.url), "utf8")
for (const line of env.split("\n")) {
  const m = line.match(/^([A-Z_0-9]+)=(.*)$/)
  if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "")
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
await client.connect()

const { rows } = await client.query(`
  select slug, name, images, description, specs, category
  from products
  where brand_slug = 'bambu-lab' and archived is not true
    and category in ('printers','laser-engravers')
  order by category, name
`)

for (const r of rows) {
  const imgs = Array.isArray(r.images) ? r.images : []
  const realImgs = imgs.filter((i) => {
    const url = typeof i === "string" ? i : i?.url || ""
    return !url.toLowerCase().endsWith(".png")
  })
  const specsCount = r.specs ? Object.keys(r.specs).length : 0
  console.log(
    r.slug.padEnd(30),
    "| cat:", r.category.padEnd(16),
    "| imgs:", String(imgs.length).padStart(2),
    "| real:", String(realImgs.length).padStart(2),
    "| desc_len:", String((r.description || "").length).padStart(5),
    "| specs:", specsCount,
  )
}

await client.end()
