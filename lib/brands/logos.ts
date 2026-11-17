export type BrandLogo =
  | { kind: "mark"; src: string }
  | { kind: "wordmark"; src: string; aspect: number }

const mark = (file: string): BrandLogo => ({ kind: "mark", src: `/brands/${file}` })
const wordmark = (file: string, aspect: number): BrandLogo => ({ kind: "wordmark", src: `/brands/${file}`, aspect })

/**
 * Official brand logos (theSVG.org, manufacturers' own sites, Wikimedia Commons) reduced to
 * single-colour alpha masks so they are recoloured with CSS and follow the theme.
 */
const BRAND_LOGOS: Record<string, BrandLogo> = {
  "bambu-lab": mark("bambu-lab.svg"),
  anycubic: mark("anycubic.svg"),
  elegoo: mark("elegoo.svg"),
  flashforge: mark("flashforge.svg"),
  biqu: mark("biqu.png"),
  "scan-dimension": mark("scan-dimension.png"),
  twotrees: mark("twotrees.png"),
  maertz: mark("maertz.png"),

  creality: wordmark("creality.svg", 24 / 3.34),
  prusa: wordmark("prusa.svg", 272.4 / 166.3),
  aliencell: wordmark("aliencell.png", 7.756),
  azurefilm: wordmark("azurefilm.png", 3.119),
  "basf-ultracur3d": wordmark("basf.png", 5.275),
  "basf-ultrafuse": wordmark("basf.png", 5.275),
  buildtak: wordmark("buildtak.png", 5.713),
  craftbot: wordmark("craftbot.png", 2.3),
  esun: wordmark("esun.png", 4.138),
  extrudr: wordmark("extrudr.png", 6.494),
  formlabs: wordmark("formlabs.png", 6.831),
  "matter-and-form": wordmark("matter-and-form.png", 10.219),
  "micro-swiss": wordmark("micro-swiss.png", 5.419),
  nordson: wordmark("nordson.png", 2.931),
  phrozen: wordmark("phrozen.png", 4.269),
  polymaker: wordmark("polymaker.png", 4.569),
  qidi: wordmark("qidi.png", 2.813),
  raise3d: wordmark("raise3d.png", 4.338),
  "shining-3d": wordmark("shining-3d.png", 4.931),
  snapmaker: wordmark("snapmaker.png", 5.206),
  sovol: wordmark("sovol.png", 4.188),
  toocaa: wordmark("toocaa.png", 10),
  ultimaker: wordmark("ultimaker.png", 6.819),
  voltera: wordmark("voltera.png", 3.575),
  xtool: wordmark("xtool.png", 7.7),
  xyzprinting: wordmark("xyzprinting.png", 4.244),
  zortrax: wordmark("zortrax.png", 4.625),
}

export function getBrandLogo(slug: string): BrandLogo | undefined {
  return BRAND_LOGOS[slug]
}

/** Display height (px) that keeps wordmarks of very different proportions visually balanced. */
export function wordmarkHeight(aspect: number): number {
  return Math.round(Math.min(40, Math.max(16, 150 / aspect)))
}

export function brandInitials(name: string): string {
  const words = name.replace(/[^\p{L}\p{N} ]/gu, " ").split(/\s+/).filter(Boolean)
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}
