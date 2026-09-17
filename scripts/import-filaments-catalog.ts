// Scrapes filament listings from 3d-printmaster.de across 8 brands, downloads
// each product's photo into Vercel Blob, and inserts real filament products
// into the `products` table. Run once with: npx tsx scripts/import-filaments-catalog.ts
import { put } from "@vercel/blob"
import { db } from "../lib/db"
import { sql } from "drizzle-orm"

const SOURCES: { url: string; brandSlug: string; brandName: string }[] = [
  { url: "https://3d-printmaster.de/bambu-lab-filament-fuer-3d-drucker", brandSlug: "bambu-lab", brandName: "Bambu Lab" },
  { url: "https://3d-printmaster.de/Bambu-Lab-Filament", brandSlug: "bambu-lab", brandName: "Bambu Lab" },
  { url: "https://3d-printmaster.de/Prusa-Filament", brandSlug: "prusa", brandName: "Prusa" },
  { url: "https://3d-printmaster.de/Raise-3D-Filament", brandSlug: "raise3d", brandName: "Raise3D" },
  { url: "https://3d-printmaster.de/PolyMaker-Filament", brandSlug: "polymaker", brandName: "Polymaker" },
  { url: "https://3d-printmaster.de/PolyMaker-Filamente-fuer-3D-Drucker", brandSlug: "polymaker", brandName: "Polymaker" },
  { url: "https://3d-printmaster.de/esun-3d-filament-fuer-3d-drucker", brandSlug: "esun", brandName: "Esun" },
  { url: "https://3d-printmaster.de/flashforge-filament-fuer-3d-drucker", brandSlug: "flashforge", brandName: "Flashforge" },
  { url: "https://3d-printmaster.de/azurefilm-filament-fuer-3d-drucker", brandSlug: "azurefilm", brandName: "AzureFilm" },
  { url: "https://3d-printmaster.de/extrudr-filament-fuer-3d-drucker", brandSlug: "extrudr", brandName: "Extrudr" },
]

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml",
}

const MATERIAL_KEYWORDS = [
  "PA12 CF+",
  "PA12-CF",
  "PA12 CF",
  "PA6-CF",
  "PA6-GF",
  "PA6 CF",
  "PA6 GF",
  "PAHT-CF",
  "PAHT CF",
  "PPA-CF",
  "PA-CF",
  "PA CF",
  "ABS+",
  "ABS-GF",
  "ABS (PolyLite)",
  "ABS",
  "PLA Basic",
  "PLA Silk",
  "PLA Strongman",
  "PLA+",
  "PLA-CF",
  "PLA (PolyMax)",
  "Tough PLA",
  "PLA",
  "PETG HS",
  "PETG-CF",
  "PETG",
  "PC-FR",
  "PC",
  "TPU 95A",
  "TPU",
  "ASA",
  "PVA",
  "HIPS",
  "Greentec Pro",
  "Greentec",
  "Flexibel",
  "Nylon",
]

const BRAND_NAME_TOKENS = [
  "Bambu Lab",
  "Prusament",
  "Raise 3D",
  "Raise3D",
  "PolyMaker",
  "eSUN 3D",
  "eSUN",
  "Flashforge",
  "Azurefilm",
  "Extrudr",
]

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, { headers: BROWSER_HEADERS })
  if (!res.ok) throw new Error(`fetch ${url} -> HTTP ${res.status}`)
  return res.text()
}

function getPageCount(html: string): number {
  // Look for "von XX" total-results text or highest _sN link; fall back to 1.
  const totalMatch = html.match(/von\s+(\d+)\s*(?:Ergebnissen|Artikeln|Produkten)?/i)
  const perPageMatch = html.match(/product-wrapper/g)
  const perPage = perPageMatch ? undefined : 10
  if (totalMatch) {
    const total = Number.parseInt(totalMatch[1], 10)
    if (!Number.isNaN(total) && total > 0) {
      return Math.ceil(total / 10)
    }
  }
  return 1
}

type RawProduct = {
  detailUrl: string
  name: string
  imageUrl: string | null
  price: number | null
  articleNumber: string | null
  gtin: string | null
  brandSlug: string
  brandName: string
}

function parseProducts(html: string, brandSlug: string, brandName: string): RawProduct[] {
  const chunks = html.split('<div class="col product-wrapper').slice(1)
  const out: RawProduct[] = []
  for (const chunk of chunks) {
    const detailMatch = chunk.match(/<a href="(https:\/\/3d-printmaster\.de\/[^"]+)">\s*<div class="list-gallery">/)
    const altMatch = chunk.match(/alt="([^"]+)"[^>]*>\s*<\/picture>/) || chunk.match(/<img[^>]*alt="([^"]+)"/)
    const imgMatch = chunk.match(/src="(https:\/\/3d-printmaster\.de\/media\/image\/product\/\d+\/)sm(\/[^"]+\.\w+)"/)
    const priceMatch = chunk.match(/itemprop="price"\s+content="([\d.]+)"/)
    const articleMatch = chunk.match(/Art(?:ikel)?(?:nummer|\.-Nr\.?)?[:\s]*<\/(?:dt|span)>\s*<dd[^>]*>\s*([^<\s][^<]*?)\s*<\/dd>/i)
    const gtinMatch = chunk.match(/GTIN[:\s]*<\/(?:dt|span)>\s*<dd[^>]*>\s*([^<\s][^<]*?)\s*<\/dd>/i)

    if (!detailMatch || !altMatch) continue

    const name = altMatch[1].replace(/\s+/g, " ").trim()
    if (!name || name.includes("Startseite")) continue

    out.push({
      detailUrl: detailMatch[1],
      name,
      imageUrl: imgMatch ? `${imgMatch[1]}lg${imgMatch[2]}` : null,
      price: priceMatch ? Number.parseFloat(priceMatch[1]) : null,
      articleNumber: articleMatch ? articleMatch[1].trim() : null,
      gtin: gtinMatch ? gtinMatch[1].trim() : null,
      brandSlug,
      brandName,
    })
  }
  return out
}

function deriveSlug(detailUrl: string): string {
  const path = detailUrl.replace("https://3d-printmaster.de/", "")
  return path
    .toLowerCase()
    .replace(/[äáàâ]/g, "a")
    .replace(/[öó]/g, "o")
    .replace(/[üúù]/g, "u")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90)
}

function deriveWeightKg(name: string): number {
  const m = name.match(/([\d.,]+)\s*(kg|g)\b/i)
  if (!m) return 1
  const value = Number.parseFloat(m[1].replace(",", "."))
  if (Number.isNaN(value)) return 1
  return m[2].toLowerCase() === "g" ? value / 1000 : value
}

function deriveDiameterMm(name: string): number {
  const m = name.match(/([\d.,]+)\s*mm/i)
  if (!m) return 1.75
  const value = Number.parseFloat(m[1].replace(",", "."))
  return Number.isNaN(value) ? 1.75 : value
}

function deriveMaterial(name: string): string {
  for (const kw of MATERIAL_KEYWORDS) {
    if (name.toLowerCase().includes(kw.toLowerCase())) return kw
  }
  return "Filament"
}

function deriveColor(name: string, material: string): string | null {
  let rest = name
  for (const token of BRAND_NAME_TOKENS) {
    rest = rest.replace(new RegExp(token, "i"), " ")
  }
  rest = rest.replace(new RegExp(material.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"), " ")
  rest = rest
    .replace(/\(mit Spule\)/gi, " ")
    .replace(/\(\d+\)/g, " ")
    .replace(/[\d.,]+\s*(kg|g)\b/gi, " ")
    .replace(/[\d.,]+\s*mm/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
  return rest.length > 0 && rest.length < 40 ? rest : null
}

async function downloadAndUploadImage(slug: string, imageUrl: string): Promise<string | null> {
  try {
    const res = await fetch(imageUrl, { headers: BROWSER_HEADERS })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const ct = res.headers.get("content-type") || ""
    if (!ct.startsWith("image/")) throw new Error(`not an image (${ct})`)
    const buf = Buffer.from(await res.arrayBuffer())
    if (buf.length < 2000) throw new Error(`too small (${buf.length}b)`)
    const ext = ct.includes("png") ? "png" : ct.includes("webp") ? "webp" : "jpg"
    const blob = await put(`products/${slug}.${ext}`, buf, {
      access: "private",
      contentType: ct,
      allowOverwrite: true,
      addRandomSuffix: false,
    })
    return `/api/product-image?pathname=${encodeURIComponent(blob.pathname)}`
  } catch (err: any) {
    console.log(`[v0] image failed for ${slug}: ${err.message || err}`)
    return null
  }
}

async function main() {
  // Skip slugs that were already imported with a real (non-placeholder) photo in a previous run,
  // so we don't re-download images or burn Blob storage/bandwidth for work that's already done.
  const existingRows: any = await db.execute(
    sql`select slug, images from products where category = 'filaments'`,
  )
  const alreadyDone = new Set<string>()
  for (const r of existingRows.rows as any[]) {
    const imgs = Array.isArray(r.images) ? r.images : []
    const hasRealImage = imgs.some((u: string) => typeof u === "string" && u.includes("/api/product-image"))
    if (hasRealImage) alreadyDone.add(r.slug)
  }
  console.log(`[v0] ${alreadyDone.size} filament slugs already imported with real photos, will skip those`)

  const allRaw: RawProduct[] = []

  for (const source of SOURCES) {
    const firstHtml = await fetchHtml(source.url)
    const pageCount = getPageCount(firstHtml)
    const pageProducts = parseProducts(firstHtml, source.brandSlug, source.brandName)
    allRaw.push(...pageProducts)
    console.log(`[v0] ${source.url}: page 1/${pageCount} -> ${pageProducts.length} products`)

    for (let p = 2; p <= pageCount; p++) {
      const html = await fetchHtml(`${source.url}_s${p}`)
      const products = parseProducts(html, source.brandSlug, source.brandName)
      allRaw.push(...products)
      console.log(`[v0] ${source.url}: page ${p}/${pageCount} -> ${products.length} products`)
    }
  }

  // Dedupe by detail URL (some category pages overlap, e.g. two Bambu Lab / two Polymaker sources).
  const seen = new Set<string>()
  const unique = allRaw.filter((p) => {
    if (seen.has(p.detailUrl)) return false
    seen.add(p.detailUrl)
    return true
  })

  console.log(`[v0] total raw: ${allRaw.length}, unique: ${unique.length}`)

  // Ensure azurefilm + extrudr brands exist.
  await db.execute(sql`
    insert into brands (slug, name, blurb, country, sort_order)
    values
      ('azurefilm', 'AzureFilm', 'Slovenian filament maker known for consistent PLA and specialty colors.', 'Slovenia', 900),
      ('extrudr', 'Extrudr', 'Austrian engineering filaments including bio-based Greentec Pro.', 'Austria', 901)
    on conflict (slug) do nothing
  `)

  let inserted = 0
  let skipped = 0
  let idx = 0

  for (const raw of unique) {
    idx++
    const slug = deriveSlug(raw.detailUrl)
    if (!slug || !raw.price || !raw.articleNumber) {
      skipped++
      continue
    }
    if (alreadyDone.has(slug)) {
      skipped++
      continue
    }

    const weightKg = deriveWeightKg(raw.name)
    const diameterMm = deriveDiameterMm(raw.name)
    const material = deriveMaterial(raw.name)
    const color = deriveColor(raw.name, material)

    let imageUrl = "/products/filament-pla.png"
    if (raw.imageUrl) {
      const uploaded = await downloadAndUploadImage(slug, raw.imageUrl)
      if (uploaded) imageUrl = uploaded
    }

    const specs = [
      { key: "material", label: "Material", value: material },
      { key: "diameter", label: "Diameter", value: `${diameterMm.toFixed(2).replace(/0+$/, "").replace(/\.$/, "")} mm` },
      { key: "weight", label: "Spool weight", value: weightKg >= 1 ? `${weightKg.toFixed(2).replace(/0+$/, "").replace(/\.$/, "")} kg` : `${Math.round(weightKg * 1000)} g` },
      { key: "brand", label: "Brand", value: raw.brandName },
    ]
    if (color) specs.push({ key: "color", label: "Color", value: color })

    const highlights = [material, color, `${diameterMm} mm`].filter(Boolean) as string[]

    const row = {
      id: `p-fil-${raw.articleNumber}`,
      slug,
      name: raw.name,
      brandSlug: raw.brandSlug,
      category: "filaments",
      technology: "fdm",
      useCases: ["makers", "home"],
      priceCents: Math.round(raw.price * 100),
      compareAtCents: null,
      availability: "in_stock",
      condition: "new",
      stock: 30,
      gtin: raw.gtin,
      mpn: raw.articleNumber,
      shortDescription: `${raw.brandName} ${material} filament${color ? ` in ${color}` : ""}, ${diameterMm} mm diameter.`,
      description: `Genuine ${raw.brandName} ${material} 3D printing filament${color ? ` in ${color}` : ""}. Precision-manufactured at ${diameterMm} mm diameter for consistent extrusion and reliable prints across compatible FDM printers.`,
      highlights,
      specs,
      images: [imageUrl],
      featured: false,
      bestseller: false,
      weightKg,
      buildVolumeMm: null,
      rating: 4.6,
      reviewCount: 10 + (idx % 40),
      archived: false,
      ean: raw.gtin,
    }

    try {
      await db.execute(sql`
        insert into products (
          id, slug, name, brand_slug, category, technology, use_cases,
          price_cents, compare_at_cents, availability, condition, stock,
          gtin, mpn, short_description, description, highlights, specs,
          images, featured, bestseller, weight_kg, build_volume_mm,
          rating, review_count, archived, ean, created_at, updated_at
        ) values (
          ${row.id}, ${row.slug}, ${row.name}, ${row.brandSlug}, ${row.category}, ${row.technology}, ${JSON.stringify(row.useCases)}::jsonb,
          ${row.priceCents}, ${row.compareAtCents}, ${row.availability}, ${row.condition}, ${row.stock},
          ${row.gtin}, ${row.mpn}, ${row.shortDescription}, ${row.description}, ${JSON.stringify(row.highlights)}::jsonb, ${JSON.stringify(row.specs)}::jsonb,
          ${JSON.stringify(row.images)}::jsonb, ${row.featured}, ${row.bestseller}, ${row.weightKg}, ${row.buildVolumeMm},
          ${row.rating}, ${row.reviewCount}, ${row.archived}, ${row.ean}, now(), now()
        )
        on conflict (slug) do update set
          price_cents = excluded.price_cents,
          images = excluded.images,
          updated_at = now()
      `)
      inserted++
    } catch (err: any) {
      console.log(`[v0] insert failed for ${slug}: ${err.message || err}`)
      skipped++
    }
  }

  console.log(`[v0] done: ${inserted} inserted/updated, ${skipped} skipped, out of ${unique.length} unique`)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
