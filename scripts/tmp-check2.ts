import { db } from "../lib/db"
import { sql } from "drizzle-orm"
async function main() {
  const product: any = await db.execute(sql`select * from products where slug ilike '%centauri%'`)
  console.log("PRODUCT:", JSON.stringify(product.rows, null, 2))
  const brands: any = await db.execute(sql`select * from brands order by name`)
  console.log("BRANDS:", JSON.stringify(brands.rows, null, 2))
  const crealityProducts: any = await db.execute(sql`select id, slug, name, category from products where brand_slug = 'creality' order by name`)
  console.log("CREALITY PRODUCTS:", JSON.stringify(crealityProducts.rows, null, 2))
  process.exit(0)
}
main()
