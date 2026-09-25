/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return {
      // images.3djools.com/products/... is the dedicated image host.
      // Rewrite internally so the response is 200, not a redirect, and
      // robots.txt on that host stays served by the app.
      beforeFiles: [
        {
          source: "/products/:path*",
          has: [{ type: "host", value: "images.3djools.com" }],
          destination: "/media/products/:path*",
        },
      ],
    }
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=63072000" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ]
  },
}

export default nextConfig
