import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

const MAX_BYTES = 8 * 1024 * 1024 // 8 MB
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "application/pdf"])

/**
 * Uploads a customer's ID document to PRIVATE Blob storage for KYC.
 * Returns only the pathname (never a public URL) — the document can only be
 * viewed later by an authenticated admin through /api/admin/id-document.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }
    if (!ALLOWED.has(file.type)) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 415 })
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "File too large (max 8 MB)" }, { status: 413 })
    }

    const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin"
    const key = `id-documents/${crypto.randomUUID()}.${ext}`

    const blob = await put(key, file, { access: "private", addRandomSuffix: false })

    // Return only the pathname — private blobs are served via an admin-gated route.
    return NextResponse.json({ pathname: blob.pathname })
  } catch (error) {
    console.error("[v0] ID upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
