import Link from "next/link"
import { Sparkles } from "lucide-react"
import type { Locale } from "@/lib/i18n/config"
import type { Dictionary } from "@/lib/i18n/dictionaries/en"
import { localizedPath } from "@/lib/i18n/paths"

export function SaleBanner({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <div className="bg-foreground text-background">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-2 gap-y-0.5 px-3 py-1.5 text-center text-xs sm:gap-x-3 sm:px-4 sm:py-2.5 sm:text-sm">
        <p className="font-medium leading-snug">
          <Sparkles className="mr-1.5 inline size-3.5 align-[-2px] text-primary sm:size-4" aria-hidden="true" />
          {dict.home.saleBannerTitle}{" "}
          <Link
            href={localizedPath(locale, "/deals")}
            className="ml-1 inline-block whitespace-nowrap font-semibold text-primary underline underline-offset-2 hover:no-underline"
          >
            {dict.home.saleBannerCta}
          </Link>
        </p>
      </div>
    </div>
  )
}
