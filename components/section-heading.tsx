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
    <div className="mb-6 flex items-end justify-between gap-4">
      <h2 className="text-balance font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {title}
      </h2>
      {viewAllHref && viewAllLabel && (
        <Link
          href={viewAllHref}
          className="group flex shrink-0 items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
        >
          {viewAllLabel}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  )
}
