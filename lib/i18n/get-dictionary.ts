import "server-only"
import type { Locale } from "./config"
import { en } from "./dictionaries/en"
import type { Dictionary } from "./dictionaries/en"

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => Promise.resolve(en),
  de: () => import("./dictionaries/de").then((m) => m.de),
  it: () => import("./dictionaries/it").then((m) => m.it),
  fr: () => import("./dictionaries/fr").then((m) => m.fr),
  nl: () => import("./dictionaries/nl").then((m) => m.nl),
  es: () => import("./dictionaries/es").then((m) => m.es),
}

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  const loader = dictionaries[locale] ?? dictionaries.en
  return loader()
}

export type { Dictionary }
