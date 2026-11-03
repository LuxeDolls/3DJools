import { NextResponse, type NextRequest } from "next/server"
import { confirmSkrillNotification } from "@/lib/payments/skrill-order"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const contentType = request.headers.get("content-type")
  try {
    const result = await confirmSkrillNotification(rawBody, contentType)
    return new NextResponse(result.ok ? "OK" : (result.reason ?? "error"), {
      status: result.httpStatus,
      headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
    })
  } catch (err) {
    console.error("[v0] Skrill webhook processing failed:", err instanceof Error ? err.message : "unknown")
    return new NextResponse("temporary_error", {
      status: 503,
      headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
    })
  }
}
