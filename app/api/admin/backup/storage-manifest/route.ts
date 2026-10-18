import { isAdmin } from "@/lib/admin-auth"
import { listAllBlobs } from "@/lib/backup/blob"
import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const blobs = await listAllBlobs()
  const manifest = {
    format: "dnd3d-blob-manifest",
    version: 1,
    generatedAt: new Date().toISOString(),
    count: blobs.length,
    totalBytes: blobs.reduce((total, blob) => total + blob.size, 0),
    files: blobs.map(({ pathname, url, downloadUrl, size, uploadedAt, etag }) => ({
      pathname,
      url,
      downloadUrl,
      size,
      uploadedAt: uploadedAt.toISOString(),
      etag,
    })),
  }

  return new NextResponse(JSON.stringify(manifest, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="dnd3d-storage-manifest-${new Date().toISOString().slice(0, 10)}.json"`,
      "Cache-Control": "no-store",
    },
  })
}
