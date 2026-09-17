import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { locales, isLocale, type Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { StorefrontShell } from "@/components/layout/storefront-shell"
import { Footer } from "@/components/layout/footer"

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : "en"
  const dict = await getDictionary(locale)

  const languages: Record<string, string> = {}
  for (const l of locales) languages[l] = `/${l}`
  languages["x-default"] = "/en"

  return {
    title: {
      default: `${dict.brandName} — ${dict.tagline}`,
      template: `%s · ${dict.brandName}`,
    },
    description: dict.footer.companyBlurb,
    alternates: {
      canonical: `/${locale}`,
      languages,
    },
    openGraph: {
      title: `${dict.brandName} — ${dict.tagline}`,
      description: dict.footer.companyBlurb,
      locale,
      type: "website",
    },
  }
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const dict = await getDictionary(lang)

  return (
    <StorefrontShell locale={lang} dict={dict}>
      {children}
      <Footer locale={lang} dict={dict} />
    </StorefrontShell>
  )
}
