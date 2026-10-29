import Link from "next/link"
import { Sparkles } from "lucide-react"
import type { Locale } from "@/lib/i18n/config"
import type { Dictionary } from "@/lib/i18n/dictionaries/en"
import { localizedPath } from "@/lib/i18n/paths"

export function SaleBanner({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <div className="bg-foreground text-background">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2.5 text-center text-sm">
        <Sparkles className="size-4 shrink-0 text-primary" aria-hidden="true" />
        <p className="font-medium">{dict.home.saleBannerTitle}</p>
        <Link
          href={localizedPath(locale, "/deals")}
          className="font-semibold text-primary underline underline-offset-2 hover:no-underline"
        >
          {dict.home.saleBannerCta}
        </Link>
      </div>
    </div>
  )
}
