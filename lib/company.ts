// Single source for the store's legal identity. Visible pages, the installment
// contract and schema.org Organization all read from here.
// Registry facts are from the KvK extract of 18 October 2026 (KvK 81194560).
// VAT NL861980669B01 is the number published by Creditsafe and confirmed valid
// in VIES for BJX BUSINESS GROUP B.V. at Herengracht 449 A, Amsterdam.
export const COMPANY = {
  tradingName: "DnD3D",
  legalName: "BJX Business Group B.V.",
  street: "Herengracht 449 A",
  postalCode: "1017 BR",
  city: "Amsterdam",
  region: "",
  country: "Netherlands",
  countryCode: "NL",
  statutorySeat: "Amsterdam",
  phoneDisplay: "+31 970 102 675 78",
  phoneTel: "+3197010267578",
  whatsappDisplay: "+31 970 102 675 78",
  whatsappTel: "+3197010267578",
  whatsappUrl: "https://wa.me/3197010267578",
  email: "info@dnd3d.com",
  companyNumber: "81194560",
  establishmentNumber: "000047508043",
  rsin: "861980669",
  vat: "NL861980669B01",
  url: "https://www.dnd3d.com",
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
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer service",
        telephone: COMPANY.phoneTel,
        email: COMPANY.email,
      },
      {
        "@type": "ContactPoint",
        contactType: "customer service",
        name: "WhatsApp",
        telephone: COMPANY.whatsappTel,
        url: COMPANY.whatsappUrl,
      },
    ],
    vatID: COMPANY.vat,
    taxID: COMPANY.rsin,
    identifier: COMPANY.companyNumber,
    address: {
      "@type": "PostalAddress",
      streetAddress: COMPANY.street,
      postalCode: COMPANY.postalCode,
      addressLocality: COMPANY.city,
      addressCountry: COMPANY.countryCode,
    },
  }
}
