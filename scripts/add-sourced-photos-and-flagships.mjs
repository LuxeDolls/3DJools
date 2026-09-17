// One-off script: adds extra real product photos (sourced from Wikimedia Commons)
// to existing catalog items, and inserts new premium/flagship printers with real
// photos + real GTIN codes. Run once with `node --env-file=.env.development.local`.
import { put } from "@vercel/blob"
import { Pool } from "pg"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function uploadFromUrl(sourceUrl, pathname, attempt = 1) {
  const res = await fetch(sourceUrl, {
    headers: { "User-Agent": "3DJoolsCatalogBot/1.0 (contact: catalog@3djools.example)" },
  })
  if (res.status === 429 && attempt <= 6) {
    const waitMs = 20000 * attempt
    console.log(`[v0] Rate limited fetching ${pathname}, retrying in ${waitMs}ms... (attempt ${attempt})`)
    await sleep(waitMs)
    return uploadFromUrl(sourceUrl, pathname, attempt + 1)
  }
  if (!res.ok) throw new Error(`Failed to fetch ${sourceUrl}: ${res.status}`)
  const buffer = Buffer.from(await res.arrayBuffer())
  const blob = await put(pathname, buffer, {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: res.headers.get("content-type") || "image/jpeg",
  })
  await sleep(5000)
  return blob.url
}

// Already applied in a previous run of this script.
const extraPhotos = []

// p-ultimaker-s5 and p-formlabs-form2 already confirmed inserted with 3 photos each
// in a previous run of this script.
const newProducts = [
  {
    id: "p-raise3d-pro2plus",
    slug: "raise3d-pro2-plus",
    name: "Raise3D Pro2 Plus",
    brand_slug: "raise3d",
    category: "printers",
    technology: "fdm",
    use_cases: ["business", "engineering"],
    price_cents: 799900,
    compare_at_cents: null,
    availability: "in_stock",
    stock: 3,
    gtin: "6970240721307",
    mpn: "PRO2PLUS",
    short_description: "Industrial dual-extruder FDM with a huge enclosed build volume.",
    description:
      "The Raise3D Pro2 Plus scales up the acclaimed Pro2 platform with an extra-tall enclosed chamber, dual independent extruders and an industrial-grade linear rail motion system, making it a favorite for manufacturing floors that need reliable, unattended production runs.",
    highlights: ["Independent dual extruders", "HEPA-filtered enclosure", "Touchscreen with live camera", "Auto-leveling bed"],
    specs: [
      { key: "technology", label: "Technology", value: "FDM (independent dual extrusion)" },
      { key: "buildVolume", label: "Build volume", value: "305 × 305 × 605 mm" },
      { key: "nozzle", label: "Nozzle", value: "2x 0.4 mm (interchangeable)" },
      { key: "connectivity", label: "Connectivity", value: "Wi-Fi, Ethernet, USB" },
    ],
    images: ["products/raise3d-pro2-plus-1.jpg"],
    featured: false,
    bestseller: false,
    weight_kg: 68,
    build_volume_mm: { x: 305, y: 305, z: 605 },
    rating: 4.5,
    review_count: 41,
    ean: "6970240721307",
    photoSources: [
      "https://upload.wikimedia.org/wikipedia/commons/7/70/Imprimante_3D_Raise3D_Pro_2_dans_une_m%C3%A9diath%C3%A8que_de_Bourg-en-Bresse_%28novembre_2023%29.jpg",
    ],
  },
  {
    id: "p-zortrax-m200plus",
    slug: "zortrax-m200-plus",
    name: "Zortrax M200 Plus",
    brand_slug: "zortrax",
    category: "printers",
    technology: "fdm",
    use_cases: ["business", "makers"],
    price_cents: 219900,
    compare_at_cents: null,
    availability: "in_stock",
    stock: 8,
    gtin: "5902280822882",
    mpn: "M200PLUS",
    short_description: "Reliable enclosed FDM printer engineered for consistent office use.",
    description:
      "The Zortrax M200 Plus is a professional-grade enclosed FDM printer engineered for consistent, hands-off operation in office and studio environments, with a perforated HIPS-compatible plate and a proprietary material library tuned for the machine.",
    highlights: ["Enclosed heated chamber", "Perforated build plate", "Layer Plan preview software", "Wide validated material library"],
    specs: [
      { key: "technology", label: "Technology", value: "FDM (enclosed)" },
      { key: "buildVolume", label: "Build volume", value: "200 × 200 × 180 mm" },
      { key: "nozzle", label: "Nozzle", value: "0.4 mm" },
      { key: "connectivity", label: "Connectivity", value: "Wi-Fi, USB, SD card" },
    ],
    images: ["products/zortrax-m200-plus-1.jpg", "products/zortrax-m200-plus-2.jpg"],
    featured: false,
    bestseller: false,
    weight_kg: 14.5,
    build_volume_mm: { x: 200, y: 200, z: 180 },
    rating: 4.4,
    review_count: 58,
    ean: "5902280822882",
    photoSources: [
      "https://upload.wikimedia.org/wikipedia/commons/a/a9/Zortrax_M200_3D_printer.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/5/5b/Zortrax_M200_3D_printer_-_19721763618_%28cropped%29.jpg",
    ],
  },
]

async function main() {
  console.log("[v0] Uploading extra photos for existing products...")
  for (const item of extraPhotos) {
    const blobUrl = await uploadFromUrl(item.url, item.pathname)
    await pool.query(
      `update products set images = images || $1::jsonb, updated_at = now() where id = $2`,
      [JSON.stringify([blobUrl]), item.productId],
    )
    console.log(`[v0] Added photo to ${item.productId}: ${blobUrl}`)
  }

  console.log("[v0] Ensuring brand rows exist for new manufacturers...")
  const newBrands = [
    { slug: "ultimaker", name: "Ultimaker" },
    { slug: "formlabs", name: "Formlabs" },
    { slug: "raise3d", name: "Raise3D" },
    { slug: "zortrax", name: "Zortrax" },
  ]
  const brandCols = await pool.query(
    `select column_name from information_schema.columns where table_name='brands' order by ordinal_position`,
  )
  console.log("[v0] brands columns:", brandCols.rows.map((r) => r.column_name))
  for (const b of newBrands) {
    try {
      await pool.query(
        `insert into brands (slug, name) values ($1, $2) on conflict (slug) do nothing`,
        [b.slug, b.name],
      )
    } catch (e) {
      console.log(`[v0] brand insert skipped for ${b.slug}: ${e.message}`)
    }
  }

  console.log("[v0] Uploading photos and inserting new flagship products...")
  for (const p of newProducts) {
    const uploadedUrls = []
    for (let i = 0; i < p.photoSources.length; i++) {
      const pathname = p.images[i]
      const url = await uploadFromUrl(p.photoSources[i], pathname)
      uploadedUrls.push(url)
      console.log(`[v0] Uploaded ${pathname} -> ${url}`)
    }

    await pool.query(
      `insert into products (
        id, slug, name, brand_slug, category, technology, use_cases,
        price_cents, compare_at_cents, availability, stock, gtin, mpn,
        short_description, description, highlights, specs, images,
        featured, bestseller, weight_kg, build_volume_mm, rating, review_count, ean
      ) values (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25
      )
      on conflict (id) do update set
        images = excluded.images,
        gtin = excluded.gtin,
        ean = excluded.ean,
        updated_at = now()
      `,
      [
        p.id,
        p.slug,
        p.name,
        p.brand_slug,
        p.category,
        p.technology,
        JSON.stringify(p.use_cases),
        p.price_cents,
        p.compare_at_cents,
        p.availability,
        p.stock,
        p.gtin,
        p.mpn,
        p.short_description,
        p.description,
        JSON.stringify(p.highlights),
        JSON.stringify(p.specs),
        JSON.stringify(uploadedUrls),
        p.featured,
        p.bestseller,
        p.weight_kg,
        JSON.stringify(p.build_volume_mm),
        p.rating,
        p.review_count,
        p.ean,
      ],
    )
    console.log(`[v0] Inserted/updated product ${p.id}`)
  }

  console.log("[v0] Done.")
  await pool.end()
}

main().catch((err) => {
  console.error("[v0] Script failed:", err)
  process.exit(1)
})
