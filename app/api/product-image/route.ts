import { type NextRequest, NextResponse } from "next/server"
import { get } from "@vercel/blob"

// Public catalog images live in a private Blob store, so they are streamed
// through this route. Responses are cached aggressively (immutable) — after the
// first request the Vercel CDN serves the bytes without hitting this function.
export async function GET(request: NextRequest) {
  const pathname = request.nextUrl.searchParams.get("pathname")

  if (!pathname || !pathname.startsWith("products/")) {
    return NextResponse.json({ error: "Invalid pathname" }, { status: 400 })
  }

  try {
    const result = await get(pathname, {
      access: "private",
      ifNoneMatch: request.headers.get("if-none-match") ?? undefined,
    })

    if (!result) {
      return new NextResponse("Not found", { status: 404 })
    }

    if (result.statusCode === 304) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          ETag: result.blob.etag,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      })
    }

    return new NextResponse(result.stream, {
      headers: {
        "Content-Type": result.blob.contentType,
        ETag: result.blob.etag,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error) {
    console.error("[v0] product-image serve error:", error)
    return NextResponse.json({ error: "Failed to serve image" }, { status: 500 })
  }
}
