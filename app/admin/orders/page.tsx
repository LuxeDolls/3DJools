import { isAdmin } from "@/lib/admin-auth"
import { getAllOrders } from "@/lib/orders/queries"
import { OrdersTable } from "@/components/admin/orders-table"

export const dynamic = "force-dynamic"

export default async function AdminOrdersPage() {
  if (!(await isAdmin())) return null
  const orders = await getAllOrders()
  const open = orders.filter((o) => !["delivered", "cancelled", "refunded"].includes(o.status)).length

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-sans text-2xl font-semibold tracking-tight">Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {orders.length} total · {open} open
        </p>
      </div>
      <OrdersTable orders={orders} />
    </div>
  )
}
