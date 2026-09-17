import sharp from "sharp"
import fs from "fs"

const dir = "/tmp/hero"
const files = fs.readdirSync(dir).sort()
const cell = 320
const cols = 5
const rows = Math.ceil(files.length / cols)
const labelH = 24

const composites = []
for (let i = 0; i < files.length; i++) {
  const col = i % cols
  const row = Math.floor(i / cols)
  composites.push({ file: files[i], x: col * cell, y: row * (cell + labelH) })
}

async function run() {
  const canvasW = cols * cell
  const canvasH = rows * (cell + labelH)
  let base = sharp({
    create: { width: canvasW, height: canvasH, channels: 3, background: { r: 255, g: 255, b: 255 } },
  })

  const overlays = []
  for (const c of composites) {
    const resized = await sharp(`${dir}/${c.file}`)
      .resize(cell, cell, { fit: "contain", background: { r: 255, g: 255, b: 255 } })
      .toBuffer()
    overlays.push({ input: resized, top: c.y, left: c.x })
  }

  const withImages = await base.composite(overlays).png().toBuffer()

  // add text labels via svg overlay
  let svgText = `<svg width="${canvasW}" height="${canvasH}">`
  for (const c of composites) {
    svgText += `<text x="${c.x + 4}" y="${c.y + cell + 16}" font-size="14" fill="black">${c.file}</text>`
  }
  svgText += `</svg>`

  await sharp(withImages)
    .composite([{ input: Buffer.from(svgText), top: 0, left: 0 }])
    .jpeg({ quality: 85 })
    .toFile("/tmp/hero_grid.jpg")
  console.log("wrote /tmp/hero_grid.jpg", files.length, "images")
}

run()
