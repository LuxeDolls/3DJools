import { db } from "../lib/db"
import { sql } from "drizzle-orm"
async function main() {
  const rows: any = await db.execute(sql`select brand_slug, count(*) from products where category='filaments' group by brand_slug order by count(*) desc`)
  console.log(rows.rows)
  const total: any = await db.execute(sql`select count(*) from products where category='filaments'`)
  console.log("total", total.rows)
  const sample: any = await db.execute(sql`select slug, name, short_description, description, highlights from products where category='filaments' order by random() limit 6`)
  console.log(JSON.stringify(sample.rows, null, 2))
  process.exit(0)
}
main()
