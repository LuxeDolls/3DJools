import Link from "next/link"
import { Percent } from "lucide-react"
import type { Locale } from "@/lib/i18n/config"
import type { Dictionary } from "@/lib/i18n/dictionaries/en"
import { localizedPath } from "@/lib/i18n/paths"
import { getActiveSale } from "@/lib/catalog"

export async function SaleBanner({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const sale = await getActiveSale()
  if (!sale.active || !sale.endsAt) return null

  const endsAtLabel = new Intl.DateTimeFormat(locale, { day: "numeric", month: "long" }).format(sale.endsAt)

  return (
    <div className="bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-2 gap-y-1 px-4 py-2.5 text-center text-sm">
        <Percent className="size-4 shrink-0" aria-hidden="true" />
        <p className="font-medium">
          {dict.home.saleBannerTitle}
          {" — "}
          {dict.home.saleBannerEndsPrefix} {endsAtLabel}.
        </p>
        <Link
          href={localizedPath(locale, "/deals")}
          className="font-semibold underline underline-offset-2 hover:no-underline"
        >
          {dict.home.saleBannerCta}
        </Link>
      </div>
    </div>
  )
}
