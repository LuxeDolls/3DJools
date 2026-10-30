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
    <section className="mx-auto max-w-7xl px-4 py-4 sm:py-5" aria-labelledby="scamadviser-trust-title">
      <a
        href={scamAdviserUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex flex-col gap-3.5 rounded-2xl border border-border bg-card p-4 shadow-[0_4px_12px_rgba(0,0,0,0.18),0_20px_50px_-12px_rgba(0,0,0,0.5)] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-[0_8px_20px_rgba(0,0,0,0.25),0_28px_60px_-12px_rgba(0,0,0,0.65)] sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-7 sm:py-5"
        aria-label={`ScamAdviser Trust Score 100/100. ${dict.home.scamAdviserCta}`}
      >
        <div className="flex items-start gap-3.5 sm:items-center sm:gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-border bg-white p-2 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.6)] sm:size-14 sm:p-2.5">
            <img
              src="https://www.scamadviser.com/images/static/logo/logo.svg"
              alt=""
              className="h-auto w-full"
            />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground sm:text-xs">
              ScamAdviser
            </p>
            <h2 id="scamadviser-trust-title" className="mt-0.5 text-balance font-heading text-lg font-semibold text-foreground sm:mt-1 sm:text-xl">
              Trust Score <span className="text-primary">100/100</span>
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">{dict.home.scamAdviserText}</p>
          </div>
        </div>
        <span className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-[0_10px_25px_-5px_rgba(0,0,0,0.6)] transition-all duration-200 group-hover:-translate-y-0.5 group-hover:bg-primary/90 sm:text-sm">
          {dict.home.scamAdviserCta}
          <ExternalLink className="size-3.5 sm:size-4" aria-hidden="true" />
        </span>
      </a>
    </section>
  )
}
