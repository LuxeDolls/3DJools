import { isAdmin } from "@/lib/admin-auth"
import { getPrivateBlob, listAllBlobs } from "@/lib/backup/blob"
import * as archiver from "archiver"
import { Readable } from "node:stream"
import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const blobs = await listAllBlobs()
  const archive = new archiver.ZipArchive({ zlib: { level: 6 } })
  const archiveStream = Readable.toWeb(archive) as ReadableStream<Uint8Array>

  void (async () => {
    try {
      for (const blob of blobs) {
        const result = await getPrivateBlob(blob.pathname)
        if (!result) continue
        archive.append(Readable.fromWeb(result.stream as Parameters<typeof Readable.fromWeb>[0]), {
          name: blob.pathname,
        })
      }
      await archive.finalize()
    } catch (error) {
      archive.destroy(error instanceof Error ? error : new Error("Blob archive failed"))
    }
  })()

  return new NextResponse(archiveStream, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="dnd3d-storage-${new Date().toISOString().slice(0, 10)}.zip"`,
      "Cache-Control": "no-store",
    },
  })
}
