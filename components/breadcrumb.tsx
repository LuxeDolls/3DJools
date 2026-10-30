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
    <nav aria-label="Breadcrumb" className="text-xs sm:text-sm">
      <ol className="flex flex-wrap items-center gap-1 text-muted-foreground sm:gap-1.5">
        {items.map((item, i) => {
          const isLast = i === items.length - 1
          return (
            <li key={i} className="flex min-w-0 items-center gap-1 sm:gap-1.5">
              {item.href && !isLast ? (
                <Link href={localizedPath(locale, item.href)} className="shrink-0 transition-colors hover:text-primary">
                  {item.label}
                </Link>
              ) : (
                <span
                  className={isLast ? "max-w-[200px] truncate font-medium text-foreground sm:max-w-none" : undefined}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
              {!isLast && <ChevronRight className="size-3 shrink-0 sm:size-3.5" />}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
