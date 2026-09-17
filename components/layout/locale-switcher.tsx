"use client"

import { usePathname, useRouter } from "next/navigation"
import { Globe, Check } from "lucide-react"
import { locales, localeNames, type Locale } from "@/lib/i18n/config"
import { switchLocaleInPath } from "@/lib/i18n/paths"
import { useI18n } from "@/components/i18n-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function LocaleSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale } = useI18n()
  const pathname = usePathname()
  const router = useRouter()

  function selectLocale(next: Locale) {
    document.cookie = `NEXT_LOCALE=${next};path=/;max-age=${60 * 60 * 24 * 365}`
    router.push(switchLocaleInPath(pathname, next, locales))
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <Globe className="size-4" />
        <span className={compact ? "uppercase" : ""}>{compact ? locale : localeNames[locale]}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((l) => (
          <DropdownMenuItem key={l} onClick={() => selectLocale(l)} className="flex items-center justify-between gap-6">
            <span>{localeNames[l]}</span>
            {l === locale && <Check className="size-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
