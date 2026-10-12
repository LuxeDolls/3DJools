"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { CreditCard, Package, MessageSquare, Boxes, LayoutDashboard, MessageCircle, HardDriveDownload, Truck } from "lucide-react"
import { getUnreadChatCount } from "@/lib/actions/admin"

const LINKS = [
  { href: "/admin", label: "Dashboard", short: "Home", icon: LayoutDashboard, exact: true },
  { href: "/admin/applications", label: "Installments", short: "Plans", icon: CreditCard },
  { href: "/admin/catalog", label: "Catalog", short: "Catalog", icon: Boxes },
  { href: "/admin/orders", label: "Orders", short: "Orders", icon: Package },
  { href: "/admin/shipments", label: "Delivery", short: "Delivery", icon: Truck },
  { href: "/admin/messages", label: "Messages", short: "Inbox", icon: MessageSquare },
  { href: "/admin/chat", label: "Live chat", short: "Chat", icon: MessageCircle },
  { href: "/admin/backups", label: "Backups", short: "Backup", icon: HardDriveDownload },
]

export function AdminNav({ placement }: { placement: "desktop" | "mobile" }) {
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

  if (placement === "mobile") {
    return (
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background pb-[env(safe-area-inset-bottom)] lg:hidden"
        aria-label="Admin sections"
      >
        <div className="grid grid-cols-4">
          {LINKS.map(({ href, short, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href)
            const showBadge = href === "/admin/chat" && unreadChats > 0
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`relative flex min-h-14 flex-col items-center justify-center gap-1 px-1 py-2 text-[11px] font-medium leading-none ${
                  active ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{short}</span>
                {showBadge ? (
                  <span className="absolute right-3 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                    {unreadChats}
                  </span>
                ) : null}
              </Link>
            )
          })}
        </div>
      </nav>
    )
  }

  return (
      <nav className="hidden gap-1 overflow-x-auto lg:flex" aria-label="Admin sections">
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
