"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown, Truck } from "lucide-react"
import type { Locale } from "@/lib/i18n/config"
import type { OrderStatus } from "@/lib/db/schema"
import { localizedPath } from "@/lib/i18n/paths"
import { OrderStatusBadge } from "@/components/orders/order-status-badge"
import { ShipmentTimeline, type ShipmentEventView } from "@/components/orders/shipment-timeline"

export type AccountOrderCard = {
  id: string
  orderNumber: string
  dateLabel: string
  itemCount: number
  totalLabel: string
  status: OrderStatus
  statusLabel: string
  trackingNumber: string | null
  carrier: string | null
  events: ShipmentEventView[]
}

export function AccountOrders({
  orders,
  locale,
  labels,
}: {
  orders: AccountOrderCard[]
  locale: Locale
  labels: {
    orderNumber: string
    viewOrder: string
    trackingNo: string
    carrier: string
    trackParcel: string
    history: string
    noUpdates: string
  }
}) {
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <ul className="mt-4 divide-y divide-border">
      {orders.map((order) => {
        const open = openId === order.id
        return (
          <li key={order.id}>
            <button
              type="button"
              aria-expanded={open}
              onClick={() => setOpenId(open ? null : order.id)}
              className="-mx-2 flex w-[calc(100%+1rem)] flex-wrap items-center justify-between gap-3 rounded-md px-2 py-4 text-left transition-colors hover:bg-muted/40"
            >
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {labels.orderNumber} {order.orderNumber}
                </p>
                <p className="text-xs text-muted-foreground">
                  {order.dateLabel} · {order.itemCount} × {order.totalLabel}
                </p>
                {order.trackingNumber ? (
                  <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Truck className="size-3" />
                    {order.carrier ? `${order.carrier} · ` : ""}
                    {order.trackingNumber}
                  </p>
                ) : null}
              </div>
              <span className="flex items-center gap-2">
                <OrderStatusBadge status={order.status} label={order.statusLabel} />
                <ChevronDown className={`size-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
              </span>
            </button>
            {open ? (
              <div className="mb-4 rounded-lg border border-border bg-background p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{labels.history}</h3>
                <div className="mt-3">
                  <ShipmentTimeline events={order.events} locale={locale} emptyLabel={labels.noUpdates} />
                </div>
                {order.trackingNumber ? (
                  <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-xs text-muted-foreground">{labels.trackingNo}</dt>
                      <dd className="font-mono text-foreground">{order.trackingNumber}</dd>
                    </div>
                    {order.carrier ? (
                      <div>
                        <dt className="text-xs text-muted-foreground">{labels.carrier}</dt>
                        <dd className="text-foreground">{order.carrier}</dd>
                      </div>
                    ) : null}
                  </dl>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-3 text-sm">
                  <Link
                    href={localizedPath(locale, `/order/${order.orderNumber}`)}
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    {labels.viewOrder}
                  </Link>
                  {order.trackingNumber ? (
                    <Link
                      href={localizedPath(locale, `/track/${order.trackingNumber}`)}
                      className="font-medium text-primary underline-offset-4 hover:underline"
                    >
                      {labels.trackParcel}
                    </Link>
                  ) : null}
                </div>
              </div>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}
