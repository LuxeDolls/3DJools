"use server"

import { chargeStoredSquareOrder, type SquareChargeResult } from "@/lib/payments/square-order"
import { squareConfigured } from "@/lib/payments/square"

export async function chargeSquareOrder(input: {
  orderNumber: string
  sourceId: string
  verificationToken?: string
  expectedUsdCents: number
}): Promise<SquareChargeResult> {
  if (!squareConfigured()) return { ok: false, error: "unavailable" }
  if (!Number.isInteger(input.expectedUsdCents) || input.expectedUsdCents < 1) {
    return { ok: false, error: "quote_unavailable" }
  }
  return chargeStoredSquareOrder(input)
}
