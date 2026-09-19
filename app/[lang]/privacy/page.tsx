import { isLocale, type Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { localizedPath } from "@/lib/i18n/paths"
import { ProsePage, ProseSection } from "@/components/legal/prose-page"
import Link from "next/link"

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : "en"
  const dict = await getDictionary(locale)
  return { title: dict.footer.privacy }
}

export default async function PrivacyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : "en"
  const dict = await getDictionary(locale)

  return (
    <ProsePage
      locale={locale}
      dict={dict}
      title={dict.footer.privacy}
      crumbs={[{ label: dict.common.home, href: "/" }, { label: dict.footer.privacy }]}
    >
      <ProseSection heading="Who we are">
        <p>
          The 3DJools online store is operated by Ln-Squared, Rue du Chénia 17, 7170 Manage, Hainaut,
          Belgium (Company No. 0564.743.304, VAT BE0564743304), which acts as the data controller for the purposes of
          this policy. This privacy policy explains how we collect, use and protect your personal data in accordance
          with the EU General Data Protection Regulation (GDPR).
        </p>
      </ProseSection>
      <ProseSection heading="Data we collect">
        <p>
          We collect the information you provide when placing an order or contacting us (name, address, email, phone,
          payment details) and technical data such as cookies necessary to run the store and understand how it is used.
        </p>
      </ProseSection>
      <ProseSection heading="How we use your data">
        <p>
          Your data is used to process orders, arrange delivery, provide support, and — with your consent — to send you
          marketing communications. We never sell your personal data.
        </p>
      </ProseSection>
      <ProseSection heading="Legal basis for processing">
        <p>We only process your personal data where we have a valid legal basis to do so:</p>
        <ul className="ml-5 list-disc space-y-1">
          <li><strong>Contract performance</strong> — processing your order, payment and delivery details to fulfil a purchase or instalment agreement</li>
          <li><strong>Legal obligation</strong> — retaining invoicing and tax records as required by Belgian and EU law</li>
          <li><strong>Legitimate interest</strong> — preventing fraud, securing our systems, and running essential store functionality</li>
          <li><strong>Consent</strong> — sending marketing communications and using non-essential analytics cookies, which you can withdraw at any time</li>
        </ul>
      </ProseSection>
      <ProseSection heading="Service providers we use">
        <p>
          We share personal data with a limited number of service providers who process it on our behalf, strictly to
          operate the store:
        </p>
        <ul className="ml-5 list-disc space-y-1">
          <li><strong>Vercel</strong> — application hosting and infrastructure</li>
          <li><strong>Neon</strong> — database hosting for order and account records</li>
          <li><strong>Vercel Blob</strong> — storage of product images and uploaded files</li>
          <li><strong>Zoho Mail / Titan Email</strong> — sending transactional emails such as order confirmations and support replies</li>
        </ul>
        <p>
          Each provider is bound by a data processing agreement and may only use your data to provide the service we
          have engaged them for.
        </p>
      </ProseSection>
      <ProseSection heading="Data retention">
        <p>
          We keep order and invoicing data for as long as required by tax and commercial law (generally up to 10
          years), account data for as long as your account is active, and marketing data until you withdraw your
          consent. Data no longer needed for these purposes is securely deleted or anonymised.
        </p>
      </ProseSection>
      <ProseSection heading="International transfers">
        <p>
          Your data is primarily processed within the European Economic Area. Where a service provider we use (such as
          a payment or logistics partner) is located outside the EEA, we rely on adequacy decisions or standard
          contractual clauses to ensure your data remains protected to EU standards.
        </p>
      </ProseSection>
      <ProseSection heading="Your rights">
        <p>Under the GDPR, you have the right to:</p>
        <ul className="ml-5 list-disc space-y-1">
          <li>Access the personal data we hold about you</li>
          <li>Correct inaccurate or incomplete data</li>
          <li>Request deletion of your data (&quot;right to be forgotten&quot;)</li>
          <li>Port your data to another provider in a machine-readable format</li>
          <li>Object to or restrict certain processing, including direct marketing</li>
          <li>Opt out of marketing communications at any time</li>
          <li>Lodge a complaint with your local data protection authority</li>
        </ul>
        <p>To exercise any of these rights, contact us at <a href="mailto:info@3djools.com" className="underline underline-offset-2 hover:text-foreground">info@3djools.com</a>.</p>
        <p>
          As our company is established in Belgium, you also have the right to lodge a complaint directly with the
          Belgian Data Protection Authority (Autorité de protection des données / Gegevensbeschermingsautoriteit),
          Rue de la Presse 35, 1000 Brussels, Belgium — <a href="mailto:contact@apd-gba.be" className="underline underline-offset-2 hover:text-foreground">contact@apd-gba.be</a>.
        </p>
      </ProseSection>
      <ProseSection heading="Cookies">
        <p>
          We use essential cookies to run the store and, with your consent, analytics cookies to improve it. You can
          manage your preferences at any time in our{" "}
          <Link href={localizedPath(locale, "/cookie-policy")} className="underline underline-offset-2">
            cookie policy
          </Link>
          .
        </p>
      </ProseSection>
      <ProseSection heading="Changes to this policy">
        <p>
          We may update this privacy policy from time to time to reflect changes in our practices or legal
          requirements. Material changes will be reflected on this page with an updated &quot;last updated&quot; date.
        </p>
      </ProseSection>
      <ProseSection heading="Contact us">
        <p>
          For any question about this policy or your data, contact Ln-Squared at <a href="mailto:info@3djools.com" className="underline underline-offset-2 hover:text-foreground">info@3djools.com</a>, by phone
          at +49 30 1234 5678, or by post at Rue du Chénia 17, 7170 Manage, Hainaut, Belgium.
        </p>
      </ProseSection>
    </ProsePage>
  )
}
