import type { Dictionary } from "@/lib/i18n/dictionaries/en"
import type { CategorySlug } from "./types"

/** Resolve a category slug to its localized label. */
export function categoryLabel(slug: CategorySlug, dict: Dictionary): string {
  switch (slug) {
    case "printers":
      return dict.categories.printers
    case "filaments":
      return dict.categories.filaments
    case "resins":
      return dict.categories.resins
    case "spare-parts":
      return dict.categories.spareParts
    case "accessories":
      return dict.categories.accessories
    case "scanners":
      return dict.categories.scanners
    case "laser-engravers":
      return dict.categories.laserEngravers
  }
}
