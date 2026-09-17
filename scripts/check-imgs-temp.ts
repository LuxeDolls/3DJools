import { Client } from "pg"

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()
  const res = await client.query(
    `select slug, images from products where category = 'printers' and created_at < now() - interval '2 hours' order by created_at asc limit 5`,
  )
  for (const row of res.rows) {
    console.log(row.slug, JSON.stringify(row.images?.slice(0, 1)))
  }
  await client.end()
}

main()
