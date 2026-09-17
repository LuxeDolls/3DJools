import { isLocale, type Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { Breadcrumb } from "@/components/breadcrumb"
import { CartPageView } from "@/components/cart/cart-page-view"

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : "en"
  const dict = await getDictionary(locale)
  return { title: dict.cart.title }
}

export default async function CartPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : "en"
  const dict = await getDictionary(locale)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Breadcrumb locale={locale} items={[{ label: dict.common.home, href: "/" }, { label: dict.cart.title }]} />
      <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight text-foreground">{dict.cart.title}</h1>
      <div className="mt-8">
        <CartPageView locale={locale} />
      </div>
    </div>
  )
}
