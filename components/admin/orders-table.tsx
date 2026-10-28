"use client"

import { Fragment, useMemo, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ChevronDown, Search, X } from "lucide-react"
import { blockCustomerForOrder, setOrderStatus, setOrderTracking } from "@/lib/actions/admin"
import { Input } from "@/components/ui/input"
import { OrderStatusBadge } from "@/components/orders/order-status-badge"
import type { OrderStatus, PaymentMethod } from "@/lib/db/schema"
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

const CLOSED = new Set<OrderStatus>(["delivered", "cancelled", "refunded"])
const METHODS: PaymentMethod[] = ["card", "alppay", "paypal", "square", "sumup", "bank_transfer", "crypto", "installments"]
type StatusFilter = "all" | "open" | OrderStatus
type PaymentFilter = "all" | string

function matchesStatus(order: OrderWithItems, filter: StatusFilter): boolean {
  if (filter === "all") return true
  if (filter === "open") return !CLOSED.has(order.status as OrderStatus)
  return order.status === filter
}

function matchesPayment(order: OrderWithItems, filter: PaymentFilter): boolean {
  return filter === "all" || order.paymentMethod === filter
}

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
        placeholder="Carrier (DnD3D Courier, DHL, DPD)"
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

function BlockCustomerControl({ order }: { order: OrderWithItems }) {
  const router = useRouter()
  const blockedNote = parseOrderNotes(order.notes).blocked_reason
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [saving, setSaving] = useState(false)

  if (blockedNote) {
    return (
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-destructive">Customer blocked</h3>
        <p className="text-xs text-muted-foreground">{blockedNote}</p>
      </div>
    )
  }

  async function block() {
    setSaving(true)
    await blockCustomerForOrder(order.id, reason)
    setSaving(false)
    setOpen(false)
    router.refresh()
  }

  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Fraud / abuse</h3>
      {open ? (
        <div className="space-y-2">
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason (e.g. suspicious card testing)"
            className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm placeholder:text-muted-foreground/60"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={block}
              disabled={saving}
              className="flex-1 rounded-md bg-destructive px-3 py-1.5 text-sm font-medium text-destructive-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Blocking…" : "Cancel order & block"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={saving}
              className="rounded-md border border-border px-3 py-1.5 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-md border border-destructive/50 px-3 py-1.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
        >
          Block customer & cancel order
        </button>
      )}
    </div>
  )
}

function paymentLabel(method: string): string {
  if (method === "paypal") return "PayPal"
  if (method === "alppay") return "Visa / Mastercard"
  return method.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

function FilterRow<T extends string>({
  label,
  filters,
  active,
  onSelect,
}: {
  label: string
  filters: { value: T; name: string; count: number }[]
  active: T
  onSelect: (value: T) => void
}) {
  return (
    <div className="space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="flex flex-wrap gap-2" role="group" aria-label={`Filter by ${label.toLowerCase()}`}>
        {filters.map((filter) => {
          const selected = active === filter.value
          return (
            <button
              key={filter.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onSelect(filter.value)}
              className={`min-h-9 rounded-full border px-3 py-1.5 text-xs font-medium ${
                selected
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              {filter.name} <span className="tabular-nums">{filter.count}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function OrderDetails({ order }: { order: OrderWithItems }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Items ordered</h3>
        <ul className="space-y-3">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center gap-3">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border border-border bg-background">
                {item.image ? (
                  <Image src={item.image || "/placeholder.svg"} alt={item.productName} fill sizes="56px" className="object-cover" />
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
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd>{euros(order.subtotalCents)}</dd>
          </div>
          {Number(parseOrderNotes(order.notes).member_discount_cents || 0) > 0 && (
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Member discount</dt>
              <dd>-{euros(Number(parseOrderNotes(order.notes).member_discount_cents))}</dd>
            </div>
          )}
          {Number(parseOrderNotes(order.notes).personal_discount_cents || 0) > 0 && (
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Personal discount</dt>
              <dd>-{euros(Number(parseOrderNotes(order.notes).personal_discount_cents))}</dd>
            </div>
          )}
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Shipping</dt>
            <dd>{order.shippingCents === 0 ? "Free" : euros(order.shippingCents)}</dd>
          </div>
          <div className="flex justify-between gap-3 font-semibold">
            <dt>Total</dt>
            <dd>{euros(order.totalCents)}</dd>
          </div>
        </dl>
      </div>
      <div className="space-y-4">
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Shipping to</h3>
          <address className="not-italic text-sm leading-relaxed">
            {order.shippingName ? <p>{order.shippingName}</p> : null}
            {order.shippingAddress1 ? <p>{order.shippingAddress1}</p> : null}
            {order.shippingAddress2 ? <p>{order.shippingAddress2}</p> : null}
            <p>{[order.shippingPostalCode, order.shippingCity].filter(Boolean).join(" ")}</p>
            {order.shippingCountry ? <p>{order.shippingCountry}</p> : null}
            {!order.shippingAddress1 && !order.shippingCity ? (
              <p className="text-muted-foreground">No shipping address on file</p>
            ) : null}
          </address>
        </div>
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Payment</h3>
          <p className="text-sm">{paymentLabel(order.paymentMethod)}</p>
        </div>
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tracking</h3>
          <TrackingForm order={order} />
        </div>
        {order.notes ? (
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Notes</h3>
            <p className="break-words text-sm text-muted-foreground">{order.notes}</p>
          </div>
        ) : null}
        <BlockCustomerControl order={order} />
      </div>
    </div>
  )
}

export function OrdersTable({ orders }: { orders: OrderWithItems[] }) {
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("all")
  const [query, setQuery] = useState("")
  const needle = query.trim().toLowerCase().replace(/\s+/g, "")
  const searched = useMemo(
    () => (needle ? orders.filter((order) => order.orderNumber.toLowerCase().replace(/\s+/g, "").includes(needle)) : orders),
    [orders, needle],
  )
  const statusCounts = useMemo(() => {
    const map = new Map<OrderStatus, number>()
    for (const status of STATUSES) map.set(status, 0)
    for (const order of searched) {
      if (!matchesPayment(order, paymentFilter)) continue
      const status = order.status as OrderStatus
      map.set(status, (map.get(status) ?? 0) + 1)
    }
    return map
  }, [searched, paymentFilter])
  const paymentCounts = useMemo(() => {
    const map = new Map<string, number>()
    for (const order of searched) {
      if (!matchesStatus(order, statusFilter)) continue
      map.set(order.paymentMethod, (map.get(order.paymentMethod) ?? 0) + 1)
    }
    return map
  }, [searched, statusFilter])
  const statusScope = useMemo(
    () => searched.filter((order) => matchesPayment(order, paymentFilter)),
    [searched, paymentFilter],
  )
  const openCount = useMemo(
    () => statusScope.filter((order) => !CLOSED.has(order.status as OrderStatus)).length,
    [statusScope],
  )
  const visible = useMemo(
    () => searched.filter((order) => matchesStatus(order, statusFilter) && matchesPayment(order, paymentFilter)),
    [searched, statusFilter, paymentFilter],
  )

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

  const methods = [...new Set<string>([...METHODS, ...searched.map((order) => order.paymentMethod)])]
  const statusFilters: { value: StatusFilter; name: string; count: number }[] = [
    { value: "all", name: "All", count: statusScope.length },
    { value: "open", name: "Open", count: openCount },
    ...STATUSES.filter((status) => status === statusFilter || (statusCounts.get(status) ?? 0) > 0).map((status) => ({
      value: status,
      name: label(status),
      count: statusCounts.get(status) ?? 0,
    })),
  ]
  const paymentFilters: { value: PaymentFilter; name: string; count: number }[] = [
    { value: "all", name: "All", count: searched.filter((order) => matchesStatus(order, statusFilter)).length },
    ...methods
      .filter((method) => method === paymentFilter || (paymentCounts.get(method) ?? 0) > 0)
      .map((method) => ({
        value: method,
        name: paymentLabel(method),
        count: paymentCounts.get(method) ?? 0,
      })),
  ]

  return (
    <div>
      <div className="mb-4 space-y-3">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by order number"
            className="h-11 pl-9 pr-10 text-base lg:text-sm"
            aria-label="Search by order number"
            inputMode="search"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center text-muted-foreground hover:text-foreground"
              aria-label="Clear order number search"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>
        <FilterRow label="Status" filters={statusFilters} active={statusFilter} onSelect={setStatusFilter} />
        <FilterRow label="Payment" filters={paymentFilters} active={paymentFilter} onSelect={setPaymentFilter} />
      </div>
      {visible.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <p className="text-sm font-medium">{needle ? "No orders match this number" : "No orders match these filters"}</p>
        </div>
      ) : (
        <>
          <ul className="space-y-3 lg:hidden">
            {visible.map((order) => {
              const isOpen = expanded === order.id
              return (
                <li key={order.id} className="rounded-lg border border-border bg-card">
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : order.id)}
                    className="flex w-full items-start gap-3 px-3 py-3 text-left"
                  >
                    <ChevronDown
                      className={`mt-0.5 h-5 w-5 shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-3">
                        <span className="font-medium">{order.orderNumber}</span>
                        <span className="shrink-0 font-medium">{euros(order.totalCents)}</span>
                      </span>
                      <span className="mt-1 block text-sm">{order.shippingName ?? "—"}</span>
                      <span className="block truncate text-xs text-muted-foreground">{order.email}</span>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()} · {order.items.length} items ·{" "}
                        {paymentLabel(order.paymentMethod)}
                      </span>
                      <span className="mt-2 block">
                        <OrderStatusBadge status={order.status as OrderStatus} label={label(order.status as OrderStatus)} />
                      </span>
                    </span>
                  </button>
                  <div className="border-t border-border px-3 py-3">
                    <label htmlFor={`order-status-${order.id}`} className="mb-1.5 block text-xs font-medium text-muted-foreground">
                      Change status
                    </label>
                    <select
                      id={`order-status-${order.id}`}
                      value={order.status}
                      disabled={busy === order.id}
                      onChange={(e) => changeStatus(order.id, e.target.value as OrderStatus)}
                      className="h-11 w-full rounded-md border border-border bg-background px-3 text-base"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {label(s)}
                        </option>
                      ))}
                    </select>
                  </div>
                  {isOpen ? (
                    <div className="border-t border-border px-3 py-4">
                      <OrderDetails order={order} />
                    </div>
                  ) : null}
                </li>
              )
            })}
          </ul>
    <div className="hidden overflow-x-auto rounded-lg border border-border lg:block">
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
          {visible.map((order) => {
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
                      {new Date(order.createdAt).toLocaleDateString()} · {order.items.length} items ·{" "}
                      {paymentLabel(order.paymentMethod)}
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
                      <OrderDetails order={order} />
                    </td>
                  </tr>
                )}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
        </>
      )}
    </div>
  )
}
