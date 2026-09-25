/** Public catalog photos are stored on Vercel Blob, but Google Merchant Center
 *  refuses to review a product when the image host has no robots.txt that
 *  names Googlebot and Googlebot-Image. Serve those files from our own
 *  domains instead, with no redirect in front of the image response.
 *
 *  - www.3djools.com/media/<pathname>     (feed, product pages, no redirect)
 *  - images.3djools.com/media/<pathname>  (same bytes, kept as a second host)
 */
export const SITE_ORIGIN = "https://www.3djools.com"
export const IMAGE_ORIGIN = "https://images.3djools.com"
export const PUBLIC_BLOB_HOST = "6iwpszoiwj016as8.public.blob.vercel-storage.com"
export const PUBLIC_BLOB_ORIGIN = `https://${PUBLIC_BLOB_HOST}`

export function storefrontImageUrl(image: string | undefined | null): string | undefined {
  if (!image) return undefined

  if (image.startsWith("/api/product-image")) {
    const pathname = new URL(image, SITE_ORIGIN).searchParams.get("pathname")
    if (!pathname) return undefined
    return mediaUrl(pathname)
  }

  if (image.startsWith("/")) return `${SITE_ORIGIN}${image}`

  try {
    const url = new URL(image)
    if (url.hostname === PUBLIC_BLOB_HOST) return mediaUrl(url.pathname)
    if (url.hostname === "3djools.com") return `${SITE_ORIGIN}${url.pathname}${url.search}`
    if (url.hostname === "images.3djools.com") return mediaUrl(url.pathname.replace(/^\/media\//, ""))
    if (url.hostname === "www.3djools.com") return image
    return image
  } catch {
    return image
  }
}

export function mediaUrl(pathname: string): string {
  const clean = pathname.replace(/^\/+/, "").replace(/^media\//, "")
  return `${SITE_ORIGIN}/media/${clean}`
}

export function imageHostUrl(pathname: string): string {
  const clean = pathname.replace(/^\/+/, "")
  return `${IMAGE_ORIGIN}/${clean}`
}
