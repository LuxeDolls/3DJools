import Link from "next/link"
import type { Locale } from "@/lib/i18n/config"
import type { Dictionary } from "@/lib/i18n/dictionaries/en"
import { localizedPath } from "@/lib/i18n/paths"
import { getAllBrands } from "@/lib/catalog"

export async function BrandMarquee({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const brands = (await getAllBrands()).slice(0, 18)
  if (brands.length === 0) return null
  const loop = [...brands, ...brands]

  return (
    <section aria-label={dict.home.shopByBrand} className="py-8 sm:py-12">
      <div className="mx-auto mb-4 flex max-w-7xl items-center justify-between gap-3 px-4">
        <p className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
          {dict.home.shopByBrand} · {brands.length}+
        </p>
        <Link
          href={localizedPath(locale, "/brands")}
          className="text-xs font-semibold text-primary underline-offset-4 hover:underline sm:text-sm"
        >
          {dict.common.allBrands}
        </Link>
      </div>
      <div className="group relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <ul className="animate-marquee flex w-max items-center gap-3 group-hover:[animation-play-state:paused] sm:gap-4">
          {loop.map((b, i) => (
            <li key={`${b.slug}-${i}`} aria-hidden={i >= brands.length ? true : undefined}>
              <Link
                href={localizedPath(locale, `/brands/${b.slug}`)}
                tabIndex={i >= brands.length ? -1 : undefined}
                className="flex h-14 items-center rounded-full border border-border bg-card px-6 font-heading text-lg font-bold whitespace-nowrap text-foreground/70 transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground sm:h-16 sm:px-8 sm:text-2xl"
              >
                {b.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
