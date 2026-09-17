import { db } from "../lib/db"
import { sql } from "drizzle-orm"
async function main() {
  const rows: any = await db.execute(sql`select id, slug, name, images, brand_slug from products where slug ilike '%centauri%'`)
  console.log(JSON.stringify(rows.rows, null, 2))
  process.exit(0)
}
main()
