import { readFileSync } from 'fs';
import pg from 'pg';
const env = readFileSync('.env.development.local','utf8');
for (const line of env.split('\n')) { const m=line.match(/^([A-Z_0-9]+)=(.*)$/); if(m) process.env[m[1]]=m[2].replace(/^["']|["']$/g,''); }
const c = new pg.Client({ connectionString: process.env.DATABASE_URL });
await c.connect();
for (const slug of ['bambu-lab-a1','bambu-lab-x1-carbon','creality-k2','bambu-lab-a1-combo']) {
  const { rows } = await c.query('SELECT slug, images FROM products WHERE slug=$1',[slug]);
  console.log('\n===', slug, '===');
  console.log(JSON.stringify(rows[0]?.images, null, 2));
}
await c.end();
