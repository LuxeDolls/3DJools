import { db } from "../lib/db"
import { sql } from "drizzle-orm"
async function main() {
  const tables: any = await db.execute(sql`select table_name from information_schema.tables where table_schema='public' order by table_name`)
  console.log(JSON.stringify(tables.rows.map((r:any) => r.table_name)))
  process.exit(0)
}
main()
