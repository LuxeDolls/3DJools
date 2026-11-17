import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  markClassName?: string
  showTagline?: boolean
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#141210] shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_2px_8px_-2px_rgba(0,0,0,0.45)] ring-1 ring-white/15 dark:bg-[#1a1613] dark:ring-white/18",
        className
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 32 32" className="size-7" fill="none">
        <defs>
          <linearGradient id="logo-top-prism" x1="7" y1="5" x2="25" y2="15" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFE4B8" />
            <stop offset="50%" stopColor="#FB923C" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>
          <linearGradient id="logo-right-3" x1="16.5" y1="11" x2="25.5" y2="26" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FF7A29" />
            <stop offset="100%" stopColor="#D9460F" />
          </linearGradient>
          <linearGradient id="logo-left-e" x1="6.5" y1="10.5" x2="15.5" y2="26" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#E6E1DA" />
          </linearGradient>
        </defs>

        {/* Top isometric diamond cap */}
        <path
          d="M16 4.4L25.6 9.85L16 15.3L6.4 9.85L16 4.4Z"
          fill="url(#logo-top-prism)"
        />
        {/* Recessed dark isometric core on top face */}
        <path
          d="M16 6.55L21.8 9.85L16 13.15L10.2 9.85L16 6.55Z"
          fill="#141210"
          fillOpacity="0.82"
        />
        {/* Isometric Eureka 4-point spark inside the core */}
        <path
          d="M16 7.15L16.75 9.15L20.3 9.85L16.75 10.55L16 12.55L15.25 10.55L11.7 9.85L15.25 9.15L16 7.15Z"
          fill="#FFFDF9"
        />

        {/* Left isometric face: Sculpted 3-layer 'E' */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M6.4 11.35L15.1 16.3V18.75L8.95 15.25V16.85L13.95 19.7V21.95L8.95 19.1V20.75L15.1 24.25V26.7L6.4 21.75V11.35Z"
          fill="url(#logo-left-e)"
        />

        {/* Right isometric face: Sculpted 3-layer '3' */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M25.6 11.35L16.9 16.3V18.75L23.05 15.25V16.85L18.05 19.7V21.95L23.05 19.1V20.75L16.9 24.25V26.7L25.6 21.75V11.35Z"
          fill="url(#logo-right-3)"
        />
      </svg>
    </span>
  )
}

export function Logo({ className, markClassName, showTagline = false }: LogoProps) {
  return (
    <span
      className={cn(
        "group/logo inline-flex items-center gap-2.5 font-heading text-lg font-bold tracking-tight select-none",
        className
      )}
    >
      <LogoMark className={markClassName} />
      <span className="flex flex-col justify-center leading-none">
        <span className="inline-flex items-baseline tracking-[-0.035em]">
          <span className="rounded-[5px] bg-primary/14 px-1.5 py-0.5 font-extrabold text-primary ring-1 ring-primary/25 transition-colors group-hover/logo:bg-primary group-hover/logo:text-primary-foreground">
            3D
          </span>
          <span className="ml-1 text-[1.14em] font-extrabold text-foreground">
            Eureka
          </span>
          <span
            className="ml-0.5 inline-block size-1.5 -translate-y-2 rounded-full bg-primary"
            aria-hidden="true"
          />
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
