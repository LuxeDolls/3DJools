/* Catalog public API.
 *
 * - Types are re-exported for use everywhere (client + server).
 * - Pure in-memory helpers (filter/sort/search) come from ./filter and are
 *   safe on the client — they operate on a product array passed down from a
 *   server component.
 * - Async DB read functions come from ./queries and are server-only.
 *
 * Note: the raw `products` / `brands` arrays are no longer exported. Server
 * components load data via the async functions below; client components
 * receive it as props.
 */

export type {
  Brand,
  Category,
  Product,
  ProductSpec,
  CategorySlug,
  Technology,
  UseCase,
  Availability,
} from "./types"

export { filterProducts, sortProducts, searchProducts, getPriceBounds } from "./filter"
export type { CatalogFilters, SortKey } from "./filter"

export {
  getAllProducts,
  getAllBrands,
  getAllCategories,
  getProductBySlug,
  getBrandBySlug,
  getBrandName,
  getProductsByCategory,
  getProductsByBrand,
  getFeaturedProducts,
  getBestsellers,
  getRelatedProducts,
  getAllProductSlugs,
  getAllBrandSlugs,
  getSitemapProducts,
  getActiveSale,
} from "./queries"

/** Static category slugs — safe to keep as a constant (used for route validation). */
export const allCategorySlugs = [
  "printers",
  "filaments",
  "resins",
  "accessories",
  "scanners",
  "laser-engravers",
] as const
