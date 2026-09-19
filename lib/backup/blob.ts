import { get, list, type ListBlobResultBlob } from "@vercel/blob"

export async function listAllBlobs(): Promise<ListBlobResultBlob[]> {
  const blobs: ListBlobResultBlob[] = []
  let cursor: string | undefined

  do {
    const page = await list({ limit: 1000, cursor })
    blobs.push(...page.blobs)
    cursor = page.hasMore ? page.cursor : undefined
  } while (cursor)

  return blobs
}

export async function getPrivateBlob(pathname: string) {
  return get(pathname, { access: "private" })
}
