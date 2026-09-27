import { isLocale } from "@/lib/i18n/config"
import { createGoogleShoppingFeed, xmlResponse } from "@/lib/feeds/google-shopping"

export const dynamic = "force-dynamic"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ lang: string }> },
) {
  const { lang } = await params
  if (lang === "ru" || lang.toLowerCase().startsWith("ru-") || lang.toLowerCase().startsWith("ru_") || !isLocale(lang)) {
    return new Response("Not found", { status: 404 })
  }

  return xmlResponse(await createGoogleShoppingFeed(lang))
}
