import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { isAdmin } from "@/lib/admin-auth"

const MAX_BYTES = 8 * 1024 * 1024
const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
}

// Admin-only upload for catalog photos. Files land in the public Blob store
// under products/ and are served directly from the CDN URL (no /api proxy),
// so they're crawlable by Googlebot for Google Merchant Center.
export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const form = await request.formData()
  const file = form.get("file")
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 8 MB)" }, { status: 400 })
  }
  const ext = EXT_BY_TYPE[file.type]
  if (!ext) {
    return NextResponse.json({ error: "Unsupported image type" }, { status: 400 })
  }

  const seed = (form.get("slug") as string | null)?.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "product"
  const pathname = `products/${seed}-${Date.now()}.${ext}`

  try {
    const blob = await put(pathname, file, {
      access: "public",
      addRandomSuffix: false,
      contentType: file.type,
      token: process.env.BLOB_PUBLIC_READ_WRITE_TOKEN,
    })
    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error("[v0] product image upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
