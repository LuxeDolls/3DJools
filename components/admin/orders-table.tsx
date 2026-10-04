"use client"

import { Fragment, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ChevronDown } from "lucide-react"
import { setOrderStatus, setOrderTracking } from "@/lib/actions/admin"
import { OrderStatusBadge } from "@/components/orders/order-status-badge"
import type { OrderStatus } from "@/lib/db/schema"
import type { OrderWithItems } from "@/lib/orders/queries"
import { parseOrderNotes } from "@/lib/orders/notes"

const STATUSES: OrderStatus[] = [
  "pending",
  "awaiting_payment",
  "reviewing_payment",
  "partially_paid",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
]

function label(s: OrderStatus): string {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

function euros(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`
}

function TrackingForm({ order }: { order: OrderWithItems }) {
  const router = useRouter()
  const [carrier, setCarrier] = useState(order.carrier ?? "")
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber ?? "")
  const [trackingUrl, setTrackingUrl] = useState(order.trackingUrl ?? "")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  async function save() {
    setSaving(true)
    setError(null)
    setSaved(false)
    const res = await setOrderTracking(order.id, { trackingNumber, trackingUrl, carrier })
    setSaving(false)
    if (res.ok) {
      setSaved(true)
      router.refresh()
    } else {
      setError(res.error ?? "Could not save tracking")
    }
  }

  const inputClass =
    "w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm placeholder:text-muted-foreground/60"

  return (
    <div className="space-y-2">
      <input
        type="text"
        value={carrier}
        onChange={(e) => setCarrier(e.target.value)}
        placeholder="Carrier (e.g. DHL, UPS)"
        className={inputClass}
      />
      <input
        type="text"
        value={trackingNumber}
        onChange={(e) => setTrackingNumber(e.target.value)}
        placeholder="Tracking number"
        className={inputClass}
      />
      <input
        type="url"
        value={trackingUrl}
        onChange={(e) => setTrackingUrl(e.target.value)}
        placeholder="Tracking link (https://…)"
        className={inputClass}
      />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      {saved && !error ? <p className="text-xs text-muted-foreground">Saved · customer notified</p> : null}
      <button
        type="button"
        onClick={save}
        disabled={saving || !trackingNumber.trim()}
        className="w-full rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {saving ? "Saving…" : order.trackingNumber ? "Update tracking" : "Assign tracking & notify"}
      </button>
    </div>
  )
}

function paymentLabel(method: string): string {
  return method.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

export function OrdersTable({ orders }: { orders: OrderWithItems[] }) {
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  async function changeStatus(orderId: string, status: OrderStatus) {
    setBusy(orderId)
    await setOrderStatus(orderId, status)
    setBusy(null)
    router.refresh()
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-12 text-center">
        <p className="text-sm font-medium">No orders yet</p>
        <p className="mt-1 text-sm text-muted-foreground">Orders will appear here once a customer completes checkout.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="w-8 px-4 py-3 font-medium">
              <span className="sr-only">Expand</span>
            </th>
            <th className="px-4 py-3 font-medium">Order</th>
            <th className="px-4 py-3 font-medium">Customer</th>
            <th className="px-4 py-3 font-medium">Total</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Change status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const isOpen = expanded === order.id
            return (
              <Fragment key={order.id}>
                <tr
                  className="cursor-pointer border-b border-border transition-colors hover:bg-muted/30 last:border-0"
                  onClick={() => setExpanded(isOpen ? null : order.id)}
                >
                  <td className="px-4 py-3">
                    <ChevronDown
                      className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{order.orderNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()} · {order.items.length} items
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p>{order.shippingName ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">{order.email}</p>
                  </td>
                  <td className="px-4 py-3">{euros(order.totalCents)}</td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={order.status as OrderStatus} label={label(order.status as OrderStatus)} />
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={order.status}
                      disabled={busy === order.id}
                      onChange={(e) => changeStatus(order.id, e.target.value as OrderStatus)}
                      className="rounded-md border border-border bg-background px-2 py-1 text-sm"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {label(s)}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
                {isOpen && (
                  <tr className="border-b border-border bg-muted/20 last:border-0">
                    <td colSpan={6} className="px-4 py-4">
                      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                        <div>
                          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Items ordered
                          </h3>
                          <ul className="space-y-3">
                            {order.items.map((item) => (
                              <li key={item.id} className="flex items-center gap-3">
                                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border border-border bg-background">
                                  {item.image ? (
                                    <Image
                                      src={item.image || "/placeholder.svg"}
                                      alt={item.productName}
                                      fill
                                      sizes="56px"
                                      className="object-cover"
                                    />
                                  ) : null}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate font-medium">{item.productName}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {item.brandName ? `${item.brandName} · ` : ""}
                                    {item.productSlug}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {item.quantity} × {euros(item.unitPriceCents)}
                                  </p>
                                </div>
                                <div className="shrink-0 font-medium">{euros(item.lineTotalCents)}</div>
                              </li>
                            ))}
                          </ul>

                          <dl className="mt-4 space-y-1 border-t border-border pt-3 text-sm">
                            <div className="flex justify-between">
                              <dt className="text-muted-foreground">Subtotal</dt>
                              <dd>{euros(order.subtotalCents)}</dd>
                            </div>
                            {Number(parseOrderNotes(order.notes).member_discount_cents || 0) > 0 && (
                              <div className="flex justify-between">
                                <dt className="text-muted-foreground">Member discount</dt>
                                <dd>-{euros(Number(parseOrderNotes(order.notes).member_discount_cents))}</dd>
                              </div>
                            )}
                            {Number(parseOrderNotes(order.notes).personal_discount_cents || 0) > 0 && (
                              <div className="flex justify-between">
                                <dt className="text-muted-foreground">Personal discount</dt>
                                <dd>-{euros(Number(parseOrderNotes(order.notes).personal_discount_cents))}</dd>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <dt className="text-muted-foreground">Shipping</dt>
                              <dd>{order.shippingCents === 0 ? "Free" : euros(order.shippingCents)}</dd>
                            </div>
                            <div className="flex justify-between font-semibold">
                              <dt>Total</dt>
                              <dd>{euros(order.totalCents)}</dd>
                            </div>
                          </dl>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              Shipping to
                            </h3>
                            <address className="not-italic text-sm leading-relaxed">
                              {order.shippingName ? <p>{order.shippingName}</p> : null}
                              {order.shippingAddress1 ? <p>{order.shippingAddress1}</p> : null}
                              {order.shippingAddress2 ? <p>{order.shippingAddress2}</p> : null}
                              <p>
                                {[order.shippingPostalCode, order.shippingCity].filter(Boolean).join(" ")}
                              </p>
                              {order.shippingCountry ? <p>{order.shippingCountry}</p> : null}
                              {!order.shippingAddress1 && !order.shippingCity ? (
                                <p className="text-muted-foreground">No shipping address on file</p>
                              ) : null}
                            </address>
                          </div>

                          <div>
                            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              Payment
                            </h3>
                            <p className="text-sm">{paymentLabel(order.paymentMethod)}</p>
                          </div>

                          <div>
                            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              Tracking
                            </h3>
                            <TrackingForm order={order} />
                          </div>

                          {order.notes ? (
                            <div>
                              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Notes
                              </h3>
                              <p className="text-sm text-muted-foreground">{order.notes}</p>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
