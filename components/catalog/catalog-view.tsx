"use client"

import { useMemo, useState } from "react"
import { SlidersHorizontal, X } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { ProductGrid } from "@/components/product/product-grid"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { filterProducts, sortProducts, type SortKey } from "@/lib/catalog/filter"
import type { Product, Brand, CategorySlug, Technology, UseCase } from "@/lib/catalog/types"
import type { Locale } from "@/lib/i18n/config"
import { formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"

interface CatalogViewProps {
  locale: Locale
  /** All products + brands, loaded by the parent server component. */
  products: Product[]
  brands: Brand[]
  /** Restrict to a single category (category page) or allow all (main catalog). */
  lockedCategory?: CategorySlug
  lockedBrand?: string
}

const CATEGORY_OPTIONS: CategorySlug[] = [
  "printers",
  "filaments",
  "resins",
  "accessories",
  "scanners",
  "laser-engravers",
]
const TECH_OPTIONS: Technology[] = ["fdm", "resin", "laser"]
const USECASE_OPTIONS: UseCase[] = ["home", "makers", "business", "engineering"]

export function CatalogView({ locale, products, brands: allBrands, lockedCategory, lockedBrand }: CatalogViewProps) {
  const { dict } = useI18n()
  const [selectedCategories, setSelectedCategories] = useState<CategorySlug[]>([])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedTech, setSelectedTech] = useState<Technology[]>([])
  const [selectedUseCases, setSelectedUseCases] = useState<UseCase[]>([])
  const [sort, setSort] = useState<SortKey>("featured")

  const results = useMemo(() => {
    const filtered = filterProducts(products, {
      categories: lockedCategory ? [lockedCategory] : selectedCategories.length ? selectedCategories : undefined,
      brands: lockedBrand ? [lockedBrand] : selectedBrands.length ? selectedBrands : undefined,
      technologies: selectedTech.length ? selectedTech : undefined,
      useCases: selectedUseCases.length ? selectedUseCases : undefined,
    })
    return sortProducts(filtered, sort)
  }, [products, lockedCategory, lockedBrand, selectedCategories, selectedBrands, selectedTech, selectedUseCases, sort])

  function toggle<T>(list: T[], value: T, setter: (v: T[]) => void) {
    setter(list.includes(value) ? list.filter((v) => v !== value) : [...list, value])
  }

  const activeCount =
    selectedCategories.length + selectedBrands.length + selectedTech.length + selectedUseCases.length

  function clearAll() {
    setSelectedCategories([])
    setSelectedBrands([])
    setSelectedTech([])
    setSelectedUseCases([])
  }

  /** Brands actually present in this category, in catalog sort order — powers the
   *  "shop by brand" chip row so e.g. Filaments reads like brand sub-categories. */
  const categoryBrands = useMemo(() => {
    if (!lockedCategory) return []
    const slugsInCategory = new Set(products.map((p) => p.brandSlug))
    return allBrands.filter((b) => slugsInCategory.has(b.slug))
  }, [products, allBrands, lockedCategory])

  function selectBrandChip(slug: string) {
    setSelectedBrands((current) => (current.length === 1 && current[0] === slug ? [] : [slug]))
  }

  const filterPanel = (
    <div className="space-y-6">
      {!lockedCategory && (
        <FilterGroup title={dict.common.category}>
          {CATEGORY_OPTIONS.map((c) => (
            <FilterCheck
              key={c}
              label={
                dict.categories[
                  c === "spare-parts" ? "spareParts" : c === "laser-engravers" ? "laserEngravers" : (c as "printers")
                ]
              }
              checked={selectedCategories.includes(c)}
              onChange={() => toggle(selectedCategories, c, setSelectedCategories)}
            />
          ))}
        </FilterGroup>
      )}

      {!lockedBrand && (
        <FilterGroup title={dict.common.brand}>
          {(lockedCategory ? categoryBrands : allBrands).map((b) => (
            <FilterCheck
              key={b.slug}
              label={b.name}
              checked={selectedBrands.includes(b.slug)}
              onChange={() => toggle(selectedBrands, b.slug, setSelectedBrands)}
            />
          ))}
        </FilterGroup>
      )}

      <FilterGroup title={dict.technology.fdm + " / " + dict.technology.resin + " / " + dict.technology.laser}>
        {TECH_OPTIONS.map((t) => (
          <FilterCheck
            key={t}
            label={dict.technology[t]}
            checked={selectedTech.includes(t)}
            onChange={() => toggle(selectedTech, t, setSelectedTech)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title={dict.useCases.makers}>
        {USECASE_OPTIONS.map((u) => (
          <FilterCheck
            key={u}
            label={dict.useCases[u]}
            checked={selectedUseCases.includes(u)}
            onChange={() => toggle(selectedUseCases, u, setSelectedUseCases)}
          />
        ))}
      </FilterGroup>
    </div>
  )

  return (
    <div>
      {categoryBrands.length > 1 && (
        <div className="mb-8 -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
          <button
            type="button"
            onClick={() => setSelectedBrands([])}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              selectedBrands.length === 0
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-foreground hover:border-primary/50",
            )}
          >
            {dict.common.allBrands}
          </button>
          {categoryBrands.map((b) => (
            <button
              key={b.slug}
              type="button"
              onClick={() => selectBrandChip(b.slug)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                selectedBrands.includes(b.slug)
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:border-primary/50",
              )}
            >
              {b.name}
            </button>
          ))}
        </div>
      )}

      <div className="lg:grid lg:grid-cols-[16rem_1fr] lg:gap-8">
        {/* Desktop sidebar */}
      <aside className="hidden lg:block">
        <div className="sticky top-40">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-foreground">
              {dict.common.filters}
            </h2>
            {activeCount > 0 && (
              <button onClick={clearAll} className="text-xs font-medium text-primary hover:underline">
                {dict.common.clearAll}
              </button>
            )}
          </div>
          {filterPanel}
        </div>
      </aside>

      <div>
        {/* Toolbar */}
        <div className="mb-6 flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{results.length}</span> {dict.common.results}
          </p>

          <div className="flex items-center gap-2">
            {/* Mobile filter trigger */}
            <Sheet>
              <SheetTrigger
                render={
                  <Button variant="outline" size="sm" className="lg:hidden">
                    <SlidersHorizontal className="size-4" />
                    {dict.common.filters}
                    {activeCount > 0 && (
                      <span className="ml-1 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                        {activeCount}
                      </span>
                    )}
                  </Button>
                }
              />
              <SheetContent side="left" className="w-80 max-w-[85vw] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>{dict.common.filters}</SheetTitle>
                </SheetHeader>
                <div className="mt-4">
                  {activeCount > 0 && (
                    <button onClick={clearAll} className="mb-4 text-xs font-medium text-primary hover:underline">
                      {dict.common.clearAll}
                    </button>
                  )}
                  {filterPanel}
                </div>
              </SheetContent>
            </Sheet>

            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger className="w-[180px]" size="sm" aria-label={dict.common.sortBy}>
                <SelectValue placeholder={dict.common.sortBy} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">{dict.sort.featured}</SelectItem>
                <SelectItem value="price-asc">{dict.sort.priceAsc}</SelectItem>
                <SelectItem value="price-desc">{dict.sort.priceDesc}</SelectItem>
                <SelectItem value="name">{dict.sort.name}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active filter chips */}
        {activeCount > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {[...selectedCategories, ...selectedBrands, ...selectedTech, ...selectedUseCases].map((f) => (
              <span
                key={f}
                className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
              >
                {f}
              </span>
            ))}
          </div>
        )}

        {results.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border py-20 text-center">
            <X className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{dict.common.noResults}</p>
            <Button variant="outline" size="sm" onClick={clearAll}>
              {dict.common.clearAll}
            </Button>
          </div>
        ) : (
          <ProductGrid products={results} locale={locale} dict={dict} />
        )}
        </div>
      </div>
    </div>
  )
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function FilterCheck({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-foreground">
      <span
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded border transition-colors",
          checked ? "border-primary bg-primary text-primary-foreground" : "border-input bg-background",
        )}
      >
        {checked && (
          <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M2.5 6.5L5 9l4.5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
      <span>{label}</span>
    </label>
  )
}
