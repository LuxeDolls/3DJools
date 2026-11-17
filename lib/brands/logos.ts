export type BrandLogo =
  | { kind: "mark"; src: string }
  | { kind: "wordmark"; src: string; aspect: number }

/** Monochrome marks from theSVG.org, recoloured via CSS mask so they follow the theme. */
const BRAND_LOGOS: Record<string, BrandLogo> = {
  "bambu-lab": { kind: "mark", src: "/brands/bambu-lab.svg" },
  anycubic: { kind: "mark", src: "/brands/anycubic.svg" },
  elegoo: { kind: "mark", src: "/brands/elegoo.svg" },
  flashforge: { kind: "mark", src: "/brands/flashforge.svg" },
  creality: { kind: "wordmark", src: "/brands/creality.svg", aspect: 24 / 3.34 },
  prusa: { kind: "wordmark", src: "/brands/prusa.svg", aspect: 272.4 / 166.3 },
}

export function getBrandLogo(slug: string): BrandLogo | undefined {
  return BRAND_LOGOS[slug]
}

export function brandInitials(name: string): string {
  const words = name.replace(/[^\p{L}\p{N} ]/gu, " ").split(/\s+/).filter(Boolean)
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}
