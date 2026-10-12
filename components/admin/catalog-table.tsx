"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Archive, ArchiveRestore, Check, Loader2, Pencil, Plus, Search, X } from "lucide-react"
import { getProductForEdit, setProductArchived } from "@/lib/actions/admin"
import type { AdminProductDetail, AdminProductRow } from "@/lib/catalog/queries"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProductForm } from "@/components/admin/product-form"

function euros(cents: number): string {
  return (cents / 100).toFixed(2)
}

export function CatalogTable({
  rows,
  brands,
  categories,
}: {
  rows: AdminProductRow[]
  brands: { slug: string; name: string }[]
  categories: { slug: string; key: string }[]
}) {
  const router = useRouter()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [detail, setDetail] = useState<AdminProductDetail | null>(null)
  const [loadingSlug, setLoadingSlug] = useState<string | null>(null)
  const [busySlug, setBusySlug] = useState<string | null>(null)
  const [query, setQuery] = useState("")

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter(
      (row) => row.name.toLowerCase().includes(q) || row.brandName.toLowerCase().includes(q),
    )
  }, [rows, query])

  function openCreate() {
    setDetail(null)
    setSheetOpen(true)
  }

  async function openEdit(slug: string) {
    setLoadingSlug(slug)
    const d = await getProductForEdit(slug)
    setLoadingSlug(null)
    if (d) {
      setDetail(d)
      setSheetOpen(true)
    }
  }

  async function toggleArchive(slug: string, archived: boolean) {
    setBusySlug(slug)
    await setProductArchived(slug, archived)
    setBusySlug(null)
    router.refresh()
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products by name…"
            className="pl-8 pr-8"
            aria-label="Search products by name"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
        <Button onClick={openCreate} className="min-h-11 w-full sm:w-auto">
          <Plus className="size-4" /> Add product
        </Button>
      </div>

      <ul className="space-y-2 lg:hidden">
        {filteredRows.length === 0 ? (
          <li className="rounded-lg border border-border px-4 py-8 text-center text-sm text-muted-foreground">
            No products match &quot;{query}&quot;.
          </li>
        ) : null}
        {filteredRows.map((row) => (
          <li key={row.slug} className={`rounded-lg border border-border p-3 ${row.archived ? "opacity-55" : ""}`}>
            <div className="flex items-start gap-3">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded bg-muted">
                {row.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={row.image || "/placeholder.svg"} alt="" className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium leading-snug">{row.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {row.brandName} · {row.category}
                </p>
                <p className="mt-1 text-sm">
                  €{euros(row.priceCents)}
                  <span className={row.stock === 0 ? "text-destructive" : "text-muted-foreground"}>
                    {" "}
                    · {row.stock} in stock
                  </span>
                </p>
                {row.archived ? (
                  <Badge variant="secondary" className="mt-1 text-[10px]">
                    Archived
                  </Badge>
                ) : null}
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button variant="outline" className="min-h-11" onClick={() => openEdit(row.slug)} disabled={loadingSlug === row.slug}>
                {loadingSlug === row.slug ? <Loader2 className="h-4 w-4 animate-spin" /> : <Pencil className="h-4 w-4" />}
                Edit
              </Button>
              <Button
                variant="outline"
                className="min-h-11"
                onClick={() => toggleArchive(row.slug, !row.archived)}
                disabled={busySlug === row.slug}
              >
                {busySlug === row.slug ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : row.archived ? (
                  <ArchiveRestore className="h-4 w-4" />
                ) : (
                  <Archive className="h-4 w-4" />
                )}
                {row.archived ? "Restore" : "Archive"}
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto rounded-lg border border-border lg:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Price €</th>
              <th className="px-4 py-3 font-medium">Compare €</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">EAN</th>
              <th className="px-4 py-3 font-medium">Featured</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No products match &quot;{query}&quot;.
                </td>
              </tr>
            )}
            {filteredRows.map((row) => (
              <tr
                key={row.slug}
                className={`border-b border-border last:border-0 ${row.archived ? "opacity-55" : ""}`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-muted">
                      {row.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={row.image || "/placeholder.svg"} alt="" className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{row.name}</p>
                        {row.archived && (
                          <Badge variant="secondary" className="text-[10px]">
                            Archived
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {row.brandName} · {row.category}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">{euros(row.priceCents)}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {row.compareAtCents ? euros(row.compareAtCents) : "—"}
                </td>
                <td className="px-4 py-3">
                  <span className={row.stock === 0 ? "text-destructive" : ""}>{row.stock}</span>
                </td>
                <td className="px-4 py-3 tabular-nums text-muted-foreground">{row.ean || "—"}</td>
                <td className="px-4 py-3">{row.featured ? <Check className="h-4 w-4 text-emerald-500" /> : "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(row.slug)} disabled={loadingSlug === row.slug}>
                      {loadingSlug === row.slug ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Pencil className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleArchive(row.slug, !row.archived)}
                      disabled={busySlug === row.slug}
                      aria-label={row.archived ? "Restore product" : "Archive product"}
                    >
                      {busySlug === row.slug ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : row.archived ? (
                        <ArchiveRestore className="h-4 w-4" />
                      ) : (
                        <Archive className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ProductForm
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        brands={brands}
        categories={categories}
        initial={detail}
      />
    </div>
  )
}
