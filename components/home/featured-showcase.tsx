"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowRight, Layers, Printer, Sparkles, ScanLine, Flame } from "lucide-react"
import type { Locale } from "@/lib/i18n/config"
import type { Dictionary } from "@/lib/i18n/dictionaries/en"
import type { Product } from "@/lib/catalog/types"
import { localizedPath } from "@/lib/i18n/paths"
import { ProductGrid } from "@/components/product/product-grid"
import { Button } from "@/components/ui/button"
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
  const [expanded, setExpanded] = useState(false)

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

  const visibleProducts = expanded ? filtered : filtered.slice(0, 8)

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-balance font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {dict.home.featuredPrinters}
          </h2>
        </div>
        <Link
          href={localizedPath(locale, "/catalog")}
          className="group inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
        >
          {dict.home.viewAll}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Interactive Category Filter Bar */}
      <div className="mb-6 -mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
        {tabs.map((tab) => {
          const count =
            tab.id === "all"
              ? products.length
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
              onClick={() => {
                setActiveTab(tab.id)
                setExpanded(false)
              }}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-all sm:text-sm",
                isActive
                  ? "border-primary bg-primary text-primary-foreground shadow-xs"
                  : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-secondary/60",
              )}
            >
              <tab.icon className="size-3.5" />
              <span>{tab.label}</span>
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                  isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-secondary text-muted-foreground",
                )}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      <ProductGrid products={visibleProducts} locale={locale} dict={dict} />

      {filtered.length > 8 && !expanded && (
        <div className="mt-8 flex justify-center">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setExpanded(true)}
            className="min-w-48 font-semibold"
          >
            {dict.common.readMore} ({filtered.length - 8}+)
          </Button>
        </div>
      )}
    </section>
  )
}
