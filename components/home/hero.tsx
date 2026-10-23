import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Truck } from "lucide-react"
import type { Locale } from "@/lib/i18n/config"
import type { Dictionary } from "@/lib/i18n/dictionaries/en"
import { localizedPath } from "@/lib/i18n/paths"
import { Button } from "@/components/ui/button"
import { getProductsByBrand } from "@/lib/catalog"

export async function Hero({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const bambuProducts = await getProductsByBrand("bambu-lab")
  const bambuModelCount = bambuProducts.filter((p) => p.category === "printers").length
  return (
    <section className="relative overflow-hidden border-b border-border bg-card">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 lg:grid-cols-2 lg:gap-6 lg:py-20">
        <div className="relative z-10">
          <p className="inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-semibold tracking-tight text-foreground">
            <Truck className="size-3.5 text-primary" />
            {dict.home.heroEyebrow}
          </p>
          <h1 className="mt-5 text-balance font-heading text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {dict.home.heroTitle}
          </h1>
          <p className="mt-5 max-w-md text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            {dict.home.heroSubtitle}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              render={
                <Link href={localizedPath(locale, "/catalog/printers")}>
                  {dict.home.heroCtaPrimary}
                  <ArrowRight className="size-4" />
                </Link>
              }
            />
            <Button
              size="lg"
              variant="outline"
              render={<Link href={localizedPath(locale, "/deals")}>{dict.home.heroCtaSecondary}</Link>}
            />
            <Button
              size="lg"
              variant="outline"
              render={<Link href={localizedPath(locale, "/catalog")}>{dict.home.heroCtaCatalog}</Link>}
            />
          </div>
        </div>

        <div className="relative">
          <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-secondary/40">
            <Image
              src="/brand/hero-printer.png?v=3"
              alt={dict.home.featuredPrinters}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="absolute -bottom-4 -left-4 hidden rounded-lg border border-border bg-background p-4 shadow-md sm:block">
            <p className="font-heading text-2xl font-bold text-primary">{bambuModelCount}</p>
            <p className="text-xs text-muted-foreground">{dict.home.shopByBrand}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
