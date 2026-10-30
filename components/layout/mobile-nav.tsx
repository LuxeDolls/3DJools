"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu, User, PackageSearch, ChevronRight, Headphones, HelpCircle, Info, Mail } from "lucide-react"
import { useI18n, useLocalizedPath } from "@/components/i18n-provider"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { LocaleSwitcher } from "./locale-switcher"
import { ThemeToggle } from "./theme-toggle"
import { Logo } from "./logo"
import type { NavItem } from "./nav-items"
import { cn } from "@/lib/utils"

export function MobileNav({ navItems }: { navItems: NavItem[] }) {
  const { dict } = useI18n()
  const lp = useLocalizedPath()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="flex size-9 items-center justify-center rounded-md text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={dict.common.menu}
      >
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-80 max-w-[85vw] gap-0 p-0">
        <SheetHeader className="shrink-0 border-b border-border px-4 py-3.5">
          <SheetTitle render={<Logo />} />
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          <nav className="flex flex-col p-2.5" aria-label="Mobile">
            <p className="px-3 pb-1.5 pt-1 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
              {dict.footer.shop}
            </p>
            {navItems.map((item) => {
              const target = lp(item.href)
              const isActive = pathname === target
              const isDeals = item.href === "/deals"
              return (
                <Link
                  key={item.href}
                  href={target}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors",
                    isActive
                      ? "bg-primary/15 text-primary"
                      : isDeals
                        ? "text-primary hover:bg-primary/10"
                        : "text-foreground hover:bg-secondary",
                  )}
                >
                  <span>{item.label}</span>
                  <ChevronRight className="size-4 text-muted-foreground/60" />
                </Link>
              )
            })}
          </nav>

          <Separator />

          <div className="flex flex-col p-2.5">
            <p className="px-3 pb-1.5 pt-1 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
              {dict.footer.support}
            </p>
            <Link
              href={lp("/account")}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <User className="size-4 text-primary" />
              {dict.common.account}
            </Link>
            <Link
              href={lp("/track-order")}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <PackageSearch className="size-4 text-primary" />
              {dict.common.trackOrder}
            </Link>
            <Link
              href={lp("/support")}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <Headphones className="size-4 text-primary" />
              {dict.nav.support}
            </Link>
            <Link
              href={lp("/about")}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <Info className="size-4 text-primary" />
              {dict.footer.about}
            </Link>
            <Link
              href={lp("/contact")}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <Mail className="size-4 text-primary" />
              {dict.footer.contact}
            </Link>
            <Link
              href={lp("/faq")}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <HelpCircle className="size-4 text-primary" />
              {dict.footer.faq}
            </Link>
          </div>
        </div>

        <Separator className="shrink-0" />

        <div className="flex shrink-0 items-center justify-between bg-secondary/30 px-4 py-3">
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
      </SheetContent>
    </Sheet>
  )
}
