"use client"

import { useId, useRef, type CSSProperties, type PointerEvent } from "react"
import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  markClassName?: string
  showTagline?: boolean
}

const WORD = "Eureka"

export function LogoMark({ className }: { className?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "")
  const ref = useRef<HTMLSpanElement>(null)

  function handleMove(e: PointerEvent<HTMLSpanElement>) {
    const el = ref.current
    if (!el || e.pointerType === "touch") return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    el.style.setProperty("--logo-rx", `${(0.5 - y) * 28}deg`)
    el.style.setProperty("--logo-ry", `${(x - 0.5) * 28}deg`)
    el.style.setProperty("--logo-mx", `${x * 100}%`)
    el.style.setProperty("--logo-my", `${y * 100}%`)
  }

  function handleLeave() {
    const el = ref.current
    if (!el) return
    el.style.setProperty("--logo-rx", "0deg")
    el.style.setProperty("--logo-ry", "0deg")
  }

  const top = `top-${uid}`
  const right = `right-${uid}`
  const left = `left-${uid}`

  return (
    <span
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className={cn(
        "eureka-mark relative inline-flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#0C1530] shadow-xs ring-1 ring-white/15 dark:bg-[#0E1A3A] dark:ring-white/18",
        className
      )}
      aria-hidden="true"
    >
      <span className="eureka-mark-grid pointer-events-none absolute inset-0" />
      <svg viewBox="0 0 32 32" className="relative size-7 overflow-visible" fill="none">
        <defs>
          <linearGradient id={top} x1="7" y1="5" x2="25" y2="15" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFF6C2" />
            <stop offset="50%" stopColor="#FACC15" />
            <stop offset="100%" stopColor="#E3B007" />
          </linearGradient>
          <linearGradient id={right} x1="16.5" y1="11" x2="25.5" y2="26" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#5B82FF" />
            <stop offset="100%" stopColor="#1E40D8" />
          </linearGradient>
          <linearGradient id={left} x1="6.5" y1="10.5" x2="15.5" y2="26" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#DCE3EE" />
          </linearGradient>
        </defs>

        <g className="eureka-face eureka-face-left">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M6.4 11.35L15.1 16.3V18.75L8.95 15.25V16.85L13.95 19.7V21.95L8.95 19.1V20.75L15.1 24.25V26.7L6.4 21.75V11.35Z"
            fill={`url(#${left})`}
          />
        </g>

        <g className="eureka-face eureka-face-right">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M25.6 11.35L16.9 16.3V18.75L23.05 15.25V16.85L18.05 19.7V21.95L23.05 19.1V20.75L16.9 24.25V26.7L25.6 21.75V11.35Z"
            fill={`url(#${right})`}
          />
        </g>

        <g className="eureka-face eureka-cap">
          <path d="M16 4.4L25.6 9.85L16 15.3L6.4 9.85L16 4.4Z" fill={`url(#${top})`} />
          <path d="M16 6.55L21.8 9.85L16 13.15L10.2 9.85L16 6.55Z" fill="#0C1530" fillOpacity="0.82" />
          <path
            className="eureka-spark"
            d="M16 7.15L16.75 9.15L20.3 9.85L16.75 10.55L16 12.55L15.25 10.55L11.7 9.85L15.25 9.15L16 7.15Z"
            fill="#FFFFFF"
          />
        </g>

        <rect className="eureka-nozzle" x="5" y="0" width="22" height="0.9" rx="0.45" fill="#FACC15" />
      </svg>
      <span className="eureka-mark-shine pointer-events-none absolute inset-0" />
    </span>
  )
}

export function Logo({ className, markClassName, showTagline = false }: LogoProps) {
  return (
    <span
      className={cn(
        "eureka-logo group/logo inline-flex items-center gap-2.5 font-heading text-lg font-bold tracking-tight select-none",
        className
      )}
    >
      <LogoMark className={markClassName} />
      <span className="flex flex-col justify-center leading-none">
        <span className="inline-flex items-baseline tracking-[-0.035em]">
          <span className="eureka-chip relative overflow-hidden rounded-[5px] bg-primary/14 px-1.5 py-0.5 font-extrabold text-primary ring-1 ring-primary/25 transition-colors duration-300 group-hover/logo:bg-primary group-hover/logo:text-primary-foreground">
            3D
          </span>
          <span className="ml-1 inline-flex text-[1.14em] font-extrabold text-foreground" aria-label={WORD}>
            {WORD.split("").map((ch, i) => (
              <span
                key={i}
                aria-hidden="true"
                className="eureka-letter inline-block"
                style={{ "--i": i } as CSSProperties}
              >
                {ch}
              </span>
            ))}
          </span>
          <span className="eureka-dot relative ml-0.5 inline-block size-1.5 -translate-y-2" aria-hidden="true">
            <span className="eureka-dot-ping absolute inset-0 rounded-full bg-signal" />
            <span className="relative block size-full rounded-full bg-signal ring-1 ring-foreground/20" />
          </span>
        </span>
        {showTagline && (
          <span className="mt-1 font-sans text-[10px] font-medium tracking-[0.12em] uppercase text-muted-foreground">
            Additive &amp; Laser Systems
          </span>
        )}
      </span>
    </span>
  )
}
