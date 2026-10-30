"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
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
import { SearchBar } from "./search-bar"
import { LocaleSwitcher } from "./locale-switcher"
import { ThemeToggle } from "./theme-toggle"
import { MobileNav } from "./mobile-nav"
import { getNavItems } from "./nav-items"
import { cn } from "@/lib/utils"

export function Header() {
  const { dict } = useI18n()
  const lp = useLocalizedPath()
  const { count, openCart } = useCart()
  const navItems = getNavItems(dict)

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] backdrop-blur">
      {/* Announcement strip */}
      <div className="border-b border-border bg-secondary text-secondary-foreground">
        <div className="mx-auto flex h-8 max-w-7xl items-center justify-between gap-2 px-3 text-[11px] sm:h-9 sm:gap-4 sm:px-4 sm:text-xs">
          <p className="flex min-w-0 items-center gap-1.5 truncate font-medium">
            <Truck className="size-3.5 shrink-0 text-primary" />
            <span className="truncate">{dict.home.heroEyebrow}</span>
          </p>
          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
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
            <div className="flex items-center gap-0.5 sm:gap-1">
              <div className="sm:hidden">
                <LocaleSwitcher compact />
              </div>
              <div className="hidden sm:flex sm:items-center sm:gap-1">
                <LocaleSwitcher />
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="mx-auto flex h-13 max-w-7xl items-center gap-2.5 px-3 sm:h-16 sm:gap-4 sm:px-4">
        <div className="flex items-center gap-1.5 lg:hidden">
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
              className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
      <div className="border-t border-border px-3 py-1.5 md:hidden">
        <SearchBar />
      </div>

      {/* Desktop nav */}
      <nav className="hidden border-t border-border lg:block" aria-label="Primary">
        <div className="mx-auto flex max-w-7xl items-center gap-1 px-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={lp(item.href)}
              className="relative px-3 py-2.5 text-sm font-semibold tracking-tight text-foreground/75 transition-colors hover:text-foreground after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:bg-primary after:transition-transform hover:after:scale-x-100 data-[deal=true]:text-primary"
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

export function MobileCategoryStrip() {
  const { dict } = useI18n()
  const lp = useLocalizedPath()
  const pathname = usePathname()
  const navItems = getNavItems(dict)

  return (
    <nav
      aria-label="Categories"
      className="border-b border-border bg-card/80 lg:hidden"
    >
      <div className="mx-auto flex max-w-7xl items-center gap-1.5 overflow-x-auto px-3 py-2 [scrollbar-width:none] sm:px-4">
        {navItems.map((item) => {
          const target = lp(item.href)
          const isActive = pathname === target
          const isDeals = item.href === "/deals"
          return (
            <Link
              key={item.href}
              href={target}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1 text-xs font-semibold shadow-[0_10px_25px_-5px_rgba(0,0,0,0.6)] transition-all duration-200 hover:-translate-y-0.5",
                isActive
                  ? "border-primary bg-primary text-primary-foreground"
                  : isDeals
                    ? "border-primary/40 bg-primary/10 text-primary hover:bg-primary/15"
                    : "border-border bg-background text-foreground/85 hover:border-primary/40 hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
