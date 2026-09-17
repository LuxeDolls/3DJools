import { Boxes } from "lucide-react"
import { cn } from "@/lib/utils"

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2 font-heading text-lg font-bold tracking-tight", className)}>
      <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Boxes className="size-5" strokeWidth={2.4} />
      </span>
      <span className="leading-none">
        Voltika<span className="text-primary">3D</span>
      </span>
    </span>
  )
}
