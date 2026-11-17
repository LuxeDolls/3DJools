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
    eyebrow: "Interactive System Selector",
    title: "Find the ideal machine for your projects",
    subtitle: "Choose your main use case to explore stocked equipment ready for dispatch across the European Union.",
    modes: [
      {
        id: "speed",
        label: "High-Speed & Multi-Color FDM",
        tagline: "Fast CoreXY printers with automated calibration for everyday prototypes and multi-color prints.",
        href: "/catalog/printers",
      },
      {
        id: "resin",
        label: "Fine-Detail Resin / SLA",
        tagline: "Precision MSLA and SLA printers built for miniatures, dental models, castable patterns, and smooth parts.",
        href: "/catalog/printers",
      },
      {
        id: "engineering",
        label: "Engineering & Large Format",
        tagline: "Heated or enclosed build chambers, high-temp extruders, and oversized volumes for end-use parts.",
        href: "/catalog/printers",
      },
      {
        id: "laser",
        label: "Laser Cutting & Engraving",
        tagline: "Accurate diode and CO2 laser systems for cutting and engraving wood, acrylic, leather, and coated metal.",
        href: "/catalog/laser-engravers",
      },
      {
        id: "scanner",
        label: "3D Scanning & Metrology",
        tagline: "Structured-light and blue-laser 3D scanners for CAD capture, inspection, and reverse engineering.",
        href: "/catalog/scanners",
      },
    ],
  },
  de: {
    eyebrow: "Interaktiver System-Finder",
    title: "Das passende Gerät für Ihren Einsatzbereich",
    subtitle: "Wählen Sie Ihr Haupteinsatzgebiet, um direkt verfügbare Systeme mit EU-weitem Versand zu vergleichen.",
    modes: [
      {
        id: "speed",
        label: "Schneller & Mehrfarb-FDM-Druck",
        tagline: "Moderne CoreXY-Drucker mit automatischer Kalibrierung für rasche Prototypen und mehrfarbige Modelle.",
        href: "/catalog/printers",
      },
      {
        id: "resin",
        label: "Feindetail Resin / SLA",
        tagline: "Präzise MSLA- und SLA-Drucker für Modellbau, Dentaltechnik, Schmuckguss und glatte Oberflächen.",
        href: "/catalog/printers",
      },
      {
        id: "engineering",
        label: "Technik & Großformat",
        tagline: "Geschlossene Bauräume, Hochtemperatur-Extruder und große Volumina für belastbare Funktionsteile.",
        href: "/catalog/printers",
      },
      {
        id: "laser",
        label: "Laserschnitt & Gravur",
        tagline: "Leistungsstarke Dioden- und CO2-Laser für die präzise Bearbeitung von Holz, Acryl, Leder und Metall.",
        href: "/catalog/laser-engravers",
      },
      {
        id: "scanner",
        label: "3D-Scan & Messtechnik",
        tagline: "Streifenlicht- und Blaulaser-Scanner für die präzise Digitalisierung und das Reverse Engineering.",
        href: "/catalog/scanners",
      },
    ],
  },
  fr: {
    eyebrow: "Sélecteur d’équipement interactif",
    title: "Identifiez l’équipement adapté à vos projets",
    subtitle: "Sélectionnez votre besoin principal pour afficher les machines en stock expédiées dans toute l’UE.",
    modes: [
      {
        id: "speed",
        label: "FDM Rapide & Multi-matériaux",
        tagline: "Architecture CoreXY et calibration autonome pour enchaîner prototypes et impressions multicolores.",
        href: "/catalog/printers",
      },
      {
        id: "resin",
        label: "Résine / SLA Haute Précision",
        tagline: "Imprimantes MSLA et SLA dédiées aux figurines, au secteur dentaire, à la bijouterie et aux pièces lisses.",
        href: "/catalog/printers",
      },
      {
        id: "engineering",
        label: "Technique & Grand Format",
        tagline: "Enceintes fermées, têtes haute température et grands volumes pour la fabrication de pièces techniques.",
        href: "/catalog/printers",
      },
      {
        id: "laser",
        label: "Gravure & Découpe Laser",
        tagline: "Systèmes laser diode et CO2 pour découper et graver avec netteté bois, acrylique, cuir et métal.",
        href: "/catalog/laser-engravers",
      },
      {
        id: "scanner",
        label: "Numérisation 3D & Métrologie",
        tagline: "Scanners 3D à laser bleu et lumière structurée pour le contrôle dimensionnel et la rétro-ingénierie.",
        href: "/catalog/scanners",
      },
    ],
  },
  it: {
    eyebrow: "Selettore interattivo di sistemi",
    title: "Individua il sistema giusto per i tuoi progetti",
    subtitle: "Scegli l’ambito di utilizzo per visualizzare le macchine disponibili con consegna rapida in tutta l’UE.",
    modes: [
      {
        id: "speed",
        label: "FDM Veloce & Multicolore",
        tagline: "Meccanica CoreXY e calibrazione automatica per prototipi rapidi e stampe multicolore.",
        href: "/catalog/printers",
      },
      {
        id: "resin",
        label: "Resina / SLA ad Alta Precisione",
        tagline: "Stampanti MSLA e SLA pensate per modellismo, odontotecnica, gioielleria e dettagli microscopici.",
        href: "/catalog/printers",
      },
      {
        id: "engineering",
        label: "Tecnico & Grande Formato",
        tagline: "Camera chiusa, estrusori ad alta temperatura e ampio volume di lavoro per componenti funzionali.",
        href: "/catalog/printers",
      },
      {
        id: "laser",
        label: "Incisione & Taglio Laser",
        tagline: "Macchine laser a diodo e CO2 per lavorare con precisione legno, acrilico, pelle e metalli rivestiti.",
        href: "/catalog/laser-engravers",
      },
      {
        id: "scanner",
        label: "Scansione 3D & Metrologia",
        tagline: "Scanner 3D a luce strutturata e laser blu per rilievi CAD, controllo qualità e reverse engineering.",
        href: "/catalog/scanners",
      },
    ],
  },
  es: {
    eyebrow: "Selector interactivo de sistemas",
    title: "Elige la máquina adecuada para tus proyectos",
    subtitle: "Indica tu aplicación principal para explorar los equipos en stock con entrega rápida en toda la UE.",
    modes: [
      {
        id: "speed",
        label: "FDM Rápida y Multicolor",
        tagline: "Sistemas CoreXY con calibración automática para prototipos ágiles e impresiones multicolores.",
        href: "/catalog/printers",
      },
      {
        id: "resin",
        label: "Resina / SLA de Alta Precisión",
        tagline: "Equipos MSLA y SLA diseñados para miniaturas, sector dental, joyería y superficies ultra lisas.",
        href: "/catalog/printers",
      },
      {
        id: "engineering",
        label: "Ingeniería y Gran Formato",
        tagline: "Cabina cerrada, extrusores de alta temperatura y amplio volumen para fabricar piezas técnicas.",
        href: "/catalog/printers",
      },
      {
        id: "laser",
        label: "Grabado y Corte Láser",
        tagline: "Equipos láser de diodo y CO2 para cortar y grabar madera, acrílico, cuero y metal anodizado.",
        href: "/catalog/laser-engravers",
      },
      {
        id: "scanner",
        label: "Digitalización 3D y Metrología",
        tagline: "Escáneres 3D de láser azul y luz estructurada para captura CAD e ingeniería inversa.",
        href: "/catalog/scanners",
      },
    ],
  },
  nl: {
    eyebrow: "Interactieve Systeemkiezer",
    title: "Vind het juiste systeem voor jouw projecten",
    subtitle: "Kies je belangrijkste toepassing om direct leverbare apparatuur met EU-verzending te bekijken.",
    modes: [
      {
        id: "speed",
        label: "Snelle & Meerkleuren FDM",
        tagline: "CoreXY-printers met automatische kalibratie voor vlotte prototypes en meerkleurenprints.",
        href: "/catalog/printers",
      },
      {
        id: "resin",
        label: "Fijndetail Hars / SLA",
        tagline: "Nauwkeurige MSLA- en SLA-printers voor miniaturen, tandtechniek, sieraden en gladde oppervlakken.",
        href: "/catalog/printers",
      },
      {
        id: "engineering",
        label: "Techniek & Grootformaat",
        tagline: "Gesloten behuizingen, hoge-temperatuur extruders en ruim bouwvolume voor technische onderdelen.",
        href: "/catalog/printers",
      },
      {
        id: "laser",
        label: "Lasergraveren & Snijden",
        tagline: "Precieze diode- en CO2-lasers voor het bewerken van hout, acryl, leer en gecoat metaal.",
        href: "/catalog/laser-engravers",
      },
      {
        id: "scanner",
        label: "3D-Scannen & Metrologie",
        tagline: "Blauw-laser en gestructureerd-licht 3D-scanners voor CAD-opname en reverse engineering.",
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
    <section className="px-2 sm:px-4">
      <div className="mx-auto max-w-7xl rounded-[2rem] bg-ink p-4 text-ink-foreground sm:rounded-[2.5rem] sm:p-8 lg:p-12">
        <div className="flex flex-col gap-2 lg:max-w-3xl">
          <p className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-wider text-signal uppercase">
            <Sparkles className="size-3.5" aria-hidden="true" />
            {copy.eyebrow}
          </p>
          <h2 className="font-heading text-2xl leading-none font-bold text-balance sm:text-4xl lg:text-5xl">
            {copy.title}
          </h2>
          <p className="max-w-2xl text-pretty text-sm leading-relaxed text-ink-foreground/70">{copy.subtitle}</p>
        </div>

        <div className="mt-6 grid gap-4 lg:mt-10 lg:grid-cols-12 lg:gap-8">
          <div
            role="radiogroup"
            aria-label={copy.eyebrow}
            className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:col-span-4 lg:flex lg:flex-col"
          >
            {copy.modes.map((m) => {
              const Icon = MODE_ICONS[m.id]
              const active = m.id === activeMode
              return (
                <button
                  key={m.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setActiveMode(m.id)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-2xl p-3.5 text-left transition-all duration-300 lg:p-4",
                    active
                      ? "bg-signal text-signal-foreground"
                      : "bg-ink-foreground/6 text-ink-foreground ring-1 ring-ink-foreground/10 hover:bg-ink-foreground/10",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-xl",
                      active ? "bg-signal-foreground text-signal" : "bg-ink-foreground/10",
                    )}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="flex min-w-0 flex-col gap-1">
                    <span className="font-heading text-sm leading-snug font-bold sm:text-base">{m.label}</span>
                    <span
                      className={cn(
                        "text-xs leading-relaxed",
                        active ? "text-signal-foreground/75" : "line-clamp-2 text-ink-foreground/60 lg:hidden",
                      )}
                    >
                      {m.tagline}
                    </span>
                  </span>
                </button>
              )
            })}
            <Link
              href={localizedPath(locale, currentModeObj.href)}
              className="group hidden items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold text-ink-foreground ring-1 ring-ink-foreground/20 transition-colors hover:bg-ink-foreground hover:text-ink lg:flex"
            >
              {dict.home.viewAll}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="min-w-0 lg:col-span-8">
            <ProductGrid
              key={activeMode}
              products={recommendations}
              locale={locale}
              dict={dict}
              className="animate-in fade-in slide-in-from-bottom-2 duration-500 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4"
            />
            <Link
              href={localizedPath(locale, currentModeObj.href)}
              className="mt-4 flex items-center justify-center gap-1.5 rounded-full py-3 text-sm font-semibold ring-1 ring-ink-foreground/20 lg:hidden"
            >
              {dict.home.viewAll}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
