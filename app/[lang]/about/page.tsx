import Link from "next/link"
import { isLocale, type Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { localizedPath } from "@/lib/i18n/paths"
import { ProsePage, ProseSection } from "@/components/legal/prose-page"

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : "en"
  const dict = await getDictionary(locale)
  return { title: dict.footer.about }
}

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : "en"
  const dict = await getDictionary(locale)

  return (
    <ProsePage
      locale={locale}
      dict={dict}
      title={dict.footer.about}
      crumbs={[{ label: dict.common.home, href: "/" }, { label: dict.footer.about }]}
    >
      <ProseSection heading="Serious machines, honest prices">
        <p>
          3DJools is a European store dedicated to 3D printing. We hand-pick the machines, filament, resin and
          accessories that makers actually rely on — from proven bestsellers to the latest CoreXY flagships — and offer
          them at prices that make sense.
        </p>
      </ProseSection>
      <ProseSection heading="Built for makers across Europe">
        <p>
          We ship fast across the EU, speak your language in six countries, and back every purchase with expert support
          and the EU 2-year consumer guarantee. Whether you&apos;re printing your first benchy or running a small
          production farm, we&apos;re here before and after the sale.
        </p>
      </ProseSection>
      <ProseSection heading="The brands we trust">
        <p>
          Bambu Lab, Prusa, Creality, Anycubic, Elegoo, Flashforge and Snapmaker — we stock the brands with the track
          record, the community and the spare-part availability to keep you printing for years.
        </p>
      </ProseSection>
      <ProseSection heading="Company & contact details">
        <p>
          3DJools is operated by Ln-Squared, Rue du Chénia 17, 7170 Manage, Hainaut, Belgium (Company No.
          0564.743.304, VAT BE0564743304).
        </p>
        <p>
          Email: <a href="mailto:info@3djools.com" className="underline underline-offset-2 hover:text-foreground">info@3djools.com</a>
          <br />
          Phone: +49 30 1234 5678
          <br />
          Business hours: Monday–Friday, 9:00–18:00 CET
        </p>
        <p>
          Orders are processed and dispatched within 48 hours on business days, and we reply to every enquiry within
          48 hours.
        </p>
        <p>
          Reach us anytime on our{" "}
          <Link href={localizedPath(locale, "/contact")} className="underline underline-offset-2">
            contact page
          </Link>
          , or see full registration details in our{" "}
          <Link href={localizedPath(locale, "/impressum")} className="underline underline-offset-2">
            legal notice
          </Link>
          .
        </p>
      </ProseSection>
    </ProsePage>
  )
}
