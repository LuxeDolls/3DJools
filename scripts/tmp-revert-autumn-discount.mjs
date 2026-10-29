import { Pool } from "pg"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

const CATEGORIES = ["printers", "scanners", "laser-engravers"]

async function main() {
  const { rows: before } = await pool.query(
    `SELECT slug, category, price_cents FROM products WHERE category = ANY($1) ORDER BY slug`,
    [CATEGORIES],
  )
  console.log(`Found ${before.length} products in autumn-discounted categories.`)

  const { rows: updated } = await pool.query(
    `UPDATE products
       SET price_cents = ROUND(price_cents / 0.92)::integer
     WHERE category = ANY($1)
     RETURNING slug, price_cents`,
    [CATEGORIES],
  )
  console.log(`Reverted price_cents for ${updated.length} products (undid the 8% autumn discount).`)

  const beforeMap = new Map(before.map((r) => [r.slug, r.price_cents]))
  for (const row of updated.slice(0, 10)) {
    console.log(`${row.slug}: ${beforeMap.get(row.slug)} -> ${row.price_cents}`)
  }

  await pool.end()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
