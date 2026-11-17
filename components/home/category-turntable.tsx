"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowUpRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react"
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
  }, [paused, hovering, categories.length, index])

  const current = categories[index]
  const go = (dir: 1 | -1) => setIndex((i) => (i + dir + categories.length) % categories.length)

  const arrow =
    "absolute top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-ink/85 text-ink-foreground shadow-lg backdrop-blur transition-colors hover:bg-signal hover:text-signal-foreground focus-visible:ring-2 focus-visible:ring-signal focus-visible:outline-none sm:size-11"

  return (
    <div
      className="flex flex-col gap-3"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocusCapture={() => setHovering(true)}
      onBlurCapture={() => setHovering(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") go(-1)
        if (e.key === "ArrowRight") go(1)
      }}
      role="region"
      aria-roledescription="carousel"
      aria-label={shopLabel}
    >
      <div className="relative">
        <Link
          href={hrefs[index]}
          className="group relative block aspect-[16/11] overflow-hidden rounded-[1.5rem] bg-photo text-ink sm:aspect-[16/10] lg:aspect-[4/3]"
          aria-label={`${shopLabel}: ${current.label}`}
        >
          {categories.map((cat, i) => (
            <Image
              key={cat.id}
              src={cat.heroImage || "/placeholder.svg"}
              alt={i === index ? cat.label : ""}
              fill
              priority={i === 0}
              sizes="(max-width: 1024px) 100vw, 42vw"
              className={cn(
                "object-contain px-14 pt-12 pb-14 transition-all duration-700 ease-out sm:px-16 sm:pt-14 sm:pb-16",
                i === index ? "scale-100 opacity-100" : "scale-95 opacity-0",
              )}
            />
          ))}

          <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2 sm:inset-x-4 sm:top-4">
            <span className="rounded-full bg-ink px-3 py-1 font-mono text-[10px] tracking-wider text-ink-foreground uppercase sm:text-[11px]">
              {current.tag}
            </span>
            <span className="flex size-9 items-center justify-center rounded-full bg-signal text-signal-foreground transition-transform duration-300 group-hover:rotate-45 sm:size-10">
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </span>
          </div>

          <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-3 sm:inset-x-5 sm:bottom-4">
            <p className="font-heading text-xl leading-none font-bold text-balance text-ink sm:text-3xl">
              {current.label}
            </p>
            <span className="shrink-0 font-mono text-xs text-ink/60 tabular-nums" aria-hidden="true">
              {String(index + 1).padStart(2, "0")}/{String(categories.length).padStart(2, "0")}
            </span>
          </div>
        </Link>

        <button type="button" onClick={() => go(-1)} className={cn(arrow, "left-2 sm:left-3")} aria-label="Previous slide">
          <ChevronLeft className="size-5" aria-hidden="true" />
        </button>
        <button type="button" onClick={() => go(1)} className={cn(arrow, "right-2 sm:right-3")} aria-label="Next slide">
          <ChevronRight className="size-5" aria-hidden="true" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <div role="tablist" aria-label={shopLabel} className="flex flex-1 flex-wrap gap-1.5">
          {categories.map((cat, i) => (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={cat.label}
              onClick={() => setIndex(i)}
              className={cn(
                "relative size-11 shrink-0 overflow-hidden rounded-xl bg-photo ring-2 transition-all sm:size-12",
                i === index ? "ring-signal" : "opacity-60 ring-transparent hover:opacity-100",
              )}
            >
              <Image src={cat.heroImage || "/placeholder.svg"} alt="" fill sizes="48px" className="object-contain p-1" />
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
