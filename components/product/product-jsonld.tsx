import type { Product } from "@/lib/catalog/types"
import { ALL_SHIPPING_COUNTRIES, DELIVERY_MAX_DAYS, DELIVERY_MIN_DAYS, HANDLING_MAX_DAYS, HANDLING_MIN_DAYS } from "@/lib/shipping/rates"

// Kept in sync with the returns policy page (app/[lang]/returns/page.tsx): EU
// statutory 14-day withdrawal right, free return shipping, returns by mail.
const RETURN_WINDOW_DAYS = 14
const SHIPPING_COUNTRY_CODES = ALL_SHIPPING_COUNTRIES.map((country) => country.code)

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
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "EUR",
      price: (product.priceCents / 100).toFixed(2),
      itemCondition: "https://schema.org/NewCondition",
      availability: availabilityMap[product.availability],
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: RETURN_WINDOW_DAYS,
        applicableCountry: SHIPPING_COUNTRY_CODES,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: { "@type": "MonetaryAmount", value: "0", currency: "EUR" },
        shippingDestination: { "@type": "DefinedRegion", addressCountry: SHIPPING_COUNTRY_CODES },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: { "@type": "QuantitativeValue", minValue: HANDLING_MIN_DAYS, maxValue: HANDLING_MAX_DAYS, unitCode: "DAY" },
          transitTime: { "@type": "QuantitativeValue", minValue: DELIVERY_MIN_DAYS, maxValue: DELIVERY_MAX_DAYS, unitCode: "DAY" },
        },
      },
    },
  }

  return (
    <script type="application/ld+json" suppressHydrationWarning>
      {JSON.stringify(json)}
    </script>
  )
}
