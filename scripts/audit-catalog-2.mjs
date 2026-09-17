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
  select category,
    count(*) as total,
    count(*) filter (where ean is null and gtin is null) as no_ean,
    count(*) filter (where mpn is null) as no_mpn,
    count(*) filter (where length(coalesce(description,'')) < 200) as short_desc,
    count(*) filter (where jsonb_array_length(coalesce(specs,'[]'::jsonb)) < 5) as few_specs,
    count(*) filter (where brand_slug = 'bambu-lab') as bambu_count
  from products where archived is not true
  group by category order by total desc
`)
console.table(rows)

const { rows: bambuPrinters } = await client.query(`
  select slug, name, category, jsonb_array_length(images) as imgs from products
  where brand_slug='bambu-lab' and category in ('printers','laser-engravers') and archived is not true
  order by name
`)
console.log("Bambu Lab printers/lasers:", bambuPrinters.length)
console.log(bambuPrinters.map((r) => `${r.slug} (imgs:${r.imgs})`).join("\n"))

await client.end()
