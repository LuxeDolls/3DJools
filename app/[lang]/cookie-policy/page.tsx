import type { Metadata } from "next"
import { isLocale, type Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { CookieSettingsButton } from "@/components/legal/cookie-settings-button"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : "en"
  const dict = await getDictionary(locale)
  return {
    title: dict.cookiePolicy.title,
    description: dict.cookiePolicy.intro,
  }
}

export default async function CookiePolicyPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : "en"
  const dict = await getDictionary(locale)
  const cp = dict.cookiePolicy

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <h1 className="font-heading text-3xl font-bold text-balance text-foreground sm:text-4xl">{cp.title}</h1>
      <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">{cp.intro}</p>

      <div className="mt-10 flex flex-col gap-8">
        {cp.sections.map((section) => (
          <section key={section.heading} className="flex flex-col gap-2">
            <h2 className="font-heading text-xl font-semibold text-foreground">{section.heading}</h2>
            <p className="text-pretty leading-relaxed text-muted-foreground">{section.body}</p>
          </section>
        ))}
      </div>

      <div className="mt-12 rounded-xl border border-border bg-card p-6">
        <h2 className="font-heading text-lg font-semibold text-foreground">{cp.manageHeading}</h2>
        <p className="mb-4 mt-1 text-sm text-pretty leading-relaxed text-muted-foreground">{cp.manageText}</p>
        <CookieSettingsButton />
      </div>
    </main>
  )
}
