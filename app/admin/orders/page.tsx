import { isAdmin } from "@/lib/admin-auth"
import { getAllOrders } from "@/lib/orders/queries"
import { OrdersTable } from "@/components/admin/orders-table"
import { RunAutomationButton } from "@/components/admin/run-automation-button"
import { SendPaymentRemindersButton } from "@/components/admin/send-payment-reminders-button"
import { AUTO_SHIP_AFTER_DAYS } from "@/lib/orders/automation"

export const dynamic = "force-dynamic"

export default async function AdminOrdersPage() {
  if (!(await isAdmin())) return null
  const orders = await getAllOrders()
  const open = orders.filter((o) => !["delivered", "cancelled", "refunded"].includes(o.status)).length

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-sans text-2xl font-semibold tracking-tight">Orders</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {orders.length} total · {open} open
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Automation: Paid → Processing runs hourly, Processing → Shipped after {AUTO_SHIP_AFTER_DAYS} days.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <SendPaymentRemindersButton />
          <RunAutomationButton />
        </div>
      </div>
      <OrdersTable orders={orders} />
    </div>
  )
}
