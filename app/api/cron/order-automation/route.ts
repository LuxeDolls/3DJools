import { NextResponse, type NextRequest } from "next/server"
import { revalidateTag } from "next/cache"
import { runOrderAutomation } from "@/lib/orders/automation"
import { STAMPED_REVIEWS_TAG } from "@/lib/reviews/stamped-reviews"
import { syncStampedRatings } from "@/lib/reviews/sync-ratings"

export const dynamic = "force-dynamic"
export const maxDuration = 60

/**
 * Vercel Cron hits this on a schedule (see vercel.json). It automatically
 * sends `Authorization: Bearer <CRON_SECRET>` when that env var is set, so
 * we require it here to stop anyone else from triggering fulfillment.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  const authHeader = request.headers.get("authorization")
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 })
  }

  const result = await runOrderAutomation()

  let reviewSync: { updated: number; cleared: number } | null = null
  try {
    reviewSync = await syncStampedRatings()
    revalidateTag(STAMPED_REVIEWS_TAG, "max")
  } catch (error) {
    console.error("[stamped] Scheduled rating sync failed:", error)
  }

  return NextResponse.json({
    ok: true,
    movedToProcessing: result.movedToProcessing.length,
    movedToShipped: result.movedToShipped.length,
    reviewSync,
  })
}
