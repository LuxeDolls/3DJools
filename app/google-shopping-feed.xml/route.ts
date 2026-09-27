import { createGoogleShoppingFeed, xmlResponse } from "@/lib/feeds/google-shopping"

export const dynamic = "force-dynamic"

export async function GET() {
  return xmlResponse(await createGoogleShoppingFeed("en"))
}
