import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type { Locale } from "@/lib/i18n/config"
import type { Dictionary } from "@/lib/i18n/dictionaries/en"
import { localizedPath } from "@/lib/i18n/paths"

export function SaleBanner({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <div className="bg-signal text-signal-foreground">
      <Link
        href={localizedPath(locale, "/deals")}
        className="group mx-auto flex max-w-7xl items-center justify-center gap-2 px-3 py-2 text-center text-xs font-medium sm:text-sm"
      >
        <span className="rounded-full bg-signal-foreground px-2 py-0.5 font-mono text-[10px] font-bold text-signal">
          -5%
        </span>
        <span className="line-clamp-1 text-pretty">{dict.home.saleBannerTitle}</span>
        <span className="hidden shrink-0 items-center gap-1 font-semibold underline-offset-4 group-hover:underline sm:inline-flex">
          {dict.home.saleBannerCta}
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </Link>
    </div>
  )
}
