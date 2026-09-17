import { db } from "../lib/db"
import { sql } from "drizzle-orm"
async function main() {
  await db.execute(sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS translations JSONB NOT NULL DEFAULT '{}'::jsonb`)
  console.log("done")
  process.exit(0)
}
main()
