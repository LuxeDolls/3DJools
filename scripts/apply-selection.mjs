// Usage: node scripts/apply-selection.mjs <slug>:<idx1>,<idx2>,... [<slug2>:<idx>,...] ...
// Also supports <slug>:DROP_PNG_ONLY to just strip generated png entries without adding new photos.
import { readFileSync } from 'fs';
import pg from 'pg';
import { put } from '@vercel/blob';

const env = readFileSync('.env.development.local', 'utf8');
for (const line of env.split('\n')) {
  const m = line.match(/^([A-Z_0-9]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}

const queries = JSON.parse(readFileSync('/tmp/queries.json', 'utf8'));
const args = process.argv.slice(2);
if (!args.length) {
  console.error('No selections given');
  process.exit(1);
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

for (const arg of args) {
  const [slug, sel] = arg.split(':');
  const q = queries.find((x) => x.slug === slug);
  if (!q) { console.error('Unknown slug', slug); continue; }

  let finalImages = [...q.existingReal];

  if (sel !== 'DROP_PNG_ONLY') {
    const idxList = sel.split(',').map((s) => s.trim()).filter(Boolean);
    const mapFile = `/tmp/sheets/${slug}.json`;
    const map = JSON.parse(readFileSync(mapFile, 'utf8'));
    for (const idxStr of idxList) {
      const idx = parseInt(idxStr, 10);
      const entry = map.find((m) => m.idx === idx);
      if (!entry) { console.error(slug, 'no candidate with idx', idx); continue; }
      const localPath = `/tmp/dl/${slug}/${idx}.jpg`;
      const buf = readFileSync(localPath);
      const uniq = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      const pathname = `products/${slug}/web-${uniq}.jpg`;
      const blob = await put(pathname, buf, { access: 'private', contentType: 'image/jpeg', token: process.env.BLOB_READ_WRITE_TOKEN });
      finalImages.push(`/api/product-image?pathname=${encodeURIComponent(pathname)}`);
      console.log(slug, 'uploaded idx', idx, '->', pathname);
    }
  }

  if (finalImages.length < 3) {
    console.warn(slug, 'WARNING: final image count', finalImages.length, '< 3');
  }

  await client.query('UPDATE products SET images = $1::jsonb WHERE slug = $2', [JSON.stringify(finalImages), slug]);
  console.log(slug, '-> DB updated with', finalImages.length, 'images');
}

await client.end();
