import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/checkout", "/admin"],
    },
    sitemap: "https://voltika3d.example/sitemap.xml",
  }
}
