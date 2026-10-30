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
    <section className="relative overflow-hidden border-b border-border bg-card">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 lg:grid-cols-12 lg:gap-10 lg:py-16">
        <div className="relative z-10 lg:col-span-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold tracking-tight text-foreground">
              <Truck className="size-3.5 text-primary" />
              {dict.home.heroEyebrow}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground">
              <ShieldCheck className="size-3.5 text-primary" />
              {dict.home.uspWarrantyTitle}
            </span>
          </div>

          <h1 className="mt-5 text-balance font-heading text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {dict.home.heroTitle}
          </h1>

          <p className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            {dict.home.heroSubtitle}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              className="h-11 px-6 text-sm font-semibold shadow-sm"
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
              className="h-11 px-5 text-sm font-semibold"
              render={<Link href={localizedPath(locale, "/deals")}>{dict.home.heroCtaSecondary}</Link>}
            />
            <Button
              size="lg"
              variant="ghost"
              className="h-11 px-4 text-sm font-semibold"
              render={<Link href={localizedPath(locale, "/catalog")}>{dict.home.heroCtaCatalog}</Link>}
            />
          </div>

          {/* Direct Brand Ecosystem Jump Pills */}
          <div className="mt-8 border-t border-border/80 pt-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                {dict.home.shopByBrand}:
              </span>
              {TOP_ECOSYSTEM_BRANDS.map((b) => (
                <Link
                  key={b.slug}
                  href={localizedPath(locale, `/brands/${b.slug}`)}
                  className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-foreground transition-colors hover:border-primary hover:bg-primary/10 hover:text-primary"
                >
                  {b.name}
                </Link>
              ))}
              <Link
                href={localizedPath(locale, "/brands")}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-primary hover:underline"
              >
                +{ Math.max(1, brands.length - TOP_ECOSYSTEM_BRANDS.length) } {dict.common.allBrands.toLowerCase()}
              </Link>
            </div>
          </div>
        </div>

        <div className="relative lg:col-span-5">
          <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-secondary/40 shadow-lg">
            <Image
              src="/brand/hero-printer.png?v=3"
              alt={dict.home.featuredPrinters}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 42vw"
              className="object-cover"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
            <div className="absolute right-3 bottom-3 left-3 flex items-center justify-between gap-2 rounded-xl border border-white/15 bg-black/75 px-3.5 py-2.5 text-white backdrop-blur-md">
              <div className="flex items-center gap-2.5">
                <CalendarClock className="size-4 shrink-0 text-primary" />
                <span className="text-xs font-medium">
                  {dict.checkout.payInstallments}
                </span>
              </div>
              <span className="rounded-md bg-primary px-2 py-0.5 text-[11px] font-bold text-primary-foreground">
                0% APR
              </span>
            </div>
          </div>

          <div className=" -top-3 -left-3 hidden items-center gap-3 rounded-xl border border-border bg-background/95 px-4 py-3 shadow-md backdrop-blur-xs sm:absolute sm:flex">
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
