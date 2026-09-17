import { readFileSync } from "fs"
import pg from "pg"
const env = readFileSync(new URL("../.env.development.local", import.meta.url), "utf8")
for (const line of env.split("\n")) {
  const m = line.match(/^([A-Z_0-9]+)=(.*)$/)
  if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "")
}
const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
await client.connect()
const { rows } = await client.query(`select * from products where slug = 'bambu-lab-a1'`)
console.log(JSON.stringify(rows[0], null, 2))
await client.end()
