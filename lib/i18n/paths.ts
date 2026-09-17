import type { Locale } from "./config"

/** Build a locale-prefixed path, e.g. localizedPath("de", "/catalog") -> "/de/catalog" */
export function localizedPath(locale: Locale, path = "/"): string {
  const clean = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`
  return `/${locale}${clean}`
}

/** Swap the locale segment of an existing pathname. */
export function switchLocaleInPath(pathname: string, nextLocale: Locale, locales: readonly string[]): string {
  const segments = pathname.split("/")
  // segments[0] is "" because pathname starts with "/"
  if (segments[1] && locales.includes(segments[1])) {
    segments[1] = nextLocale
  } else {
    segments.splice(1, 0, nextLocale)
  }
  return segments.join("/") || `/${nextLocale}`
}
