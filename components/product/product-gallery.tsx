"use client"

import Image from "next/image"
import { useState } from "react"
import { cn } from "@/lib/utils"

export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0)
  const gallery = images.length ? images : ["/placeholder.svg"]

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="relative aspect-square min-w-0 overflow-hidden rounded-xl border border-border bg-secondary/40">
        <Image
          src={gallery[active] || "/placeholder.svg"}
          alt={alt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-contain p-6"
        />
      </div>
      {gallery.length > 1 && (
        <div className="flex min-w-0 gap-3 overflow-x-auto pb-1">
          {gallery.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                "relative size-20 shrink-0 overflow-hidden rounded-lg border-2 bg-secondary/40 transition-colors",
                i === active ? "border-primary" : "border-border hover:border-muted-foreground",
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
