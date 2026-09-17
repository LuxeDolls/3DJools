import { type NextRequest, NextResponse } from "next/server"
import { get } from "@vercel/blob"
import { isAdmin } from "@/lib/admin-auth"

/**
 * Serves a customer's private ID document — ADMIN ONLY. Private Blob URLs are
 * never exposed to the client; the admin UI fetches through this gated route.
 */
export async function GET(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const pathname = request.nextUrl.searchParams.get("pathname")
  if (!pathname || !pathname.startsWith("id-documents/")) {
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
        headers: { ETag: result.blob.etag, "Cache-Control": "private, no-cache" },
      })
    }

    return new NextResponse(result.stream, {
      headers: {
        "Content-Type": result.blob.contentType,
        ETag: result.blob.etag,
        "Cache-Control": "private, no-cache",
      },
    })
  } catch (error) {
    console.error("[v0] ID document serve error:", error)
    return NextResponse.json({ error: "Failed to serve document" }, { status: 500 })
  }
}
