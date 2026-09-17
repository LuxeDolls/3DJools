import type { OrderStatus } from "@/lib/db/schema"

const STYLES: Record<OrderStatus, string> = {
  pending: "bg-muted text-muted-foreground",
  awaiting_payment: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  reviewing_payment: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  partially_paid: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  paid: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  processing: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  shipped: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  delivered: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  cancelled: "bg-destructive/15 text-destructive",
  refunded: "bg-destructive/15 text-destructive",
}

export function OrderStatusBadge({ status, label }: { status: OrderStatus; label: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STYLES[status] ?? STYLES.pending}`}
    >
      {label}
    </span>
  )
}
