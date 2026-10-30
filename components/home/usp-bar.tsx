import { Truck, Headphones, ShieldCheck, CreditCard } from "lucide-react"
import type { Dictionary } from "@/lib/i18n/dictionaries/en"
import type { Locale } from "@/lib/i18n/config"
import { STRIPE_CHECKOUT_ENABLED, STRIPE_OFF_USP } from "@/lib/payments/stripe-availability"
import { BANK_TRANSFER_CHECKOUT_ENABLED, BANK_TRANSFER_OFF_USP } from "@/lib/payments/bank-transfer"

export function UspBar({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const paymentText = !BANK_TRANSFER_CHECKOUT_ENABLED
    ? BANK_TRANSFER_OFF_USP[locale]
    : !STRIPE_CHECKOUT_ENABLED
      ? STRIPE_OFF_USP[locale]
      : dict.home.uspPaymentText

  const items = [
    { icon: Truck, title: dict.home.uspShippingTitle, text: dict.home.uspShippingText },
    { icon: Headphones, title: dict.home.uspSupportTitle, text: dict.home.uspSupportText },
    { icon: ShieldCheck, title: dict.home.uspWarrantyTitle, text: dict.home.uspWarrantyText },
    {
      icon: CreditCard,
      title: dict.home.uspPaymentTitle,
      text: paymentText,
    },
  ]

  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-2.5 px-4 py-5 sm:gap-6 sm:py-8 lg:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.title}
            className="flex flex-col gap-2 rounded-xl border border-border/60 bg-card/50 p-3 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.6)] transition-transform duration-200 hover:-translate-y-0.5 sm:flex-row sm:items-start sm:gap-3 sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none"
          >
            <div className="flex items-center gap-2 sm:block">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary shadow-[0_10px_25px_-5px_rgba(0,0,0,0.6)] sm:size-10">
                <item.icon className="size-4 sm:size-5" />
              </div>
              <h3 className="text-xs font-semibold leading-tight text-foreground sm:hidden">{item.title}</h3>
            </div>
            <div>
              <h3 className="hidden text-sm font-semibold text-foreground sm:block">{item.title}</h3>
              <p className="text-[11px] leading-snug text-muted-foreground sm:mt-0.5 sm:text-xs sm:leading-relaxed">
                {item.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
