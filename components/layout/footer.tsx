import Image from "next/image"
import Link from "next/link"
import { CreditCard, Landmark, Bitcoin, CalendarClock, Clock, Mail, Phone } from "lucide-react"
import { COMPANY, companyStreetLine } from "@/lib/company"
import type { Locale } from "@/lib/i18n/config"
import type { Dictionary } from "@/lib/i18n/dictionaries/en"
import { localizedPath } from "@/lib/i18n/paths"
import { Logo } from "./logo"
import { ScamAdviserTrust } from "@/components/home/scamadviser-trust"

export function Footer({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const lp = (p: string) => localizedPath(locale, p)

  const columns: { title: string; links: { label: string; href: string }[] }[] = [
    {
      title: dict.footer.shop,
      links: [
        { label: dict.nav.printers, href: "/catalog/printers" },
        { label: dict.nav.filaments, href: "/catalog/filaments" },
        { label: dict.nav.resins, href: "/catalog/resins" },
        { label: dict.nav.accessories, href: "/catalog/accessories" },
        { label: dict.nav.brands, href: "/brands" },
      ],
    },
    {
      title: dict.footer.support,
      links: [
        { label: dict.footer.contact, href: "/contact" },
        { label: dict.footer.faq, href: "/faq" },
        { label: dict.footer.shipping, href: "/shipping" },
        { label: dict.footer.returns, href: "/returns" },
        { label: dict.footer.paymentMethods, href: "/payment-methods" },
        { label: dict.account.tracking, href: "/track-order" },
      ],
    },
    {
      title: dict.footer.legal,
      links: [
        { label: dict.footer.about, href: "/about" },
        { label: dict.footer.terms, href: "/terms" },
        { label: dict.footer.privacy, href: "/privacy" },
        { label: dict.footer.cookies, href: "/cookie-policy" },
        { label: dict.footer.impressum, href: "/impressum" },
        { label: dict.footer.instalmentAgreement, href: "/instalment-agreement" },
      ],
    },
  ]

  const payments = [
    { icon: CreditCard, label: dict.checkout.payPaypal, mark: "/payments/paypal.svg" },
    { icon: CreditCard, label: dict.checkout.payCard },
    { icon: Landmark, label: dict.checkout.paySepa },
    { icon: Bitcoin, label: dict.checkout.payCrypto },
    { icon: CalendarClock, label: dict.checkout.payInstallments },
  ]

  return (
    <footer className="mt-16 border-t border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Logo />
          <p className="mt-4 max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground">
            {dict.footer.companyBlurb}
          </p>
          <a
            href={`mailto:${COMPANY.email}`}
            className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-foreground underline underline-offset-2 transition-colors hover:text-primary"
          >
            <Mail className="size-4 text-primary" aria-hidden="true" />
            {COMPANY.email}
          </a>
          <a
            href={`tel:${COMPANY.phoneTel}`}
            className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-foreground underline underline-offset-2 transition-colors hover:text-primary"
          >
            <Phone className="size-4 text-primary" aria-hidden="true" />
            {COMPANY.phoneDisplay}
          </a>
          <div className="mt-5 flex items-start gap-2 text-sm text-muted-foreground">
            <Clock className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>{dict.footer.hoursNote}</span>
          </div>
          <div className="mt-5">
            <ScamAdviserTrust dict={dict} compact />
          </div>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            {dict.footer.operatedBy}
            <br />
            {companyStreetLine}
            <br />
            {dict.footer.companyNumber} {COMPANY.companyNumber} · {dict.footer.vatId} {COMPANY.vat}
          </p>
        </div>

        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h3 className="font-heading text-sm font-semibold text-foreground">{col.title}</h3>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={lp(link.href)}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col-reverse items-center justify-between gap-4 px-4 py-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} {COMPANY.tradingName} — {COMPANY.legalName}. {dict.footer.rights}
          </p>
          <ul className="flex flex-wrap items-center gap-3">
            {payments.map((p) => (
              <li
                key={p.label}
                className="flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-muted-foreground"
                title={p.label}
              >
                {"mark" in p && p.mark ? (
                  <span className="flex h-5 items-center rounded-sm bg-white px-1">
                    <Image src={p.mark} alt="" width={56} height={14} className="h-3.5 w-auto" />
                  </span>
                ) : (
                  <p.icon className="size-4 text-foreground" />
                )}
                <span className="hidden sm:inline">{p.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
