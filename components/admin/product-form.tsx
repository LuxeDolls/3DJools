"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Plus, Star, Trash2, Upload, X } from "lucide-react"
import {
  createProduct,
  updateProductDetails,
  type ProductDetailsInput,
} from "@/lib/actions/admin"
import type { AdminProductDetail } from "@/lib/catalog/queries"
import type { Availability, CategorySlug, ProductSpec, Technology, UseCase } from "@/lib/catalog/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

const selectClass =
  "h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"

const AVAILABILITY_OPTIONS: { value: Availability; label: string }[] = [
  { value: "in_stock", label: "In stock" },
  { value: "out_of_stock", label: "Out of stock" },
  { value: "preorder", label: "Pre-order" },
]

const USE_CASE_OPTIONS: { value: UseCase; label: string }[] = [
  { value: "home", label: "Home" },
  { value: "makers", label: "Makers" },
  { value: "business", label: "Business" },
  { value: "engineering", label: "Engineering" },
]

type FormState = {
  name: string
  brandSlug: string
  category: CategorySlug
  technology: Technology | null
  availability: Availability
  price: string
  compare: string
  stock: string
  gtin: string
  ean: string
  mpn: string
  shortDescription: string
  description: string
  highlights: string
  specs: ProductSpec[]
  images: string[]
  useCases: UseCase[]
  featured: boolean
  bestseller: boolean
  weight: string
  bvx: string
  bvy: string
  bvz: string
}

function euros(cents: number): string {
  return (cents / 100).toFixed(2)
}

function toFormState(p: AdminProductDetail | null): FormState {
  return {
    name: p?.name ?? "",
    brandSlug: p?.brandSlug ?? "",
    category: p?.category ?? "printers",
    technology: p?.technology ?? null,
    availability: p?.availability ?? "in_stock",
    price: p ? euros(p.priceCents) : "",
    compare: p?.compareAtCents ? euros(p.compareAtCents) : "",
    stock: p ? String(p.stock) : "0",
    gtin: p?.gtin ?? "",
    ean: p?.ean ?? "",
    mpn: p?.mpn ?? "",
    shortDescription: p?.shortDescription ?? "",
    description: p?.description ?? "",
    highlights: (p?.highlights ?? []).join("\n"),
    specs: p?.specs ?? [],
    images: p?.images ?? [],
    useCases: p?.useCases ?? [],
    featured: p?.featured ?? false,
    bestseller: p?.bestseller ?? false,
    weight: p ? String(p.weightKg) : "0",
    bvx: p?.buildVolumeMm ? String(p.buildVolumeMm.x) : "",
    bvy: p?.buildVolumeMm ? String(p.buildVolumeMm.y) : "",
    bvz: p?.buildVolumeMm ? String(p.buildVolumeMm.z) : "",
  }
}

export function ProductForm({
  open,
  onOpenChange,
  brands,
  categories,
  initial,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  brands: { slug: string; name: string }[]
  categories: { slug: string; key: string }[]
  initial: AdminProductDetail | null
}) {
  const router = useRouter()
  const isEdit = !!initial
  const fileRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState<FormState>(() => toFormState(initial))
  const [imageUrl, setImageUrl] = useState("")
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setForm(toFormState(initial))
    setImageUrl("")
    setError(null)
  }, [initial, open])

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function toggleUseCase(u: UseCase) {
    setForm((f) => ({
      ...f,
      useCases: f.useCases.includes(u) ? f.useCases.filter((x) => x !== u) : [...f.useCases, u],
    }))
  }

  function addImageUrl() {
    const url = imageUrl.trim()
    if (!url) return
    setForm((f) => ({ ...f, images: [...f.images, url] }))
    setImageUrl("")
  }

  function removeImage(index: number) {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== index) }))
  }

  function makeHeroImage(index: number) {
    setForm((f) => {
      if (index === 0) return f
      const images = [...f.images]
      const [chosen] = images.splice(index, 1)
      images.unshift(chosen)
      return { ...f, images }
    })
  }

  async function onFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append("file", file)
      fd.append("slug", form.name || "product")
      const res = await fetch("/api/admin/upload-product-image", { method: "POST", body: fd })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Upload failed")
      } else {
        setForm((f) => ({ ...f, images: [...f.images, data.url] }))
      }
    } catch {
      setError("Upload failed")
    } finally {
      setUploading(false)
    }
  }

  function updateSpec(index: number, patch: Partial<ProductSpec>) {
    setForm((f) => ({
      ...f,
      specs: f.specs.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    }))
  }

  function addSpec() {
    setForm((f) => ({ ...f, specs: [...f.specs, { key: "", label: "", value: "" }] }))
  }

  function removeSpec(index: number) {
    setForm((f) => ({ ...f, specs: f.specs.filter((_, i) => i !== index) }))
  }

  function buildInput(): ProductDetailsInput {
    const bvx = Number.parseFloat(form.bvx)
    const bvy = Number.parseFloat(form.bvy)
    const bvz = Number.parseFloat(form.bvz)
    const bv =
      [bvx, bvy, bvz].every((n) => Number.isFinite(n) && n > 0) ? { x: bvx, y: bvy, z: bvz } : null
    return {
      name: form.name,
      brandSlug: form.brandSlug,
      category: form.category,
      technology: form.technology,
      useCases: form.useCases,
      priceCents: Math.round(Number.parseFloat(form.price || "0") * 100) || 0,
      compareAtCents: form.compare ? Math.round(Number.parseFloat(form.compare) * 100) : null,
      availability: form.availability,
      stock: Number.parseInt(form.stock || "0", 10) || 0,
      gtin: form.gtin || null,
      ean: form.ean || null,
      mpn: form.mpn,
      shortDescription: form.shortDescription,
      description: form.description,
      highlights: form.highlights.split("\n").map((s) => s.trim()).filter(Boolean),
      specs: form.specs,
      images: form.images,
      featured: form.featured,
      bestseller: form.bestseller,
      weightKg: Number.parseFloat(form.weight || "0") || 0,
      buildVolumeMm: bv,
    }
  }

  async function save() {
    setError(null)
    if (!form.name.trim()) return setError("Name is required")
    if (!form.brandSlug) return setError("Please select a brand")
    const priceCents = Math.round(Number.parseFloat(form.price || "0") * 100)
    if (!Number.isFinite(priceCents) || priceCents <= 0) return setError("Enter a valid price")

    setSaving(true)
    const input = buildInput()
    const res = isEdit ? await updateProductDetails(initial!.slug, input) : await createProduct(input)
    setSaving(false)
    if (!res.ok) {
      setError(res.error || "Could not save the product")
      return
    }
    onOpenChange(false)
    router.refresh()
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:!max-w-xl">
        <SheetHeader className="border-b border-border">
          <SheetTitle>{isEdit ? "Edit product" : "Add product"}</SheetTitle>
          <SheetDescription>
            {isEdit ? initial!.name : "Create a new catalog product with photos and an EAN code."}
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4">
          {/* Basics */}
          <div className="space-y-1.5">
            <Label htmlFor="pf-name">Name</Label>
            <Input id="pf-name" value={form.name} onChange={(e) => set("name", e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="pf-brand">Brand</Label>
              <select
                id="pf-brand"
                className={selectClass}
                value={form.brandSlug}
                onChange={(e) => set("brandSlug", e.target.value)}
              >
                <option value="">Select brand…</option>
                {brands.map((b) => (
                  <option key={b.slug} value={b.slug}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pf-category">Category</Label>
              <select
                id="pf-category"
                className={selectClass}
                value={form.category}
                onChange={(e) => set("category", e.target.value as CategorySlug)}
              >
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.slug}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="pf-tech">Technology</Label>
              <select
                id="pf-tech"
                className={selectClass}
                value={form.technology ?? ""}
                onChange={(e) => set("technology", e.target.value ? (e.target.value as Technology) : null)}
              >
                <option value="">None</option>
                <option value="fdm">FDM</option>
                <option value="resin">Resin</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pf-availability">Availability</Label>
              <select
                id="pf-availability"
                className={selectClass}
                value={form.availability}
                onChange={(e) => set("availability", e.target.value as Availability)}
              >
                {AVAILABILITY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing & stock */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="pf-price">Price €</Label>
              <Input id="pf-price" inputMode="decimal" value={form.price} onChange={(e) => set("price", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pf-compare">Compare €</Label>
              <Input
                id="pf-compare"
                inputMode="decimal"
                placeholder="—"
                value={form.compare}
                onChange={(e) => set("compare", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pf-stock">Stock</Label>
              <Input id="pf-stock" inputMode="numeric" value={form.stock} onChange={(e) => set("stock", e.target.value)} />
            </div>
          </div>

          {/* Identifiers */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="pf-ean">EAN</Label>
              <Input id="pf-ean" value={form.ean} onChange={(e) => set("ean", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pf-gtin">GTIN</Label>
              <Input id="pf-gtin" value={form.gtin} onChange={(e) => set("gtin", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pf-mpn">MPN</Label>
              <Input id="pf-mpn" value={form.mpn} onChange={(e) => set("mpn", e.target.value)} />
            </div>
          </div>

          {/* Images */}
          <div className="space-y-2">
            <Label>Photos</Label>
            {form.images.length > 0 && (
              <>
                <p className="text-xs text-muted-foreground">
                  The hero photo is shown on product cards and at the top of the product page. Hover a
                  photo and click the star to make it the hero.
                </p>
                <div className="flex flex-wrap gap-2">
                  {form.images.map((url, i) => (
                    <div
                      key={`${url}-${i}`}
                      className={`group relative h-16 w-16 overflow-hidden rounded border bg-muted ${
                        i === 0 ? "border-primary ring-2 ring-primary/40" : "border-border"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url || "/placeholder.svg"} alt="" className="h-full w-full object-cover" />
                      {i === 0 && (
                        <span className="absolute left-0 top-0 flex items-center gap-0.5 rounded-br bg-primary px-1 py-0.5 text-[9px] font-medium text-primary-foreground">
                          <Star className="size-2.5 fill-current" /> Hero
                        </span>
                      )}
                      {i !== 0 && (
                        <button
                          type="button"
                          onClick={() => makeHeroImage(i)}
                          className="absolute left-0 top-0 flex size-5 items-center justify-center rounded-br bg-background/90 text-foreground opacity-0 transition-opacity group-hover:opacity-100"
                          aria-label="Make hero photo"
                          title="Make hero photo"
                        >
                          <Star className="size-3" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute right-0 top-0 flex size-4 items-center justify-center rounded-bl bg-background/90 text-foreground"
                        aria-label="Remove image"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
            <div className="flex gap-2">
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Paste image URL"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                    e.preventDefault()
                    addImageUrl()
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addImageUrl}>
                Add
              </Button>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFilePick} />
              <Button type="button" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
                {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                Upload
              </Button>
            </div>
          </div>

          {/* Descriptions */}
          <div className="space-y-1.5">
            <Label htmlFor="pf-short">Short description</Label>
            <Textarea
              id="pf-short"
              value={form.shortDescription}
              onChange={(e) => set("shortDescription", e.target.value)}
              className="min-h-14"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pf-desc">Description</Label>
            <Textarea id="pf-desc" value={form.description} onChange={(e) => set("description", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pf-highlights">Highlights (one per line)</Label>
            <Textarea
              id="pf-highlights"
              value={form.highlights}
              onChange={(e) => set("highlights", e.target.value)}
              className="min-h-14"
            />
          </div>

          {/* Specs */}
          <div className="space-y-2">
            <Label>Specifications</Label>
            {form.specs.map((s, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={s.label}
                  onChange={(e) => updateSpec(i, { label: e.target.value })}
                  placeholder="Label"
                  className="flex-1"
                />
                <Input
                  value={s.value}
                  onChange={(e) => updateSpec(i, { value: e.target.value })}
                  placeholder="Value"
                  className="flex-1"
                />
                <Button type="button" variant="ghost" size="icon-sm" onClick={() => removeSpec(i)} aria-label="Remove spec">
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addSpec}>
              <Plus className="size-4" /> Add specification
            </Button>
          </div>

          {/* Use cases */}
          <div className="space-y-2">
            <Label>Use cases</Label>
            <div className="flex flex-wrap gap-3">
              {USE_CASE_OPTIONS.map((o) => (
                <label key={o.value} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="size-4"
                    checked={form.useCases.includes(o.value)}
                    onChange={() => toggleUseCase(o.value)}
                  />
                  {o.label}
                </label>
              ))}
            </div>
          </div>

          {/* Flags & logistics */}
          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="size-4" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} />
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="size-4" checked={form.bestseller} onChange={(e) => set("bestseller", e.target.checked)} />
              Bestseller
            </label>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="pf-weight">Weight kg</Label>
              <Input id="pf-weight" inputMode="decimal" value={form.weight} onChange={(e) => set("weight", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pf-bvx">Build X</Label>
              <Input id="pf-bvx" inputMode="numeric" placeholder="mm" value={form.bvx} onChange={(e) => set("bvx", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pf-bvy">Build Y</Label>
              <Input id="pf-bvy" inputMode="numeric" placeholder="mm" value={form.bvy} onChange={(e) => set("bvy", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pf-bvz">Build Z</Label>
              <Input id="pf-bvz" inputMode="numeric" placeholder="mm" value={form.bvz} onChange={(e) => set("bvz", e.target.value)} />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <SheetFooter className="flex-row justify-end gap-2 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving && <Loader2 className="size-4 animate-spin" />}
            {isEdit ? "Save changes" : "Create product"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
