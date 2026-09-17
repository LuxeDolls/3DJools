"use client"

import { useRouter } from "next/navigation"
import { Landmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PaymentInstructionsDialog } from "@/components/checkout/payment-instructions-dialog"
import { markOrderPaidByCustomer } from "@/lib/actions/orders"
import type { Locale } from "@/lib/i18n/config"
import type { PaymentMethod } from "@/lib/db/schema"

export function OrderPaymentInstructions({
  orderNumber,
  paymentMethod,
  amountCents,
  locale,
  dict,
}: {
  orderNumber: string
  paymentMethod: PaymentMethod
  amountCents: number
  locale: Locale
  dict: {
    paymentInstructions: string
    iPaidButton: string
    showPaymentDetails: string
    payCard: string
    paySepa: string
    payCrypto: string
    payCryptoNoteText: string
    payCryptoNetwork: string
    payCryptoAddress: string
    orderNumber: string
  }
}) {
  const router = useRouter()
  if (paymentMethod !== "bank_transfer" && paymentMethod !== "crypto") return null

  return (
    <PaymentInstructionsDialog
      method={paymentMethod}
      amountCents={amountCents}
      reference={orderNumber}
      locale={locale}
      dict={dict}
      trigger={
        <Button variant="outline">
          <Landmark className="size-4" />
          {dict.showPaymentDetails}
        </Button>
      }
      onConfirm={async () => {
        const res = await markOrderPaidByCustomer(orderNumber)
        if (res.ok) router.refresh()
        return res
      }}
    />
  )
}
