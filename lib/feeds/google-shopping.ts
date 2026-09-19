import type { Locale } from "@/lib/i18n/config"
import { getAllProducts } from "@/lib/catalog"

const BASE_URL = "https://3djools.com"
const STORE_NAME = "3DJools"

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
  if (!image) return undefined
  return image.startsWith("http") ? image : `${BASE_URL}${image.startsWith("/") ? "" : "/"}${image}`
}

function availability(value: string): string {
  if (value === "out_of_stock") return "out of stock"
  if (value === "preorder") return "preorder"
  return "in stock"
}

export async function createGoogleShoppingFeed(locale: Locale): Promise<string> {
  const products = await getAllProducts(locale)
  const items = products.map((product) => {
    const brand = product.brandName ?? product.brandSlug
    const gtin = product.ean ?? product.gtin
    const fullMpn = [brand, product.mpn].filter(Boolean).join(" ")
    const imageLink = absoluteImageUrl(product.images[0])
    const productUrl = `${BASE_URL}/${locale}/product/${encodeURIComponent(product.slug)}`
    const salePrice = product.compareAtCents && product.compareAtCents > product.priceCents
      ? `\n      <g:sale_price>${formatPrice(product.priceCents)}</g:sale_price>\n      <g:price>${formatPrice(product.compareAtCents)}</g:price>`
      : `\n      <g:price>${formatPrice(product.priceCents)}</g:price>`

    return `
    <item>
      <g:id>${escapeXml(product.id)}</g:id>
      <g:title>${escapeXml(product.name)}</g:title>
      <g:description>${escapeXml(product.shortDescription || product.description)}</g:description>
      <g:link>${escapeXml(productUrl)}</g:link>
      ${imageLink ? `<g:image_link>${escapeXml(imageLink)}</g:image_link>` : ""}
      <g:availability>${availability(product.availability)}</g:availability>${salePrice}
      <g:brand>${escapeXml(brand)}</g:brand>
      <g:mpn>${escapeXml(fullMpn)}</g:mpn>
      ${gtin ? `<g:gtin>${escapeXml(gtin)}</g:gtin>` : ""}
      <g:condition>new</g:condition>
      <g:product_type>${escapeXml(product.category)}</g:product_type>
      <g:custom_label_0>${STORE_NAME}</g:custom_label_0>
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
