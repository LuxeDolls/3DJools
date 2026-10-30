"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Cpu, Flame, Layers, Rocket, ScanLine, Sparkles, ArrowRight } from "lucide-react"
import type { Locale } from "@/lib/i18n/config"
import type { Dictionary } from "@/lib/i18n/dictionaries/en"
import type { Product } from "@/lib/catalog/types"
import { localizedPath } from "@/lib/i18n/paths"
import { ProductGrid } from "@/components/product/product-grid"
import { cn } from "@/lib/utils"

const COPY: Record<
  Locale,
  {
    eyebrow: string
    title: string
    subtitle: string
    modes: {
      id: "speed" | "resin" | "engineering" | "laser" | "scanner"
      label: string
      tagline: string
      href: string
    }[]
  }
> = {
  en: {
    eyebrow: "Interactive Solution Finder",
    title: "Match the right machine to your workflow",
    subtitle: "Select your primary application to preview curated machines ready to ship from our European warehouse.",
    modes: [
      {
        id: "speed",
        label: "High-Speed & Multi-Color FDM",
        tagline: "CoreXY & auto-calibrated printers for rapid prototyping and multi-material prints.",
        href: "/catalog/printers",
      },
      {
        id: "resin",
        label: "Ultra-Detail Resin / SLA",
        tagline: "High-resolution MSLA & SLA systems for miniatures, dental, jewelry, and smooth surfaces.",
        href: "/catalog/printers",
      },
      {
        id: "engineering",
        label: "Industrial & Large Format",
        tagline: "Enclosed chambers, high-temp hotends, and large build volumes for production parts.",
        href: "/catalog/printers",
      },
      {
        id: "laser",
        label: "Laser Cutting & Engraving",
        tagline: "Precision diode and CO2 laser cutters for wood, acrylic, leather, and anodized metal.",
        href: "/catalog/laser-engravers",
      },
      {
        id: "scanner",
        label: "3D Metrology & Scanning",
        tagline: "Blue-laser and structured-light 3D scanners for reverse engineering and digital twins.",
        href: "/catalog/scanners",
      },
    ],
  },
  de: {
    eyebrow: "Interaktiver Geräte-Berater",
    title: "Finden Sie das passende System für Ihren Workflow",
    subtitle: "Wählen Sie Ihren Anwendungsbereich und entdecken Sie sofort lieferbare Systeme aus unserem EU-Lager.",
    modes: [
      {
        id: "speed",
        label: "High-Speed & Mehrfarb-FDM",
        tagline: "CoreXY- und vollautomatisch kalibrierte 3D-Drucker für schnelle Prototypen.",
        href: "/catalog/printers",
      },
      {
        id: "resin",
        label: "Ultra-Detail Resin / SLA",
        tagline: "Hochauflösende MSLA- und SLA-Systeme für Miniaturen, Dental, Schmuck und glatte Oberflächen.",
        href: "/catalog/printers",
      },
      {
        id: "engineering",
        label: "Industrie & Großformat",
        tagline: "Geschlossene Bauräume, Hochtemperatur-Hotends und großes Bauvolumen für Serienbauteile.",
        href: "/catalog/printers",
      },
      {
        id: "laser",
        label: "Laserschneiden & Gravieren",
        tagline: "Präzise Dioden- und CO2-Lasersysteme für Holz, Acryl, Leder und Metall.",
        href: "/catalog/laser-engravers",
      },
      {
        id: "scanner",
        label: "3D-Messtechnik & Scanner",
        tagline: "Blaulaser- und Streifenlicht-3D-Scanner für Reverse Engineering und Qualitätskontrolle.",
        href: "/catalog/scanners",
      },
    ],
  },
  fr: {
    eyebrow: "Guide interactif par usage",
    title: "Trouvez la machine adaptée à votre flux de travail",
    subtitle: "Choisissez votre application principale pour découvrir notre sélection expédiée rapidement en Europe.",
    modes: [
      {
        id: "speed",
        label: "FDM Haute Vitesse & Multi-couleurs",
        tagline: "Imprimantes CoreXY à calibration automatique pour le prototypage rapide.",
        href: "/catalog/printers",
      },
      {
        id: "resin",
        label: "Résine / SLA Ultra-Précise",
        tagline: "Systèmes MSLA et SLA haute résolution pour figurines, dentaire, bijouterie et états de surface lisses.",
        href: "/catalog/printers",
      },
      {
        id: "engineering",
        label: "Industrie & Grand Volume",
        tagline: "Chambres fermées, buses haute température et grands volumes pour pièces fonctionnelles.",
        href: "/catalog/printers",
      },
      {
        id: "laser",
        label: "Découpe & Gravure Laser",
        tagline: "Graveurs et découpeurs laser diode et CO2 pour bois, acrylique, cuir et métal.",
        href: "/catalog/laser-engravers",
      },
      {
        id: "scanner",
        label: "Scanners 3D & Métrologie",
        tagline: "Scanners 3D laser bleu et lumière structurée pour la rétro-ingénierie.",
        href: "/catalog/scanners",
      },
    ],
  },
  it: {
    eyebrow: "Guida interattiva alla scelta",
    title: "Trova la macchina ideale per il tuo flusso di lavoro",
    subtitle: "Seleziona la tua applicazione principale per confrontare i modelli pronti per la spedizione in UE.",
    modes: [
      {
        id: "speed",
        label: "FDM Alta Velocità & Multicolore",
        tagline: "Stampanti CoreXY con calibrazione automatica per prototipazione rapida.",
        href: "/catalog/printers",
      },
      {
        id: "resin",
        label: "Resina / SLA Ultra-Dettaglio",
        tagline: "Sistemi MSLA e SLA ad alta risoluzione per miniature, dentale, gioielleria e superfici lisce.",
        href: "/catalog/printers",
      },
      {
        id: "engineering",
        label: "Industriale & Grande Formato",
        tagline: "Camere chiuse, alte temperature e grandi volumi di stampa per parti tecniche.",
        href: "/catalog/printers",
      },
      {
        id: "laser",
        label: "Taglio & Incisione Laser",
        tagline: "Sistemi laser a diodo e CO2 di precisione per legno, acrilico, pelle e metallo.",
        href: "/catalog/laser-engravers",
      },
      {
        id: "scanner",
        label: "Scansione 3D & Metrologia",
        tagline: "Scanner 3D a laser blu e luce strutturata per reverse engineering.",
        href: "/catalog/scanners",
      },
    ],
  },
  es: {
    eyebrow: "Asesor interactivo de equipos",
    title: "Encuentra el equipo ideal para tu flujo de trabajo",
    subtitle: "Selecciona tu aplicación principal para ver las máquinas recomendadas con envío rápido en toda la UE.",
    modes: [
      {
        id: "speed",
        label: "FDM de Alta Velocidad y Multicolor",
        tagline: "Impresoras CoreXY con calibración automática para prototipado rápido.",
        href: "/catalog/printers",
      },
      {
        id: "resin",
        label: "Resina / SLA de Ultra Detalle",
        tagline: "Sistemas MSLA y SLA de alta resolución para miniaturas, dental, joyería y acabados lisos.",
        href: "/catalog/printers",
      },
      {
        id: "engineering",
        label: "Industrial y Gran Formato",
        tagline: "Cámaras cerradas, alta temperatura y gran volumen para piezas finales de ingeniería.",
        href: "/catalog/printers",
      },
      {
        id: "laser",
        label: "Corte y Grabado Láser",
        tagline: "Cortadoras y grabadoras láser de diodo y CO2 para madera, acrílico, cuero y metal.",
        href: "/catalog/laser-engravers",
      },
      {
        id: "scanner",
        label: "Escaneo 3D y Metrología",
        tagline: "Escáneres 3D de láser azul y luz estructurada para ingeniería inversa.",
        href: "/catalog/scanners",
      },
    ],
  },
  nl: {
    eyebrow: "Interactieve Keuzehulp",
    title: "Kies de juiste machine voor jouw workflow",
    subtitle: "Selecteer je toepassing en bekijk direct geselecteerde systemen met gratis verzending binnen de EU.",
    modes: [
      {
        id: "speed",
        label: "High-Speed & Meerkleuren FDM",
        tagline: "CoreXY- en automatisch gekalibreerde 3D-printers voor snelle prototypes.",
        href: "/catalog/printers",
      },
      {
        id: "resin",
        label: "Ultra-Detail Hars / SLA",
        tagline: "Hoge-resolutie MSLA- en SLA-systemen voor miniaturen, tandtechniek, sieraden en gladde modellen.",
        href: "/catalog/printers",
      },
      {
        id: "engineering",
        label: "Industrieel & Grootformaat",
        tagline: "Gesloten bouwkamers, hoge-temperatuur hotends en groot bouwvolume voor functionele onderdelen.",
        href: "/catalog/printers",
      },
      {
        id: "laser",
        label: "Lasersnijden & Graveren",
        tagline: "Nauwkeurige diode- en CO2-lasersystemen voor hout, acryl, leer en metaal.",
        href: "/catalog/laser-engravers",
      },
      {
        id: "scanner",
        label: "3D-Scanners & Metrologie",
        tagline: "Blauw-laser en gestructureerd-licht 3D-scanners voor reverse engineering.",
        href: "/catalog/scanners",
      },
    ],
  },
}

const MODE_ICONS = {
  speed: Rocket,
  resin: Layers,
  engineering: Cpu,
  laser: Flame,
  scanner: ScanLine,
}

export function PrinterFinder({
  products,
  locale,
  dict,
}: {
  products: Product[]
  locale: Locale
  dict: Dictionary
}) {
  const copy = COPY[locale] ?? COPY.en
  const [activeMode, setActiveMode] = useState<"speed" | "resin" | "engineering" | "laser" | "scanner">("speed")

  const currentModeObj = copy.modes.find((m) => m.id === activeMode) ?? copy.modes[0]

  const recommendations = useMemo(() => {
    const matched = products.filter((p) => {
      if (activeMode === "laser") return p.category === "laser-engravers"
      if (activeMode === "scanner") return p.category === "scanners"
      if (activeMode === "resin") {
        return (
          p.category === "printers" &&
          (p.technology === "resin" || /mars|saturn|photon|form\s|jupiter/i.test(p.name))
        )
      }
      if (activeMode === "engineering") {
        return (
          p.category === "printers" &&
          (p.priceCents >= 90000 ||
            p.useCases.includes("engineering") ||
            p.useCases.includes("business") ||
            /h2d|x1|giga|ultimaker|raise3d|core one/i.test(p.name))
        )
      }
      // speed / multi-color FDM
      return (
        p.category === "printers" &&
        p.technology !== "resin" &&
        !/mars|saturn|photon|form\s|jupiter/i.test(p.name)
      )
    })

    return (matched.length > 0 ? matched : products).slice(0, 4)
  }, [products, activeMode])

  return (
    <section className="relative z-10 border-y border-border bg-card/60 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-primary sm:text-xs">
              <Sparkles className="size-3.5" />
              {copy.eyebrow}
            </p>
            <h2 className="mt-1 text-balance font-heading text-xl font-bold tracking-tight text-foreground sm:mt-1.5 sm:text-3xl">
              {copy.title}
            </h2>
            <p className="mt-1 max-w-2xl text-pretty text-xs text-muted-foreground sm:mt-1.5 sm:text-sm">
              {copy.subtitle}
            </p>
          </div>
          <Link
            href={localizedPath(locale, currentModeObj.href)}
            className="group inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary hover:underline sm:gap-1.5 sm:text-sm"
          >
            {dict.home.viewAll}
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5 sm:size-4" />
          </Link>
        </div>

        {/* Workflow Selector Cards — horizontal swipe on mobile, grid on sm+ */}
        <div className="mt-4 -mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1.5 [scrollbar-width:none] sm:mx-0 sm:mt-6 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-5">
          {copy.modes.map((m) => {
            const Icon = MODE_ICONS[m.id]
            const active = m.id === activeMode
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setActiveMode(m.id)}
                className={cn(
                  "flex w-56 shrink-0 flex-col items-start gap-2 rounded-xl border p-3.5 text-left shadow-[0_10px_25px_-5px_rgba(0,0,0,0.6)] transition-all duration-200 hover:-translate-y-0.5 sm:w-auto sm:p-4",
                  active
                    ? "border-primary bg-primary/10 ring-1 ring-primary/40"
                    : "border-border bg-background hover:border-primary/40 hover:bg-secondary/40",
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <span
                    className={cn(
                      "flex size-7 items-center justify-center rounded-lg transition-colors sm:size-8",
                      active ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground",
                    )}
                  >
                    <Icon className="size-3.5 sm:size-4" />
                  </span>
                  {active && (
                    <span className="size-2 rounded-full bg-primary" aria-hidden="true" />
                  )}
                </div>
                <div>
                  <p className="font-heading text-xs font-bold leading-snug text-foreground sm:text-sm">{m.label}</p>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
                    {m.tagline}
                  </p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Matching 4 Products */}
        <div className="mt-4 sm:mt-6">
          <ProductGrid products={recommendations} locale={locale} dict={dict} />
        </div>
      </div>
    </section>
  )
}
