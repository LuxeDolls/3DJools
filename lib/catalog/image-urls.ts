/** Public catalog photos are stored on Vercel Blob, but Google Merchant Center
 *  refuses to review a product when the image host has no robots.txt that
 *  names Googlebot and Googlebot-Image. Serve those files from our own
 *  domains instead, with no redirect in front of the image response.
 *
 *  Pages use a same-origin /media path so the HTML does not name a host.
 *  Feeds and schema use SITE_ORIGIN.
 */
export const SITE_ORIGIN = "https://www.dnd3d.com"
export const IMAGE_ORIGIN = "https://images.dnd3d.com"
const OWN_HOSTS = new Set([
  "dnd3d.com",
  "www.dnd3d.com",
  "images.dnd3d.com",
  "3djools.com",
  "www.3djools.com",
  "images.3djools.com",
])
export const PUBLIC_BLOB_HOST = "6iwpszoiwj016as8.public.blob.vercel-storage.com"
export const PUBLIC_BLOB_ORIGIN = `https://${PUBLIC_BLOB_HOST}`

export function storefrontImageUrl(image: string | undefined | null): string | undefined {
  if (!image) return undefined

  if (image.startsWith("/api/product-image")) {
    const pathname = new URL(image, SITE_ORIGIN).searchParams.get("pathname")
    if (!pathname) return undefined
    return mediaPath(pathname)
  }

  if (image.startsWith("/")) return image

  try {
    const url = new URL(image)
    if (url.hostname === PUBLIC_BLOB_HOST) return mediaPath(url.pathname)
    if (OWN_HOSTS.has(url.hostname)) {
      return url.hostname.startsWith("images.")
        ? mediaPath(url.pathname.replace(/^\/media\//, ""))
        : `${url.pathname}${url.search}`
    }
    return image
  } catch {
    return image
  }
}

export function mediaPath(pathname: string): string {
  const clean = pathname.replace(/^\/+/, "").replace(/^media\//, "")
  return `/media/${clean}`
}

export function mediaUrl(pathname: string): string {
  return `${SITE_ORIGIN}${mediaPath(pathname)}`
}

export function imageHostUrl(pathname: string): string {
  const clean = pathname.replace(/^\/+/, "")
  return `${IMAGE_ORIGIN}/${clean}`
}
