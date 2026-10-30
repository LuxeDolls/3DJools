import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import type { Locale } from "@/lib/i18n/config"
import type { Dictionary } from "@/lib/i18n/dictionaries/en"
import { localizedPath } from "@/lib/i18n/paths"
import { SectionHeading } from "@/components/section-heading"

export function CategoryTiles({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const tiles = [
    {
      key: dict.categories.printers,
      href: "/catalog/printers",
      image: "/brand/tile-printers.jpg?v=4",
      tag: "FDM & SLA",
    },
    {
      key: dict.categories.resins,
      href: "/catalog/resins",
      image: "/brand/tile-resins.jpg?v=8",
      tag: "8K / 12K / Tough",
    },
    {
      key: dict.categories.filaments,
      href: "/catalog/filaments",
      image: "/brand/tile-filaments.jpg?v=4",
      tag: "PLA · PETG · ABS · CF",
    },
    {
      key: dict.categories.accessories,
      href: "/catalog/accessories",
      image: "/brand/tile-accessories.jpg?v=7",
      tag: "AMS · Dryers · Plates",
    },
    {
      key: dict.categories.laserEngravers,
      href: "/catalog/laser-engravers",
      image: "/brand/tile-laser.jpg?v=5",
      tag: "Diode & CO2",
    },
    {
      key: dict.categories.scanners,
      href: "/catalog/scanners",
      image: "/brand/tile-scanners.jpg?v=8",
      tag: "Blue Laser & NIR",
    },
  ]

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
      <SectionHeading
        title={dict.home.shopByCategory}
        viewAllHref={localizedPath(locale, "/catalog")}
        viewAllLabel={dict.home.viewAll}
      />
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 md:grid-cols-3 md:gap-5">
        {tiles.map((tile) => (
          <Link
            key={tile.href}
            href={localizedPath(locale, tile.href)}
            className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md"
          >
            <div className="relative aspect-4/3 overflow-hidden bg-white">
              <Image
                src={tile.image || "/placeholder.svg"}
                alt={tile.key}
                fill
                sizes="(max-width: 1024px) 50vw, 33vw"
                className="object-contain p-3 transition-transform duration-300 group-hover:scale-105 sm:p-4"
              />
              <span className="absolute top-2 left-2 rounded-md border border-neutral-200 bg-white/95 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-neutral-700 uppercase sm:top-2.5 sm:left-2.5 sm:px-2 sm:text-[10px]">
                {tile.tag}
              </span>
            </div>
            <div className="flex flex-1 items-center justify-between gap-1.5 border-t border-border px-3 py-2.5 sm:px-4 sm:py-3.5">
              <h3 className="font-heading text-sm font-bold leading-tight text-balance text-card-foreground transition-colors group-hover:text-primary sm:text-base md:text-lg">
                {tile.key}
              </h3>
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground sm:size-7">
                <ArrowUpRight className="size-3.5 sm:size-4" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
