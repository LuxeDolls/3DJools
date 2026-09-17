import { getAdminProducts, getAllBrands, getAllCategories } from "@/lib/catalog/queries"
import { isAdmin } from "@/lib/admin-auth"
import { CatalogTable } from "@/components/admin/catalog-table"

export const dynamic = "force-dynamic"

export default async function AdminCatalogPage() {
  if (!(await isAdmin())) return null
  const [rows, brands, categories] = await Promise.all([getAdminProducts(), getAllBrands(), getAllCategories()])
  const active = rows.filter((r) => !r.archived)
  const featured = active.filter((r) => r.featured).length
  const outOfStock = active.filter((r) => r.stock === 0).length
  const archived = rows.length - active.length

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-sans text-2xl font-semibold tracking-tight">Catalog</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {active.length} products · {featured} featured · {outOfStock} out of stock
          {archived > 0 ? ` · ${archived} archived` : ""}
        </p>
      </div>
      <CatalogTable
        rows={rows}
        brands={brands.map((b) => ({ slug: b.slug, name: b.name }))}
        categories={categories.map((c) => ({ slug: c.slug, key: c.key }))}
      />
    </div>
  )
}
