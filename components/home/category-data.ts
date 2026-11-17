import type { Dictionary } from "@/lib/i18n/dictionaries/en"

export interface HomeCategory {
  id: string
  label: string
  href: string
  image: string
  tag: string
}

export function getHomeCategories(dict: Dictionary): HomeCategory[] {
  return [
    {
      id: "printers",
      label: dict.categories.printers,
      href: "/catalog/printers",
      image: "/brand/tile-printers.jpg?v=4",
      tag: "FDM · SLA · CoreXY",
    },
    {
      id: "filaments",
      label: dict.categories.filaments,
      href: "/catalog/filaments",
      image: "/brand/tile-filaments.jpg?v=4",
      tag: "PLA · PETG · ABS · CF",
    },
    {
      id: "resins",
      label: dict.categories.resins,
      href: "/catalog/resins",
      image: "/brand/tile-resins.jpg?v=8",
      tag: "8K · 12K · Tough",
    },
    {
      id: "accessories",
      label: dict.categories.accessories,
      href: "/catalog/accessories",
      image: "/brand/tile-accessories.jpg?v=7",
      tag: "AMS · Dryers · Plates",
    },
    {
      id: "laser",
      label: dict.categories.laserEngravers,
      href: "/catalog/laser-engravers",
      image: "/brand/tile-laser.jpg?v=5",
      tag: "Diode · CO2",
    },
    {
      id: "scanners",
      label: dict.categories.scanners,
      href: "/catalog/scanners",
      image: "/brand/tile-scanners.jpg?v=8",
      tag: "Blue laser · NIR",
    },
  ]
}
