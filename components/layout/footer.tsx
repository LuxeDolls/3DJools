import Image from "next/image"
import Link from "next/link"
import { CreditCard, Landmark, CalendarClock, Clock, Mail, Phone } from "lucide-react"
import { COMPANY, companyStreetLine } from "@/lib/company"
import { isPaypalCheckoutEnabled } from "@/lib/payments/paypal-availability"
import { ALPPAY_CHECKOUT_ENABLED } from "@/lib/payments/alppay-availability"
import { STRIPE_CHECKOUT_ENABLED } from "@/lib/payments/stripe-availability"
import { SQUARE_CHECKOUT_ENABLED } from "@/lib/payments/square-availability"
import { BANK_TRANSFER_CHECKOUT_ENABLED } from "@/lib/payments/bank-transfer"
import type { Locale } from "@/lib/i18n/config"
import type { Dictionary } from "@/lib/i18n/dictionaries/en"
import { localizedPath } from "@/lib/i18n/paths"
import { Logo } from "./logo"
import { WhatsAppMark } from "@/components/contact/whatsapp-mark"
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
    ...(SQUARE_CHECKOUT_ENABLED ? [{ icon: CreditCard, label: dict.checkout.paySquare }] : []),
    ...(STRIPE_CHECKOUT_ENABLED
      ? [
          { icon: CreditCard, label: dict.checkout.payCard },
          { icon: CreditCard, label: dict.checkout.payApplePay, word: dict.checkout.payApplePay },
          { icon: CreditCard, label: dict.checkout.payLink, word: dict.checkout.payLink },
          { icon: CreditCard, label: dict.checkout.payBancontact, word: dict.checkout.payBancontact },
          { icon: CreditCard, label: dict.checkout.payKlarna, word: dict.checkout.payKlarna },
        ]
      : []),
    ...(ALPPAY_CHECKOUT_ENABLED ? [{ icon: CreditCard, label: dict.checkout.payAlppay }] : []),
    ...(BANK_TRANSFER_CHECKOUT_ENABLED ? [{ icon: Landmark, label: dict.checkout.paySepa }] : []),
    ...(isPaypalCheckoutEnabled()
      ? [{ icon: CreditCard, label: dict.checkout.payPaypal, mark: "/payments/paypal.svg" }]
      : []),
    { icon: CalendarClock, label: dict.checkout.payInstallments },
  ]

  return (
    <footer className="mt-12 border-t border-border bg-card sm:mt-16">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:gap-10 sm:py-12 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Logo />
          <p className="mt-3 max-w-sm text-pretty text-xs leading-relaxed text-muted-foreground sm:mt-4 sm:text-sm">
            {dict.footer.companyBlurb}
          </p>
          <div className="mt-4 flex flex-col items-start gap-2">
            <a
              href={`mailto:${COMPANY.email}`}
              className="inline-flex items-center gap-2 text-xs font-medium text-foreground underline underline-offset-2 transition-colors hover:text-primary sm:text-sm"
            >
              <Mail className="size-4 shrink-0 text-primary" aria-hidden="true" />
              {COMPANY.email}
            </a>
            <a
              href={`tel:${COMPANY.phoneTel}`}
              className="inline-flex items-center gap-2 text-xs font-medium text-foreground underline underline-offset-2 transition-colors hover:text-primary sm:text-sm"
            >
              <Phone className="size-4 shrink-0 text-primary" aria-hidden="true" />
              {COMPANY.phoneDisplay}
            </a>
            <a
              href={COMPANY.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-medium text-foreground underline underline-offset-2 transition-colors hover:text-primary sm:text-sm"
            >
              <WhatsAppMark className="size-4 shrink-0" />
              WhatsApp {COMPANY.whatsappDisplay}
            </a>
          </div>
          <div className="mt-4 flex items-start gap-2 text-xs text-muted-foreground sm:mt-5 sm:text-sm">
            <Clock className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>{dict.footer.hoursNote}</span>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground sm:mt-5">
            {dict.footer.operatedBy}
            <br />
            {companyStreetLine}
            <br />
            {dict.footer.companyNumber} {COMPANY.companyNumber} · {dict.footer.vatId} {COMPANY.vat}
          </p>
          <div className="mt-4 sm:mt-5">
            <ScamAdviserTrust dict={dict} compact />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:col-span-3">
          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="font-heading text-xs font-semibold uppercase tracking-wider text-foreground sm:text-sm sm:normal-case sm:tracking-normal">
                {col.title}
              </h3>
              <ul className="mt-3 space-y-2 sm:mt-4 sm:space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={lp(link.href)}
                      className="text-xs text-muted-foreground transition-colors hover:text-primary sm:text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col-reverse items-center justify-between gap-4 px-4 py-5 sm:flex-row sm:py-6">
          <p className="text-center text-xs text-muted-foreground sm:text-left">
            &copy; {new Date().getFullYear()} {COMPANY.tradingName} — {COMPANY.legalName} {dict.footer.rights}
          </p>
          <ul className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {payments.map((p) => (
              <li
                key={p.label}
                className="flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground sm:text-xs"
                title={p.label}
              >
                {"word" in p && p.word ? (
                  <span>{p.word}</span>
                ) : (
                  <>
                    {"mark" in p && p.mark ? (
                      <span className="flex h-5 items-center rounded-sm bg-white px-1">
                        <Image src={p.mark} alt="" width={56} height={14} className="h-3.5 w-auto" />
                      </span>
                    ) : (
                      <p.icon className="size-3.5 shrink-0 text-foreground sm:size-4" />
                    )}
                    <span>{p.label}</span>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
