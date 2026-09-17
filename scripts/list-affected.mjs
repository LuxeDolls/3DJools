import { readFileSync, writeFileSync } from 'fs';
import pg from 'pg';

const env = readFileSync('.env.development.local', 'utf8');
for (const line of env.split('\n')) {
  const m = line.match(/^([A-Z_0-9]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}

const c = new pg.Client({ connectionString: process.env.DATABASE_URL });
await c.connect();
const { rows } = await c.query(`
  SELECT slug, name, brand_slug, category, images
  FROM products
  WHERE category IN ('printers','laser-engravers')
  ORDER BY category, brand_slug, name
`);

const affected = [];
for (const r of rows) {
  const imgs = Array.isArray(r.images) ? r.images : (r.images ? JSON.parse(r.images) : []);
  const paths = imgs.map((i) => (typeof i === 'string' ? i : i.url || i.path || i.src || JSON.stringify(i)));
  const hasPng = paths.some((p) => /\.png(\?|$)/i.test(p));
  const lessThan3 = paths.length < 3;
  if (hasPng || lessThan3) {
    affected.push({
      slug: r.slug,
      name: r.name,
      brand: r.brand_slug,
      category: r.category,
      count: paths.length,
      hasPng,
      lessThan3,
      paths,
    });
  }
}

console.log('Total affected:', affected.length, 'of', rows.length);
writeFileSync('/tmp/affected.json', JSON.stringify(affected, null, 2));
for (const a of affected) {
  console.log(`${a.category} | ${a.brand} | ${a.name} | ${a.slug} | n=${a.count} png=${a.hasPng} lt3=${a.lessThan3}`);
}
await c.end();
