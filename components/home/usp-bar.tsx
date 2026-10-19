import { Truck, Headphones, ShieldCheck, CreditCard } from "lucide-react"
import type { Dictionary } from "@/lib/i18n/dictionaries/en"

export function UspBar({ dict }: { dict: Dictionary }) {
  const items = [
    { icon: Truck, title: dict.home.uspShippingTitle, text: dict.home.uspShippingText },
    { icon: Headphones, title: dict.home.uspSupportTitle, text: dict.home.uspSupportText },
    { icon: ShieldCheck, title: dict.home.uspWarrantyTitle, text: dict.home.uspWarrantyText },
    { icon: CreditCard, title: dict.home.uspPaymentTitle, text: dict.home.uspPaymentText },
  ]

  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-6 px-4 py-8 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.title} className="flex gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
              <item.icon className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
