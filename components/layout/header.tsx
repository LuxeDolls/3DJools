"use client"

import Link from "next/link"
import { ShoppingCart, User, Truck, PackageSearch } from "lucide-react"
import { useI18n, useLocalizedPath } from "@/components/i18n-provider"
import { useCart } from "@/components/cart/cart-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Logo } from "./logo"
import { MaintenanceBanner } from "./maintenance-banner"
import { SearchBar } from "./search-bar"
import { LocaleSwitcher } from "./locale-switcher"
import { ThemeToggle } from "./theme-toggle"
import { MobileNav } from "./mobile-nav"
import { getNavItems } from "./nav-items"

export function Header() {
  const { dict } = useI18n()
  const lp = useLocalizedPath()
  const { count, openCart } = useCart()
  const navItems = getNavItems(dict)

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <MaintenanceBanner label={dict.maintenance.label} text={dict.maintenance.text} />
      {/* Announcement strip */}
      <div className="border-b border-border bg-secondary text-secondary-foreground">
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-between gap-4 px-4 text-xs">
          <p className="flex items-center gap-1.5 font-medium">
            <Truck className="size-3.5 text-primary" />
            {dict.home.heroEyebrow}
          </p>
          <div className="hidden items-center gap-4 sm:flex">
            <nav aria-label="Utility" className="hidden items-center gap-4 md:flex">
              <Link href={lp("/about")} className="whitespace-nowrap transition-colors hover:text-primary">
                {dict.footer.about}
              </Link>
              <Link href={lp("/contact")} className="whitespace-nowrap transition-colors hover:text-primary">
                {dict.footer.contact}
              </Link>
              <Link href={lp("/faq")} className="whitespace-nowrap transition-colors hover:text-primary">
                {dict.footer.faq}
              </Link>
            </nav>
            <div className="flex items-center gap-1">
              <LocaleSwitcher />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        <div className="flex items-center gap-2 lg:hidden">
          <MobileNav navItems={navItems} />
        </div>

        <Link href={lp("/")} className="shrink-0" aria-label={dict.brandName}>
          <Logo />
        </Link>

        <div className="hidden flex-1 md:block">
          <SearchBar className="mx-auto max-w-xl" />
        </div>

        <div className="ml-auto flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger
              className="hidden size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex"
              aria-label={dict.common.account}
            >
              <User className="size-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem render={<Link href={lp("/account")} />}>
                <User className="size-4" />
                {dict.common.account}
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href={lp("/track-order")} />}>
                <PackageSearch className="size-4" />
                {dict.common.trackOrder}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <button
            type="button"
            onClick={openCart}
            className="relative flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`${dict.common.cart} (${count})`}
          >
            <ShoppingCart className="size-5" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex size-4.5 min-w-4.5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Search on mobile */}
      <div className="border-t border-border px-4 py-2 md:hidden">
        <SearchBar />
      </div>

      {/* Desktop nav */}
      <nav className="hidden border-t border-border lg:block" aria-label="Primary">
        <div className="mx-auto flex max-w-7xl items-center gap-1 px-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={lp(item.href)}
              className="relative px-3 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:text-primary data-[deal=true]:text-primary"
              data-deal={item.href === "/deals"}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  )
}
