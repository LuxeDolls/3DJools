"use client"

import { useEffect, useState, type FormEvent } from "react"
import { ArrowLeft, Loader2 } from "lucide-react"
import { addShipmentEvent, getShipmentDetail, searchShipmentOrders } from "@/lib/actions/shipments"
import { ADMIN_STATUS_LABELS, CARRIERS, OWN_CARRIER, SHIPMENT_STATUSES } from "@/lib/shipping/tracking"
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
  const [status, setStatus] = useState<string>("in_transit")
  const [location, setLocation] = useState("")
  const [carrier, setCarrier] = useState<string>(initialOrders[0]?.carrier || OWN_CARRIER)
  const [comment, setComment] = useState("")
  const [copied, setCopied] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [mobileDetail, setMobileDetail] = useState(false)

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
    setMobileDetail(false)
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
    const result = await addShipmentEvent({ orderId: selectedId, status, location, comment, carrier })
    setSaving(false)
    if (!result.ok) {
      setError(result.error ?? "Не удалось сохранить статус.")
      return
    }
    setComment("")
    setLocation("")
    setMessage(result.emailed ? "Статус сохранён. Письмо отправлено покупателю." : "Статус сохранён. Письмо не отправилось.")
    await load(selectedId)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <div className={mobileDetail ? "max-lg:hidden" : undefined}>
        <form onSubmit={search} className="flex gap-2">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Заказ, email, трек"
            aria-label="Найти заказ"
          />
          <Button type="submit" variant="secondary" className="min-h-11 shrink-0" disabled={searching}>
            {searching ? <Loader2 className="size-4 animate-spin" /> : "Найти"}
          </Button>
        </form>
        <ul className="mt-3 divide-y divide-border rounded-lg border border-border">
          {orders.length === 0 ? (
            <li className="p-3 text-sm text-muted-foreground">Заказы не найдены.</li>
          ) : (
            orders.map((order) => (
              <li key={order.id}>
                <button
                  type="button"
                  onClick={() => {
                    setMobileDetail(true)
                    void load(order.id)
                  }}
                  className={`min-h-14 w-full px-3 py-3 text-left text-sm ${
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
        <div className={`rounded-lg border border-border p-4 sm:p-6 ${mobileDetail ? "" : "max-lg:hidden"}`}>
          <Button variant="ghost" size="sm" className="mb-3 -ml-2 min-h-11 lg:hidden" onClick={() => setMobileDetail(false)}>
            <ArrowLeft className="h-4 w-4" />
            К заказам
          </Button>
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

          <div className="mt-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Доставка курьером</p>
            {detail.trackingNumber ? (
              <p className="mt-2 text-sm text-foreground">
                Трек-номер: <span className="font-mono">{detail.trackingNumber}</span>
              </p>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                Трек-номер создастся при первом статусе или когда заказ перейдёт в Shipped.
              </p>
            )}
            {detail.trackingUrl ? (
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <Input value={detail.trackingUrl} readOnly aria-label="Ссылка на отслеживание" className="font-mono text-xs" />
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-11 shrink-0"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(detail.trackingUrl ?? "")
                      setCopied(true)
                      window.setTimeout(() => setCopied(false), 1500)
                    } catch {
                      setCopied(false)
                    }
                  }}
                >
                  {copied ? "Скопировано" : "Копировать"}
                </Button>
              </div>
            ) : null}
          </div>

          <div className="mt-6">
            <ShipmentTimeline events={events} locale="en" admin emptyLabel="Статусов доставки пока нет." />
          </div>

          <form onSubmit={save} className="mt-6 grid gap-4 border-t border-border pt-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="shipment-status" className="sr-only">
                  Статус
                </Label>
                <select
                  id="shipment-status"
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  aria-label="Статус"
                  className="h-11 rounded-md border border-border bg-background px-3 text-base text-foreground lg:text-sm"
                >
                  {SHIPMENT_STATUSES.map((item) => (
                    <option key={item} value={item}>
                      {ADMIN_STATUS_LABELS[item]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="shipment-location" className="sr-only">
                  Место
                </Label>
                <Input
                  id="shipment-location"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="Место (напр. Brussels, BE)"
                  aria-label="Место"
                  maxLength={120}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="shipment-carrier">Служба</Label>
              <select
                id="shipment-carrier"
                value={carrier}
                onChange={(event) => setCarrier(event.target.value)}
                className="h-11 rounded-md border border-border bg-background px-3 text-base text-foreground lg:text-sm"
              >
                {CARRIERS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <Textarea
              id="shipment-comment"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Комментарий для покупателя (необязательно)"
              aria-label="Комментарий для покупателя"
              rows={3}
              maxLength={1000}
            />
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
            <Button type="submit" disabled={saving} variant="outline" className="min-h-11 w-full uppercase tracking-wide sm:w-fit">
              {saving ? <Loader2 className="size-4 animate-spin" /> : null}
              Добавить статус
            </Button>
          </form>
        </div>
      ) : (
        <p className={`text-sm text-muted-foreground ${mobileDetail ? "" : "max-lg:hidden"}`}>
          Выберите заказ, чтобы добавить статус доставки.
        </p>
      )}
    </div>
  )
}
