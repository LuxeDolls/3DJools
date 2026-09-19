import { isLocale, type Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { ProsePage, ProseSection } from "@/components/legal/prose-page"

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : "en"
  const dict = await getDictionary(locale)
  return { title: dict.footer.returns }
}

export default async function ReturnsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : "en"
  const dict = await getDictionary(locale)

  return (
    <ProsePage
      locale={locale}
      dict={dict}
      title={dict.footer.returns}
      crumbs={[{ label: dict.common.home, href: "/" }, { label: dict.footer.returns }]}
    >
      <ProseSection heading="Order cancellation">
        <p>
          You can cancel an order free of charge within 2 hours of placing it, as long as it has not yet been
          dispatched, by contacting us with your order reference. Once an order has shipped, it can no longer be
          cancelled and instead falls under our right-of-withdrawal and returns process below.
        </p>
      </ProseSection>

      <ProseSection heading="14-day right of withdrawal">
        <p>
          As a consumer in the EU you have the right to withdraw from your purchase within 14 days of receiving your
          goods, without giving any reason, in line with EU consumer protection law. To exercise this right, contact us
          with your order reference and we&apos;ll guide you through the return.
        </p>
      </ProseSection>

      <ProseSection heading="How to return an item">
        <p>
          Items must be returned in their original condition and packaging to: Ln-Squared (3DJools returns), Rue
          du Chénia 17, 7170 Manage, Hainaut, Belgium. Once we receive and inspect the return, we&apos;ll
          issue a refund to your original payment method within 14 days. For instalment and bank-transfer orders,
          refunds are made to the account used for payment.
        </p>
      </ProseSection>

      <ProseSection heading="Who pays for return shipping">
        <p>
          If you are withdrawing from your purchase within the 14-day period simply because you changed your mind, you
          are responsible for the direct cost of returning the item to us — we recommend using a tracked shipping
          service. If your order arrived damaged, faulty or incorrect, we cover the return shipping cost in full; see
          &quot;Damaged or faulty on arrival&quot; below.
        </p>
      </ProseSection>

      <ProseSection heading="Warranty">
        <p>
          Every machine we sell is covered by the EU statutory 2-year consumer guarantee against defects. Many
          manufacturers also provide their own additional warranty. If something goes wrong, our support team will help
          arrange a repair or replacement.
        </p>
      </ProseSection>

      <ProseSection heading="Damaged or faulty on arrival">
        <p>
          If your order arrives damaged or faulty, contact us within 48 hours with photos and we&apos;ll arrange a free
          replacement or return at no cost to you.
        </p>
      </ProseSection>

      <ProseSection heading="Contact information">
        <p>
          For cancellations, returns or refund questions, reach Ln-Squared at <a href="mailto:info@3djools.com" className="underline underline-offset-2 hover:text-foreground">info@3djools.com</a>, by phone at
          +49 30 1234 5678 (Mon–Fri, 9:00–18:00 CET), or by post at Rue du Chénia 17, 7170 Manage, Hainaut,
          Belgium.
        </p>
      </ProseSection>
    </ProsePage>
  )
}
