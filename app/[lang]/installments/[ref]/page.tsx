import Link from "next/link"
import type { Locale } from "@/lib/i18n/config"
import { getInstallmentDict } from "@/lib/i18n/installments"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { getApplicationStatus } from "@/lib/actions/installments"
import { StatusView } from "@/components/installments/status-view"
import { localizedPath } from "@/lib/i18n/paths"
import { Button } from "@/components/ui/button"

export default async function InstallmentStatusPage({
  params,
}: {
  params: Promise<{ lang: Locale; ref: string }>
}) {
  const { lang, ref } = await params
  const t = getInstallmentDict(lang)
  const dict = await getDictionary(lang)
  const data = await getApplicationStatus(decodeURIComponent(ref).toUpperCase())

  const paymentDict = {
    paymentInstructions: dict.orderConfirmation.paymentInstructions,
    iPaidButton: dict.orderConfirmation.iPaidButton,
    payCard: dict.checkout.payCard,
    paySepa: dict.checkout.paySepa,
    payCrypto: dict.checkout.payCrypto,
    payCryptoNoteText: dict.checkout.payCryptoNoteText,
    payCryptoNetwork: dict.checkout.payCryptoNetwork,
    payCryptoAddress: dict.checkout.payCryptoAddress,
    orderNumber: dict.orderConfirmation.orderNumber,
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-balance font-sans text-3xl font-semibold tracking-tight">{t.statusTitle}</h1>
      {data ? (
        <StatusView data={data} paymentDict={paymentDict} />
      ) : (
        <div className="mx-auto max-w-xl rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">{t.notFound}</p>
          <Button className="mt-4" render={<Link href={localizedPath(lang, "/installments")}>{t.lookupTitle}</Link>} />
        </div>
      )}
    </div>
  )
}
