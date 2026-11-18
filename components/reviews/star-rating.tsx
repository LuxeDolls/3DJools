import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

const sizes = {
  xs: "size-3",
  sm: "size-3.5",
  md: "size-4",
  lg: "size-5",
  xl: "size-7",
} as const

function Row({ className }: { className: string }) {
  return (
    <>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={cn("shrink-0", className)} fill="currentColor" strokeWidth={0} aria-hidden="true" />
      ))}
    </>
  )
}

/** Five stars with fractional fill. Pass `label` for screen readers, e.g. "4.8 out of 5". */
export function StarRating({
  value,
  size = "sm",
  label,
  className,
}: {
  value: number
  size?: keyof typeof sizes
  label?: string
  className?: string
}) {
  const percent = (Math.max(0, Math.min(5, value)) / 5) * 100
  return (
    <span
      className={cn("relative inline-flex shrink-0 items-center", className)}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <span className="flex gap-0.5 text-muted-foreground/25">
        <Row className={sizes[size]} />
      </span>
      <span className="absolute inset-y-0 left-0 flex gap-0.5 overflow-hidden text-star" style={{ width: `${percent}%` }}>
        <Row className={sizes[size]} />
      </span>
    </span>
  )
}
