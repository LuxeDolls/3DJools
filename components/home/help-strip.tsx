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
            className="flex items-center justify-center gap-2 border-border px-3 py-3.5 text-sm font-semibold tracking-tight text-foreground transition-colors hover:bg-primary/10 hover:text-primary [&:nth-child(odd)]:border-r sm:border-r sm:last:border-r-0"
          >
            <link.icon className="size-4 shrink-0 text-primary" aria-hidden="true" />
            {link.label}
          </Link>
        ))}
      </div>
    </section>
  )
}
