import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Zones as fractions of width/height where badges/disclaimer text can appear.
// top-left ribbon ("FREE SHIPPING" / "Refurbished"), top-right award badges (can stack),
// bottom disclaimer text strip.
const ZONES = [
  { name: 'top-left', l: 0.0, t: 0.0, r: 0.30, b: 0.24 },
  { name: 'top-right', l: 0.62, t: 0.0, r: 1.0, b: 0.34 },
  { name: 'bottom-text', l: 0.0, t: 0.90, r: 1.0, b: 1.0 },
];

const BLUR_SIGMA = 45;
const DIFF_THRESHOLD = 22; // per-channel abs diff vs blurred estimate
const DILATE_PX = 4;

async function processImage(inputPath, outputPath) {
  const img = sharp(inputPath);
  const meta = await img.metadata();
  const W = meta.width, H = meta.height;

  const { data: orig, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const { channels } = info;

  const blurredBuf = await sharp(inputPath).blur(BLUR_SIGMA).raw().toBuffer();

  const mask = new Uint8Array(W * H); // 1 = badge pixel to replace

  for (const z of ZONES) {
    const l = Math.floor(z.l * W), r = Math.ceil(z.r * W);
    const t = Math.floor(z.t * H), b = Math.ceil(z.b * H);
    for (let y = t; y < b; y++) {
      for (let x = l; x < r; x++) {
        const idx = (y * W + x) * channels;
        const dr = Math.abs(orig[idx] - blurredBuf[idx]);
        const dg = Math.abs(orig[idx + 1] - blurredBuf[idx + 1]);
        const db = Math.abs(orig[idx + 2] - blurredBuf[idx + 2]);
        if (dr > DIFF_THRESHOLD || dg > DIFF_THRESHOLD || db > DIFF_THRESHOLD) {
          mask[y * W + x] = 1;
        }
      }
    }
  }

  // dilate mask within zones only (simple box dilation)
  const dilated = new Uint8Array(W * H);
  for (const z of ZONES) {
    const l = Math.floor(z.l * W), r = Math.ceil(z.r * W);
    const t = Math.floor(z.t * H), b = Math.ceil(z.b * H);
    for (let y = t; y < b; y++) {
      for (let x = l; x < r; x++) {
        if (mask[y * W + x]) {
          for (let dy = -DILATE_PX; dy <= DILATE_PX; dy++) {
            for (let dx = -DILATE_PX; dx <= DILATE_PX; dx++) {
              const ny = y + dy, nx = x + dx;
              if (ny >= t && ny < b && nx >= l && nx < r) {
                dilated[ny * W + nx] = 1;
              }
            }
          }
        }
      }
    }
  }

  const out = Buffer.from(orig);
  let replaced = 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const p = y * W + x;
      if (dilated[p]) {
        const idx = p * channels;
        out[idx] = blurredBuf[idx];
        out[idx + 1] = blurredBuf[idx + 1];
        out[idx + 2] = blurredBuf[idx + 2];
        if (channels === 4) out[idx + 3] = blurredBuf[idx + 3];
        replaced++;
      }
    }
  }

  await sharp(out, { raw: { width: W, height: H, channels } })
    .toFormat(path.extname(outputPath).slice(1) === 'png' ? 'png' : 'jpeg', { quality: 92 })
    .toFile(outputPath);

  return { W, H, replacedPx: replaced, replacedPct: (replaced / (W * H) * 100).toFixed(2) };
}

const args = process.argv.slice(2);
const outDir = '/tmp/hero-fixed';
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
