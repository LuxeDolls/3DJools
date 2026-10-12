import type { Locale } from "@/lib/i18n/config"
import { isShipmentStatus, shipmentStatusLabel } from "@/lib/shipping/tracking"

export type ShipmentEventView = {
  id: string
  status: string
  comment: string | null
  carrier: string | null
  createdAt: string
}

export function ShipmentTimeline({
  events,
  locale,
  emptyLabel,
}: {
  events: ShipmentEventView[]
  locale: Locale
  emptyLabel: string
}) {
  if (events.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>
  }

  return (
    <ol className="flex flex-col">
      {events.map((event, index) => {
        const label = isShipmentStatus(event.status) ? shipmentStatusLabel(event.status, locale) : event.status
        const when = new Intl.DateTimeFormat(locale, {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(new Date(event.createdAt))
        return (
          <li key={event.id} className="relative flex gap-3 pb-5 last:pb-0">
            {index < events.length - 1 ? (
              <span className="absolute top-4 left-[7px] h-full w-px bg-border" aria-hidden="true" />
            ) : null}
            <span
              className={`relative mt-1 size-3.5 shrink-0 rounded-full ${index === 0 ? "bg-primary" : "bg-muted-foreground/40"}`}
              aria-hidden="true"
            />
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground">
                {when}
                {event.carrier ? ` · ${event.carrier}` : ""}
              </p>
              {event.comment ? <p className="mt-1 text-sm leading-relaxed text-foreground">{event.comment}</p> : null}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
