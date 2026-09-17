import { isLocale, type Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { ProsePage, ProseSection } from "@/components/legal/prose-page"

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : "en"
  const dict = await getDictionary(locale)
  return { title: dict.footer.impressum }
}

export default async function ImpressumPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : "en"
  const dict = await getDictionary(locale)

  return (
    <ProsePage
      locale={locale}
      dict={dict}
      title={dict.footer.impressum}
      crumbs={[{ label: dict.common.home, href: "/" }, { label: dict.footer.impressum }]}
    >
      <ProseSection heading="Company details">
        <p>
          Voltika 3D (trading name)
          <br />
          Ln-Squared
          <br />
          Rue du Chénia 17
          <br />
          7170 Manage, Hainaut, Belgium
        </p>
      </ProseSection>
      <ProseSection heading="Legal form & incorporation">
        <p>
          Legal form: Société privée à responsabilité limitée (SPRL)
          <br />
          Incorporated: 15 October 2014, by deed of notary Léopold Derbaix
          <br />
          Registered share capital: €18,600
        </p>
      </ProseSection>
      <ProseSection heading="Management">
        <p>Sole manager: Xavier Nyssen, appointed for an indefinite term at incorporation.</p>
      </ProseSection>
      <ProseSection heading="Founders">
        <p>
          Xavier Jean Georges Nyssen and Elodie Claudine Ghislaine Godefroid, founding shareholders, both domiciled at
          Rue des Quatre Jalouses 4, 7181 Seneffe, Belgium at the time of incorporation.
        </p>
      </ProseSection>
      <ProseSection heading="Contact">
        <p>
          Email: support@voltika3d.example
          <br />
          Phone: +49 30 1234 5678
        </p>
      </ProseSection>
      <ProseSection heading="Registration & VAT">
        <p>
          Company number: 0564.743.304
          <br />
          Safe number: BE02758815
          <br />
          VAT identification number: BE0564743304
        </p>
      </ProseSection>
      <ProseSection heading="Online dispute resolution">
        <p>
          The European Commission provides a platform for online dispute resolution (ODR):
          https://ec.europa.eu/consumers/odr. We are neither obliged nor willing to participate in dispute resolution
          proceedings before a consumer arbitration board.
        </p>
      </ProseSection>
    </ProsePage>
  )
}
