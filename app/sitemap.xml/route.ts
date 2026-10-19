import { loadSitemapCatalog, sitemapIndexXml, sitemapResponse } from "@/lib/seo/sitemap"

export const dynamic = "force-dynamic"

export async function GET() {
  const { newest } = await loadSitemapCatalog()
  return sitemapResponse(sitemapIndexXml(newest, newest))
}
