import Link from "next/link"
import type { CSSProperties } from "react"
import type { Locale } from "@/lib/i18n/config"
import type { Dictionary } from "@/lib/i18n/dictionaries/en"
import { localizedPath } from "@/lib/i18n/paths"
import { getAllBrands } from "@/lib/catalog"
import { brandInitials, getBrandLogo, wordmarkHeight } from "@/lib/brands/logos"

function maskStyle(src: string, extra?: CSSProperties): CSSProperties {
  const url = `url(${src})`
  return {
    maskImage: url,
    WebkitMaskImage: url,
    maskSize: "contain",
    WebkitMaskSize: "contain",
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
    maskPosition: "center",
    WebkitMaskPosition: "center",
    ...extra,
  }
}

function BrandBadge({ slug, name }: { slug: string; name: string }) {
  const logo = getBrandLogo(slug)

  if (logo?.kind === "wordmark") {
    const height = wordmarkHeight(logo.aspect)
    return (
      <>
        <span
          aria-hidden="true"
          data-wordmark=""
          className="block bg-current"
          style={maskStyle(logo.src, { height, width: Math.round(height * logo.aspect) })}
        />
        <span className="sr-only">{name}</span>
      </>
    )
  }

  return (
    <>
      <span
        aria-hidden="true"
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-foreground transition-colors group-hover/brand:bg-primary-foreground/15 group-hover/brand:text-primary-foreground sm:size-10"
      >
        {logo ? (
          <span className="block size-5 bg-current sm:size-[22px]" style={maskStyle(logo.src)} />
        ) : (
          <span className="font-mono text-[11px] font-bold tracking-tight">{brandInitials(name)}</span>
        )}
      </span>
      <span>{name}</span>
    </>
  )
}

export async function BrandMarquee({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const brands = (await getAllBrands()).slice(0, 18)
  if (brands.length === 0) return null
  const loop = [...brands, ...brands]

  return (
    <section aria-label={dict.home.shopByBrand} className="py-8 sm:py-12">
      <div className="mx-auto mb-4 flex max-w-7xl items-center justify-between gap-3 px-4">
        <p className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
          {dict.home.shopByBrand} · {brands.length}+
        </p>
        <Link
          href={localizedPath(locale, "/brands")}
          className="text-xs font-semibold text-primary underline-offset-4 hover:underline sm:text-sm"
        >
          {dict.common.allBrands}
        </Link>
      </div>
      <div className="group relative overflow-hidden py-3 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <ul className="animate-marquee flex w-max items-center gap-3 group-hover:[animation-play-state:paused] sm:gap-4">
          {loop.map((b, i) => (
            <li key={`${b.slug}-${i}`} aria-hidden={i >= brands.length ? true : undefined}>
              <Link
                href={localizedPath(locale, `/brands/${b.slug}`)}
                tabIndex={i >= brands.length ? -1 : undefined}
                className="group/brand flex h-14 items-center gap-3 rounded-full border border-border/90 bg-card/90 pr-6 pl-2.5 font-heading text-lg font-bold whitespace-nowrap text-foreground/80 shadow-[var(--shadow-float-sm)] backdrop-blur-md transition-all duration-250 hover:-translate-y-1 hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-[var(--shadow-float-sm-hover)] sm:h-16 sm:pr-8 sm:pl-3 sm:text-2xl has-[[data-wordmark]]:pl-6 sm:has-[[data-wordmark]]:pl-8"
              >
                <BrandBadge slug={b.slug} name={b.name} />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
