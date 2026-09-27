import { companyJsonLd } from "@/lib/company"

export function OrganizationJsonLd() {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(companyJsonLd()) }} />
  )
}
