import Link from "next/link"
import type { Locale } from "@/lib/i18n/config"
import type { Dictionary } from "@/lib/i18n/dictionaries/en"
import { localizedPath } from "@/lib/i18n/paths"
import { Breadcrumb, type Crumb } from "@/components/breadcrumb"
import { Info } from "lucide-react"

export function ProsePage({
  locale,
  dict,
  title,
  crumbs,
  showPlaceholderNotice = false,
  children,
}: {
  locale: Locale
  dict: Dictionary
  title: string
  crumbs: Crumb[]
  showPlaceholderNotice?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Breadcrumb locale={locale} items={crumbs} />
      <h1 className="mt-4 text-balance font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {dict.legal.lastUpdated}: {new Date().toISOString().slice(0, 10)}
      </p>

      {showPlaceholderNotice && (
        <div className="mt-6 flex gap-3 rounded-lg border border-accent/40 bg-accent/10 p-4 text-sm text-foreground">
          <Info className="size-5 shrink-0 text-accent-foreground" />
          <p>{dict.legal.placeholderNotice}</p>
        </div>
      )}

      <div className="prose-content mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">{children}</div>

      <p className="mt-10 border-t border-border pt-6 text-sm text-muted-foreground">
        {dict.legal.contactPrompt}{" "}
        <Link
          href={localizedPath(locale, "/contact")}
          className="underline underline-offset-2 hover:text-foreground"
        >
          {dict.legal.contactLink}
        </Link>
      </p>
    </div>
  )
}

/** Styled section block for policy content. */
export function ProseSection({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="font-heading text-lg font-bold text-foreground">{heading}</h2>
      {children}
    </section>
  )
}
