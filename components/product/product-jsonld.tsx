import type { Product } from "@/lib/catalog/types"
import type { StampedReview } from "@/lib/reviews/stamped-reviews"
import type { StampedProductRating } from "@/lib/reviews/stamped-rating"
import { ALL_SHIPPING_COUNTRIES, DELIVERY_MAX_DAYS, DELIVERY_MIN_DAYS, HANDLING_MAX_DAYS, HANDLING_MIN_DAYS } from "@/lib/shipping/rates"

// Kept in sync with the returns policy page (app/[lang]/returns/page.tsx):
// voluntary 30-day return window, free return shipping, returns by mail.
const RETURN_WINDOW_DAYS = 30
const SHIPPING_COUNTRY_CODES = ALL_SHIPPING_COUNTRIES.map((country) => country.code)

/**
 * Product structured data for Google Merchant Center / rich results.
 * Availability + condition + price are the fields GMC/Shopping validate against.
 */
export function ProductJsonLd({
  product,
  url,
  reviews = [],
  rating,
}: {
  product: Product
  url: string
  reviews?: StampedReview[]
  rating?: StampedProductRating
}) {
  const availabilityMap: Record<Product["availability"], string> = {
    in_stock: "https://schema.org/InStock",
    out_of_stock: "https://schema.org/OutOfStock",
    preorder: "https://schema.org/PreOrder",
  }

  const json = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "@id": `${url}#product`,
    productID: product.productId,
    name: product.name,
    image: product.images.map((i) => new URL(i, url).toString()),
    description: product.shortDescription,
    sku: product.mpn || product.productId,
    mpn: product.mpn,
    ...(product.ean ?? product.gtin ? { gtin13: product.ean ?? product.gtin } : {}),
    brand: { "@type": "Brand", name: product.brandName ?? product.brandSlug },
    ...(rating && rating.rating > 0 && rating.count > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: rating.rating,
            reviewCount: rating.count,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    ...(reviews.length > 0
      ? {
          review: reviews.slice(0, 10).map((r) => ({
            "@type": "Review",
            author: { "@type": "Person", name: r.author },
            ...(r.date ? { datePublished: r.date.slice(0, 10) } : {}),
            ...(r.title ? { name: r.title } : {}),
            ...(r.message ? { reviewBody: r.message } : {}),
            reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5, worstRating: 1 },
          })),
        }
      : {}),
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
    <script
      type="application/ld+json"
      // Review text comes from customers; escaping "<" keeps "</script>" from closing the tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json).replace(/</g, "\\u003c") }}
    />
  )
}
