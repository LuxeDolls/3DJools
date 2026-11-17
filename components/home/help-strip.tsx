import Link from "next/link"
import { ArrowUpRight, Mail, PackageSearch, RotateCcw, Truck } from "lucide-react"
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
    <nav aria-label={dict.footer.support} className="mx-auto max-w-7xl px-4 pt-3">
      <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={localizedPath(locale, link.href)}
              className="group flex items-center justify-between gap-2 rounded-full border border-border/70 bg-secondary/90 py-2 pr-2 pl-4 text-xs font-semibold text-secondary-foreground shadow-[var(--shadow-float-sm)] backdrop-blur-md transition-all duration-250 hover:-translate-y-1 hover:bg-foreground hover:text-background hover:shadow-[var(--shadow-float-sm-hover)] sm:text-sm"
            >
              <span className="flex min-w-0 items-center gap-2">
                <link.icon className="size-4 shrink-0" aria-hidden="true" />
                <span className="truncate">{link.label}</span>
              </span>
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-card text-foreground shadow-xs">
                <ArrowUpRight className="size-3.5 transition-transform group-hover:rotate-45" aria-hidden="true" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
