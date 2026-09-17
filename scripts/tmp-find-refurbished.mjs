import { Pool } from "pg"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

const res = await pool.query(`
  SELECT slug, name, condition, images
  FROM products
  WHERE description ILIKE '%refurbish%'
     OR short_description ILIKE '%refurbish%'
     OR specs::text ILIKE '%refurbish%'
     OR highlights::text ILIKE '%refurbish%'
     OR translations::text ILIKE '%refurbish%'
     OR images::text ILIKE '%refurbish%'
     OR condition ILIKE '%refurbish%'
     OR name ILIKE '%refurbish%'
`)

console.log("TOTAL MATCHES:", res.rows.length)
for (const row of res.rows) {
  console.log("---")
  console.log("slug:", row.slug, "| name:", row.name, "| condition:", row.condition)
}

const distinctConditions = await pool.query(`SELECT DISTINCT condition FROM products`)
console.log("DISTINCT CONDITIONS:", JSON.stringify(distinctConditions.rows))

await pool.end()
