"use client"

import Image from "next/image"
import { useRef, useState } from "react"
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0)
  const touchStartX = useRef<number | null>(null)
  const gallery = images.length ? images : ["/placeholder.svg"]

  function prev() {
    setActive((idx) => (idx === 0 ? gallery.length - 1 : idx - 1))
  }

  function next() {
    setActive((idx) => (idx === gallery.length - 1 ? 0 : idx + 1))
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0]?.clientX ?? null
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null || gallery.length <= 1) return
    const deltaX = (e.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current
    touchStartX.current = null
    if (Math.abs(deltaX) > 40) {
      if (deltaX < 0) next()
      else prev()
    }
  }

  return (
    <div className="flex min-w-0 flex-col gap-2.5 sm:gap-3">
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="group relative aspect-square min-w-0 overflow-hidden rounded-2xl border border-border bg-white shadow-xs"
      >
        <Image
          src={gallery[active] || "/placeholder.svg"}
          alt={alt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-contain p-4 transition-transform duration-300 group-hover:scale-[1.02] sm:p-6"
        />

        {/* Counter badge */}
        {gallery.length > 1 && (
          <span className="pointer-events-none absolute top-2.5 left-2.5 rounded-full border border-neutral-200 bg-white/95 px-2.5 py-0.5 text-[11px] font-semibold tabular-nums text-neutral-700 shadow-2xs sm:top-3 sm:left-3 sm:py-1 sm:text-xs">
            {active + 1} / {gallery.length}
          </span>
        )}

        {/* Lightbox zoom trigger */}
        <Dialog>
          <DialogTrigger
            render={
              <button
                type="button"
                aria-label="Zoom image"
                className="absolute top-2.5 right-2.5 flex size-8 items-center justify-center rounded-full border border-neutral-200 bg-white/95 text-neutral-700 shadow-xs transition-transform hover:scale-105 hover:text-neutral-950 sm:top-3 sm:right-3 sm:size-9"
              >
                <ZoomIn className="size-4" />
              </button>
            }
          />
          <DialogContent className="max-w-4xl bg-white p-4 sm:max-w-3xl">
            <DialogTitle className="sr-only">{alt}</DialogTitle>
            <div className="relative aspect-square w-full overflow-hidden bg-white">
              <Image
                src={gallery[active] || "/placeholder.svg"}
                alt={alt}
                fill
                sizes="90vw"
                className="object-contain p-2"
              />
            </div>
          </DialogContent>
        </Dialog>

        {/* Prev / Next arrows */}
        {gallery.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous image"
              className="absolute top-1/2 left-2.5 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white/90 text-neutral-800 shadow-sm transition-all hover:bg-white sm:left-3 sm:size-9 sm:opacity-0 sm:group-hover:opacity-100"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next image"
              className="absolute top-1/2 right-2.5 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white/90 text-neutral-800 shadow-sm transition-all hover:bg-white sm:right-3 sm:size-9 sm:opacity-0 sm:group-hover:opacity-100"
            >
              <ChevronRight className="size-4" />
            </button>
          </>
        )}
      </div>

      {gallery.length > 1 && (
        <div className="flex min-w-0 gap-2 overflow-x-auto pb-1 [scrollbar-width:none] sm:gap-2.5">
          {gallery.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "relative size-15 shrink-0 overflow-hidden rounded-xl border-2 bg-white transition-all sm:size-20",
                i === active
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border opacity-80 hover:border-muted-foreground hover:opacity-100",
              )}
              aria-label={`${alt} — image ${i + 1}`}
            >
              <Image src={img || "/placeholder.svg"} alt="" fill sizes="80px" className="object-contain p-1.5" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
