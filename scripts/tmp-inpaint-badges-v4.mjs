import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const DIFF_THRESHOLD = 22;
const DILATE_PX = 6;
const MIN_COMPONENT_PX = 400; // ignore tiny noise
const MAX_COMPONENT_FRACTION = 0.18; // a single badge component shouldn't be bigger than this fraction of the image
const CENTER_MARGIN = 0.12; // central region considered "product" territory - components overlapping it a lot are excluded

function quantize(v) {
  return Math.round(v / 8) * 8;
}

function estimateGlobalBg(raw, W, H, channels) {
  const buckets = new Map();
  const thickness = Math.max(3, Math.round(Math.min(W, H) * 0.01));
  const step = 2;

  function sample(x, y) {
    const idx = (y * W + x) * channels;
    if (channels === 4 && raw[idx + 3] < 10) return; // skip transparent
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

  if (buckets.size === 0) return null; // fully transparent border -> transparent-canvas image

  let best = null;
  for (const e of buckets.values()) {
    if (!best || e.count > best.count) best = e;
  }
  return [Math.round(best.r / best.count), Math.round(best.g / best.count), Math.round(best.b / best.count)];
}

// Connected components (BFS) over a boolean mask array
function findComponents(mask, W, H) {
  const visited = new Uint8Array(W * H);
  const components = [];
  const stack = new Int32Array(W * H);

  for (let start = 0; start < W * H; start++) {
    if (!mask[start] || visited[start]) continue;
    let sp = 0;
    stack[sp++] = start;
    visited[start] = 1;
    let minX = W, maxX = -1, minY = H, maxY = -1, count = 0;
    const pixels = [];
    while (sp > 0) {
      const p = stack[--sp];
      const x = p % W, y = Math.floor(p / W);
      count++;
      pixels.push(p);
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      const neighbors = [p - 1, p + 1, p - W, p + W];
      for (const n of neighbors) {
        if (n < 0 || n >= W * H) continue;
        const nx = n % W;
        if (Math.abs(nx - x) > 1) continue; // avoid wraparound on row edges
        if (!mask[n] || visited[n]) continue;
        visited[n] = 1;
        stack[sp++] = n;
      }
    }
    components.push({ minX, maxX, minY, maxY, count, pixels });
  }
  return components;
}

async function processImage(inputPath, outputPath) {
  const img = sharp(inputPath);
  const meta = await img.metadata();
  const W = meta.width, H = meta.height;
  const { data: orig, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const { channels } = info;

  const bg = estimateGlobalBg(orig, W, H, channels);
  const transparentCanvas = bg === null;

  const mask = new Uint8Array(W * H);
  if (!transparentCanvas) {
    for (let p = 0; p < W * H; p++) {
      const idx = p * channels;
      if (channels === 4 && orig[idx + 3] < 10) continue; // already transparent
      const dr = Math.abs(orig[idx] - bg[0]);
      const dg = Math.abs(orig[idx + 1] - bg[1]);
      const db = Math.abs(orig[idx + 2] - bg[2]);
      if (dr > DIFF_THRESHOLD || dg > DIFF_THRESHOLD || db > DIFF_THRESHOLD) mask[p] = 1;
    }
  } else {
    // transparent-canvas image: treat any opaque pixel as "content"; badges are opaque isolated blobs
    for (let p = 0; p < W * H; p++) {
      const idx = p * channels;
      if (orig[idx + 3] >= 10) mask[p] = 1;
    }
  }

  const components = findComponents(mask, W, H);

  const cx0 = W * CENTER_MARGIN, cx1 = W * (1 - CENTER_MARGIN);
  const cy0 = H * CENTER_MARGIN, cy1 = H * (1 - CENTER_MARGIN);

  const toFillPixels = [];
  const componentInfo = [];

  for (const c of components) {
    if (c.count < MIN_COMPONENT_PX) continue;
    const area = (c.maxX - c.minX + 1) * (c.maxY - c.minY + 1);
    const fraction = area / (W * H);
    // overlap of bbox with central "product" region
    const ox = Math.max(0, Math.min(c.maxX, cx1) - Math.max(c.minX, cx0));
    const oy = Math.max(0, Math.min(c.maxY, cy1) - Math.max(c.minY, cy0));
    const overlapArea = ox * oy;
    const overlapFraction = overlapArea / area;

    const isCandidate = fraction <= MAX_COMPONENT_FRACTION && overlapFraction < 0.05;
    componentInfo.push({ minX: c.minX, maxX: c.maxX, minY: c.minY, maxY: c.maxY, count: c.count, fraction: fraction.toFixed(3), overlapFraction: overlapFraction.toFixed(3), kept: isCandidate });
    if (isCandidate) {
      for (const p of c.pixels) toFillPixels.push(p);
    }
  }

  // dilate the fill set
  const dilated = new Uint8Array(W * H);
  for (const p of toFillPixels) {
    const x = p % W, y = Math.floor(p / W);
    for (let dy = -DILATE_PX; dy <= DILATE_PX; dy++) {
      for (let dx = -DILATE_PX; dx <= DILATE_PX; dx++) {
        const ny = y + dy, nx = x + dx;
        if (ny >= 0 && ny < H && nx >= 0 && nx < W) dilated[ny * W + nx] = 1;
      }
    }
  }

  const out = Buffer.from(orig);
  let replaced = 0;
  for (let p = 0; p < W * H; p++) {
    if (!dilated[p]) continue;
    const idx = p * channels;
    if (transparentCanvas) {
      out[idx + 3] = 0;
    } else {
      out[idx] = bg[0];
      out[idx + 1] = bg[1];
      out[idx + 2] = bg[2];
      if (channels === 4) out[idx + 3] = orig[idx + 3];
    }
    replaced++;
  }

  await sharp(out, { raw: { width: W, height: H, channels } })
    .toFormat(path.extname(outputPath).slice(1) === 'png' ? 'png' : 'jpeg', { quality: 92 })
    .toFile(outputPath);

  return {
    W, H, bg: transparentCanvas ? 'transparent-canvas' : bg,
    replacedPx: replaced, replacedPct: (replaced / (W * H) * 100).toFixed(2),
    components: componentInfo.filter(c => c.kept).map(c => `${c.minX},${c.minY}-${c.maxX},${c.maxY}(${c.fraction})`),
  };
}

const args = process.argv.slice(2);
const outDir = '/tmp/hero-fixed4';
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
      console.log('FAIL', base, e.message, e.stack);
    }
  }
})();
