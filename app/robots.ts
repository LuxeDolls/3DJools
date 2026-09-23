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

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow,
      },
      {
        userAgent: "Googlebot-Image",
        allow: "/",
        disallow,
      },
      {
        userAgent: "*",
        allow: "/",
        disallow,
      },
    ],
    sitemap: "https://3djools.com/sitemap.xml",
  }
}
