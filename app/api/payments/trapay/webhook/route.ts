import { NextResponse, type NextRequest } from "next/server"
import { handleTrapayWebhook } from "@/lib/payments/trapay-webhook"

export const dynamic = "force-dynamic"

export async function GET() {
  return NextResponse.json({ ok: true, provider: "trapay" })
}

export async function POST(request: NextRequest) {
  return handleTrapayWebhook(request)
}
