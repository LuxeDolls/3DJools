import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import sharp from 'sharp';

// 5x7 bitmap font for digits, no system fonts required
const FONT = {
  '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
  '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  '2': ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
  '3': ['11111', '00010', '00100', '00010', '00001', '10001', '01110'],
  '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
  '5': ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
  '6': ['00110', '01000', '10000', '11110', '10001', '10001', '01110'],
  '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  '9': ['01110', '10001', '10001', '01111', '00001', '00010', '01100'],
  '#': ['01010', '01010', '11111', '01010', '11111', '01010', '01010'],
};

async function numberChip(numStr, scale = 7) {
  const digits = numStr.split('').map((ch) => FONT[ch] || FONT['#']);
  const gap = scale;
  const width = digits.length * 5 * scale + (digits.length - 1) * gap;
  const height = 7 * scale;
  const raw = Buffer.alloc(width * height * 4, 0);
  digits.forEach((bitmap, di) => {
    const xOff = di * (5 * scale + gap);
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 5; c++) {
        if (bitmap[r][c] === '1') {
          for (let dy = 0; dy < scale; dy++) {
            for (let dx = 0; dx < scale; dx++) {
              const px = xOff + c * scale + dx;
              const py = r * scale + dy;
              const idx = (py * width + px) * 4;
              raw[idx] = 220; raw[idx + 1] = 20; raw[idx + 2] = 20; raw[idx + 3] = 255;
            }
          }
        }
      }
    }
  });
  const pad = 8;
  return sharp({ create: { width: width + pad * 2, height: height + pad * 2, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 230 } } })
    .composite([{ input: raw, raw: { width, height, channels: 4 }, left: pad, top: pad }])
    .png()
    .toBuffer();
}

const queries = JSON.parse(readFileSync('/tmp/queries.json', 'utf8'));
const only = process.argv.slice(2);
const list = only.length ? queries.filter((q) => only.includes(q.slug)) : queries.filter((q) => q.needed > 0);

if (!existsSync('/tmp/sheets')) mkdirSync('/tmp/sheets', { recursive: true });
if (!existsSync('/tmp/dl')) mkdirSync('/tmp/dl', { recursive: true });

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

async function fetchBuf(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 15000);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { 'User-Agent': UA, Referer: 'https://www.bing.com/' } });
    clearTimeout(t);
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 8000 || buf.length > 15 * 1024 * 1024) return null;
    return buf;
  } catch {
    clearTimeout(t);
    return null;
  }
}

const CELL = 480;
const COLS = 3;

for (const q of list) {
  const candFile = `/tmp/cand/${q.slug}.json`;
  if (!existsSync(candFile)) { console.log('no candidates for', q.slug); continue; }
  const cands = JSON.parse(readFileSync(candFile, 'utf8'));
  const dlDir = `/tmp/dl/${q.slug}`;
  if (!existsSync(dlDir)) mkdirSync(dlDir, { recursive: true });

  const valid = []; // { idx, url }
  for (const url of cands) {
    if (valid.length >= 9) break;
    const buf = await fetchBuf(url);
    if (!buf) continue;
    let meta;
    try {
      meta = await sharp(buf, { failOn: 'none' }).metadata();
    } catch {
      continue;
    }
    if (!meta.width || !meta.height || meta.width < 400 || meta.height < 400) continue;
    const ratio = meta.width / meta.height;
    if (ratio < 0.4 || ratio > 2.5) continue;
    const idx = valid.length + 1;
    const jpgPath = `${dlDir}/${idx}.jpg`;
    try {
      const jpg = await sharp(buf, { failOn: 'none' }).flatten({ background: '#ffffff' }).jpeg({ quality: 85 }).toBuffer();
      writeFileSync(jpgPath, jpg);
      valid.push({ idx, url, path: jpgPath });
    } catch {
      continue;
    }
  }

  if (!valid.length) {
    console.log(q.slug, '-> 0 valid images!');
    writeFileSync(`/tmp/sheets/${q.slug}.json`, JSON.stringify([]));
    continue;
  }

  // build grid
  const rows = Math.ceil(valid.length / COLS);
  const cells = [];
  for (const v of valid) {
    const thumb = await sharp(v.path)
      .resize(CELL - 20, CELL - 50, { fit: 'contain', background: '#f0f0f0' })
      .extend({ top: 40, bottom: 10, left: 10, right: 10, background: '#ffffff' })
      .png()
      .toBuffer();
    const chip = await numberChip(String(v.idx), 12);
    cells.push({ idx: v.idx, buf: thumb, chip });
  }

  const sheetW = CELL * COLS;
  const sheetH = CELL * rows;
  const composites = [];
  cells.forEach((c, i) => {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    composites.push({ input: c.buf, left: col * CELL, top: row * CELL });
    composites.push({ input: c.chip, left: col * CELL + 6, top: row * CELL + 4 });
  });

  const base = sharp({ create: { width: sheetW, height: sheetH, channels: 3, background: '#ffffff' } });
  const sheet = await base
    .composite(composites)
    .jpeg({ quality: 90 })
    .toBuffer();
  const uniq = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  writeFileSync(`/tmp/sheets/${q.slug}-${uniq}.jpg`, sheet);
  writeFileSync(`/tmp/sheets/${q.slug}.json`, JSON.stringify(valid.map((v) => ({ idx: v.idx, url: v.url })), null, 2));
  console.log(q.slug, '-> sheet with', valid.length, 'candidates ->', `${q.slug}-${uniq}.jpg`);
}
console.log('build-sheets done');
