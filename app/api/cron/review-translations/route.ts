import { NextResponse, type NextRequest } from "next/server"
import { translateMissingReviews } from "@/lib/reviews/translations"

export const dynamic = "force-dynamic"
export const maxDuration = 300

/** Translates new or edited Stamped reviews into every site language. */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 })
  }

  try {
    const result = await translateMissingReviews({ budgetMs: 240_000 })
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    console.error("[reviews] Scheduled review translation failed:", error)
    return NextResponse.json({ ok: false, error: "translation_failed" }, { status: 500 })
  }
}
