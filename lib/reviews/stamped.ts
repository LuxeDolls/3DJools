import type { OrderWithItems } from "@/lib/orders/queries"

export const STAMPED_PUBLIC_API_KEY =
  process.env.STAMPED_PUBLIC_KEY ||
  process.env.NEXT_PUBLIC_STAMPED_PUBLIC_KEY ||
  "1b1500a0-8c0b-4c15-8338-1da52e8d7012"

export const STAMPED_STORE_HASH =
  process.env.STAMPED_STORE_HASH ||
  process.env.NEXT_PUBLIC_STAMPED_STORE_HASH ||
  "3deureka.com"

const STAMPED_PRIVATE_API_KEY =
  process.env.STAMPED_PRIVATE_KEY ||
  "b8effe0228c4eb798876fad679058aeb7c8a10d8ea3ef173f0098e5f710df53e"

function splitCustomerName(fullName: string | null | undefined, email: string) {
  const cleaned = (fullName || "").trim()
  if (!cleaned) {
    const fallback = email.split("@")[0] || "Customer"
    return { firstName: fallback, lastName: "" }
  }
  const parts = cleaned.split(/\s+/)
  return {
    firstName: parts[0] || "Customer",
    lastName: parts.slice(1).join(" "),
  }
}

function absoluteProductImageUrl(img: string | null | undefined): string | undefined {
  if (!img) return undefined
  if (img.startsWith("http://") || img.startsWith("https://")) return img
  return `https://www.3deureka.com${img.startsWith("/") ? "" : "/"}${img}`
}

/**
 * Pushes an order to Stamped.io so Stamped can schedule and send a verified
 * review-request email to the customer.
 */
export async function pushOrderToStamped(order: OrderWithItems): Promise<void> {
  if (!STAMPED_PUBLIC_API_KEY || !STAMPED_PRIVATE_API_KEY || !STAMPED_STORE_HASH) {
    return
  }
  if (!order.items || order.items.length === 0) {
    return
  }

  const { firstName, lastName } = splitCustomerName(order.shippingName, order.email)
  const basicAuth = Buffer.from(
    `${STAMPED_PUBLIC_API_KEY}:${STAMPED_PRIVATE_API_KEY}`,
  ).toString("base64")

  const payload = {
    email: order.email,
    firstName,
    lastName,
    location: order.shippingCountry || undefined,
    orderNumber: order.orderNumber,
    orderId: order.id,
    orderCurrencyISO: order.currency || "EUR",
    orderTotal: Number((order.totalCents / 100).toFixed(2)),
    orderSource: "api",
    orderDate: (order.createdAt instanceof Date
      ? order.createdAt
      : new Date(order.createdAt)
    ).toISOString(),
    itemsList: order.items.map((item) => ({
      productId: item.productId,
      productDescription: item.productName,
      productBrand: item.brandName || undefined,
      productTitle: item.productName,
      productPrice: Number((item.unitPriceCents / 100).toFixed(2)),
      productType: undefined,
      productSKU: item.productSlug,
      productImageUrl: absoluteProductImageUrl(item.image),
      productUrl: `https://www.3deureka.com/en/product/${item.productSlug}`,
      quantity: item.quantity,
    })),
  }

  const endpoint = `https://stamped.io/api/v2/${encodeURIComponent(STAMPED_STORE_HASH)}/orders`

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    console.warn(`[stamped] Order push returned ${res.status}: ${text.slice(0, 200)}`)
  }
}
