import { Pool } from "pg"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function main() {
  const { rows: before } = await pool.query(`SELECT count(*)::int AS count FROM products`)
  console.log(`Products in catalog: ${before[0].count}`)

  const { rows: updated } = await pool.query(
    `UPDATE products
       SET price_cents = ROUND(price_cents * 0.9)::integer
     RETURNING slug, price_cents`,
  )
  console.log(`Applied 10% Black Friday discount to price_cents for ${updated.length} products.`)
  console.log(JSON.stringify(updated.slice(0, 10), null, 2))

  await pool.end()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
