import type { Locale } from "@/lib/i18n/config"
import { getAllProducts } from "@/lib/catalog"
import { storefrontImageUrl, SITE_ORIGIN } from "@/lib/catalog/image-urls"
import { ALL_SHIPPING_COUNTRIES, DOMESTIC_COUNTRY, DOMESTIC_RATE_CENTS, INTERNATIONAL_RATE_CENTS } from "@/lib/shipping/rates"

const BASE_URL = SITE_ORIGIN
const STORE_NAME = "3DJools"

// Shipping is free to every destination, mirrored from lib/shipping/rates.ts (see the Shipping page).
const SHIPPING_BLOCKS = ALL_SHIPPING_COUNTRIES
  .map(({ code }) => {
    const cents = code === DOMESTIC_COUNTRY.code ? DOMESTIC_RATE_CENTS : INTERNATIONAL_RATE_CENTS
    return `\n      <g:shipping>\n        <g:country>${code}</g:country>\n        <g:price>${(cents / 100).toFixed(2)} EUR</g:price>\n      </g:shipping>`
  })
  .join("")

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;")
}

function formatPrice(cents: number): string {
  return `${(cents / 100).toFixed(2)} EUR`
}

function absoluteImageUrl(image: string | undefined): string | undefined {
  return storefrontImageUrl(image)
}

function availability(value: string): string {
  if (value === "out_of_stock") return "out of stock"
  if (value === "preorder") return "preorder"
  return "in stock"
}

function hashForGoogleId(value: string): string {
  let first = 2166136261
  let second = 16777619

  for (const character of value) {
    const codePoint = character.codePointAt(0) ?? 0
    first = Math.imul(first ^ codePoint, 16777619) >>> 0
    second = Math.imul(second ^ codePoint, 2246822519) >>> 0
  }

  return `${first.toString(16).padStart(8, "0")}${second.toString(16).padStart(8, "0")}`
}

function googleProductId(product: { id: string; slug: string }): string {
  if (product.id.length <= 50) return product.id

  const readableSlug = product.slug.replace(/[^a-zA-Z0-9-]/g, "-").slice(0, 31)
  return `p-${hashForGoogleId(product.id)}-${readableSlug}`
}

export async function createGoogleShoppingFeed(locale: Locale): Promise<string> {
  const products = (await getAllProducts(locale)).filter((product) => product.category !== "filaments")
  const items = products.map((product) => {
    const brand = product.brandName ?? product.brandSlug
    const gtin = product.ean ?? product.gtin
    const fullMpn = [brand, product.mpn].filter(Boolean).join(" ")
    const imageLink = absoluteImageUrl(product.images[0])
    const productUrl = `${BASE_URL}/${locale}/product/${encodeURIComponent(product.slug)}`
    // Only the final (already-discounted) price is ever sent — no g:sale_price /
    // g:sale_price_effective_date, matching the single-price display on the site.
    const priceBlock = `\n      <g:price>${formatPrice(product.priceCents)}</g:price>`

    return `
    <item>
      <g:id>${escapeXml(googleProductId(product))}</g:id>
      <g:title>${escapeXml(product.name)}</g:title>
      <g:description>${escapeXml(product.shortDescription || product.description)}</g:description>
      <g:link>${escapeXml(productUrl)}</g:link>
      ${imageLink ? `<g:image_link>${escapeXml(imageLink)}</g:image_link>` : ""}
      <g:availability>${availability(product.availability)}</g:availability>${priceBlock}
      <g:brand>${escapeXml(brand)}</g:brand>
      <g:mpn>${escapeXml(fullMpn)}</g:mpn>
      ${gtin ? `<g:gtin>${escapeXml(gtin)}</g:gtin>` : ""}
      <g:condition>new</g:condition>
      <g:product_type>${escapeXml(product.category)}</g:product_type>
      <g:custom_label_0>${STORE_NAME}</g:custom_label_0>${SHIPPING_BLOCKS}
    </item>`
  }).join("")

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${STORE_NAME} (${locale})</title>
    <link>${BASE_URL}/${locale}</link>
    <description>Product feed for ${STORE_NAME} in ${locale}</description>${items}
  </channel>
</rss>`
}

export function xmlResponse(xml: string): Response {
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  })
}
