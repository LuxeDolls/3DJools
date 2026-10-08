import type { MetadataRoute } from "next"
import { headers } from "next/headers"
import { SITE_ORIGIN } from "@/lib/catalog/image-urls"

const disallow = [
  "/api/",
  "/admin",
  "/*/admin",
  "/*/account",
  "/*/cart",
  "/*/checkout",
  "/*/installments/apply",
  "/*/installments/*",
  "/*/order/*",
  "/*/search",
  "/*/sign-in",
  "/*/sign-up",
  "/*/track-order",
  "/*/product/test-card-payment",
]

// /media is the same-origin image proxy. /api/product-image stays allowed as a
// safety net for old links. Googlebot and Googlebot-Image are named explicitly
// because Merchant Center looks for those user-agents.
const allow = ["/", "/media", "/api/product-image"]

export default async function robots(): Promise<MetadataRoute.Robots> {
  const host = (await headers()).get("host")?.split(":")[0] ?? ""

  // Dedicated image host. Merchant Center checks robots.txt on the host that
  // serves the image, so this file must name Googlebot and Googlebot-Image.
  if (host === "images.3djools.com") {
    return {
      rules: [
        { userAgent: "Googlebot", allow: "/" },
        { userAgent: "Googlebot-Image", allow: "/" },
        { userAgent: "*", allow: "/" },
      ],
    }
  }

  return {
    rules: [
      {
        userAgent: "Googlebot",
        allow,
        disallow,
      },
      {
        userAgent: "Googlebot-Image",
        allow,
        disallow,
      },
      {
        userAgent: "*",
        allow,
        disallow,
      },
    ],
    sitemap: `${SITE_ORIGIN}/sitemap.xml`,
  }
}
