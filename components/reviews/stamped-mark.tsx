import { BadgeCheck } from "lucide-react"

/** Small "Reviews collected by Stamped.io" eyebrow. */
export function StampedMark({ label }: { label: string }) {
  return (
    <p className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-wider text-primary uppercase">
      <BadgeCheck className="size-3.5" aria-hidden="true" />
      {label} <span className="font-semibold text-foreground normal-case tracking-normal">Stamped.io</span>
    </p>
  )
}
