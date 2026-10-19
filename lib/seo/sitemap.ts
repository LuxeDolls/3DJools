import "server-only"

import { locales, localeHreflang } from "@/lib/i18n/config"
import { allCategorySlugs, getSitemapProducts } from "@/lib/catalog"
import { SITE_ORIGIN } from "@/lib/catalog/image-urls"

const BASE = SITE_ORIGIN
const unlistedCategories = new Set(["spare-parts"])

export const SITEMAP_INDEX = `${BASE}/sitemap.xml`
export const PAGE_SITEMAP = `${BASE}/sitemaps/pages.xml`
export const PRODUCT_SITEMAP = `${BASE}/sitemaps/products.xml`

type ChangeFrequency = "daily" | "weekly" | "monthly" | "yearly"

type SitemapPath = {
  path: string
  lastModified?: Date
  changeFrequency: ChangeFrequency
  priority: number
}

const staticPages: SitemapPath[] = [
  { path: "", changeFrequency: "daily", priority: 1 },
  { path: "/catalog", changeFrequency: "daily", priority: 0.9 },
  { path: "/deals", changeFrequency: "daily", priority: 0.8 },
  { path: "/brands", changeFrequency: "weekly", priority: 0.7 },
  { path: "/support", changeFrequency: "monthly", priority: 0.6 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.6 },
  { path: "/about", changeFrequency: "monthly", priority: 0.5 },
  { path: "/faq", changeFrequency: "monthly", priority: 0.5 },
  { path: "/shipping", changeFrequency: "monthly", priority: 0.4 },
  { path: "/track", changeFrequency: "monthly", priority: 0.4 },
  { path: "/returns", changeFrequency: "yearly", priority: 0.3 },
  { path: "/payment-methods", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.2 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.2 },
  { path: "/impressum", changeFrequency: "yearly", priority: 0.2 },
  { path: "/cookie-policy", changeFrequency: "yearly", priority: 0.2 },
  { path: "/instalment-agreement", changeFrequency: "yearly", priority: 0.2 },
]

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;")
}

function pageUrl(locale: string, path: string): string {
  return encodeURI(`${BASE}/${locale}${path}`)
}

function latest(dates: Date[]): Date | undefined {
  if (dates.length === 0) return undefined
  return new Date(Math.max(...dates.map((date) => date.getTime())))
}

function alternates(path: string): string {
  const links = [
    ...locales.map((locale) => [localeHreflang[locale], pageUrl(locale, path)] as const),
    ["x-default", pageUrl("en", path)] as const,
  ]
  return links
    .map(([lang, href]) => `    <xhtml:link rel="alternate" hreflang="${lang}" href="${escapeXml(href)}" />`)
    .join("\n")
}

function urlBlock(entry: SitemapPath): string {
  return locales
    .map((locale) => {
      const modified = entry.lastModified ? `\n  <lastmod>${entry.lastModified.toISOString()}</lastmod>` : ""
      return `<url>
  <loc>${escapeXml(pageUrl(locale, entry.path))}</loc>${modified}
  <changefreq>${entry.changeFrequency}</changefreq>
  <priority>${entry.priority.toFixed(1)}</priority>
${alternates(entry.path)}
</url>`
    })
    .join("\n")
}

function urlset(entries: SitemapPath[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.map(urlBlock).join("\n")}
</urlset>
`
}

export async function loadSitemapCatalog() {
  const products = await getSitemapProducts()
  const categories = allCategorySlugs.filter((category) => !unlistedCategories.has(category))
  const brandSlugs = [...new Set(products.map((product) => product.brandSlug))].sort()
  return { products, categories, brandSlugs, newest: latest(products.map((product) => product.updatedAt)) }
}

export async function pagesSitemapXml(): Promise<{ xml: string; lastModified?: Date }> {
  const { products, categories, brandSlugs, newest } = await loadSitemapCatalog()
  const entries: SitemapPath[] = [
    ...staticPages.map((page) => ({ ...page, lastModified: page.path === "" || page.path === "/catalog" || page.path === "/deals" ? newest : undefined })),
    ...categories.map((category) => ({
      path: `/catalog/${category}`,
      lastModified: latest(products.filter((product) => product.category === category).map((product) => product.updatedAt)),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...brandSlugs.map((slug) => ({
      path: `/brands/${slug}`,
      lastModified: latest(products.filter((product) => product.brandSlug === slug).map((product) => product.updatedAt)),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ]
  return { xml: urlset(entries), lastModified: newest }
}

export async function productsSitemapXml(): Promise<{ xml: string; lastModified?: Date }> {
  const { products, newest } = await loadSitemapCatalog()
  const entries = products.map((product) => ({
    path: `/product/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }))
  return { xml: urlset(entries), lastModified: newest }
}

export function sitemapIndexXml(pagesModified?: Date, productsModified?: Date): string {
  const item = (loc: string, modified?: Date) => `<sitemap>
  <loc>${escapeXml(loc)}</loc>${modified ? `\n  <lastmod>${modified.toISOString()}</lastmod>` : ""}
</sitemap>`
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${item(PAGE_SITEMAP, pagesModified)}
${item(PRODUCT_SITEMAP, productsModified)}
</sitemapindex>
`
}

export function sitemapResponse(xml: string): Response {
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  })
}
