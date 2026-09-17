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
                <th className="px-4 py-3 font-semibold">Method</th>
                <th className="px-4 py-3 font-semibold">Delivery time</th>
                <th className="px-4 py-3 font-semibold">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="px-4 py-3 font-medium text-foreground">EU standard shipping</td>
                <td className="px-4 py-3">5–10 working days</td>
                <td className="px-4 py-3">
                  €4.90 <span className="font-medium text-primary">(free over €100)</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          We ship across the European Union with trusted carriers (DPD, GLS, DHL and UPS). Every order is processed
          and dispatched within 48 hours on business days; orders placed before 14:00 CET on a working day are often
          dispatched the same day.
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
          Standard rates apply to most EU destinations. Remote areas and islands (for example Cyprus and Malta) and
          non-EU European destinations (Switzerland, Norway) may have a small surcharge, calculated automatically at
          checkout based on your delivery address.
        </p>
      </ProseSection>

      <ProseSection heading="Large & heavy items">
        <p>
          Large printers, enclosures and other bulky items may carry a supplemental freight fee shown clearly at
          checkout before you pay. These are shipped fully insured.
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
