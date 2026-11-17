import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function SectionHeading({
  title,
  eyebrow,
  viewAllHref,
  viewAllLabel,
}: {
  title: string
  eyebrow?: string
  viewAllHref?: string
  viewAllLabel?: string
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4 sm:mb-8">
      <div className="flex min-w-0 flex-col gap-1.5">
        {eyebrow && (
          <p className="font-mono text-[11px] tracking-wider text-primary uppercase">{eyebrow}</p>
        )}
        <h2 className="font-heading text-2xl leading-none font-bold text-balance text-foreground sm:text-4xl lg:text-5xl">
          {title}
        </h2>
      </div>
      {viewAllHref && viewAllLabel && (
        <Link
          href={viewAllHref}
          className="group inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground sm:text-sm"
        >
          {viewAllLabel}
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      )}
    </div>
  )
}
