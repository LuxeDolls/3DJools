"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Horizontal snap carousel. Touch devices swipe natively; on desktop the
 * track can be dragged with the mouse, scrolled with a trackpad, or paged
 * with the arrow buttons pinned to the vertical middle of the rail.
 */
export function ProductRail({
  children,
  label,
  className,
}: {
  children: React.ReactNode
  label: string
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const drag = useRef({ active: false, startX: 0, startLeft: 0, moved: false })
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)
  const [dragging, setDragging] = useState(false)

  const update = useCallback(() => {
    const el = ref.current
    if (!el) return
    setCanPrev(el.scrollLeft > 4)
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [update, children])

  function scroll(dir: 1 | -1) {
    const el = ref.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" })
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse" || e.button !== 0 || !ref.current) return
    drag.current = { active: true, startX: e.clientX, startLeft: ref.current.scrollLeft, moved: false }
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const d = drag.current
    const el = ref.current
    if (!d.active || !el) return
    const dx = e.clientX - d.startX
    if (!d.moved && Math.abs(dx) > 6) {
      d.moved = true
      setDragging(true)
      el.setPointerCapture(e.pointerId)
    }
    if (d.moved) el.scrollLeft = d.startLeft - dx
  }

  function endDrag(e: React.PointerEvent<HTMLDivElement>) {
    const d = drag.current
    if (!d.active) return
    d.active = false
    if (ref.current?.hasPointerCapture(e.pointerId)) ref.current.releasePointerCapture(e.pointerId)
    if (d.moved) {
      setDragging(false)
      const el = ref.current
      if (el) {
        const child = el.firstElementChild as HTMLElement | null
        const step = child ? child.offsetWidth + parseFloat(getComputedStyle(el).columnGap || "0") : el.clientWidth
        const target = Math.round(el.scrollLeft / step) * step
        el.scrollTo({ left: target, behavior: "smooth" })
      }
    }
  }

  const arrow =
    "absolute top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/95 text-foreground shadow-lg backdrop-blur transition-all hover:border-primary hover:bg-primary hover:text-primary-foreground disabled:pointer-events-none disabled:opacity-0 sm:size-12"

  return (
    <div className={cn("relative", className)}>
      <div
        ref={ref}
        role="region"
        aria-label={label}
        tabIndex={0}
        onScroll={update}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={(e) => {
          if (drag.current.moved) {
            e.preventDefault()
            e.stopPropagation()
            drag.current.moved = false
          }
        }}
        onDragStart={(e) => e.preventDefault()}
        className={cn(
          "no-scrollbar -mx-4 flex gap-2 overflow-x-auto scroll-px-4 px-4 pb-2 focus-visible:outline-none sm:gap-4 [&>*]:w-[68%] [&>*]:shrink-0 [&>*]:snap-start sm:[&>*]:w-[38%] lg:[&>*]:w-[calc((100%-3rem)/4)]",
          dragging ? "cursor-grabbing select-none" : "snap-x snap-mandatory sm:cursor-grab",
        )}
      >
        {children}
      </div>
      <button
        type="button"
        onClick={() => scroll(-1)}
        disabled={!canPrev}
        className={cn(arrow, "-left-2 sm:-left-5")}
        aria-label="Previous"
      >
        <ChevronLeft className="size-5" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => scroll(1)}
        disabled={!canNext}
        className={cn(arrow, "-right-2 sm:-right-5")}
        aria-label="Next"
      >
        <ChevronRight className="size-5" aria-hidden="true" />
      </button>
    </div>
  )
}
