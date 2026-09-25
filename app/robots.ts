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

// Catalog photos are served directly from the public Blob CDN
// (blob.vercel-storage.com), not proxied through our own /api/ routes, so
// there's no need to carve out an exception to the blanket Disallow: /api/
// below for Google Merchant Center or any other crawler.
const allow = ["/"]

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
