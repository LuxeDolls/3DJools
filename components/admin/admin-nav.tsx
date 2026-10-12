"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { CreditCard, Package, MessageSquare, Boxes, LayoutDashboard, MessageCircle, HardDriveDownload, Truck } from "lucide-react"
import { getUnreadChatCount } from "@/lib/actions/admin"

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/applications", label: "Installments", icon: CreditCard },
  { href: "/admin/catalog", label: "Catalog", icon: Boxes },
  { href: "/admin/orders", label: "Orders", icon: Package },
  { href: "/admin/shipments", label: "Delivery", icon: Truck },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
  { href: "/admin/chat", label: "Live chat", icon: MessageCircle },
  { href: "/admin/backups", label: "Backups", icon: HardDriveDownload },
]

export function AdminNav() {
  const pathname = usePathname()
  const [unreadChats, setUnreadChats] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function poll() {
      try {
        const count = await getUnreadChatCount()
        if (!cancelled) setUnreadChats(count)
      } catch {
        // ignore transient polling errors
      }
    }

    poll()
    const interval = setInterval(poll, 5000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  return (
    <nav className="flex gap-1 overflow-x-auto">
      {LINKS.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href)
        const showBadge = href === "/admin/chat" && unreadChats > 0
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
              active
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
            {showBadge && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-semibold text-primary-foreground">
                {unreadChats}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}
