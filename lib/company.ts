// Single source for the store's legal identity. Visible pages, the installment
// contract and schema.org Organization all read from here.
export const COMPANY = {
  tradingName: "3DJools",
  legalName: "LN-SQUARED",
  street: "Rue du Chénia 17",
  postalCode: "7170",
  city: "Manage",
  region: "Hainaut",
  country: "Belgium",
  countryCode: "BE",
  phoneDisplay: "+32 460 00 80 70",
  phoneTel: "+32460008070",
  email: "info@3djools.com",
  companyNumber: "0564.743.304",
  vat: "BE0564743304",
  url: "https://www.3djools.com",
} as const

export const companyStreetLine = `${COMPANY.street}, ${COMPANY.postalCode} ${COMPANY.city}, ${COMPANY.country}`
export const companyFullAddress = `${COMPANY.street}, ${COMPANY.postalCode} ${COMPANY.city}, ${COMPANY.region}, ${COMPANY.country}`

const COMPANY_TOKENS: Record<string, string> = {
  legalName: COMPANY.legalName,
  tradingName: COMPANY.tradingName,
  street: COMPANY.street,
  postalCode: COMPANY.postalCode,
  city: COMPANY.city,
  region: COMPANY.region,
  companyNumber: COMPANY.companyNumber,
  vat: COMPANY.vat,
  phone: COMPANY.phoneDisplay,
  email: COMPANY.email,
}

export function fillCompany<T>(value: T): T {
  return fill(value) as T
}

function fill(value: unknown): unknown {
  if (typeof value === "string") {
    return value.replace(/\{(legalName|tradingName|street|postalCode|city|region|companyNumber|vat|phone|email)\}/g, (_, key: string) => COMPANY_TOKENS[key] ?? "")
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
    email: COMPANY.email,
    telephone: COMPANY.phoneTel,
    vatID: COMPANY.vat,
    taxID: COMPANY.companyNumber,
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
