import Link from "next/link"
import { isLocale, type Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { localizedPath } from "@/lib/i18n/paths"
import { ProsePage, ProseSection } from "@/components/legal/prose-page"

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : "en"
  const dict = await getDictionary(locale)
  return { title: dict.footer.terms }
}

export default async function TermsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : "en"
  const dict = await getDictionary(locale)

  return (
    <ProsePage
      locale={locale}
      dict={dict}
      title={dict.footer.terms}
      crumbs={[{ label: dict.common.home, href: "/" }, { label: dict.footer.terms }]}
    >
      <ProseSection heading="1. Contracting party">
        <p>
          The 3DJools online store is operated by Ln-Squared, Rue du Chénia 17, 7170 Manage, Hainaut,
          Belgium (Company No. 0564.743.304, VAT BE0564743304). References to &quot;we&quot;, &quot;us&quot; or the
          &quot;Seller&quot; in these terms mean Ln-Squared. See our{" "}
          <Link href={localizedPath(locale, "/impressum")} className="underline underline-offset-2">
            legal notice
          </Link>{" "}
          for full contact details. You can also reach us directly at{" "}
          <a href="mailto:info@3djools.com" className="underline underline-offset-2 hover:text-foreground">
            info@3djools.com
          </a>.
        </p>
      </ProseSection>
      <ProseSection heading="2. Definitions">
        <p>
          &quot;Customer&quot;, &quot;you&quot; or &quot;your&quot; means the person or business placing an order
          through the store. &quot;Goods&quot; means any product listed for sale on the store. &quot;Order&quot; means
          a purchase request submitted and confirmed through our checkout.
        </p>
      </ProseSection>
      <ProseSection heading="3. Scope">
        <p>
          These terms and conditions govern all orders placed through the 3DJools online store by consumers and
          businesses within the European Union and associated territories.
        </p>
      </ProseSection>
      <ProseSection heading="4. Prices & payment">
        <p>
          All prices are in euro (EUR) and include statutory VAT where applicable. We accept SEPA bank transfer,
          cryptocurrency and interest-free instalments as described on our payment methods page. Card payment is
          temporarily unavailable.
        </p>
      </ProseSection>
      <ProseSection heading="5. Delivery">
        <p>
          Delivery times and costs are as stated on our shipping page. Risk passes to the consumer on delivery of the
          goods.
        </p>
      </ProseSection>
      <ProseSection heading="6. Right of withdrawal">
        <p>
          Consumers have a statutory 14-day right of withdrawal, which 3DJools voluntarily extends to a 30-day return
          policy as described in our returns policy, which forms part of these terms.
        </p>
      </ProseSection>
      <ProseSection heading="7. Warranty & liability">
        <p>
          Statutory warranty rights apply to all goods. Nothing in these terms limits liability for death, personal
          injury or any liability that cannot be excluded under applicable law.
        </p>
      </ProseSection>
      <ProseSection heading="8. User responsibilities & restrictions">
        <p>
          You agree to provide accurate order and account information, to use the store only for lawful purposes, and
          not to attempt to disrupt, reverse-engineer or gain unauthorised access to our systems. We may cancel orders
          or suspend accounts placed in breach of these terms.
        </p>
      </ProseSection>
      <ProseSection heading="9. Cookies">
        <p>
          Our store uses cookies to operate the shopping cart, keep you signed in and understand how the site is used.
          Details of the cookies we use and how to manage your preferences are set out in our{" "}
          <Link href={localizedPath(locale, "/cookie-policy")} className="underline underline-offset-2">
            cookie policy
          </Link>
          .
        </p>
      </ProseSection>
      <ProseSection heading="10. Your suggestions">
        <p>
          If you send us feedback, ideas or suggestions about our products or store, you agree that we may use them
          without restriction or compensation to you.
        </p>
      </ProseSection>
      <ProseSection heading="11. Your consent">
        <p>
          By using this store and placing an order, you consent to these terms and to our{" "}
          <Link href={localizedPath(locale, "/privacy")} className="underline underline-offset-2">
            privacy policy
          </Link>
          .
        </p>
      </ProseSection>
      <ProseSection heading="12. Links to other websites">
        <p>
          Our store may link to third-party websites, such as manufacturer pages or payment providers. We are not
          responsible for the content, policies or practices of any third-party website.
        </p>
      </ProseSection>
      <ProseSection heading="13. Changes to these terms">
        <p>
          We may update these terms from time to time to reflect changes in our services or legal requirements. The
          version in force at the time you place an order applies to that order. Material changes will be reflected on
          this page with an updated &quot;last updated&quot; date.
        </p>
      </ProseSection>
      <ProseSection heading="14. Governing law & disputes">
        <p>
          These terms are governed by the laws of Belgium and applicable EU consumer-protection law, without prejudice
          to any mandatory consumer-protection provisions of the consumer&apos;s country of residence. Disputes may
          also be submitted to the EU Online Dispute Resolution platform referenced in our legal notice.
        </p>
      </ProseSection>
    </ProsePage>
  )
}
