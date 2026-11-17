import type { Dictionary } from "@/lib/i18n/dictionaries/en"

export interface HomeCategory {
  id: string
  label: string
  href: string
  /** Square-ish product shot used by the bento tiles and the catalog strip. */
  image: string
  /** Different product from the same category, used by the hero carousel. */
  heroImage: string
  tag: string
}

export function getHomeCategories(dict: Dictionary): HomeCategory[] {
  return [
    {
      id: "printers",
      label: dict.categories.printers,
      href: "/catalog/printers",
      image: "/brand/cat-printers.webp",
      heroImage: "/brand/hero-printers.webp",
      tag: "FDM · SLA · CoreXY",
    },
    {
      id: "filaments",
      label: dict.categories.filaments,
      href: "/catalog/filaments",
      image: "/brand/cat-filaments.webp",
      heroImage: "/brand/cat-filaments.webp",
      tag: "PLA · PETG · ABS · CF",
    },
    {
      id: "resins",
      label: dict.categories.resins,
      href: "/catalog/resins",
      image: "/brand/cat-resins.webp",
      heroImage: "/brand/hero-resins.webp",
      tag: "8K · 12K · Tough",
    },
    {
      id: "accessories",
      label: dict.categories.accessories,
      href: "/catalog/accessories",
      image: "/brand/cat-accessories.webp",
      heroImage: "/brand/hero-accessories.webp",
      tag: "AMS · Dryers · Plates",
    },
    {
      id: "laser",
      label: dict.categories.laserEngravers,
      href: "/catalog/laser-engravers",
      image: "/brand/cat-laser.webp",
      heroImage: "/brand/hero-laser.webp",
      tag: "Diode · CO2",
    },
    {
      id: "scanners",
      label: dict.categories.scanners,
      href: "/catalog/scanners",
      image: "/brand/cat-scanners.webp",
      heroImage: "/brand/hero-scanners.webp",
      tag: "Blue laser · NIR",
    },
  ]
}
