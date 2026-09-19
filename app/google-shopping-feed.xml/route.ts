import { createGoogleShoppingFeed, xmlResponse } from "@/lib/feeds/google-shopping"

export async function GET() {
  return xmlResponse(await createGoogleShoppingFeed("en"))
}
