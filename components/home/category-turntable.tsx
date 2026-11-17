"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowUpRight, Pause, Play } from "lucide-react"
import type { HomeCategory } from "./category-data"
import { cn } from "@/lib/utils"

const INTERVAL_MS = 4200

export function CategoryTurntable({
  categories,
  hrefs,
  shopLabel,
}: {
  categories: HomeCategory[]
  hrefs: string[]
  shopLabel: string
}) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [hovering, setHovering] = useState(false)

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduce) setPaused(true)
  }, [])

  useEffect(() => {
    if (paused || hovering) return
    const id = window.setInterval(() => setIndex((i) => (i + 1) % categories.length), INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [paused, hovering, categories.length])

  const current = categories[index]

  return (
    <div
      className="flex flex-col gap-3"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocusCapture={() => setHovering(true)}
      onBlurCapture={() => setHovering(false)}
    >
      <Link
        href={hrefs[index]}
        className="group relative block aspect-[5/4] overflow-hidden rounded-[1.75rem] bg-photo text-ink sm:aspect-[4/3] lg:aspect-[5/4]"
        aria-label={`${shopLabel}: ${current.label}`}
      >
        {categories.map((cat, i) => (
          <Image
            key={cat.id}
            src={cat.image || "/placeholder.svg"}
            alt={i === index ? cat.label : ""}
            fill
            priority={i === 0}
            sizes="(max-width: 1024px) 100vw, 45vw"
            className={cn(
              "object-contain p-6 transition-all duration-700 ease-out sm:p-10",
              i === index ? "scale-100 opacity-100" : "scale-95 opacity-0",
            )}
          />
        ))}

        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2 sm:inset-x-4 sm:top-4">
          <span className="rounded-full bg-ink px-3 py-1 font-mono text-[10px] tracking-wider text-ink-foreground uppercase sm:text-[11px]">
            {current.tag}
          </span>
          <span className="flex size-10 items-center justify-center rounded-full bg-signal text-signal-foreground transition-transform duration-300 group-hover:rotate-45 sm:size-12">
            <ArrowUpRight className="size-5" aria-hidden="true" />
          </span>
        </div>

        <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-3 sm:inset-x-5 sm:bottom-5">
          <p className="font-heading text-2xl leading-none font-bold text-balance text-ink sm:text-4xl">
            {current.label}
          </p>
          <span className="shrink-0 font-mono text-xs text-ink/60 tabular-nums" aria-hidden="true">
            {String(index + 1).padStart(2, "0")}/{String(categories.length).padStart(2, "0")}
          </span>
        </div>
      </Link>

      <div className="flex items-center gap-2">
        <div role="tablist" aria-label={shopLabel} className="no-scrollbar flex flex-1 gap-1.5 overflow-x-auto">
          {categories.map((cat, i) => (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={cat.label}
              onClick={() => setIndex(i)}
              className={cn(
                "relative size-12 shrink-0 overflow-hidden rounded-xl bg-photo ring-2 transition-all sm:size-14",
                i === index ? "ring-signal" : "opacity-60 ring-transparent hover:opacity-100",
              )}
            >
              <Image src={cat.image || "/placeholder.svg"} alt="" fill sizes="56px" className="object-contain p-1.5" />
              {i === index && !paused && !hovering && (
                <span
                  key={index}
                  className="absolute inset-x-0 bottom-0 h-1 origin-left bg-signal"
                  style={{ animation: `turntable-progress ${INTERVAL_MS}ms linear forwards` }}
                  aria-hidden="true"
                />
              )}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          className="flex size-10 shrink-0 items-center justify-center rounded-full border border-primary-foreground/25 text-primary-foreground transition-colors hover:bg-primary-foreground/10"
          aria-label={paused ? "Play" : "Pause"}
        >
          {paused ? <Play className="size-4" aria-hidden="true" /> : <Pause className="size-4" aria-hidden="true" />}
        </button>
      </div>
      <style>{`@keyframes turntable-progress{from{transform:scaleX(0)}to{transform:scaleX(1)}}`}</style>
    </div>
  )
}
