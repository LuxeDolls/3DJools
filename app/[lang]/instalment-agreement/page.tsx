import { isLocale, type Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { ProsePage, ProseSection } from "@/components/legal/prose-page"
import { CREDITOR } from "@/components/installments/contract"

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : "en"
  const dict = await getDictionary(locale)
  return { title: dict.footer.instalmentAgreement }
}

export default async function InstalmentAgreementPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : "en"
  const dict = await getDictionary(locale)

  return (
    <ProsePage
      locale={locale}
      dict={dict}
      title={dict.footer.instalmentAgreement}
      crumbs={[{ label: dict.common.home, href: "/" }, { label: dict.footer.instalmentAgreement }]}
    >
      <ProseSection heading="1. Parties">
        <p>
          This Instalment Sale Agreement ("Agreement") is entered into between the Seller / Creditor and the Buyer /
          Borrower named on the order confirmation for any order placed on the Voltika 3D store using the interest-free
          instalment payment method.
        </p>
        <p className="mt-2">
          <span className="font-medium text-foreground">Seller / Creditor:</span> {CREDITOR.name}, {CREDITOR.address} ·{" "}
          {CREDITOR.registration} · VAT {CREDITOR.vat} · {CREDITOR.email}
        </p>
        <p className="mt-1">
          <span className="font-medium text-foreground">Buyer / Borrower:</span> the individual or business identified
          on the corresponding order confirmation and instalment application.
        </p>
      </ProseSection>

      <ProseSection heading="2. Subject of the agreement">
        <p>
          The Seller sells the goods listed on the Buyer&apos;s order to the Buyer under an interest-free instalment
          plan. Title to the goods passes to the Buyer once all instalments due under the plan have been paid in full.
          A separate, order-specific version of this Agreement — with the exact goods, prices and payment dates for
          that order — is generated automatically and made available to the Buyer once an instalment application is
          approved.
        </p>
      </ProseSection>

      <ProseSection heading="3. Eligibility & financial terms">
        <p>
          The instalment payment method is available for orders with a total value of €1,000 or more, subject to a
          quick identity and creditworthiness check. Approved plans are interest-free (0% APR) and consist of 4 equal
          payments: a 25% down payment due on approval, followed by three further instalments of 25% each, spaced two
          weeks apart. No fees, interest or other charges are added to the total price of the goods.
        </p>
      </ProseSection>

      <ProseSection heading="4. Payment collection">
        <p>
          The Buyer authorizes the Seller to collect each scheduled instalment on its due date via the payment
          instructions provided (bank transfer or cryptocurrency, as shown in the payment dialog for that order). The
          Buyer confirms each payment by using the &quot;I&apos;ve paid&quot; action on the order or instalment status
          page; the Seller then verifies receipt before marking the instalment as paid.
        </p>
      </ProseSection>

      <ProseSection heading="5. Missed or failed payments">
        <p>
          If a scheduled instalment is not confirmed as paid by its due date, the Seller may contact the Buyer to
          arrange payment. Repeated failure to pay may result in the full remaining balance becoming due immediately
          and may affect the Buyer&apos;s ability to use instalment payments for future orders.
        </p>
      </ProseSection>

      <ProseSection heading="6. Right of withdrawal">
        <p>
          The Buyer has a statutory right of withdrawal of 14 days in accordance with EU consumer law, as further
          described in our returns policy. Amounts already paid under this Agreement are refunded according to that
          policy if the Buyer exercises this right.
        </p>
      </ProseSection>

      <ProseSection heading="7. Shipping">
        <p>
          Goods purchased under an instalment plan are shipped once the down payment has been received and the plan is
          active, using the standard EU shipping method described on our shipping page.
        </p>
      </ProseSection>

      <ProseSection heading="8. Data protection">
        <p>
          Personal data and identity documents submitted with an instalment application are processed solely for
          identity verification and credit assessment, in accordance with the GDPR and our Privacy Policy.
        </p>
      </ProseSection>

      <ProseSection heading="9. Governing law">
        <p>
          This Agreement, and any order-specific agreement generated under it, is governed by the laws of Belgium and
          applicable EU consumer-protection law.
        </p>
      </ProseSection>
    </ProsePage>
  )
}
