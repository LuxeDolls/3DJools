import type { MetadataRoute } from "next"

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
]

// Catalog photos are public but streamed through /api/product-image. That path
// must stay allowed: Google Merchant Center fetches it with Googlebot-Image,
// and a blanket Disallow: /api/ makes those products fail policy checks.
const allow = ["/", "/api/product-image"]

export default function robots(): MetadataRoute.Robots {
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
    sitemap: "https://3djools.com/sitemap.xml",
  }
}
