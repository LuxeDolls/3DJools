import { db } from "../lib/db"
import { sql } from "drizzle-orm"
async function main() {
  const fks: any = await db.execute(sql`
    select tc.table_name, kcu.column_name, ccu.table_name as foreign_table, ccu.column_name as foreign_column
    from information_schema.table_constraints tc
    join information_schema.key_column_usage kcu on tc.constraint_name = kcu.constraint_name
    join information_schema.constraint_column_usage ccu on tc.constraint_name = ccu.constraint_name
    where tc.constraint_type = 'FOREIGN KEY' and ccu.table_name = 'products'
  `)
  console.log(JSON.stringify(fks.rows, null, 2))
  const reviewCount: any = await db.execute(sql`select count(*) from reviews where product_id = 'prod_creality_centauri_2'`)
  console.log("reviews referencing this product:", JSON.stringify(reviewCount.rows))
  process.exit(0)
}
main()
