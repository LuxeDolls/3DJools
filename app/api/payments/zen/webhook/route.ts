import { NextResponse, type NextRequest } from "next/server"
import { confirmZenNotification } from "@/lib/payments/zen-order"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  try {
    const result = await confirmZenNotification(rawBody)
    if (!result.ok) {
      console.warn("[zen-webhook] rejected notification:", {
        httpStatus: result.httpStatus,
        reason: result.reason,
      })
    }
    return NextResponse.json(
      result.ok ? { status: "OK" } : { status: "ERROR", reason: result.reason ?? "error" },
      {
        status: result.httpStatus,
        headers: { "cache-control": "no-store" },
      },
    )
  } catch (err) {
    console.error("[v0] ZEN webhook processing failed:", err instanceof Error ? err.message : "unknown")
    return NextResponse.json(
      { status: "ERROR", reason: "temporary_error" },
      { status: 503, headers: { "cache-control": "no-store" } },
    )
  }
}
