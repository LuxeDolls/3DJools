import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Zones as fractions of width/height where badges/ribbons/disclaimer text appear.
const ZONES = [
  { name: 'top-left', l: 0.0, t: 0.0, r: 0.30, b: 0.24 },
  { name: 'top-right', l: 0.60, t: 0.0, r: 1.0, b: 0.40 },
  { name: 'bottom-text', l: 0.0, t: 0.92, r: 1.0, b: 1.0 },
];

const DIFF_THRESHOLD = 16; // euclidean-ish per-channel diff vs local bg median to flag "badge" pixel
const DILATE_PX = 6;
const BORDER_RING = 24; // px ring outside zone box used to estimate local background

function median(arr) {
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

async function processImage(inputPath, outputPath) {
  const img = sharp(inputPath);
  const meta = await img.metadata();
  const W = meta.width, H = meta.height;
  const { data: orig, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const { channels } = info;

  const mask = new Uint8Array(W * H);
  const zoneStats = [];

  for (const z of ZONES) {
    const l = Math.floor(z.l * W), r = Math.ceil(z.r * W);
    const t = Math.floor(z.t * H), b = Math.ceil(z.b * H);

    // sample border ring just OUTSIDE the zone box (clamped to image) to estimate local bg color
    const ringSamples = { r: [], g: [], b: [] };
    const sl = Math.max(0, l - BORDER_RING), sr = Math.min(W, r + BORDER_RING);
    const st = Math.max(0, t - BORDER_RING), sb = Math.min(H, b + BORDER_RING);
    for (let y = st; y < sb; y += 3) {
      for (let x = sl; x < sr; x += 3) {
        const insideZone = x >= l && x < r && y >= t && y < b;
        if (insideZone) continue;
        const idx = (y * W + x) * channels;
        ringSamples.r.push(orig[idx]);
        ringSamples.g.push(orig[idx + 1]);
        ringSamples.b.push(orig[idx + 2]);
      }
    }
    if (!ringSamples.r.length) continue;
    const bg = [median(ringSamples.r), median(ringSamples.g), median(ringSamples.b)];

    for (let y = t; y < b; y++) {
      for (let x = l; x < r; x++) {
        const idx = (y * W + x) * channels;
        const dr = Math.abs(orig[idx] - bg[0]);
        const dg = Math.abs(orig[idx + 1] - bg[1]);
        const db = Math.abs(orig[idx + 2] - bg[2]);
        if (dr > DIFF_THRESHOLD || dg > DIFF_THRESHOLD || db > DIFF_THRESHOLD) {
          mask[y * W + x] = 1;
        }
      }
    }
    zoneStats.push({ name: z.name, bg });
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

  // fill: for each masked pixel, use the bg color of whichever zone it belongs to
  const out = Buffer.from(orig);
  let replaced = 0;
  for (const z of ZONES) {
    const l = Math.floor(z.l * W), r = Math.ceil(z.r * W);
    const t = Math.floor(z.t * H), b = Math.ceil(z.b * H);
    const stat = zoneStats.find((s) => s.name === z.name);
    if (!stat) continue;
    for (let y = t; y < b; y++) {
      for (let x = l; x < r; x++) {
        const p = y * W + x;
        if (dilated[p]) {
          const idx = p * channels;
          out[idx] = stat.bg[0];
          out[idx + 1] = stat.bg[1];
          out[idx + 2] = stat.bg[2];
          if (channels === 4) out[idx + 3] = orig[idx + 3];
          replaced++;
        }
      }
    }
  }

  await sharp(out, { raw: { width: W, height: H, channels } })
    .toFormat(path.extname(outputPath).slice(1) === 'png' ? 'png' : 'jpeg', { quality: 92 })
    .toFile(outputPath);

  return { W, H, replacedPx: replaced, replacedPct: (replaced / (W * H) * 100).toFixed(2) };
}

const args = process.argv.slice(2);
const outDir = '/tmp/hero-fixed2';
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
