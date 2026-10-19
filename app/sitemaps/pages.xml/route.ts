import { pagesSitemapXml, sitemapResponse } from "@/lib/seo/sitemap"

export const dynamic = "force-dynamic"

export async function GET() {
  const { xml } = await pagesSitemapXml()
  return sitemapResponse(xml)
}
