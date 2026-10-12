import { isAdmin } from "@/lib/admin-auth"
import { listShipmentOrders } from "@/lib/shipping/events"
import { ShipmentManager } from "@/components/admin/shipment-manager"
import { ADMIN_STATUS_LABELS, SHIPMENT_STATUSES } from "@/lib/shipping/tracking"

export const dynamic = "force-dynamic"

export default async function AdminShipmentsPage() {
  if (!(await isAdmin())) return null
  const orders = await listShipmentOrders()

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-sans text-2xl font-semibold tracking-tight">Статусы доставки</h1>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          В админке статусы на русском. Покупатель видит тот же статус на своём языке. Место и комментарий уходят в
          письме как написаны.
        </p>
      </div>
      <ShipmentManager
        initialOrders={orders.map((order) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          email: order.email,
          status: order.status,
          shippingName: order.shippingName,
          shippingCity: order.shippingCity,
          shippingCountry: order.shippingCountry,
          trackingNumber: order.trackingNumber,
          trackingUrl: order.trackingUrl,
          carrier: order.carrier,
          totalCents: order.totalCents,
          updatedAt: order.updatedAt.toISOString(),
        }))}
      />
      <section className="mt-8">
        <h2 className="text-sm font-semibold text-foreground">Статусы</h2>
        <ul className="mt-3 divide-y divide-border rounded-md border border-border">
          {SHIPMENT_STATUSES.map((status) => (
            <li key={status} className="px-3 py-2 text-sm text-foreground">
              {ADMIN_STATUS_LABELS[status]}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
