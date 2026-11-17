import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import type { Locale } from "@/lib/i18n/config"
import type { Dictionary } from "@/lib/i18n/dictionaries/en"
import { localizedPath } from "@/lib/i18n/paths"
import { SectionHeading } from "@/components/section-heading"
import { getHomeCategories } from "./category-data"
import { cn } from "@/lib/utils"

const LAYOUT: Record<string, string> = {
  printers: "col-span-2 lg:col-span-2 lg:row-span-2",
  filaments: "col-span-1 lg:col-span-2",
  resins: "col-span-1",
  accessories: "col-span-1",
  laser: "col-span-1 lg:col-span-2",
  scanners: "col-span-2 sm:col-span-3 lg:col-span-2",
}

export function CategoryTiles({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const tiles = getHomeCategories(dict)

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:py-16">
      <SectionHeading
        eyebrow={dict.nav.catalog}
        title={dict.home.shopByCategory}
        viewAllHref={localizedPath(locale, "/catalog")}
        viewAllLabel={dict.home.viewAll}
      />
      <div className="grid auto-rows-[11rem] grid-cols-2 gap-2.5 sm:auto-rows-[13rem] sm:grid-cols-3 sm:gap-3 lg:auto-rows-[14rem] lg:grid-cols-4">
        {tiles.map((tile) => {
          const hero = tile.id === "printers"
          return (
            <Link
              key={tile.id}
              href={localizedPath(locale, tile.href)}
              className={cn(
                "group relative flex overflow-hidden rounded-3xl border border-border bg-photo text-ink transition-colors hover:border-primary",
                LAYOUT[tile.id],
              )}
            >
              <Image
                src={tile.image || "/placeholder.svg"}
                alt=""
                fill
                sizes={hero ? "(max-width: 1024px) 100vw, 50vw" : "(max-width: 1024px) 50vw, 25vw"}
                className={cn(
                  "object-contain transition-transform duration-500 ease-out group-hover:scale-105",
                  hero ? "p-4 pb-12 sm:p-6 sm:pb-14 lg:p-12 lg:pb-20" : "p-4 pb-12 sm:p-6 sm:pb-14",
                )}
              />
              <span className="absolute top-3 right-3 flex size-9 items-center justify-center rounded-full bg-ink text-ink-foreground transition-all duration-300 group-hover:rotate-45 group-hover:bg-primary group-hover:text-primary-foreground">
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </span>
              <div className="absolute inset-x-3 bottom-3 flex flex-col gap-1 sm:inset-x-4 sm:bottom-4">
                <span className="w-fit rounded-full bg-secondary px-2 py-0.5 font-mono text-[9px] tracking-wider text-secondary-foreground uppercase sm:text-[10px]">
                  {tile.tag}
                </span>
                <h3
                  className={cn(
                    "font-heading leading-none font-bold text-balance text-ink",
                    hero ? "text-3xl sm:text-5xl" : "text-lg sm:text-2xl",
                  )}
                >
                  {tile.label}
                </h3>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
