import Image from "next/image"
import Link from "next/link"
import type { Locale } from "@/lib/i18n/config"
import type { Dictionary } from "@/lib/i18n/dictionaries/en"
import { localizedPath } from "@/lib/i18n/paths"
import { getHomeCategories } from "@/components/home/category-data"

export function CategoryStrip({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const categories = getHomeCategories(dict)

  return (
    <nav aria-label={dict.home.shopByCategory}>
      <ul className="grid grid-cols-3 gap-2 sm:gap-3 md:grid-cols-6">
        {categories.map((cat) => (
          <li key={cat.id}>
            <Link
              href={localizedPath(locale, cat.href)}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary"
            >
              <span className="relative block aspect-[4/3] bg-photo">
                <Image
                  src={cat.image || "/placeholder.svg"}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 33vw, 16vw"
                  className="object-contain p-3 transition-transform duration-500 ease-out group-hover:scale-105"
                />
              </span>
              <span className="px-3 py-2.5 text-xs font-semibold text-foreground text-balance sm:text-sm">
                {cat.label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
