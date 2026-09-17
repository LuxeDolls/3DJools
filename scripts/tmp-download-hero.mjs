import { get } from '@vercel/blob';
import fs from 'fs';

const rows = JSON.parse(fs.readFileSync('/tmp/badge-target-images.json', 'utf8'));

function pathnameFromUrl(u) {
  // images stored as full urls served via /api/product-image?pathname=... OR direct blob url
  try {
    const url = new URL(u, 'http://x');
    const p = url.searchParams.get('pathname');
    if (p) return p;
  } catch {}
  return null;
}

const dir = '/tmp/hero';
fs.mkdirSync(dir, { recursive: true });

const manifest = [];
for (const row of rows) {
  const first = (row.images || [])[0];
  if (!first) { console.log('NO IMAGE', row.slug); continue; }
  let pathname = pathnameFromUrl(first);
  if (!pathname) {
    // maybe it's already a pathname-like string or direct blob path
    pathname = first.replace(/^https?:\/\/[^/]+\//, '');
  }
  try {
    const r = await get(pathname, { access: 'private' });
    const chunks = [];
    for await (const chunk of r.stream) chunks.push(chunk);
    const buf = Buffer.concat(chunks);
    const ext = pathname.split('.').pop().split('?')[0];
    const localPath = `${dir}/${row.slug}.${ext}`;
    fs.writeFileSync(localPath, buf);
    manifest.push({ slug: row.slug, pathname, localPath, ext });
    console.log('OK', row.slug, pathname);
  } catch (e) {
    console.log('FAIL', row.slug, first, e.message);
  }
}
fs.writeFileSync('/tmp/hero-manifest.json', JSON.stringify(manifest, null, 2));
console.log('done', manifest.length, '/', rows.length);
