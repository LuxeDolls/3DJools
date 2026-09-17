import { writeFileSync, existsSync, mkdirSync } from 'fs';

if (!existsSync('/tmp/cand')) mkdirSync('/tmp/cand', { recursive: true });

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

async function getPageMap(storePath) {
  const res = await fetch(`https://us.store.bambulab.com/products/${storePath}`, { headers: { 'User-Agent': UA } });
  const html = await res.text();
  const re = /(https:\/\/store\.bblcdn\.com\/s7\/default\/[a-f0-9]+\/([^"'\\]+?\.(?:jpg|png)))(?=["'\\ ])/g;
  const map = new Map(); // filename -> full url (first occurrence)
  for (const m of html.matchAll(re)) {
    const [full, , filename] = m;
    if (!map.has(filename)) map.set(filename, full);
  }
  return map;
}

// slug -> { page, files: [exact filenames to pick, in priority order] }
const SPEC = {
  'bambu-lab-a1': { page: 'a1', files: ['A1-compressed.jpg', 'A1.png', 'A1-1.png', 'A1-2.png', 'A1_2.png', 'A1_4.png'] },
  'bambu-lab-a1-combo': { page: 'a1', files: ['A1_C-compressed.jpg', 'A1C_Combo-compressed-compressed-compressed.jpg'] },
  'bambu-lab-a1-mini-combo': { page: 'a1-mini', files: ['A1_mini_C-compressed.jpg', 'A1_mini_C.jpg', 'A1_mini_m.jpg', 'A1_mini_pc.jpg'] },
  'bambu-lab-a2l': { page: 'a2l', files: ['A2L-compressed.jpg'] },
  'bambu-lab-a2l-combo': { page: 'a2l', files: ['A2LC-compressed.jpg'] },
  'bambu-lab-h2c': { page: 'h2c', files: ['H2CC-compressed.jpg', 'H2CC.jpg', 'H2CCcompressed.jpg'] },
  'bambu-lab-h2c-laser-full-combo-10-w': { page: 'h2c', files: ['H2CL-10W-compressed.jpg', 'H2CL.jpg', 'H2CLcompressed.jpg'] },
  'bambu-lab-h2c-laser-full-combo-40-w': { page: 'h2c', files: ['H2CL-10W-compressed.jpg', 'H2CL.jpg', 'H2CLcompressed.jpg'] },
  'bambu-lab-h2d': { page: 'h2d', files: ['H2D-compressed.jpg'] },
  'bambu-lab-h2d-ams-combo': { page: 'h2d', files: ['H2DC-compressed.jpg'] },
  'bambu-lab-h2d-pro': { page: 'h2d-pro', files: ['0.jpg', '1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg'] },
  'bambu-lab-h2d-10-w-laser-combo': { page: 'h2d', files: ['H2DL-10w-compressed.jpg'] },
  'bambu-lab-h2d-40-w-laser-combo': { page: 'h2d', files: ['H2DL-10w-compressed.jpg'] },
  'bambu-lab-h2s': { page: 'h2s', files: ['H2S-compressed.jpg', 'H2S.jpg', 'H2S-5.jpg', 'H2S-6.jpg', 'H2S-7.jpg', 'H2S-8.jpg', 'H2S-9.jpg'] },
  'bambu-lab-h2s-ams-combo': { page: 'h2s', files: ['H2SC-compressed.jpg', 'H2SC.jpg'] },
  'bambu-lab-h2s-laser-full-combo-10-w': { page: 'h2s', files: ['H2SL-compressed.jpg', 'H2SL.jpg'] },
  'bambu-lab-p1s-combo': { page: 'p1s', files: ['P1SC-compressed.jpg', 'P1SC2-compressed.jpg', 'P1S-compressed.jpg'] },
  'bambu-lab-p2s': { page: 'p2s', files: ['P2S-compressed.jpg', 'P2S.jpg'] },
  'bambu-lab-p2s-combo-including-ams-2-pro': { page: 'p2s', files: ['P2S_Combo-compressed.jpg', 'P2S_Combo.jpg'] },
  'bambu-lab-x2d': { page: 'x2d', files: ['X2D-compressed.jpg'] },
  'bambu-lab-x2d-combo': { page: 'x2d', files: ['X2DC-compressed.jpg', 'X2D_Combo-compressed-compressed-compressed.jpg'] },
};

const pageCache = new Map();

for (const [slug, { page, files }] of Object.entries(SPEC)) {
  if (!pageCache.has(page)) pageCache.set(page, await getPageMap(page));
  const map = pageCache.get(page);
  const urls = [];
  for (const f of files) {
    const u = map.get(f);
    if (u && !urls.includes(u)) urls.push(u);
  }
  writeFileSync(`/tmp/cand/${slug}.json`, JSON.stringify(urls, null, 2));
  console.log(slug, '->', urls.length, 'curated urls');
}
