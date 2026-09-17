import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';

// Multi-source image discovery: Bing Images, DuckDuckGo Images, and
// site-restricted Bing queries against known 3D-printer retailers.
// This intentionally avoids relying on a single search engine so that
// a systematic bias/failure in one source (e.g. Bing mis-resolving an
// ambiguous product name) doesn't silently poison every candidate list.

const queries = JSON.parse(readFileSync('/tmp/queries.json', 'utf8'));
const only = process.argv.slice(2);
const list = only.length ? queries.filter((q) => only.includes(q.slug)) : queries.filter((q) => q.needed > 0);

if (!existsSync('/tmp/cand')) mkdirSync('/tmp/cand', { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

const RETAILERS = [
  'amazon.com',
  '3djake.com',
  'matterhackers.com',
  'dynamism.com',
  'microcenter.com',
  'bambulab.com',
  'store.bblcdn.com',
  'aniwaa.com',
  'all3dp.com',
];

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

// NOTE: DuckDuckGo's reverse-engineered image JSON endpoint was tried here and
// removed — it returned an identical, query-independent result set for every
// slug (bamboo/plant photos regardless of query), i.e. it was silently broken
// rather than failing loudly. Do not re-add it without verifying the vqd token
// flow manually against a live query first.

async function bingSiteRestricted(query, site) {
  return bing(`${query} site:${site}`);
}

for (const q of list) {
  const out = `/tmp/cand/${q.slug}.json`;
  const all = new Set();

  // 1. Plain Bing search
  try {
    (await bing(q.query)).forEach((u) => all.add(u));
  } catch {}
  await sleep(1500);

  // 2. Site-restricted queries against known retailers.
  for (const site of RETAILERS) {
    try {
      (await bingSiteRestricted(q.query, site)).forEach((u) => all.add(u));
    } catch {}
    await sleep(1200);
  }

  const arr = [...all];
  writeFileSync(out, JSON.stringify(arr, null, 2));
  console.log(q.slug, '->', arr.length, 'candidates (multi-source)');
  await sleep(1500);
}
console.log('done');
