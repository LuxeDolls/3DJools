"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowRight, Layers, Printer, Sparkles, ScanLine, Flame } from "lucide-react"
import type { Locale } from "@/lib/i18n/config"
import type { Dictionary } from "@/lib/i18n/dictionaries/en"
import type { Product } from "@/lib/catalog/types"
import { localizedPath } from "@/lib/i18n/paths"
import { ProductRail } from "@/components/product/product-rail"
import { ProductCard } from "@/components/product/product-card"
import { cn } from "@/lib/utils"

type TabId = "all" | "printers" | "laser-engravers" | "scanners" | "materials"

export function FeaturedShowcase({
  products,
  locale,
  dict,
}: {
  products: Product[]
  locale: Locale
  dict: Dictionary
}) {
  const [activeTab, setActiveTab] = useState<TabId>("all")

  const tabs = useMemo(
    () => [
      { id: "all" as const, label: dict.nav.all, icon: Sparkles },
      { id: "printers" as const, label: dict.categories.printers, icon: Printer },
      { id: "laser-engravers" as const, label: dict.categories.laserEngravers, icon: Flame },
      { id: "scanners" as const, label: dict.categories.scanners, icon: ScanLine },
      {
        id: "materials" as const,
        label: `${dict.categories.resins} & ${dict.categories.filaments}`,
        icon: Layers,
      },
    ],
    [dict],
  )

  const filtered = useMemo(() => {
    if (activeTab === "all") return products
    if (activeTab === "materials") {
      return products.filter(
        (p) => p.category === "resins" || p.category === "filaments" || p.category === "accessories",
      )
    }
    return products.filter((p) => p.category === activeTab)
  }, [products, activeTab])

  const visibleProducts = activeTab === "all" ? filtered.slice(0, 16) : filtered

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:py-16">
      <div className="mb-5 flex items-end justify-between gap-3 sm:mb-8">
        <div className="flex flex-col gap-1.5">
          <p className="font-mono text-[11px] tracking-wider text-primary uppercase">{dict.nav.all}</p>
          <h2 className="font-heading text-2xl leading-none font-bold text-balance text-foreground sm:text-4xl lg:text-5xl">
            {dict.home.featuredPrinters}
          </h2>
        </div>
        <Link
          href={localizedPath(locale, "/catalog")}
          className="group inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground sm:text-sm"
        >
          {dict.home.viewAll}
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div
        role="tablist"
        aria-label={dict.home.featuredPrinters}
        className="no-scrollbar -mx-4 mb-5 flex w-auto items-center gap-1 overflow-x-auto px-4 sm:mx-0 sm:mb-8 sm:w-fit sm:flex-wrap sm:overflow-visible sm:rounded-3xl sm:border sm:border-border sm:bg-card sm:p-1"
      >
        {tabs.map((tab) => {
          const count =
            tab.id === "all"
              ? Math.min(products.length, 16)
              : tab.id === "materials"
                ? products.filter(
                    (p) => p.category === "resins" || p.category === "filaments" || p.category === "accessories",
                  ).length
                : products.filter((p) => p.category === tab.id).length

          if (tab.id !== "all" && count === 0) return null

          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => {
                setActiveTab(tab.id)
              }}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-colors duration-200 sm:gap-2 sm:px-4 sm:text-sm",
                isActive
                  ? "bg-foreground text-background"
                  : "border border-border bg-card text-foreground/75 hover:text-foreground sm:border-0 sm:bg-transparent",
              )}
            >
              <tab.icon className="size-3.5" aria-hidden="true" />
              <span>{tab.label}</span>
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 font-mono text-[10px] tabular-nums",
                  isActive ? "bg-signal text-signal-foreground" : "bg-secondary text-muted-foreground",
                )}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      <ProductRail
        key={activeTab}
        label={dict.home.featuredPrinters}
        className="animate-in fade-in slide-in-from-bottom-2 duration-500"
      >
        {visibleProducts.map((p) => (
          <ProductCard key={p.id} product={p} locale={locale} dict={dict} />
        ))}
      </ProductRail>
    </section>
  )
}
