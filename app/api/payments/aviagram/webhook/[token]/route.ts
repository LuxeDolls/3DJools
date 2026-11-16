import { type NextRequest } from "next/server"
import { handleAviagramWebhook } from "@/lib/payments/aviagram-webhook"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params
  return handleAviagramWebhook(request, decodeURIComponent(token))
}
