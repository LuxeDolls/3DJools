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

// Catalog photos now live on the public Blob CDN (blob.vercel-storage.com),
// not proxied through /api/product-image, so Google Merchant Center no
// longer depends on this exception. Kept as a harmless safety net for the
// legacy route (still serves old cached/external links) and any other public
// /api/ endpoint that should stay crawlable despite the blanket Disallow: /api/ below.
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
