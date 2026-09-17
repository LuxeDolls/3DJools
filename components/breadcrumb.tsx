import Link from "next/link"
import { ChevronRight } from "lucide-react"
import type { Locale } from "@/lib/i18n/config"
import { localizedPath } from "@/lib/i18n/paths"

export interface Crumb {
  label: string
  href?: string
}

export function Breadcrumb({ items, locale }: { items: Crumb[]; locale: Locale }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm">
      <ol className="flex flex-wrap items-center gap-1.5 text-muted-foreground">
        {items.map((item, i) => {
          const isLast = i === items.length - 1
          return (
            <li key={i} className="flex items-center gap-1.5">
              {item.href && !isLast ? (
                <Link href={localizedPath(locale, item.href)} className="transition-colors hover:text-primary">
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? "font-medium text-foreground" : undefined} aria-current={isLast ? "page" : undefined}>
                  {item.label}
                </span>
              )}
              {!isLast && <ChevronRight className="size-3.5" />}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
