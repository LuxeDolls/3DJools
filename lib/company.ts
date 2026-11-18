// Single source for the store's legal identity. Visible pages, the installment
// contract and schema.org Organization all read from here.
// Registry facts are from the KBO public extract (1005.815.863) and the
// founding deed published in the Bijlagen bij het Belgisch Staatsblad on
// 12 February 2024 (ref. 24357554) for AIREF SOLUTIONS (Commanditaire vennootschap).
export const COMPANY = {
  tradingName: "3DEureka",
  legalName: "AIREF SOLUTIONS",
  street: "Turnhoutsebaan 243",
  postalCode: "2100",
  city: "Antwerpen",
  region: "Antwerpen",
  country: "Belgium",
  countryCode: "BE",
  statutorySeat: "Antwerpen (Deurne)",
  email: "info@3deureka.com",
  companyNumber: "1005.815.863",
  vat: "BE1005815863",
  url: "https://3deureka.com",
} as const

export const companyStreetLine = `${COMPANY.street}, ${COMPANY.postalCode} ${COMPANY.city}, ${COMPANY.country}`
export const companyFullAddress = companyStreetLine

const COMPANY_TOKENS: Record<string, string> = {
  legalName: COMPANY.legalName,
  tradingName: COMPANY.tradingName,
  street: COMPANY.street,
  postalCode: COMPANY.postalCode,
  city: COMPANY.city,
  region: COMPANY.region,
  companyNumber: COMPANY.companyNumber,
  vat: COMPANY.vat,
  email: COMPANY.email,
}

export function fillCompany<T>(value: T): T {
  return fill(value) as T
}

function fill(value: unknown): unknown {
  if (typeof value === "string") {
    return value.replace(/\{(legalName|tradingName|street|postalCode|city|region|companyNumber|vat|email)\}/g, (_, key: string) => COMPANY_TOKENS[key] ?? "")
  }
  if (Array.isArray(value)) return value.map(fill)
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, fill(item)]))
  }
  return value
}

export function companyJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: COMPANY.tradingName,
    legalName: COMPANY.legalName,
    url: COMPANY.url,
    logo: `${COMPANY.url}/icon-48.png`,
    email: COMPANY.email,
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer service",
        email: COMPANY.email,
      },
    ],
    vatID: COMPANY.vat,
    taxID: COMPANY.companyNumber,
    identifier: COMPANY.companyNumber,
    address: {
      "@type": "PostalAddress",
      streetAddress: COMPANY.street,
      postalCode: COMPANY.postalCode,
      addressLocality: COMPANY.city,
      addressRegion: COMPANY.region,
      addressCountry: COMPANY.countryCode,
    },
  }
}
