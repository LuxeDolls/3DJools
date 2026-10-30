import Link from "next/link"
import { Mail, PackageSearch, RotateCcw, Truck } from "lucide-react"
import type { Locale } from "@/lib/i18n/config"
import type { Dictionary } from "@/lib/i18n/dictionaries/en"
import { localizedPath } from "@/lib/i18n/paths"

export function HelpStrip({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const links = [
    { icon: PackageSearch, label: dict.common.trackOrder, href: "/track-order" },
    { icon: Truck, label: dict.footer.shipping, href: "/shipping" },
    { icon: RotateCcw, label: dict.footer.returns, href: "/returns" },
    { icon: Mail, label: dict.footer.contact, href: "/contact" },
  ]

  return (
    <section className="border-y border-border bg-card">
      <div className="mx-auto grid max-w-7xl grid-cols-2 sm:grid-cols-4">
        {links.map((link) => (
          <Link
            key={link.href}
            href={localizedPath(locale, link.href)}
            className="flex items-center justify-center gap-1.5 border-border px-2.5 py-3 text-center text-xs font-semibold tracking-tight text-foreground transition-colors hover:bg-primary/10 hover:text-primary [&:nth-child(-n+2)]:border-b [&:nth-child(odd)]:border-r sm:gap-2 sm:border-r sm:px-3 sm:py-3.5 sm:text-sm sm:[&:nth-child(-n+2)]:border-b-0 sm:last:border-r-0"
          >
            <link.icon className="size-3.5 shrink-0 text-primary sm:size-4" aria-hidden="true" />
            <span className="truncate">{link.label}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
