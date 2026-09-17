"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, User, PackageSearch } from "lucide-react"
import { useI18n, useLocalizedPath } from "@/components/i18n-provider"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { LocaleSwitcher } from "./locale-switcher"
import { ThemeToggle } from "./theme-toggle"
import { Logo } from "./logo"
import type { NavItem } from "./nav-items"

export function MobileNav({ navItems }: { navItems: NavItem[] }) {
  const { dict } = useI18n()
  const lp = useLocalizedPath()
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
        <SheetHeader className="shrink-0 border-b border-border p-4">
          <SheetTitle render={<Logo />} />
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          <nav className="flex flex-col p-2" aria-label="Mobile">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={lp(item.href)}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-base font-medium text-foreground transition-colors hover:bg-secondary"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <Separator />

          <div className="flex flex-col p-2">
            <Link
              href={lp("/account")}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-md px-3 py-2.5 text-base font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <User className="size-5" />
              {dict.common.account}
            </Link>
            <Link
              href={lp("/track-order")}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-md px-3 py-2.5 text-base font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <PackageSearch className="size-5" />
              {dict.common.trackOrder}
            </Link>
            <Link
              href={lp("/support")}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2.5 text-base font-medium text-foreground transition-colors hover:bg-secondary"
            >
              {dict.nav.support}
            </Link>
            <Link
              href={lp("/about")}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2.5 text-base font-medium text-foreground transition-colors hover:bg-secondary"
            >
              {dict.footer.about}
            </Link>
            <Link
              href={lp("/contact")}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2.5 text-base font-medium text-foreground transition-colors hover:bg-secondary"
            >
              {dict.footer.contact}
            </Link>
            <Link
              href={lp("/faq")}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2.5 text-base font-medium text-foreground transition-colors hover:bg-secondary"
            >
              {dict.footer.faq}
            </Link>
          </div>
        </div>

        <Separator className="shrink-0" />

        <div className="flex shrink-0 items-center justify-between p-4">
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
      </SheetContent>
    </Sheet>
  )
}
