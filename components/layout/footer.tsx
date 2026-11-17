import Image from "next/image"
import Link from "next/link"
import { CreditCard, Landmark, Building2, CalendarClock, Clock, Mail, Phone } from "lucide-react"
import { COMPANY, companyStreetLine } from "@/lib/company"
import { isPaypalCheckoutEnabled } from "@/lib/payments/paypal-availability"
import { CARD_CHECKOUT_ENABLED, OPEN_BANKING_CHECKOUT_ENABLED } from "@/lib/payments/cardholder"
import { BANK_TRANSFER_CHECKOUT_ENABLED } from "@/lib/payments/bank-transfer"
import { INSTALLMENTS_CHECKOUT_ENABLED } from "@/lib/installments"
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
        { label: dict.footer.faq, href: "/faq" },
        { label: dict.account.tracking, href: "/track-order" },
        { label: dict.footer.shipping, href: "/shipping" },
        { label: dict.footer.returns, href: "/returns" },
        { label: dict.footer.paymentMethods, href: "/payment-methods" },
        { label: dict.footer.contact, href: "/contact" },
      ],
    },
    {
      title: dict.footer.legal,
      links: [
        { label: dict.footer.privacy, href: "/privacy" },
        { label: dict.footer.cookies, href: "/cookie-policy" },
        { label: dict.footer.terms, href: "/terms" },
        { label: dict.footer.instalmentAgreement, href: "/instalment-agreement" },
        { label: dict.footer.impressum, href: "/impressum" },
        { label: dict.footer.about, href: "/about" },
      ],
    },
  ]

  const payments: {
    icon: typeof CreditCard
    label: string
    marks?: { src: string; width: number; height: number }[]
  }[] = [
    ...(CARD_CHECKOUT_ENABLED
      ? [
          {
            icon: CreditCard,
            label: dict.checkout.payCard,
            marks: [
              { src: "/payments/visa.svg", width: 32, height: 14 },
              { src: "/payments/mastercard.svg", width: 24, height: 14 },
            ],
          },
        ]
      : []),
    ...(OPEN_BANKING_CHECKOUT_ENABLED
      ? [
          {
            icon: Building2,
            label: dict.checkout.payOpenBanking,
            marks: [{ src: "/payments/open-banking.svg", width: 32, height: 14 }],
          },
        ]
      : []),
    ...(BANK_TRANSFER_CHECKOUT_ENABLED
      ? [
          {
            icon: Landmark,
            label: dict.checkout.paySepa,
            marks: [{ src: "/payments/sepa.svg", width: 36, height: 14 }],
          },
        ]
      : []),
    ...(isPaypalCheckoutEnabled()
      ? [
          {
            icon: CreditCard,
            label: dict.checkout.payPaypal,
            marks: [{ src: "/payments/paypal.svg", width: 56, height: 14 }],
          },
        ]
      : []),
    ...(INSTALLMENTS_CHECKOUT_ENABLED
      ? [
          {
            icon: CalendarClock,
            label: dict.checkout.payInstallments,
            marks: [{ src: "/payments/installments.svg", width: 34, height: 14 }],
          },
        ]
      : []),
  ]

  return (
    <footer className="mt-10 px-2 pb-4 sm:mt-16 sm:px-4 sm:pb-6">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-border/90 bg-card/90 shadow-[var(--shadow-float-lg)] backdrop-blur-xl sm:rounded-[2.5rem]">
      <div className="grid gap-8 px-5 py-10 sm:gap-10 sm:px-8 sm:py-12 lg:grid-cols-5 lg:px-12">
        <div className="lg:col-span-2">
          <Logo showTagline />
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
              <h3 className="font-mono text-[11px] tracking-wider text-primary uppercase">
                {col.title}
              </h3>
              <ul className="mt-3 flex flex-col gap-2 sm:mt-4 sm:gap-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={lp(link.href)}
                      className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
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
        <div className="flex flex-col-reverse items-center justify-between gap-4 px-5 py-5 sm:flex-row sm:px-8 sm:py-6 lg:px-12">
          <p className="text-center text-xs text-muted-foreground sm:text-left">
            &copy; {new Date().getFullYear()} {COMPANY.tradingName} — {COMPANY.legalName} {dict.footer.rights}
          </p>
          <ul className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {payments.map((p) => (
              <li
                key={p.label}
                className="flex items-center gap-2 rounded-lg border border-border bg-background/90 px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground shadow-xs sm:text-xs"
                title={p.label}
              >
                {p.marks && p.marks.length > 0 ? (
                  <span className="flex items-center gap-1">
                    {p.marks.map((m) => (
                      <span
                        key={m.src}
                        className="flex h-5 items-center justify-center rounded-sm border border-neutral-200/80 bg-white px-1.5"
                      >
                        <Image
                          src={m.src}
                          alt=""
                          width={m.width}
                          height={m.height}
                          className="h-3.5 w-auto object-contain"
                        />
                      </span>
                    ))}
                  </span>
                ) : (
                  <span className="flex size-5 items-center justify-center rounded-sm bg-primary/15 text-primary">
                    <p.icon className="size-3.5 shrink-0" />
                  </span>
                )}
                <span className="text-foreground/90">{p.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p
        aria-hidden="true"
        className="pointer-events-none -mb-[0.18em] px-3 text-center font-heading text-[21vw] leading-none font-extrabold tracking-tighter text-primary/10 select-none lg:text-[15.5rem]"
      >
        {dict.brandName}
      </p>
      </div>
    </footer>
  )
}
