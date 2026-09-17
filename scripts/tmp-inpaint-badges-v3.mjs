import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Zones as fractions of width/height where badges/ribbons/disclaimer text appear.
const ZONES = [
  { name: 'top-left', l: 0.0, t: 0.0, r: 0.30, b: 0.24 },
  { name: 'top-right', l: 0.58, t: 0.0, r: 1.0, b: 0.24 },
  { name: 'bottom-text', l: 0.0, t: 0.93, r: 1.0, b: 1.0 },
];

const DIFF_THRESHOLD = 20;
const DILATE_PX = 6;
const MAX_ZONE_FILL_FRACTION = 0.55; // safety cap: if a zone would need >55% filled, skip it (likely real product, not a badge)

function quantize(v) {
  return Math.round(v / 8) * 8;
}

// Robustly estimate the true background color by sampling the outer perimeter
// of the image and taking the color of the most common (mode) quantized bucket.
// Badges sit near corners too, but they only occupy a minority of the full perimeter,
// so the dominant bucket should still be the real background.
function estimateGlobalBg(raw, W, H, channels) {
  const buckets = new Map();
  const thickness = Math.max(3, Math.round(Math.min(W, H) * 0.01));
  const step = 2;

  function sample(x, y) {
    const idx = (y * W + x) * channels;
    const r = raw[idx], g = raw[idx + 1], b = raw[idx + 2];
    const key = `${quantize(r)},${quantize(g)},${quantize(b)}`;
    if (!buckets.has(key)) buckets.set(key, { count: 0, r: 0, g: 0, b: 0 });
    const e = buckets.get(key);
    e.count++; e.r += r; e.g += g; e.b += b;
  }

  for (let t = 0; t < thickness; t++) {
    for (let x = 0; x < W; x += step) {
      sample(x, Math.min(H - 1, t));
      sample(x, Math.max(0, H - 1 - t));
    }
    for (let y = 0; y < H; y += step) {
      sample(Math.min(W - 1, t), y);
      sample(Math.max(0, W - 1 - t), y);
    }
  }

  let best = null;
  for (const e of buckets.values()) {
    if (!best || e.count > best.count) best = e;
  }
  return [Math.round(best.r / best.count), Math.round(best.g / best.count), Math.round(best.b / best.count)];
}

async function processImage(inputPath, outputPath) {
  const img = sharp(inputPath);
  const meta = await img.metadata();
  const W = meta.width, H = meta.height;
  const { data: orig, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const { channels } = info;

  const bg = estimateGlobalBg(orig, W, H, channels);

  const mask = new Uint8Array(W * H);
  const skippedZones = [];
  const zoneInfo = [];

  for (const z of ZONES) {
    const l = Math.floor(z.l * W), r = Math.ceil(z.r * W);
    const t = Math.floor(z.t * H), b = Math.ceil(z.b * H);
    const area = (r - l) * (b - t);
    let flagged = 0;
    const localMask = [];
    for (let y = t; y < b; y++) {
      for (let x = l; x < r; x++) {
        const idx = (y * W + x) * channels;
        const dr = Math.abs(orig[idx] - bg[0]);
        const dg = Math.abs(orig[idx + 1] - bg[1]);
        const db = Math.abs(orig[idx + 2] - bg[2]);
        if (dr > DIFF_THRESHOLD || dg > DIFF_THRESHOLD || db > DIFF_THRESHOLD) {
          flagged++;
          localMask.push(y * W + x);
        }
      }
    }
    if (flagged / area > MAX_ZONE_FILL_FRACTION) {
      skippedZones.push(z.name);
      continue;
    }
    for (const p of localMask) mask[p] = 1;
    zoneInfo.push({ name: z.name, flagged, area, pct: (flagged / area * 100).toFixed(1) });
  }

  // dilate mask
  const dilated = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (!mask[y * W + x]) continue;
      for (let dy = -DILATE_PX; dy <= DILATE_PX; dy++) {
        for (let dx = -DILATE_PX; dx <= DILATE_PX; dx++) {
          const ny = y + dy, nx = x + dx;
          if (ny >= 0 && ny < H && nx >= 0 && nx < W) dilated[ny * W + nx] = 1;
        }
      }
    }
  }

  const out = Buffer.from(orig);
  let replaced = 0;
  for (let p = 0; p < W * H; p++) {
    if (!dilated[p]) continue;
    const idx = p * channels;
    out[idx] = bg[0];
    out[idx + 1] = bg[1];
    out[idx + 2] = bg[2];
    if (channels === 4) out[idx + 3] = orig[idx + 3];
    replaced++;
  }

  await sharp(out, { raw: { width: W, height: H, channels } })
    .toFormat(path.extname(outputPath).slice(1) === 'png' ? 'png' : 'jpeg', { quality: 92 })
    .toFile(outputPath);

  return { W, H, bg, replacedPx: replaced, replacedPct: (replaced / (W * H) * 100).toFixed(2), zoneInfo, skippedZones };
}

const args = process.argv.slice(2);
const outDir = '/tmp/hero-fixed3';
fs.mkdirSync(outDir, { recursive: true });

const targets = args.length ? args : fs.readdirSync('/tmp/hero');

(async () => {
  for (const file of targets) {
    const inputPath = file.startsWith('/') ? file : `/tmp/hero/${file}`;
    const base = path.basename(inputPath);
    const outputPath = `${outDir}/${base}`;
    try {
      const stats = await processImage(inputPath, outputPath);
      console.log('OK', base, JSON.stringify(stats));
    } catch (e) {
      console.log('FAIL', base, e.message);
    }
  }
})();
