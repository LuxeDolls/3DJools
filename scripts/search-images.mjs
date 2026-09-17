import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';

const queries = JSON.parse(readFileSync('/tmp/queries.json', 'utf8'));
const only = process.argv.slice(2);
const list = only.length ? queries.filter((q) => only.includes(q.slug)) : queries.filter((q) => q.needed > 0);

if (!existsSync('/tmp/cand')) mkdirSync('/tmp/cand', { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

async function bing(query) {
  const url = 'https://www.bing.com/images/search?q=' + encodeURIComponent(query) + '&count=40';
  const res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9' } });
  if (!res.ok) return [];
  const html = await res.text();
  const raw = [...html.matchAll(/&quot;murl&quot;:&quot;(.*?)&quot;/g)].map((m) =>
    m[1].replace(/\\u002f/g, '/').replace(/\\\//g, '/')
  );
  return [...new Set(raw)];
}

for (const q of list) {
  const out = `/tmp/cand/${q.slug}.json`;
  let arr = [];
  for (let attempt = 1; attempt <= 4 && arr.length < 6; attempt++) {
    try {
      arr = await bing(q.query);
    } catch {}
    if (arr.length < 6) await sleep(3000);
  }
  writeFileSync(out, JSON.stringify(arr, null, 2));
  console.log(q.slug, '->', arr.length, 'candidates');
  await sleep(2000);
}
console.log('done');
