import Link from "next/link"
import { CreditCard, Package, MessageSquare, Boxes, ArrowRight } from "lucide-react"
import { listApplications } from "@/lib/actions/admin"
import { getProductCount } from "@/lib/catalog/queries"
import { getAllOrders } from "@/lib/orders/queries"
import { getAllContactMessages, getUnreadMessageCount } from "@/lib/contact/queries"

export const dynamic = "force-dynamic"

export default async function AdminDashboardPage() {
  const [applications, productCount, orders, messages, unread] = await Promise.all([
    listApplications(),
    getProductCount(),
    getAllOrders(),
    getAllContactMessages(),
    getUnreadMessageCount(),
  ])

  const pendingApplications = applications.filter((a) => a.status === "pending").length
  const openOrders = orders.filter((o) => !["delivered", "cancelled", "refunded"].includes(o.status)).length

  const cards = [
    {
      href: "/admin/applications",
      icon: CreditCard,
      label: "Installments",
      value: applications.length,
      hint: `${pendingApplications} awaiting review`,
    },
    {
      href: "/admin/catalog",
      icon: Boxes,
      label: "Catalog",
      value: productCount,
      hint: "products live",
    },
    {
      href: "/admin/orders",
      icon: Package,
      label: "Orders",
      value: orders.length,
      hint: `${openOrders} open`,
    },
    {
      href: "/admin/messages",
      icon: MessageSquare,
      label: "Messages",
      value: messages.length,
      hint: `${unread} unread`,
    },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-sans text-2xl font-semibold tracking-tight">Operations overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">Everything that needs your attention, in one place.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ href, icon: Icon, label, value, hint }) => (
          <Link
            key={href}
            href={href}
            className="group rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/50"
          >
            <div className="flex items-center justify-between">
              <Icon className="h-5 w-5 text-muted-foreground" />
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
            <p className="mt-4 text-3xl font-semibold tracking-tight">{value}</p>
            <p className="mt-1 text-sm font-medium">{label}</p>
            <p className="text-xs text-muted-foreground">{hint}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
