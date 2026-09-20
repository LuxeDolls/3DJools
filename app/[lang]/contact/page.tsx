import Link from "next/link"
import { Mail, Phone, Clock, MapPin } from "lucide-react"
import { isLocale, type Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { localizedPath } from "@/lib/i18n/paths"
import { Breadcrumb } from "@/components/breadcrumb"
import { ContactForm } from "@/components/contact/contact-form"

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : "en"
  const dict = await getDictionary(locale)
  return { title: dict.contact.title, description: dict.contact.subtitle }
}

export default async function ContactPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : "en"
  const dict = await getDictionary(locale)

  const details = [
    { icon: Mail, label: dict.contact.email_label, value: "info@3djools.com", href: "mailto:info@3djools.com" },
    { icon: Phone, label: dict.contact.phone_label, value: "+32 460 00 80 70" },
    { icon: Clock, label: dict.contact.hours_label, value: dict.contact.hours },
    {
      icon: MapPin,
      label: dict.contact.address_label,
      value: "Rue du Chénia 17, 7170 Manage, Hainaut, Belgium",
    },
  ]

  const quickLinks = [
    { label: dict.footer.faq, href: "/faq" },
    { label: dict.footer.privacy, href: "/privacy" },
    { label: dict.footer.terms, href: "/terms" },
  ]

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Breadcrumb locale={locale} items={[{ label: dict.common.home, href: "/" }, { label: dict.contact.title }]} />
      <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {dict.contact.title}
      </h1>
      <p className="mt-2 max-w-2xl text-pretty text-muted-foreground">{dict.contact.subtitle}</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_20rem]">
        <div className="rounded-lg border border-border bg-card p-6">
          <ContactForm />
        </div>

        <aside>
          <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {dict.contact.otherWays}
          </h2>
          <ul className="mt-4 space-y-4">
            {details.map((d, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <d.icon className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{d.label}</p>
                  {"href" in d ? (
                    <a
                      href={d.href}
                      className="text-sm font-medium text-foreground underline underline-offset-2 hover:text-primary"
                    >
                      {d.value}
                    </a>
                  ) : (
                    <p className="text-sm font-medium text-foreground">{d.value}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>

          <h2 className="mt-8 font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {dict.contact.quickLinks}
          </h2>
          <ul className="mt-4 space-y-2">
            {quickLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={localizedPath(locale, link.href)}
                  className="text-sm font-medium text-foreground underline underline-offset-2 hover:text-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  )
}
