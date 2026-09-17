import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { isLocale, type Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { localizedPath } from "@/lib/i18n/paths"
import { AuthForm } from "@/components/auth/auth-form"

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : "en"
  const dict = await getDictionary(locale)
  return { title: `${dict.auth.signUpTitle} · ${dict.brandName}` }
}

export default async function SignUpPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : "en"

  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) redirect(localizedPath(locale, "/account"))

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <AuthForm mode="sign-up" />
    </div>
  )
}
