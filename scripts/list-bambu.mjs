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
  select slug, name, category, jsonb_array_length(coalesce(images,'[]'::jsonb)) as img_count,
    length(coalesce(description,'')) as desc_len,
    jsonb_array_length(coalesce(specs,'[]'::jsonb)) as spec_count,
    ean, mpn
  from products
  where brand_slug = 'bambu-lab' and archived is not true
    and category in ('printers','laser-engravers')
  order by category, name
`)
console.log(JSON.stringify(rows, null, 2))
await client.end()
