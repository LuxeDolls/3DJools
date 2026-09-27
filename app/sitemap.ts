import type { MetadataRoute } from "next"
import { locales } from "@/lib/i18n/config"
import { getSitemapProducts, allCategorySlugs } from "@/lib/catalog"
import { SITE_ORIGIN } from "@/lib/catalog/image-urls"

const BASE = SITE_ORIGIN

const unlistedCategories = new Set(["filaments", "spare-parts"])

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = [
    "",
    "/catalog",
    "/brands",
    "/deals",
    "/contact",
    "/about",
    "/faq",
    "/shipping",
    "/returns",
    "/payment-methods",
    "/terms",
    "/privacy",
    "/impressum",
    "/cookie-policy",
    "/instalment-agreement",
  ]

  const products = await getSitemapProducts()
  const categories = allCategorySlugs.filter((category) => !unlistedCategories.has(category))
  const brandSlugs = [...new Set(products.map((product) => product.brandSlug))].sort()
  const entries: MetadataRoute.Sitemap = []

  for (const locale of locales) {
    for (const path of staticPaths) {
      entries.push({
        url: `${BASE}/${locale}${path}`,
        changeFrequency: "weekly",
        priority: path === "" ? 1 : 0.7,
      })
    }
    for (const category of categories) {
      const updated = products
        .filter((product) => product.category === category)
        .map((product) => product.updatedAt)
      entries.push({
        url: `${BASE}/${locale}/catalog/${category}`,
        lastModified: updated.length ? new Date(Math.max(...updated.map((date) => date.getTime()))) : undefined,
        changeFrequency: "weekly",
        priority: 0.8,
      })
    }
    for (const slug of brandSlugs) {
      const updated = products
        .filter((product) => product.brandSlug === slug)
        .map((product) => product.updatedAt)
      entries.push({
        url: `${BASE}/${locale}/brands/${slug}`,
        lastModified: new Date(Math.max(...updated.map((date) => date.getTime()))),
        changeFrequency: "weekly",
        priority: 0.6,
      })
    }
    for (const product of products) {
      entries.push({
        url: `${BASE}/${locale}/product/${product.slug}`,
        lastModified: product.updatedAt,
        changeFrequency: "weekly",
        priority: 0.7,
      })
    }
  }

  return entries
}
