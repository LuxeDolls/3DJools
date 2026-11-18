import crypto from "crypto"
import { revalidatePath, revalidateTag } from "next/cache"
import { NextResponse, type NextRequest } from "next/server"
import { and, eq, or, sql } from "drizzle-orm"
import { db } from "@/lib/db"
import { products, stampedReviews } from "@/lib/db/schema"
import { locales } from "@/lib/i18n/config"
import { STAMPED_PUBLIC_API_KEY } from "@/lib/reviews/stamped"
import { STAMPED_REVIEWS_TAG } from "@/lib/reviews/stamped-reviews"
import { syncStampedRatings } from "@/lib/reviews/sync-ratings"

const STAMPED_PRIVATE_API_KEY =
  process.env.STAMPED_PRIVATE_KEY ||
  "b8effe0228c4eb798876fad679058aeb7c8a10d8ea3ef173f0098e5f710df53e"

export const STAMPED_WEBHOOK_SECRET =
  process.env.STAMPED_WEBHOOK_SECRET || STAMPED_PRIVATE_API_KEY

function timingSafeMatch(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return crypto.timingSafeEqual(bufA, bufB)
}

function verifyStampedSecret(
  request: NextRequest,
  rawBody: string,
  routeToken?: string,
  parsedPayload?: Record<string, unknown>,
): boolean {
  const headerSecret =
    request.headers.get("x-stamped-webhook-secret")?.trim() ||
    request.headers.get("x-secret-key")?.trim() ||
    ""
  const signedHeader = request.headers.get("x-stamped-signed")?.trim() || ""
  const querySecret = request.nextUrl.searchParams.get("secret")?.trim() || ""
  const candidate = headerSecret || querySecret || (routeToken ? routeToken.trim() : "")

  const validSecrets = [
    process.env.STAMPED_WEBHOOK_SECRET?.trim(),
    STAMPED_PRIVATE_API_KEY,
    STAMPED_PUBLIC_API_KEY,
  ].filter((v): v is string => Boolean(v))

  if (candidate) {
    for (const secret of validSecrets) {
      if (timingSafeMatch(candidate, secret)) {
        return true
      }
      const hmacBody = crypto.createHmac("sha256", secret).update(rawBody).digest("hex")
      if (timingSafeMatch(candidate.toLowerCase(), hmacBody.toLowerCase())) {
        return true
      }
    }
    return false
  }

  if (signedHeader) {
    for (const secret of validSecrets) {
      const hmacBody = crypto.createHmac("sha256", secret).update(rawBody).digest("hex")
      if (timingSafeMatch(signedHeader.toLowerCase(), hmacBody.toLowerCase())) {
        return true
      }
      if (parsedPayload) {
        const accountId = String(parsedPayload.Shop_ID ?? parsedPayload.shopId ?? "")
        const customerId = String(parsedPayload.CustomerId ?? parsedPayload.customer_id ?? parsedPayload.id ?? "")
        const combo = `${accountId}${STAMPED_PUBLIC_API_KEY}${customerId}`
        const hmacCombo = crypto.createHmac("sha256", secret).update(combo).digest("hex")
        if (timingSafeMatch(signedHeader.toLowerCase(), hmacCombo.toLowerCase())) {
          return true
        }
      }
    }
    return false
  }

  // If STAMPED_WEBHOOK_SECRET is explicitly enforced via env, require a matching header/token.
  if (process.env.STAMPED_WEBHOOK_SECRET?.trim()) {
    return false
  }

  return true
}

function readStr(val: unknown): string | null {
  if (typeof val === "string") {
    const trimmed = val.trim()
    return trimmed.length > 0 ? trimmed : null
  }
  if (typeof val === "number" && Number.isFinite(val)) {
    return String(val)
  }
  return null
}

function readInt(val: unknown): number | null {
  if (typeof val === "number" && Number.isFinite(val)) {
    return Math.round(val)
  }
  if (typeof val === "string" && val.trim() !== "") {
    const parsed = Number(val)
    if (Number.isFinite(parsed)) return Math.round(parsed)
  }
  return null
}

function inferTopic(headerTopic: string | null, item: Record<string, unknown>): string {
  if (headerTopic && headerTopic.trim()) {
    return headerTopic.trim().toLowerCase()
  }
  if ("reviewRating" in item || "reviewMessage" in item || "reviewTitle" in item) {
    return "reviews"
  }
  if ("product_id" in item && "message" in item) {
    return "questions"
  }
  if ("SurveySource" in item || "QueueReviewEmailId" in item) {
    return "nps"
  }
  if ("orderNumber" in item && "body" in item) {
    return "checkout_comments"
  }
  if ("points" in item || "vip_tier_id" in item) {
    return "rewards"
  }
  return "reviews"
}

async function resolveCatalogProduct(
  rawProductId: string | null,
  rawProductSku: string | null,
): Promise<{ productId: string; slug: string } | null> {
  const candidates = [rawProductId, rawProductSku].filter((v): v is string => Boolean(v))
  if (candidates.length === 0) return null

  const conditions = candidates.flatMap((c) => [
    eq(products.productId, c),
    eq(products.slug, c),
    eq(products.mpn, c),
  ])

  const [matched] = await db
    .select({ productId: products.productId, slug: products.slug })
    .from(products)
    .where(or(...conditions))
    .limit(1)

  return matched ?? null
}

export async function handleStampedWebhook(
  request: NextRequest,
  routeToken?: string,
): Promise<NextResponse> {
  let rawBody = ""
  try {
    rawBody = await request.text()
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 })
  }

  let parsed: unknown = null
  if (rawBody.trim()) {
    try {
      parsed = JSON.parse(rawBody)
    } catch {
      try {
        const params = new URLSearchParams(rawBody)
        parsed = Object.fromEntries(params.entries())
      } catch {
        return NextResponse.json({ ok: false, error: "Invalid JSON payload" }, { status: 400 })
      }
    }
  } else {
    parsed = {}
  }

  const firstObj =
    Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === "object" && parsed[0] !== null
      ? (parsed[0] as Record<string, unknown>)
      : typeof parsed === "object" && parsed !== null
        ? (parsed as Record<string, unknown>)
        : undefined

  if (!verifyStampedSecret(request, rawBody, routeToken, firstObj)) {
    return NextResponse.json({ ok: false, error: "Unauthorized webhook signature" }, { status: 401 })
  }

  const items: Record<string, unknown>[] = Array.isArray(parsed)
    ? parsed.filter((x): x is Record<string, unknown> => typeof x === "object" && x !== null)
    : typeof parsed === "object" && parsed !== null
      ? Array.isArray((parsed as Record<string, unknown>).data)
        ? ((parsed as Record<string, unknown>).data as unknown[]).filter(
            (x): x is Record<string, unknown> => typeof x === "object" && x !== null,
          )
        : [parsed as Record<string, unknown>]
      : []

  const headerTopic = request.headers.get("x-stamped-topic")
  let processed = 0
  const touchedSlugs = new Set<string>()

  for (const item of items) {
    if (Object.keys(item).length === 0) continue

    const topic = inferTopic(headerTopic, item)
    const rawId = readStr(item.id ?? item.Id ?? item.reviewId) || crypto.randomUUID()
    const recordId = `${topic}:${rawId}`

    const rawProductId = readStr(item.productId ?? item.product_id ?? item.ShopProductId)
    const rawProductSku = readStr(item.productSKU ?? item.product_sku)
    const matchedProduct = await resolveCatalogProduct(rawProductId, rawProductSku)

    const productId = matchedProduct?.productId ?? rawProductId
    const productSlug = matchedProduct?.slug ?? rawProductSku

    const ratingVal = readInt(item.reviewRating ?? item.rating ?? item.Rating)
    const rating = ratingVal !== null && ratingVal >= 1 && ratingVal <= 5 ? ratingVal : null

    const author = readStr(item.author ?? item.name ?? item.customer_name)
    const customerEmail = readStr(item.customerEmail ?? item.customer_email ?? item.email)
    const title = readStr(item.reviewTitle ?? item.title ?? item.title_public)
    const message = readStr(item.reviewMessage ?? item.message ?? item.Body ?? item.body)
    const verifiedType = readInt(item.reviewVerifiedType ?? item.VerifiedType)
    const reply = readStr(item.reviewReply ?? item.Reply)

    const published =
      typeof item.published === "boolean"
        ? item.published
        : typeof item.isPublished === "boolean"
          ? item.isPublished
          : true

    await db
      .insert(stampedReviews)
      .values({
        id: recordId,
        topic,
        productId,
        productSlug,
        author,
        customerEmail,
        rating,
        title,
        message,
        verifiedType,
        reply,
        published,
        rawPayload: item,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: stampedReviews.id,
        set: {
          topic,
          productId,
          productSlug,
          author,
          customerEmail,
          rating,
          title,
          message,
          verifiedType,
          reply,
          published,
          rawPayload: item,
          updatedAt: new Date(),
        },
      })

    if (matchedProduct) touchedSlugs.add(matchedProduct.slug)

    processed += 1
  }

  if (processed > 0) {
    revalidateTag(STAMPED_REVIEWS_TAG, "max")
    try {
      await syncStampedRatings()
    } catch (error) {
      console.error("[stamped] Rating sync after webhook failed:", error)
    }
    revalidatePath(`/[lang]/reviews`, "page")
    for (const slug of touchedSlugs) {
      for (const locale of locales) {
        revalidatePath(`/${locale}/product/${slug}`)
      }
    }
  }

  return NextResponse.json({
    ok: true,
    received: true,
    provider: "stamped",
    processed,
  })
}
