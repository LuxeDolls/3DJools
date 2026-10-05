import { type NextRequest } from "next/server"
import { handleAviagramWebhook } from "@/lib/payments/aviagram-webhook"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  return handleAviagramWebhook(request, request.nextUrl.searchParams.get("token") ?? "")
}
