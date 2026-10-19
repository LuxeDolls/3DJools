import { NextResponse, type NextRequest } from "next/server"
import { locales, defaultLocale, localeFromCountry } from "@/lib/i18n/config"

function detectLocale(request: NextRequest): string {
  // 1. Explicit cookie preference wins.
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value
  if (cookieLocale && (locales as readonly string[]).includes(cookieLocale)) {
    return cookieLocale
  }

  // 2. Fall back to Accept-Language negotiation.
  const accept = request.headers.get("accept-language")
  if (accept) {
    const preferred = accept
      .split(",")
      .map((part) => {
        const [tag, q] = part.trim().split(";q=")
        return { tag: tag.toLowerCase().split("-")[0], q: q ? Number(q) : 1 }
      })
      .sort((a, b) => b.q - a.q)

    for (const { tag } of preferred) {
      if ((locales as readonly string[]).includes(tag)) return tag
    }
  }

  // 3. Fall back to IP-based geo location. The CDN injects the visitor's
  // country as an ISO-3166 alpha-2 code; map it to the closest locale.
  const country =
    request.headers.get("x-vercel-ip-country") ??
    request.headers.get("x-country") ??
    null
  const geoLocale = localeFromCountry(country)
  if (geoLocale) return geoLocale

  return defaultLocale
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const host = request.headers.get("host")?.split(":")[0]

  // The image host only serves catalog photos. robots.txt and image files
  // are outside this matcher; everything else must not duplicate the storefront.
  if (host === "images.dnd3d.com" || host === "images.3djools.com") {
    return new NextResponse("Not found", { status: 404 })
  }

  // The OAuth callback stays on www, but shoppers use the apex domain.
  // Page requests must not split the session across the two hosts.
  if (host === "www.dnd3d.com") {
    const url = request.nextUrl.clone()
    url.hostname = "dnd3d.com"
    url.protocol = "https:"
    return NextResponse.redirect(url, 308)
  }

  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  )
  if (hasLocale) return NextResponse.next()

  const locale = detectLocale(request)
  const url = request.nextUrl.clone()
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`

  const response = NextResponse.redirect(url)
  response.cookies.set("NEXT_LOCALE", locale, { maxAge: 60 * 60 * 24 * 365, path: "/" })
  return response
}

export const config = {
  // Skip Next internals, API routes, the (non-localized) admin console, and
  // files with an extension (assets).
  matcher: ["/((?!api|admin|_next/static|_next/image|.*\\..*).*)"],
}
