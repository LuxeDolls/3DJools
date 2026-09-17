import { db } from "../lib/db"
import { sql } from "drizzle-orm"
async function main() {
  const rows: any = await db.execute(sql`
    select distinct jsonb_path_query(specs, '$[*] ? (@.key == "color")') as color_spec
    from products where category='filaments'
  `)
  console.log("distinct colors count:", rows.rows.length)
  const colors = rows.rows.map((r: any) => r.color_spec?.value).filter(Boolean).sort()
  console.log(JSON.stringify(colors, null, 0))
  process.exit(0)
}
main()
