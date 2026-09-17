import type { Dictionary } from "@/lib/i18n/dictionaries/en"

export interface NavItem {
  label: string
  href: string
}

/** Primary navigation, resolved against the active dictionary. */
export function getNavItems(dict: Dictionary): NavItem[] {
  return [
    { label: dict.nav.catalog, href: "/catalog" },
    { label: dict.nav.printers, href: "/catalog/printers" },
    { label: dict.nav.filaments, href: "/catalog/filaments" },
    { label: dict.nav.resins, href: "/catalog/resins" },
    { label: dict.nav.spareParts, href: "/catalog/spare-parts" },
    { label: dict.nav.accessories, href: "/catalog/accessories" },
    { label: dict.nav.scanners, href: "/catalog/scanners" },
    { label: dict.nav.laserEngravers, href: "/catalog/laser-engravers" },
    { label: dict.nav.brands, href: "/brands" },
    { label: dict.nav.deals, href: "/deals" },
  ]
}
