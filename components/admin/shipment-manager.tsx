"use client"

import { useEffect, useState, type FormEvent } from "react"
import { Loader2 } from "lucide-react"
import { addShipmentEvent, getShipmentDetail, searchShipmentOrders } from "@/lib/actions/shipments"
import { CARRIERS, OWN_CARRIER, SHIPMENT_STATUSES, SHIPMENT_STATUS_HINTS } from "@/lib/shipping/tracking"
import { ShipmentTimeline, type ShipmentEventView } from "@/components/orders/shipment-timeline"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type ShipmentOrder = {
  id: string
  orderNumber: string
  email: string
  status: string
  shippingName: string | null
  shippingCity: string | null
  shippingCountry: string | null
  trackingNumber: string | null
  trackingUrl: string | null
  carrier: string | null
  totalCents: number
  updatedAt: string
}

export function ShipmentManager({ initialOrders }: { initialOrders: ShipmentOrder[] }) {
  const [query, setQuery] = useState("")
  const [orders, setOrders] = useState(initialOrders)
  const [searching, setSearching] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(initialOrders[0]?.id ?? null)
  const [events, setEvents] = useState<ShipmentEventView[]>([])
  const [detail, setDetail] = useState<ShipmentOrder | null>(initialOrders[0] ?? null)
  const [status, setStatus] = useState<string>("collected")
  const [carrier, setCarrier] = useState<string>(initialOrders[0]?.carrier || OWN_CARRIER)
  const [comment, setComment] = useState("")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function load(orderId: string, list = orders) {
    setSelectedId(orderId)
    setMessage(null)
    setError(null)
    const found = list.find((order) => order.id === orderId) ?? null
    setDetail(found)
    setCarrier(found?.carrier || OWN_CARRIER)
    const result = await getShipmentDetail(orderId)
    setEvents(result?.events ?? [])
    if (result?.order) {
      setDetail(result.order)
      setCarrier(result.order.carrier || OWN_CARRIER)
      setOrders((current) => current.map((item) => (item.id === result.order.id ? result.order : item)))
    }
  }

  useEffect(() => {
    if (initialOrders[0]) void load(initialOrders[0].id)
    // Load the first order's history once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function search(event: FormEvent) {
    event.preventDefault()
    setSearching(true)
    const rows = await searchShipmentOrders(query)
    setOrders(rows)
    setSearching(false)
    if (rows[0]) await load(rows[0].id, rows)
    else {
      setSelectedId(null)
      setDetail(null)
      setEvents([])
    }
  }

  async function save(event: FormEvent) {
    event.preventDefault()
    if (!selectedId) return
    setSaving(true)
    setMessage(null)
    setError(null)
    const result = await addShipmentEvent({ orderId: selectedId, status, comment, carrier })
    setSaving(false)
    if (!result.ok) {
      setError(result.error ?? "Could not save the status.")
      return
    }
    setComment("")
    setMessage(result.emailed ? "Status saved. The customer was emailed." : "Status saved. The email was not sent.")
    await load(selectedId)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <div>
        <form onSubmit={search} className="flex gap-2">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Order, email, tracking"
            aria-label="Search orders"
          />
          <Button type="submit" variant="secondary" disabled={searching}>
            {searching ? <Loader2 className="size-4 animate-spin" /> : "Find"}
          </Button>
        </form>
        <ul className="mt-3 divide-y divide-border rounded-lg border border-border">
          {orders.length === 0 ? (
            <li className="p-3 text-sm text-muted-foreground">No orders found.</li>
          ) : (
            orders.map((order) => (
              <li key={order.id}>
                <button
                  type="button"
                  onClick={() => load(order.id)}
                  className={`w-full px-3 py-2.5 text-left text-sm ${
                    selectedId === order.id ? "bg-muted text-foreground" : "text-foreground hover:bg-muted/50"
                  }`}
                >
                  <span className="block font-medium">{order.orderNumber}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {order.shippingName || order.email} · {order.status}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>

      {detail ? (
        <div className="rounded-lg border border-border p-4 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-sans text-lg font-semibold">{detail.orderNumber}</h2>
              <p className="text-sm text-muted-foreground">
                {detail.shippingName} · {detail.email}
              </p>
              <p className="text-sm text-muted-foreground">
                {[detail.shippingCity, detail.shippingCountry].filter(Boolean).join(", ")}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">{detail.status}</p>
          </div>

          {detail.trackingNumber ? (
            <p className="mt-4 rounded-md bg-muted px-3 py-2 font-mono text-sm text-foreground">
              {detail.carrier ? `${detail.carrier} · ` : ""}
              {detail.trackingNumber}
            </p>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              A tracking number is created when you add the first status, or when the order is marked Shipped.
            </p>
          )}

          <div className="mt-6">
            <ShipmentTimeline
              events={events}
              locale="en"
              emptyLabel="No delivery statuses yet."
            />
          </div>

          <form onSubmit={save} className="mt-6 grid gap-4 border-t border-border pt-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="shipment-status">Delivery status</Label>
                <select
                  id="shipment-status"
                  value={status}
                  onChange={(event) => {
                    const next = event.target.value
                    setStatus(next)
                    if (next === "handed_to_partner" && carrier === OWN_CARRIER) setCarrier("DHL")
                  }}
                  className="h-9 rounded-md border border-border bg-background px-2 text-sm"
                >
                  {SHIPMENT_STATUSES.map((item) => (
                    <option key={item} value={item}>
                      {item.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  {SHIPMENT_STATUS_HINTS[status as keyof typeof SHIPMENT_STATUS_HINTS]}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="shipment-carrier">Carrier</Label>
                <select
                  id="shipment-carrier"
                  value={carrier}
                  onChange={(event) => setCarrier(event.target.value)}
                  className="h-9 rounded-md border border-border bg-background px-2 text-sm"
                >
                  {CARRIERS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="shipment-comment">Comment for the customer</Label>
              <Textarea
                id="shipment-comment"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Write this in the customer's language. It is emailed as written."
                rows={4}
                maxLength={1000}
              />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
            <Button type="submit" disabled={saving} className="w-fit">
              {saving ? <Loader2 className="size-4 animate-spin" /> : null}
              Add status and email customer
            </Button>
          </form>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Select an order to add a delivery status.</p>
      )}
    </div>
  )
}
