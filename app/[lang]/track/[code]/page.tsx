import Link from "next/link"
import { isLocale, type Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { localizedPath } from "@/lib/i18n/paths"
import { Breadcrumb } from "@/components/breadcrumb"
import { ShipmentTimeline } from "@/components/orders/shipment-timeline"
import { getShipmentByTrackingNumber } from "@/lib/shipping/events"
import { normalizeTrackingCode, trackingPageCopy } from "@/lib/shipping/tracking"

export async function generateMetadata({ params }: { params: Promise<{ lang: string; code: string }> }) {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : "en"
  const copy = trackingPageCopy(locale)
  return { title: copy.title, robots: { index: false, follow: false } }
}

export default async function TrackCodePage({ params }: { params: Promise<{ lang: string; code: string }> }) {
  const { lang, code } = await params
  const locale: Locale = isLocale(lang) ? lang : "en"
  const dict = await getDictionary(locale)
  const copy = trackingPageCopy(locale)
  const normalized = normalizeTrackingCode(decodeURIComponent(code))
  const shipment = normalized ? await getShipmentByTrackingNumber(normalized) : null
  const destination = shipment
    ? [shipment.order.shippingCity, shipment.order.shippingCountry].filter(Boolean).join(", ")
    : ""

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <Breadcrumb
        locale={locale}
        items={[
          { label: dict.common.home, href: "/" },
          { label: copy.title, href: "/track" },
        ]}
      />
      <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight text-balance text-foreground">{copy.title}</h1>

      {!shipment ? (
        <div className="mt-6 rounded-lg border border-border bg-card p-6">
          <p className="text-sm leading-relaxed text-foreground">{copy.notFound}</p>
          <Link
            href={localizedPath(locale, "/track")}
            className="mt-4 inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            {copy.submit}
          </Link>
        </div>
      ) : (
        <div className="mt-6 rounded-lg border border-border bg-card p-6">
          <p className="font-mono text-sm text-foreground">{shipment.order.trackingNumber}</p>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted-foreground">{copy.order}</dt>
              <dd className="font-medium text-foreground">{shipment.order.orderNumber}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">{copy.carrier}</dt>
              <dd className="font-medium text-foreground">{shipment.order.carrier || "3DJools Courier"}</dd>
            </div>
            {destination ? (
              <div>
                <dt className="text-xs text-muted-foreground">{copy.destination}</dt>
                <dd className="font-medium text-foreground">{destination}</dd>
              </div>
            ) : null}
          </dl>
          <h2 className="mt-6 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{copy.history}</h2>
          <div className="mt-3">
            <ShipmentTimeline
              events={shipment.events.map((event) => ({
                id: event.id,
                status: event.status,
                comment: event.comment,
                carrier: event.carrier,
                createdAt: event.createdAt.toISOString(),
              }))}
              locale={locale}
              emptyLabel={copy.noUpdates}
            />
          </div>
          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{copy.note}</p>
        </div>
      )}
    </div>
  )
}
