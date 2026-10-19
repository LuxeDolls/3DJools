import { ExternalLink } from "lucide-react"
import type { Dictionary } from "@/lib/i18n/dictionaries/en"

export const scamAdviserUrl = "https://www.scamadviser.com/check-website/dnd3d.com"

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
        <span className="flex h-5 items-center rounded-sm bg-white px-1">
          <img
            src="https://www.scamadviser.com/images/static/logo/logo.svg"
            alt=""
            className="h-3.5 w-auto"
          />
        </span>
        <span className="font-semibold text-foreground">100/100</span>
        <span className="text-muted-foreground">{dict.footer.scamAdviserBadge}</span>
      </a>
    )
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-5" aria-labelledby="scamadviser-trust-title">
      <a
        href={scamAdviserUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex flex-col gap-4 rounded-2xl border border-border bg-card px-5 py-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md sm:flex-row sm:items-center sm:justify-between sm:px-7"
        aria-label={`ScamAdviser Trust Score 100/100. ${dict.home.scamAdviserCta}`}
      >
        <div className="flex items-center gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-xl border border-border bg-white p-2.5 shadow-sm">
            <img
              src="https://www.scamadviser.com/images/static/logo/logo.svg"
              alt=""
              className="h-auto w-full"
            />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">ScamAdviser</p>
            <h2 id="scamadviser-trust-title" className="mt-1 text-balance font-heading text-xl font-semibold text-foreground">
              Trust Score <span className="text-primary">100/100</span>
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{dict.home.scamAdviserText}</p>
          </div>
        </div>
        <span className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors group-hover:bg-primary/90">
          {dict.home.scamAdviserCta}
          <ExternalLink className="size-4" aria-hidden="true" />
        </span>
      </a>
    </section>
  )
}
