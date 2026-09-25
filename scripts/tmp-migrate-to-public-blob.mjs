// One-off migration: copy all product images from the private Blob store
// (served via /api/product-image) into the new public Blob store, and
// rewrite products.images to point directly at the public CDN URL.
import { Pool } from "pg"
import { get, put } from "@vercel/blob"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const PRIVATE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN
const PUBLIC_TOKEN = process.env.BLOB_PUBLIC_READ_WRITE_TOKEN

if (!PRIVATE_TOKEN || !PUBLIC_TOKEN) {
  console.error("Missing BLOB_READ_WRITE_TOKEN or BLOB_PUBLIC_READ_WRITE_TOKEN")
  process.exit(1)
}

async function main() {
  const { rows } = await pool.query(
    "SELECT slug, images FROM products WHERE images IS NOT NULL AND jsonb_array_length(images) > 0"
  )

  const pathnameToPublicUrl = new Map()
  let migrated = 0
  let failed = 0
  let skipped = 0

  // Collect unique pathnames first
  const uniquePathnames = new Set()
  for (const row of rows) {
    for (const img of row.images) {
      if (typeof img === "string" && img.startsWith("/api/product-image")) {
        const m = img.match(/pathname=([^&]+)/)
        if (m) uniquePathnames.add(decodeURIComponent(m[1]))
      }
    }
  }

  console.log(`Found ${uniquePathnames.size} unique private pathnames to migrate`)

  for (const pathname of uniquePathnames) {
    try {
      const result = await get(pathname, { access: "private", token: PRIVATE_TOKEN })
      if (!result) {
        console.warn(`[skip] not found in private store: ${pathname}`)
        skipped++
        continue
      }
      const buffer = await streamToBuffer(result.stream)
      const blob = await put(pathname, buffer, {
        access: "public",
        contentType: result.blob.contentType,
        token: PUBLIC_TOKEN,
        addRandomSuffix: false,
        allowOverwrite: true,
      })
      pathnameToPublicUrl.set(pathname, blob.url)
      migrated++
      if (migrated % 50 === 0) console.log(`  migrated ${migrated}/${uniquePathnames.size}...`)
    } catch (e) {
      console.error(`[fail] ${pathname}: ${e.message}`)
      failed++
    }
  }

  console.log(`Migration done: ${migrated} migrated, ${failed} failed, ${skipped} skipped`)

  // Now rewrite DB
  let updatedProducts = 0
  for (const row of rows) {
    let changed = false
    const newImages = row.images.map((img) => {
      if (typeof img === "string" && img.startsWith("/api/product-image")) {
        const m = img.match(/pathname=([^&]+)/)
        if (m) {
          const pathname = decodeURIComponent(m[1])
          const publicUrl = pathnameToPublicUrl.get(pathname)
          if (publicUrl) {
            changed = true
            return publicUrl
          }
        }
      }
      return img
    })
    if (changed) {
      await pool.query("UPDATE products SET images = $1::jsonb WHERE slug = $2", [
        JSON.stringify(newImages),
        row.slug,
      ])
      updatedProducts++
    }
  }

  console.log(`Updated ${updatedProducts} products in DB`)
  await pool.end()
}

async function streamToBuffer(stream) {
  const chunks = []
  for await (const chunk of stream) chunks.push(chunk)
  return Buffer.concat(chunks)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
