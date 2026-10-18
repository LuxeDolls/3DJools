import { NextResponse } from "next/server"
import { placeOrder, type PlaceOrderInput } from "@/lib/actions/orders"
import { isLocale } from "@/lib/i18n/config"
import { localizedPath } from "@/lib/i18n/paths"
import { toIsoDate } from "@/lib/payments/cardholder"

export const dynamic = "force-dynamic"

function sameSite(request: Request): boolean {
  const hosts = [request.headers.get("host"), request.headers.get("x-forwarded-host")]
    .flatMap((value) => (value ? value.split(",").map((part) => part.trim()) : []))
  const origin = request.headers.get("origin") ?? request.headers.get("referer")
  if (!origin || hosts.length === 0) return false
  try {
    const source = new URL(origin)
    return hosts.some((host) => host === source.host || host.split(":")[0] === source.hostname)
  } catch {
    return false
  }
}

function redirectTo(path: string) {
  // Relative, so a preview iframe does not get sent to the sandbox's localhost.
  return new NextResponse(null, {
    status: 303,
    headers: { location: path, "cache-control": "no-store" },
  })
}

function fail(locale: string, error: string) {
  const path = `${localizedPath(isLocale(locale) ? locale : "en", "/checkout")}?error=${encodeURIComponent(error)}`
  return redirectTo(path)
}

function paymentBridge(url: string) {
  const scriptUrl = JSON.stringify(url).replace(/</g, "\\u003c")
  const href = url.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;")
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Payment</title></head><body><p><a href="${href}">Continue to payment</a></p><script>var u=${scriptUrl};try{if(window.top&&window.top!==window)window.top.location.replace(u);else location.replace(u)}catch(e){location.replace(u)}</script></body></html>`
  return new NextResponse(html, {
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
  })
}

/** Document POST so the browser follows the payment redirect even inside the preview iframe. */
export async function POST(request: Request) {
  const form = await request.formData()
  const str = (key: string) => String(form.get(key) ?? "").trim()
  const locale = str("locale")
  if (!sameSite(request)) return fail(locale, "order_failed")

  let items: PlaceOrderInput["items"] = []
  try {
    const parsed = JSON.parse(str("items")) as unknown
    if (!Array.isArray(parsed) || parsed.length < 1 || parsed.length > 50) return fail(locale, "empty_cart")
    items = parsed.flatMap((line) => {
      if (!line || typeof line !== "object") return []
      const row = line as { slug?: unknown; quantity?: unknown; brand?: unknown; image?: unknown }
      const slug = typeof row.slug === "string" ? row.slug : ""
      const quantity = typeof row.quantity === "number" ? row.quantity : Number(row.quantity)
      if (!slug || !Number.isFinite(quantity)) return []
      return [{
        slug,
        quantity,
        brand: typeof row.brand === "string" ? row.brand : undefined,
        image: typeof row.image === "string" ? row.image : undefined,
      }]
    })
  } catch {
    return fail(locale, "empty_cart")
  }
  if (items.length < 1) return fail(locale, "empty_cart")

  const payment = str("payment")
  if (!["card", "alppay", "paypal", "square", "sepa", "installments"].includes(payment)) {
    return fail(locale, "order_failed")
  }

  try {
    const result = await placeOrder({
      email: str("email"),
      firstName: str("firstName"),
      lastName: str("lastName"),
      address: str("address"),
      city: str("city"),
      postalCode: str("postalCode"),
      country: str("country"),
      phone: str("phone"),
      region: str("billingRegion"),
      cardholderName: str("cardholderName"),
      dateOfBirth: toIsoDate(str("dateOfBirth")) ?? undefined,
      payment: payment as PlaceOrderInput["payment"],
      cryptoCoin: payment === "crypto" ? str("cryptoCoin") : undefined,
      termsAccepted: form.get("termsAccepted") === "on",
      locale,
      items,
    })
    if (!result.ok) return fail(locale, result.error)
    if (result.paymentUrl) return paymentBridge(result.paymentUrl)
    return redirectTo(localizedPath(isLocale(locale) ? locale : "en", `/order/${result.orderNumber}`))
  } catch (err) {
    console.error("[v0] Checkout submit failed:", err)
    return fail(locale, "order_failed")
  }
}
