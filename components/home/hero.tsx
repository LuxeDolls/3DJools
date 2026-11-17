import Link from "next/link"
import { ArrowRight, ShieldCheck, Truck, CalendarClock } from "lucide-react"
import type { Locale } from "@/lib/i18n/config"
import type { Dictionary } from "@/lib/i18n/dictionaries/en"
import { localizedPath } from "@/lib/i18n/paths"
import { getHomeCategories } from "./category-data"
import { CategoryTurntable } from "./category-turntable"

export function Hero({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const categories = getHomeCategories(dict)
  const facts = [
    { icon: Truck, label: dict.home.uspShippingTitle },
    { icon: ShieldCheck, label: dict.home.uspWarrantyTitle },
    { icon: CalendarClock, label: dict.checkout.payInstallments },
  ]

  return (
    <section className="px-2 pt-3 sm:px-4 sm:pt-5">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-primary text-primary-foreground sm:rounded-[2.5rem]">
        <div className="bg-dots pointer-events-none absolute inset-0 text-primary-foreground opacity-60" aria-hidden="true" />

        <div className="relative grid gap-8 p-5 sm:p-8 lg:grid-cols-12 lg:items-center lg:gap-10 lg:p-10">
          <div className="flex min-w-0 flex-col gap-5 sm:gap-6 lg:col-span-7">
            <span className="animate-rise inline-flex w-fit items-center gap-2 rounded-full bg-primary-foreground/12 py-1 pr-3 pl-1 text-xs font-medium ring-1 ring-primary-foreground/20 sm:text-sm">
              <span className="rounded-full bg-signal px-2 py-0.5 font-mono text-[10px] font-bold text-signal-foreground uppercase">
                EU
              </span>
              {dict.home.heroEyebrow}
            </span>

            <h1
              className="animate-rise font-heading text-[2.4rem] leading-[0.95] font-extrabold text-balance sm:text-6xl lg:text-[4.2rem]"
              style={{ animationDelay: "80ms" }}
            >
              {dict.home.heroTitle}
            </h1>

            <p
              className="animate-rise max-w-lg text-pretty text-sm leading-relaxed text-primary-foreground/80 sm:text-base"
              style={{ animationDelay: "160ms" }}
            >
              {dict.home.heroSubtitle}
            </p>

            <div className="animate-rise flex flex-col gap-2.5 sm:flex-row" style={{ animationDelay: "240ms" }}>
              <Link
                href={localizedPath(locale, "/catalog/printers")}
                className="group inline-flex h-13 items-center justify-between gap-3 rounded-full bg-signal pr-1.5 pl-6 text-sm font-bold text-signal-foreground transition-transform hover:scale-[1.02] sm:justify-start"
              >
                {dict.home.heroCtaPrimary}
                <span className="flex size-10 items-center justify-center rounded-full bg-signal-foreground text-signal transition-transform group-hover:translate-x-0.5">
                  <ArrowRight className="size-4" aria-hidden="true" />
                </span>
              </Link>
              <Link
                href={localizedPath(locale, "/deals")}
                className="inline-flex h-13 items-center justify-center rounded-full px-6 text-sm font-semibold ring-1 ring-primary-foreground/35 transition-colors hover:bg-primary-foreground/10"
              >
                {dict.home.heroCtaSecondary}
              </Link>
            </div>

            <ul
              className="animate-rise flex flex-wrap gap-x-5 gap-y-2 border-t border-primary-foreground/20 pt-5 text-xs font-medium text-primary-foreground/85 sm:text-sm"
              style={{ animationDelay: "320ms" }}
            >
              {facts.map((f) => (
                <li key={f.label} className="flex items-center gap-2">
                  <f.icon className="size-4 text-signal" aria-hidden="true" />
                  {f.label}
                </li>
              ))}
            </ul>
          </div>

          <div className="animate-rise mx-auto w-full min-w-0 max-w-xl lg:col-span-5 lg:max-w-none" style={{ animationDelay: "200ms" }}>
            <CategoryTurntable
              categories={categories}
              hrefs={categories.map((c) => localizedPath(locale, c.href))}
              shopLabel={dict.home.shopByCategory}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
