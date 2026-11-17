"use client"

import { useEffect, useRef } from "react"

const DROPLETS = [
  { left: "6%", top: "9%", w: 14, h: 18, blur: 0.4, speed: 1.15 },
  { left: "14%", top: "24%", w: 9, h: 12, blur: 0.8, speed: 0.85 },
  { left: "23%", top: "14%", w: 18, h: 24, blur: 0.3, speed: 1.3 },
  { left: "34%", top: "31%", w: 11, h: 14, blur: 0.6, speed: 0.95 },
  { left: "46%", top: "11%", w: 8, h: 10, blur: 1, speed: 0.75 },
  { left: "58%", top: "22%", w: 16, h: 22, blur: 0.3, speed: 1.25 },
  { left: "71%", top: "15%", w: 12, h: 16, blur: 0.5, speed: 1.05 },
  { left: "83%", top: "27%", w: 20, h: 27, blur: 0.2, speed: 1.4 },
  { left: "91%", top: "12%", w: 10, h: 13, blur: 0.7, speed: 0.9 },
  { left: "9%", top: "48%", w: 17, h: 23, blur: 0.3, speed: 1.2 },
  { left: "19%", top: "62%", w: 10, h: 14, blur: 0.8, speed: 0.88 },
  { left: "31%", top: "54%", w: 15, h: 20, blur: 0.4, speed: 1.12 },
  { left: "49%", top: "46%", w: 22, h: 29, blur: 0.2, speed: 1.35 },
  { left: "63%", top: "59%", w: 11, h: 15, blur: 0.6, speed: 0.98 },
  { left: "76%", top: "49%", w: 16, h: 21, blur: 0.4, speed: 1.18 },
  { left: "88%", top: "64%", w: 13, h: 17, blur: 0.5, speed: 1.08 },
  { left: "12%", top: "82%", w: 15, h: 20, blur: 0.3, speed: 1.22 },
  { left: "28%", top: "78%", w: 9, h: 12, blur: 0.9, speed: 0.82 },
  { left: "42%", top: "86%", w: 18, h: 25, blur: 0.3, speed: 1.28 },
  { left: "55%", top: "74%", w: 12, h: 16, blur: 0.5, speed: 1.02 },
  { left: "69%", top: "88%", w: 19, h: 26, blur: 0.25, speed: 1.32 },
  { left: "84%", top: "81%", w: 11, h: 15, blur: 0.7, speed: 0.92 },
  { left: "16%", top: "112%", w: 16, h: 22, blur: 0.35, speed: 1.24 },
  { left: "38%", top: "118%", w: 14, h: 19, blur: 0.45, speed: 1.1 },
  { left: "61%", top: "108%", w: 21, h: 28, blur: 0.2, speed: 1.38 },
  { left: "79%", top: "122%", w: 13, h: 18, blur: 0.5, speed: 1.06 },
  { left: "24%", top: "138%", w: 17, h: 23, blur: 0.3, speed: 1.26 },
  { left: "52%", top: "144%", w: 12, h: 16, blur: 0.6, speed: 0.96 },
  { left: "73%", top: "136%", w: 18, h: 24, blur: 0.35, speed: 1.2 },
  { left: "89%", top: "148%", w: 14, h: 19, blur: 0.4, speed: 1.14 },
]

export function ParallaxBackground() {
  const studioLayerRef = useRef<HTMLDivElement>(null)
  const schematicLayerRef = useRef<HTMLDivElement>(null)
  const causticLayerRef = useRef<HTMLDivElement>(null)
  const dropletsLayerRef = useRef<HTMLDivElement>(null)
  const streaksLayerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (media.matches) return

    let rafId = 0
    let currentY = window.scrollY
    let targetY = window.scrollY

    const update = () => {
      const diff = targetY - currentY
      currentY += diff * 0.14

      // Loop offset softly over long pages so parallax never runs out of travel
      const studioOffset = -(currentY * 0.14) % 420
      const schematicOffset = -(currentY * 0.25) % 640
      const schematicDriftX = Math.sin(currentY * 0.0018) * 18
      const causticOffset = -(currentY * 0.36) % 520
      const causticDriftX = Math.cos(currentY * 0.0014) * 24
      const dropletsOffset = -(currentY * 0.48) % 680
      const streaksOffset = -(currentY * 0.3) % 460

      if (studioLayerRef.current) {
        studioLayerRef.current.style.transform = `translate3d(0, ${studioOffset.toFixed(1)}px, 0) scale(1.12)`
      }
      if (schematicLayerRef.current) {
        schematicLayerRef.current.style.transform = `translate3d(${schematicDriftX.toFixed(1)}px, ${schematicOffset.toFixed(1)}px, 0)`
      }
      if (causticLayerRef.current) {
        causticLayerRef.current.style.transform = `translate3d(${causticDriftX.toFixed(1)}px, ${causticOffset.toFixed(1)}px, 0)`
      }
      if (dropletsLayerRef.current) {
        dropletsLayerRef.current.style.transform = `translate3d(0, ${dropletsOffset.toFixed(1)}px, 0)`
      }
      if (streaksLayerRef.current) {
        streaksLayerRef.current.style.transform = `translate3d(0, ${streaksOffset.toFixed(1)}px, 0)`
      }

      if (Math.abs(targetY - currentY) > 0.25) {
        rafId = window.requestAnimationFrame(update)
      } else {
        rafId = 0
      }
    }

    const onScroll = () => {
      targetY = window.scrollY
      if (!rafId) {
        rafId = window.requestAnimationFrame(update)
      }
    }

    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      if (rafId) window.cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
    >
      {/* Layer 1: Blurred 3D printing studio background image with parallax motion */}
      <div
        ref={studioLayerRef}
        className="absolute -inset-x-12 -top-24 h-[165vh] bg-cover bg-center bg-repeat-y opacity-45 blur-[5px] saturate-130 will-change-transform dark:opacity-65"
        style={{
          backgroundImage: "url('/images/parallax-3d-studio.png')",
        }}
      />

      {/* Layer 2: Wet glossy liquid caustics & reflections (cobalt + signal amber + cyan) */}
      <div
        ref={causticLayerRef}
        className="absolute -inset-x-16 -top-32 h-[180vh] blur-2xl will-change-transform"
        style={{
          backgroundImage: `
            radial-gradient(42% 28% at 18% 20%, color-mix(in oklab, var(--primary) 42%, transparent), transparent 72%),
            radial-gradient(36% 24% at 82% 32%, color-mix(in oklab, var(--signal) 28%, transparent), transparent 74%),
            radial-gradient(45% 30% at 32% 62%, color-mix(in oklab, var(--primary) 36%, transparent), transparent 75%),
            radial-gradient(38% 26% at 76% 78%, color-mix(in oklab, oklch(0.72 0.15 210) 34%, transparent), transparent 72%),
            radial-gradient(35% 22% at 24% 92%, color-mix(in oklab, var(--signal) 24%, transparent), transparent 70%)
          `,
        }}
      />

      {/* Layer 3: 3D-Printing themed parallax elements (build plate grid, filament spools, 3D cubes, extruder hotend) */}
      <div
        ref={schematicLayerRef}
        className="absolute inset-x-0 -top-20 h-[190vh] opacity-55 blur-[1.2px] will-change-transform dark:opacity-70"
      >
        {/* Perspective heated build-plate coordinate grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, color-mix(in oklab, var(--primary) 20%, transparent) 1px, transparent 1px),
              linear-gradient(to bottom, color-mix(in oklab, var(--primary) 20%, transparent) 1px, transparent 1px)
            `,
            backgroundSize: "72px 72px",
            maskImage: "radial-gradient(ellipse 85% 75% at 50% 50%, black 25%, transparent 85%)",
            WebkitMaskImage: "radial-gradient(ellipse 85% 75% at 50% 50%, black 25%, transparent 85%)",
          }}
        />

        {/* Floating blurred 3D-printer artefacts: filament spools, isometric build cubes, nozzle & SLA vat rings */}
        <svg
          viewBox="0 0 1440 2200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full text-primary"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Top-left Filament Spool silhouette */}
          <g transform="translate(130, 210)" opacity="0.55">
            <circle cx="0" cy="0" r="96" stroke="currentColor" strokeWidth="3" strokeDasharray="10 6" />
            <circle cx="0" cy="0" r="74" stroke="currentColor" strokeWidth="14" strokeOpacity="0.35" />
            <circle cx="0" cy="0" r="34" stroke="currentColor" strokeWidth="3" />
            <line x1="-96" y1="0" x2="96" y2="0" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.5" />
            <line x1="0" y1="-96" x2="0" y2="96" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.5" />
          </g>

          {/* Top-right Isometric 3D Calibration Cube with slicing layers */}
          <g transform="translate(1250, 290)" opacity="0.6">
            <polygon
              points="0,-90 78,-45 78,45 0,90 -78,45 -78,-45"
              stroke="currentColor"
              strokeWidth="2.5"
              fill="currentColor"
              fillOpacity="0.08"
            />
            <polyline points="-78,-45 0,0 78,-45" stroke="currentColor" strokeWidth="2" />
            <line x1="0" y1="0" x2="0" y2="90" stroke="currentColor" strokeWidth="2" />
            <polyline points="-78,-15 0,30 78,-15" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.55" />
            <polyline points="-78,15 0,60 78,15" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.55" />
          </g>

          {/* Mid-left Extruder Hotend & Nozzle depositing molten layer */}
          <g transform="translate(210, 780)" opacity="0.5">
            <rect x="-26" y="-80" width="52" height="58" rx="6" stroke="currentColor" strokeWidth="2.5" />
            <line x1="-34" y1="-64" x2="34" y2="-64" stroke="currentColor" strokeWidth="3" />
            <line x1="-34" y1="-48" x2="34" y2="-48" stroke="currentColor" strokeWidth="3" />
            <line x1="-34" y1="-32" x2="34" y2="-32" stroke="currentColor" strokeWidth="3" />
            <polygon points="-18,-22 18,-22 7,8 -7,8" stroke="currentColor" strokeWidth="2.5" />
            <path
              d="M 0 8 C 0 36, 48 28, 92 36 C 136 44, 160 28, 210 36"
              stroke="var(--signal)"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </g>

          {/* Center-right SLA Resin Vat concentric liquid ripples */}
          <g transform="translate(1160, 880)" opacity="0.5">
            <ellipse cx="0" cy="0" rx="135" ry="62" stroke="currentColor" strokeWidth="2" />
            <ellipse cx="0" cy="0" rx="95" ry="43" stroke="currentColor" strokeWidth="1.6" strokeDasharray="8 6" />
            <ellipse cx="0" cy="0" rx="52" ry="24" stroke="var(--signal)" strokeWidth="2" />
          </g>

          {/* Lower-left Isometric Voronoi / Lattice 3D Print */}
          <g transform="translate(240, 1340)" opacity="0.55">
            <polygon
              points="0,-105 91,-52 91,52 0,105 -91,52 -91,-52"
              stroke="currentColor"
              strokeWidth="2.5"
              fill="currentColor"
              fillOpacity="0.06"
            />
            <polygon points="0,-60 52,-30 52,30 0,60 -52,30 -52,-30" stroke="var(--signal)" strokeWidth="1.8" />
            <line x1="-91" y1="-52" x2="91" y2="52" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.45" />
            <line x1="91" y1="-52" x2="-91" y2="52" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.45" />
          </g>

          {/* Lower-right Secondary Filament Spool & Toolpath */}
          <g transform="translate(1220, 1480)" opacity="0.55">
            <circle cx="0" cy="0" r="108" stroke="currentColor" strokeWidth="2.5" />
            <circle cx="0" cy="0" r="82" stroke="currentColor" strokeWidth="16" strokeOpacity="0.3" />
            <circle cx="0" cy="0" r="38" stroke="var(--signal)" strokeWidth="2.5" />
          </g>

          {/* Bottom-left Build Plate Corner & Slicer G-code path */}
          <g transform="translate(320, 1860)" opacity="0.5">
            <path
              d="M -120 40 L 0 -30 L 120 40 L 0 110 Z"
              stroke="currentColor"
              strokeWidth="2.5"
              fill="currentColor"
              fillOpacity="0.07"
            />
            <path
              d="M -80 40 L 0 -6 L 80 40 L 0 86 Z"
              stroke="var(--signal)"
              strokeWidth="1.8"
              strokeDasharray="6 4"
            />
          </g>
        </svg>
      </div>

      {/* Layer 4: Wet glass vertical condensation streaks & glossy sheen */}
      <div
        ref={streaksLayerRef}
        className="absolute inset-x-0 -top-24 h-[175vh] opacity-65 will-change-transform dark:opacity-80"
        style={{
          backgroundImage: `
            linear-gradient(90deg,
              transparent 4%,
              rgb(255 255 255 / 0.06) 4.4%,
              transparent 5%,
              transparent 19%,
              rgb(255 255 255 / 0.08) 19.3%,
              transparent 20%,
              transparent 37%,
              rgb(255 255 255 / 0.05) 37.4%,
              transparent 38%,
              transparent 56%,
              rgb(255 255 255 / 0.09) 56.3%,
              transparent 57%,
              transparent 74%,
              rgb(255 255 255 / 0.06) 74.4%,
              transparent 75%,
              transparent 89%,
              rgb(255 255 255 / 0.07) 89.3%,
              transparent 90%
            ),
            linear-gradient(180deg,
              color-mix(in oklab, var(--background) 38%, transparent) 0%,
              color-mix(in oklab, var(--background) 52%, transparent) 50%,
              color-mix(in oklab, var(--background) 40%, transparent) 100%
            )
          `,
        }}
      />

      {/* Layer 5: Wet water droplets & condensation beads on blurred glass */}
      <div
        ref={dropletsLayerRef}
        className="absolute inset-x-0 -top-16 h-[185vh] will-change-transform"
      >
        {DROPLETS.map((d, idx) => (
          <span
            key={idx}
            className="wet-droplet absolute block"
            style={{
              left: d.left,
              top: d.top,
              width: `${d.w}px`,
              height: `${d.h}px`,
              filter: `blur(${d.blur}px)`,
            }}
          />
        ))}
      </div>

      {/* Subtle frosted wet-glass atmospheric veil */}
      <div className="absolute inset-0 backdrop-blur-[1.5px]" />
    </div>
  )
}
