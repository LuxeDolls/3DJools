import Link from "next/link"
import type { Locale } from "@/lib/i18n/config"
import type { Dictionary } from "@/lib/i18n/dictionaries/en"
import type { Brand } from "@/lib/catalog/types"
import { localizedPath } from "@/lib/i18n/paths"
import { SectionHeading } from "@/components/section-heading"

export function BrandStrip({ locale, dict, brands }: { locale: Locale; dict: Dictionary; brands: Brand[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <SectionHeading
        title={dict.home.shopByBrand}
        viewAllHref={localizedPath(locale, "/brands")}
        viewAllLabel={dict.home.viewAll}
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
        {brands.map((brand) => (
          <Link
            key={brand.slug}
            href={localizedPath(locale, `/brands/${brand.slug}`)}
            className="flex h-20 items-center justify-center rounded-lg border border-border bg-card px-4 text-center font-heading text-sm font-bold text-foreground transition-all hover:border-primary/40 hover:text-primary"
          >
            {brand.name}
          </Link>
        ))}
      </div>
    </section>
  )
}
