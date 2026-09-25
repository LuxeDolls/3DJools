import { PUBLIC_BLOB_ORIGIN } from "@/lib/catalog/image-urls"

export const dynamic = "force-dynamic"

/** Stream a public catalog photo from Blob while the browser and Googlebot
 *  stay on our domain. Only `products/` is allowed — this is not an open proxy. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params
  const pathname = path.map((segment) => decodeURIComponent(segment)).join("/")

  if (
    path.length === 0 ||
    path.some((segment) => segment === "" || segment === "." || segment === "..") ||
    !pathname.startsWith("products/")
  ) {
    return new Response("Not found", { status: 404 })
  }

  const upstream = await fetch(`${PUBLIC_BLOB_ORIGIN}/${path.map(encodeURIComponent).join("/")}`, {
    cache: "force-cache",
  })

  if (!upstream.ok || !upstream.body) {
    return new Response("Not found", { status: 404 })
  }

  const contentType = upstream.headers.get("content-type") ?? "application/octet-stream"
  if (!contentType.startsWith("image/")) {
    return new Response("Not found", { status: 404 })
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      "X-Content-Type-Options": "nosniff",
    },
  })
}
