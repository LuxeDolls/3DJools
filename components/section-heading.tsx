import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function SectionHeading({
  title,
  viewAllHref,
  viewAllLabel,
}: {
  title: string
  viewAllHref?: string
  viewAllLabel?: string
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3 sm:mb-6 sm:gap-4">
      <h2 className="text-balance font-heading text-xl font-bold tracking-tight text-foreground sm:text-3xl">
        {title}
      </h2>
      {viewAllHref && viewAllLabel && (
        <Link
          href={viewAllHref}
          className="group flex shrink-0 items-center gap-1 text-xs font-semibold text-primary transition-colors hover:text-primary/80 sm:text-sm sm:font-medium"
        >
          {viewAllLabel}
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5 sm:size-4" />
        </Link>
      )}
    </div>
  )
}
