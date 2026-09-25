import Image from "next/image"
import Link from "next/link"
import type { Locale } from "@/lib/i18n/config"
import type { Dictionary } from "@/lib/i18n/dictionaries/en"
import { localizedPath } from "@/lib/i18n/paths"
import { SectionHeading } from "@/components/section-heading"

export function CategoryTiles({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const tiles = [
    { key: dict.categories.printers, href: "/catalog/printers", image: "/products/bambu-p1s-2.jpg" },
    { key: dict.categories.resins, href: "/catalog/resins", image: "/products/resin-standard.png" },
    { key: dict.categories.filaments, href: "/catalog/filaments", image: "/products/filament-pla.png" },
    { key: dict.categories.accessories, href: "/catalog/accessories", image: "/products/wash-cure.png" },
    { key: dict.categories.spareParts, href: "/catalog/spare-parts", image: "/products/nozzle-kit.png" },
    {
      key: dict.categories.laserEngravers,
      href: "/catalog/laser-engravers",
      image: "/products/creality-falcon-2-pro-60w-1.jpg",
    },
    {
      key: dict.categories.scanners,
      href: "/catalog/scanners",
      image: "https://www.3djools.com/media/products/matter-and-form-three/1.png",
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
            className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card"
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
