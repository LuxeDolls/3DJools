import { NextResponse, type NextRequest } from "next/server"
import { handleTrapayWebhook } from "@/lib/payments/trapay-webhook"

export const dynamic = "force-dynamic"

export async function GET() {
  return NextResponse.json({ ok: true, received: true, provider: "trapay" }, { status: 200 })
}

export async function HEAD() {
  return new NextResponse(null, { status: 200 })
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      Allow: "GET, HEAD, POST, OPTIONS",
    },
  })
}

export async function POST(request: NextRequest) {
  return handleTrapayWebhook(request)
}
