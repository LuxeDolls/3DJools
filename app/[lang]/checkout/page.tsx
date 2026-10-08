import { isLocale, type Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { Breadcrumb } from "@/components/breadcrumb"
import { CheckoutView } from "@/components/checkout/checkout-view"

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : "en"
  const dict = await getDictionary(locale)
  return { title: dict.checkout.title }
}

export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ error?: string | string[] }>
}) {
  const { lang } = await params
  const { error } = await searchParams
  const locale: Locale = isLocale(lang) ? lang : "en"
  const dict = await getDictionary(locale)
  const initialError = Array.isArray(error) ? error[0] : error

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Breadcrumb
        locale={locale}
        items={[
          { label: dict.common.home, href: "/" },
          { label: dict.cart.title, href: "/cart" },
          { label: dict.checkout.title },
        ]}
      />
      <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight text-foreground">{dict.checkout.title}</h1>
      <div className="mt-8">
        <CheckoutView locale={locale} initialError={initialError} />
      </div>
    </div>
  )
}
