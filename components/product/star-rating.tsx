import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

export function StarRating({
  rating,
  count,
  size = "sm",
}: {
  rating: number
  count?: number
  size?: "sm" | "md"
}) {
  const full = Math.floor(rating)
  const hasHalf = rating - full >= 0.5
  const starSize = size === "md" ? "size-4" : "size-3.5"

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i < full
          const half = i === full && hasHalf
          return (
            <span key={i} className="relative">
              <Star className={cn(starSize, "text-border")} strokeWidth={0} fill="currentColor" />
              {(filled || half) && (
                <span className={cn("absolute inset-0 overflow-hidden", half && "w-1/2")}>
                  <Star className={cn(starSize, "text-primary")} strokeWidth={0} fill="currentColor" />
                </span>
              )}
            </span>
          )
        })}
      </div>
      <span className="text-xs font-medium text-muted-foreground">
        {rating.toFixed(1)}
        {typeof count === "number" && <span className="ml-1">({count})</span>}
      </span>
      <span className="sr-only">{`${rating.toFixed(1)} out of 5${typeof count === "number" ? `, ${count} reviews` : ""}`}</span>
    </div>
  )
}
