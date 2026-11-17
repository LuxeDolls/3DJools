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
          className="group inline-flex shrink-0 items-center gap-1.5 rounded-full border border-primary/40 bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-md shadow-primary/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/35 sm:px-5 sm:py-2.5 sm:text-sm"
        >
          {viewAllLabel}
          <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5 sm:size-4" aria-hidden="true" />
        </Link>
      )}
    </div>
  )
}
