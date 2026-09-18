import { isLocale, type Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { ProsePage, ProseSection } from "@/components/legal/prose-page"

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : "en"
  const dict = await getDictionary(locale)
  return { title: dict.footer.shipping }
}

export default async function ShippingPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : "en"
  const dict = await getDictionary(locale)

  return (
    <ProsePage
      locale={locale}
      dict={dict}
      title={dict.footer.shipping}
      crumbs={[{ label: dict.common.home, href: "/" }, { label: dict.footer.shipping }]}
    >
      <ProseSection heading="Delivery options & pricing">
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary text-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Destination</th>
                <th className="px-4 py-3 font-semibold">Delivery time</th>
                <th className="px-4 py-3 font-semibold">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="px-4 py-3 font-medium text-foreground">Belgium</td>
                <td className="px-4 py-3">5–10 working days</td>
                <td className="px-4 py-3">
                  €4.90 <span className="font-medium text-primary">(free over €250)</span>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-foreground">Rest of the EU & neighbouring countries</td>
                <td className="px-4 py-3">5–10 working days</td>
                <td className="px-4 py-3">
                  €14.99 <span className="font-medium text-primary">(free over €250)</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          The delivery country you select at checkout automatically determines your shipping cost — no manual
          calculation needed. We ship with trusted carriers (DPD, GLS, DHL and UPS). Every order is processed and
          dispatched within 48 hours on business days; orders placed before 14:00 CET on a working day are often
          dispatched the same day. Our 3D printers, laser engravers and other equipment are large and heavy, so the
          flat international rate reflects the real cost of shipping this kind of freight — there are no additional
          surprise surcharges at checkout.
        </p>
      </ProseSection>

      <ProseSection heading="Business hours">
        <p>
          Our team works Monday to Friday, 9:00–18:00 CET (excluding Belgian public holidays). Orders and enquiries
          received outside these hours are processed on the next business day, still within our 48-hour turnaround.
        </p>
      </ProseSection>

      <ProseSection heading="Shipping zones">
        <p>
          We ship to Belgium and to the rest of the European Union plus a handful of neighbouring countries
          (Switzerland, Norway, United Kingdom). Belgium is our domestic market and has a lower flat rate; every
          other destination we deliver to pays the same flat international rate regardless of distance.
        </p>
      </ProseSection>

      <ProseSection heading="Tracking your order">
        <p>
          Once your order ships you&apos;ll receive an email with a tracking number. Registered customers can follow
          every order from payment to delivery in their account area.
        </p>
      </ProseSection>
    </ProsePage>
  )
}
