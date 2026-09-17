import sharp from 'sharp';
import fs from 'fs';

// Usage: node manual-patch.mjs <input> <output> '[{"x":0,"y":75,"w":400,"h":280,"donorY":460},...]'
// Each box: badge rectangle in actual pixel coords. donorY = top y-coord of a same-size clean
// background strip (same x range, height=h) to copy from (usually just below or above the badge,
// still in the flat background zone, no product/badge pixels).

const [, , input, output, boxesJson] = process.argv;
const boxes = JSON.parse(boxesJson);

async function run() {
  const img = sharp(input);
  const meta = await img.metadata();
  const { width, height, channels } = await img
    .raw()
    .toBuffer({ resolveWithObject: true })
    .then(({ info }) => info);

  const { data } = await sharp(input).raw().toBuffer({ resolveWithObject: true });
  const C = channels;

  for (const box of boxes) {
    const { x, y, w, h, donorY } = box;
    for (let row = 0; row < h; row++) {
      const srcY = donorY + row;
      const dstY = y + row;
      if (srcY < 0 || srcY >= height || dstY < 0 || dstY >= height) continue;
      const srcStart = (srcY * width + x) * C;
      const dstStart = (dstY * width + x) * C;
      for (let col = 0; col < w; col++) {
        if (x + col >= width) break;
        for (let c = 0; c < C; c++) {
          data[dstStart + col * C + c] = data[srcStart + col * C + c];
        }
      }
    }
  }

  await sharp(data, { raw: { width, height, channels: C } })
    .toFormat(meta.format === 'png' ? 'png' : 'jpeg', { quality: 92 })
    .toFile(output);
  console.log('wrote', output);
}

run();
