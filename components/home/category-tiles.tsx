import Image from "next/image"
import Link from "next/link"
import type { Locale } from "@/lib/i18n/config"
import type { Dictionary } from "@/lib/i18n/dictionaries/en"
import { localizedPath } from "@/lib/i18n/paths"
import { SectionHeading } from "@/components/section-heading"

export function CategoryTiles({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const tiles = [
    { key: dict.categories.printers, href: "/catalog/printers", image: "/brand/tile-printers.png?v=2" },
    { key: dict.categories.resins, href: "/catalog/resins", image: "/brand/tile-resins.png?v=2" },
    { key: dict.categories.filaments, href: "/catalog/filaments", image: "/brand/tile-filaments.png?v=2" },
    { key: dict.categories.accessories, href: "/catalog/accessories", image: "/brand/tile-accessories.png?v=2" },
    {
      key: dict.categories.laserEngravers,
      href: "/catalog/laser-engravers",
      image: "/brand/tile-laser.png?v=2",
    },
    {
      key: dict.categories.scanners,
      href: "/catalog/scanners",
      image: "/brand/tile-scanners.png?v=2",
    },
  ]

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <SectionHeading title={dict.home.shopByCategory} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
        {tiles.map((tile, i) => (
          <Link
            key={tile.href}
            href={localizedPath(locale, tile.href)}
            className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary/60"
          >
            <div className="relative aspect-square overflow-hidden bg-secondary/40">
              <Image
                src={tile.image || "/placeholder.svg"}
                alt={tile.key}
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <h3 className="border-t border-border px-4 py-3 font-heading text-base font-bold text-balance text-card-foreground md:text-lg">
              {tile.key}
            </h3>
          </Link>
        ))}
      </div>
    </section>
  )
}
