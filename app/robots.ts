import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: ["Googlebot", "Googlebot-Image"],
        allow: "/",
        disallow: [
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
        ],
      },
      {
        userAgent: "*",
        allow: "/",
        disallow: [
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
        ],
      },
    ],
    sitemap: "https://3djools.com/sitemap.xml",
  }
}
