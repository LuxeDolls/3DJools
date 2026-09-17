import type { Product } from "@/lib/catalog/types"

/**
 * Product structured data for Google Merchant Center / rich results.
 * Availability + condition + price are the fields GMC/Shopping validate against.
 */
export function ProductJsonLd({ product, url }: { product: Product; url: string }) {
  const availabilityMap: Record<Product["availability"], string> = {
    in_stock: "https://schema.org/InStock",
    out_of_stock: "https://schema.org/OutOfStock",
    preorder: "https://schema.org/PreOrder",
  }

  const json = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    image: product.images.map((i) => i),
    description: product.shortDescription,
    sku: product.mpn,
    mpn: product.mpn,
    ...(product.ean ?? product.gtin ? { gtin13: product.ean ?? product.gtin } : {}),
    brand: { "@type": "Brand", name: product.brandName ?? product.brandSlug },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "EUR",
      price: (product.priceCents / 100).toFixed(2),
      itemCondition: "https://schema.org/NewCondition",
      availability: availabilityMap[product.availability],
    },
  }

  return (
    <script type="application/ld+json" suppressHydrationWarning>
      {JSON.stringify(json)}
    </script>
  )
}
