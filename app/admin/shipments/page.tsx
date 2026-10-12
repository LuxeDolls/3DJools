import { isAdmin } from "@/lib/admin-auth"
import { listShipmentOrders } from "@/lib/shipping/events"
import { ShipmentManager } from "@/components/admin/shipment-manager"
import { SHIPMENT_STATUSES, SHIPMENT_STATUS_HINTS } from "@/lib/shipping/tracking"

export const dynamic = "force-dynamic"

export default async function AdminShipmentsPage() {
  if (!(await isAdmin())) return null
  const orders = await listShipmentOrders()

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-sans text-2xl font-semibold tracking-tight">Delivery statuses</h1>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Mark an order Shipped to generate a tracking number, or add a status here. Each status emails the customer
          with the tracking link. Write the comment in their language.
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
        <h2 className="text-sm font-semibold text-foreground">The 15 statuses</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {SHIPMENT_STATUSES.map((status, index) => (
            <li key={status} className="rounded-md border border-border px-3 py-2 text-sm">
              <span className="font-medium text-foreground">
                {index + 1}. {status.replaceAll("_", " ")}
              </span>
              <span className="mt-0.5 block text-xs text-muted-foreground">{SHIPMENT_STATUS_HINTS[status]}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
