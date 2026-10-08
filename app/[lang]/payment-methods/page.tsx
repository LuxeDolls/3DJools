import Image from "next/image"
import { PAYPAL_CHECKOUT_ENABLED } from "@/lib/payments/paypal-availability"
import { STRIPE_CHECKOUT_ENABLED } from "@/lib/payments/stripe-availability"
import Link from "next/link"
import { CreditCard, Landmark, Bitcoin, CalendarClock } from "lucide-react"
import { isLocale, type Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { localizedPath } from "@/lib/i18n/paths"
import { Breadcrumb } from "@/components/breadcrumb"

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : "en"
  const dict = await getDictionary(locale)
  return { title: dict.footer.paymentMethods }
}

export default async function PaymentMethodsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : "en"
  const dict = await getDictionary(locale)

  const methods = [
    ...(STRIPE_CHECKOUT_ENABLED
      ? [
          { icon: CreditCard, title: dict.checkout.payCard, desc: dict.checkout.payCardDesc },
          { icon: CreditCard, word: dict.checkout.payApplePay, title: dict.checkout.payApplePay, desc: dict.checkout.payStripeMethodDesc },
          { icon: CreditCard, word: dict.checkout.payLink, title: dict.checkout.payLink, desc: dict.checkout.payStripeMethodDesc },
          { icon: CreditCard, word: dict.checkout.payBancontact, title: dict.checkout.payBancontact, desc: dict.checkout.payStripeMethodDesc },
        ]
      : []),
    { icon: CreditCard, title: dict.checkout.payAlppay, desc: dict.checkout.payAlppayDesc },
    { icon: Landmark, title: dict.checkout.paySepa, desc: dict.checkout.paySepaDesc },
    { icon: Bitcoin, title: dict.checkout.payCrypto, desc: dict.checkout.payCryptoDesc },
    ...(PAYPAL_CHECKOUT_ENABLED
      ? [{ icon: Landmark, mark: "/payments/paypal.svg", title: dict.checkout.payPaypal, desc: dict.checkout.payPaypalDesc }]
      : []),
    {
      icon: CalendarClock,
      title: dict.checkout.payInstallments,
      desc: `${dict.checkout.payInstallmentsDesc} — ${dict.checkout.payInstallmentsMinNote}`,
    },
  ]

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Breadcrumb
        locale={locale}
        items={[{ label: dict.common.home, href: "/" }, { label: dict.footer.paymentMethods }]}
      />
      <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {dict.footer.paymentMethods}
      </h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {methods.map((m) => (
          <div
            key={m.title}
            className="rounded-lg border border-border bg-card p-5"
          >
            <span className="flex h-11 items-center justify-center rounded-md bg-primary/10 px-3 text-primary">
              {"word" in m && m.word ? (
                <span className="font-heading text-xs font-bold tracking-tight text-foreground">{m.word}</span>
              ) : "mark" in m && m.mark ? (
                <span className="flex h-7 items-center rounded-sm bg-white px-1.5">
                  <Image src={m.mark} alt="" width={72} height={18} className="h-[18px] w-auto" />
                </span>
              ) : (
                <m.icon className="size-5" />
              )}
            </span>
            <h2 className="mt-4 font-heading text-base font-bold text-foreground">{m.title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{m.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-lg border border-border bg-secondary/40 p-5 text-sm leading-relaxed text-muted-foreground">
        <p>{dict.checkout.payMethodsNote}</p>
      </div>

      <p className="mt-10 border-t border-border pt-6 text-sm text-muted-foreground">
        {dict.legal.contactPrompt}{" "}
        <Link href={localizedPath(locale, "/contact")} className="underline underline-offset-2 hover:text-foreground">
          {dict.legal.contactLink}
        </Link>
      </p>
    </div>
  )
}
