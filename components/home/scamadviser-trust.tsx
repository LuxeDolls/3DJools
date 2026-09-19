import { ExternalLink, ShieldCheck } from "lucide-react"
import type { Dictionary } from "@/lib/i18n/dictionaries/en"

export const scamAdviserUrl = "https://www.scamadviser.com/check-website/3djools.com"

export function ScamAdviserTrust({ dict, compact = false }: { dict: Dictionary; compact?: boolean }) {
  if (compact) {
    return (
      <a
        href={scamAdviserUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-xs transition-colors hover:border-primary/50 hover:bg-muted"
        aria-label={dict.footer.scamAdviserLink}
      >
        <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
        <span className="font-semibold text-foreground">ScamAdviser</span>
        <span className="text-muted-foreground">{dict.footer.scamAdviserBadge}</span>
      </a>
    )
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-6" aria-labelledby="scamadviser-trust-title">
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ShieldCheck className="size-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">ScamAdviser</p>
            <h2 id="scamadviser-trust-title" className="mt-1 text-balance font-heading text-lg font-semibold text-foreground">
              {dict.home.scamAdviserRating}
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{dict.home.scamAdviserText}</p>
          </div>
        </div>
        <a
          href={scamAdviserUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {dict.home.scamAdviserCta}
          <ExternalLink className="size-4" aria-hidden="true" />
        </a>
      </div>
    </section>
  )
}
