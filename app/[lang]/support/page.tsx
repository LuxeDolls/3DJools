import Link from "next/link"
import { Mail, Truck, RotateCcw, CreditCard, MessageCircle, ArrowRight } from "lucide-react"
import { isLocale, type Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { localizedPath } from "@/lib/i18n/paths"
import { Breadcrumb } from "@/components/breadcrumb"

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : "en"
  const dict = await getDictionary(locale)
  return { title: dict.nav.support }
}

export default async function SupportPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : "en"
  const dict = await getDictionary(locale)

  const links = [
    { icon: Truck, label: dict.footer.shipping, href: "/shipping" },
    { icon: RotateCcw, label: dict.footer.returns, href: "/returns" },
    { icon: CreditCard, label: dict.footer.paymentMethods, href: "/payment-methods" },
    { icon: Mail, label: dict.footer.contact, href: "/contact" },
  ]

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Breadcrumb locale={locale} items={[{ label: dict.common.home, href: "/" }, { label: dict.nav.support }]} />
      <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {dict.nav.support}
      </h1>
      <p className="mt-2 text-pretty text-muted-foreground">{dict.contact.subtitle}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={localizedPath(locale, link.href)}
            className="group flex items-center gap-3 rounded-lg border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-md"
          >
            <span className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
              <link.icon className="size-5" />
            </span>
            <span className="flex-1 font-medium text-foreground group-hover:text-primary">{link.label}</span>
            <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
          </Link>
        ))}
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/5 p-5">
        <MessageCircle className="size-5 shrink-0 text-primary" />
        <p className="text-sm leading-relaxed text-muted-foreground">
          Need a hand right now? Use the live chat in the bottom-right corner — our assistant answers common questions
          instantly, and a specialist can jump in whenever you need one.
        </p>
      </div>
    </div>
  )
}
