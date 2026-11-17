"use client"

import { useRef } from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"

export function ProductRail({
  children,
  label,
}: {
  children: React.ReactNode
  label: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  function scroll(dir: 1 | -1) {
    const el = ref.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" })
  }

  return (
    <div className="relative">
      <div
        ref={ref}
        role="region"
        aria-label={label}
        tabIndex={0}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto scroll-px-4 px-4 pb-2 focus-visible:outline-none sm:gap-4 [&>*]:w-[68%] [&>*]:shrink-0 [&>*]:snap-start sm:[&>*]:w-[38%] lg:[&>*]:w-[calc((100%-3rem)/4)]"
      >
        {children}
      </div>
      <div className="mt-4 hidden justify-end gap-2 sm:flex">
        <button
          type="button"
          onClick={() => scroll(-1)}
          className="flex size-11 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
          aria-label="Previous"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => scroll(1)}
          className="flex size-11 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
          aria-label="Next"
        >
          <ArrowRight className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
