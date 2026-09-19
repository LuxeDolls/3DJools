import type { MetadataRoute } from "next"
import { locales } from "@/lib/i18n/config"
import { getAllProductSlugs, getAllBrandSlugs, allCategorySlugs } from "@/lib/catalog"

const BASE = "https://3djools.com"

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
    "/track-order",
    "/terms",
    "/privacy",
    "/impressum",
    "/cookie-policy",
    "/instalment-agreement",
  ]

  const [productSlugs, brandSlugs] = await Promise.all([getAllProductSlugs(), getAllBrandSlugs()])
  const entries: MetadataRoute.Sitemap = []

  for (const locale of locales) {
    for (const path of staticPaths) {
      entries.push({
        url: `${BASE}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: path === "" ? 1 : 0.7,
      })
    }
    for (const category of allCategorySlugs) {
      entries.push({ url: `${BASE}/${locale}/catalog/${category}`, changeFrequency: "weekly", priority: 0.8 })
    }
    for (const slug of brandSlugs) {
      entries.push({ url: `${BASE}/${locale}/brands/${slug}`, changeFrequency: "weekly", priority: 0.6 })
    }
    for (const slug of productSlugs) {
      entries.push({ url: `${BASE}/${locale}/product/${slug}`, changeFrequency: "weekly", priority: 0.7 })
    }
  }

  return entries
}
