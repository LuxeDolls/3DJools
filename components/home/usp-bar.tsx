import { Truck, Headphones, ShieldCheck, CreditCard } from "lucide-react"
import type { Dictionary } from "@/lib/i18n/dictionaries/en"
import type { Locale } from "@/lib/i18n/config"
import { CARD_CHECKOUT_ENABLED } from "@/lib/payments/cardholder"
import { BANK_TRANSFER_CHECKOUT_ENABLED, BANK_TRANSFER_OFF_USP } from "@/lib/payments/bank-transfer"
import { INSTALLMENTS_CHECKOUT_ENABLED } from "@/lib/installments"

export function UspBar({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const paymentText =
    !BANK_TRANSFER_CHECKOUT_ENABLED &&
    !CARD_CHECKOUT_ENABLED &&
    !INSTALLMENTS_CHECKOUT_ENABLED
      ? dict.checkout.payCardGatewayNotice
      : !BANK_TRANSFER_CHECKOUT_ENABLED
        ? BANK_TRANSFER_OFF_USP[locale]
        : dict.home.uspPaymentText

  const items = [
    { icon: Truck, title: dict.home.uspShippingTitle, text: dict.home.uspShippingText },
    { icon: Headphones, title: dict.home.uspSupportTitle, text: dict.home.uspSupportText },
    { icon: ShieldCheck, title: dict.home.uspWarrantyTitle, text: dict.home.uspWarrantyText },
    { icon: CreditCard, title: dict.home.uspPaymentTitle, text: paymentText },
  ]

  return (
    <section className="mx-auto max-w-7xl px-4 pt-10 sm:pt-16">
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-4">
        {items.map((item) => (
          <li
            key={item.title}
            className="group flex gap-4 rounded-3xl border border-border bg-card p-4 transition-colors hover:border-primary sm:flex-col sm:p-6"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground transition-transform duration-300 group-hover:-rotate-6 sm:size-12">
              <item.icon className="size-5" aria-hidden="true" />
            </span>
            <div className="flex flex-col gap-1">
              <h3 className="font-heading text-base leading-tight font-bold text-foreground sm:text-lg">{item.title}</h3>
              <p className="text-pretty text-xs leading-relaxed text-muted-foreground sm:text-sm">{item.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
