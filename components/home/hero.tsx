import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Truck, ShieldCheck, RotateCcw, CalendarClock } from "lucide-react"
import type { Locale } from "@/lib/i18n/config"
import type { Dictionary } from "@/lib/i18n/dictionaries/en"
import { localizedPath } from "@/lib/i18n/paths"
import { Button } from "@/components/ui/button"
import { getAllBrands } from "@/lib/catalog"

const TOP_ECOSYSTEM_BRANDS = [
  { slug: "bambu-lab", name: "Bambu Lab" },
  { slug: "prusa", name: "Prusa" },
  { slug: "creality", name: "Creality" },
  { slug: "elegoo", name: "Elegoo" },
  { slug: "formlabs", name: "Formlabs" },
  { slug: "xtool", name: "xTool" },
]

export async function Hero({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const brands = await getAllBrands()

  return (
    <section className="relative z-10 overflow-hidden border-b border-border bg-card shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)]">
      <div className="mx-auto grid max-w-7xl items-center gap-6 px-4 py-6 sm:gap-8 sm:py-10 lg:grid-cols-12 lg:gap-10 lg:py-16">
        <div className="relative z-10 min-w-0 lg:col-span-7">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="hidden items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold tracking-tight text-foreground shadow-[0_10px_25px_-5px_rgba(0,0,0,0.6)] transition-transform duration-200 hover:-translate-y-0.5 sm:inline-flex">
              <Truck className="size-3.5 text-primary" />
              {dict.home.heroEyebrow}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-foreground shadow-[0_10px_25px_-5px_rgba(0,0,0,0.6)] transition-transform duration-200 hover:-translate-y-0.5 sm:border-border sm:bg-background/80 sm:px-3 sm:py-1 sm:text-xs sm:font-medium sm:text-muted-foreground">
              <ShieldCheck className="size-3.5 text-primary" />
              {dict.home.uspWarrantyTitle}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background/80 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground shadow-[0_10px_25px_-5px_rgba(0,0,0,0.6)] transition-transform duration-200 hover:-translate-y-0.5 sm:hidden">
              <RotateCcw className="size-3 text-primary" />
              {dict.footer.returns}
            </span>
          </div>

          <h1 className="mt-3.5 text-balance font-heading text-[1.75rem] font-bold leading-[1.1] tracking-tight text-foreground sm:mt-5 sm:text-5xl sm:leading-[1.05] lg:text-6xl">
            {dict.home.heroTitle}
          </h1>

          <p className="mt-3 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground sm:mt-4 sm:text-lg">
            {dict.home.heroSubtitle}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-2.5 sm:mt-7 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
            <Button
              size="lg"
              className="h-11 px-4 text-xs font-semibold shadow-[0_10px_25px_-5px_rgba(0,0,0,0.6)] sm:px-6 sm:text-sm"
              render={
                <Link href={localizedPath(locale, "/catalog/printers")}>
                  {dict.home.heroCtaPrimary}
                  <ArrowRight data-icon="inline-end" />
                </Link>
              }
            />
            <Button
              size="lg"
              variant="outline"
              className="h-11 px-4 text-xs font-semibold sm:px-5 sm:text-sm"
              render={<Link href={localizedPath(locale, "/deals")}>{dict.home.heroCtaSecondary}</Link>}
            />
            <Button
              size="lg"
              variant="ghost"
              className="col-span-2 h-9 border border-border/60 bg-background/40 px-4 text-xs font-semibold shadow-[0_10px_25px_-5px_rgba(0,0,0,0.6)] sm:col-span-1 sm:h-11 sm:border-0 sm:bg-transparent sm:text-sm sm:shadow-none"
              render={<Link href={localizedPath(locale, "/catalog")}>{dict.home.heroCtaCatalog}</Link>}
            />
          </div>

          {/* Direct Brand Ecosystem Jump Pills */}
          <div className="mt-5 border-t border-border/80 pt-4 sm:mt-8 sm:pt-5">
            <div className="-mx-4 flex items-center gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:gap-2 sm:overflow-visible sm:px-0 sm:pb-0">
              <span className="mr-1 shrink-0 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase sm:text-xs">
                {dict.home.shopByBrand}:
              </span>
              {TOP_ECOSYSTEM_BRANDS.map((b) => (
                <Link
                  key={b.slug}
                  href={localizedPath(locale, `/brands/${b.slug}`)}
                  className="inline-flex shrink-0 items-center rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-foreground shadow-[0_10px_25px_-5px_rgba(0,0,0,0.6)] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:bg-primary/10 hover:text-primary"
                >
                  {b.name}
                </Link>
              ))}
              <Link
                href={localizedPath(locale, "/brands")}
                className="inline-flex shrink-0 items-center gap-1 px-2 py-1 text-xs font-semibold text-primary hover:underline"
              >
                +{Math.max(1, brands.length - TOP_ECOSYSTEM_BRANDS.length)} {dict.common.allBrands.toLowerCase()}
              </Link>
            </div>
          </div>
        </div>

        <div className="relative lg:col-span-5">
          <div className="relative aspect-16/11 overflow-hidden rounded-2xl border border-border bg-secondary/40 shadow-[0_4px_12px_rgba(0,0,0,0.2),0_20px_50px_-12px_rgba(0,0,0,0.5)] sm:aspect-square">
            <Image
              src="/brand/hero-printer.png?v=3"
              alt={dict.home.featuredPrinters}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 42vw"
              className="object-cover"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 via-black/35 to-transparent sm:h-28" />
            <div className="absolute right-2.5 bottom-2.5 left-2.5 flex items-center justify-between gap-2 rounded-xl border border-white/15 bg-black/75 px-3 py-2 text-white shadow-[0_10px_25px_-5px_rgba(0,0,0,0.6)] backdrop-blur-md transition-transform duration-200 hover:-translate-y-0.5 sm:right-3 sm:bottom-3 sm:left-3 sm:px-3.5 sm:py-2.5">
              <div className="flex min-w-0 items-center gap-2">
                <CalendarClock className="size-4 shrink-0 text-primary" />
                <span className="truncate text-xs font-medium">
                  {dict.checkout.payInstallments}
                </span>
              </div>
              <span className="shrink-0 whitespace-nowrap rounded-md bg-primary px-2 py-0.5 text-[11px] font-bold text-primary-foreground shadow-[0_10px_25px_-5px_rgba(0,0,0,0.6)]">
                0% APR
              </span>
            </div>
          </div>

          <div className="-top-3 -left-3 hidden items-center gap-3 rounded-xl border border-border bg-background/95 px-4 py-3 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.6)] backdrop-blur-xs transition-transform duration-200 hover:-translate-y-0.5 sm:absolute sm:flex">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/15 font-heading text-lg font-bold text-primary">
              {brands.length}
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">{dict.home.shopByBrand}</p>
              <p className="text-[11px] text-muted-foreground">{dict.home.uspShippingTitle}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
