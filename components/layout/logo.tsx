import { cn } from "@/lib/utils"

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2 font-heading text-lg font-bold tracking-tight", className)}>
      <span className="flex size-8 items-center justify-center rounded-md bg-foreground text-background" aria-hidden="true">
        <svg viewBox="0 0 32 32" className="size-6" fill="none">
          <path d="M7 6.5h9.2c4.8 0 8.3 3.4 8.3 9.5S21 25.5 16.2 25.5H7V6.5Z" stroke="currentColor" strokeWidth="2.6" />
          <path d="M7 11.6h10.2M7 16h7.6M7 20.4h10.2" className="stroke-primary" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </span>
      <span className="leading-none">
        <span className="text-primary">DnD</span>3D
      </span>
    </span>
  )
}
