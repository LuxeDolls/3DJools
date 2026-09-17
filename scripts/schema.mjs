import { readFileSync } from 'fs';
import pg from 'pg';
const env = readFileSync('.env.development.local','utf8');
for (const line of env.split('\n')) { const m = line.match(/^([A-Z_0-9]+)=(.*)$/); if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g,''); }
const c = new pg.Client({ connectionString: process.env.DATABASE_URL });
await c.connect();
const { rows } = await c.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name='products' ORDER BY ordinal_position`);
console.log(rows.map(r=>`${r.column_name} (${r.data_type})`).join('\n'));
const cats = await c.query(`SELECT DISTINCT category_slug FROM products` );
await c.end();
