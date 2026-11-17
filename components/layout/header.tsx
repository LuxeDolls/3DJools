"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ShoppingBag, User, PackageSearch, Search, Home, LayoutGrid } from "lucide-react"
import { useI18n, useLocalizedPath } from "@/components/i18n-provider"
import { useCart } from "@/components/cart/cart-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Logo } from "./logo"
import { LocaleSwitcher } from "./locale-switcher"
import { ThemeToggle } from "./theme-toggle"
import { MobileNav } from "./mobile-nav"
import { getNavItems } from "./nav-items"
import { useSearch } from "./search-provider"
import { cn } from "@/lib/utils"

const iconButton =
  "relative flex size-10 items-center justify-center rounded-full text-foreground/80 transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

export function Header() {
  const { dict } = useI18n()
  const lp = useLocalizedPath()
  const pathname = usePathname()
  const { count, openCart } = useCart()
  const { openSearch } = useSearch()
  const navItems = getNavItems(dict)

  return (
    <header className="sticky top-0 z-40 px-2 pt-2 sm:px-4 sm:pt-3">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 rounded-full border border-border bg-card/85 pr-1.5 pl-2 shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-card/70 sm:h-16 sm:gap-3 sm:pr-2 sm:pl-3">
        <div className="xl:hidden">
          <MobileNav navItems={navItems} />
        </div>

        <Link href={lp("/")} className="shrink-0 rounded-full" aria-label={dict.brandName}>
          <Logo markClassName="size-8 sm:size-9" className="text-base sm:text-lg" />
        </Link>

        <nav aria-label="Primary" className="mx-auto hidden items-center gap-0.5 xl:flex">
          {navItems.map((item) => {
            const target = lp(item.href)
            const active = pathname === target
            const isDeals = item.href === "/deals"
            return (
              <Link
                key={item.href}
                href={target}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-full px-3 py-2 text-[13px] font-semibold whitespace-nowrap transition-colors",
                  active
                    ? "bg-foreground text-background"
                    : isDeals
                      ? "bg-signal text-signal-foreground hover:brightness-95"
                      : "text-foreground/75 hover:bg-secondary hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center gap-0.5 xl:ml-0">
          <button
            type="button"
            onClick={openSearch}
            className="hidden h-10 items-center gap-2 rounded-full border border-border bg-background px-3.5 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground md:flex xl:w-10 xl:justify-center xl:px-0 2xl:w-auto 2xl:justify-start 2xl:px-3.5"
            aria-label={dict.common.search}
          >
            <Search className="size-4 shrink-0" aria-hidden="true" />
            <span className="xl:hidden 2xl:inline">{dict.common.search}</span>
            <kbd className="rounded-md bg-secondary px-1.5 font-mono text-[10px] xl:hidden 2xl:inline">
              /
            </kbd>
          </button>

          <div className="hidden items-center lg:flex xl:hidden 2xl:flex">
            <LocaleSwitcher />
          </div>
          <div className="lg:hidden xl:block 2xl:hidden">
            <LocaleSwitcher compact />
          </div>
          <div className="hidden md:block">
            <ThemeToggle />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger className={cn(iconButton, "hidden md:flex")} aria-label={dict.common.account}>
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
            className="relative flex h-10 items-center gap-2 rounded-full bg-primary px-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:px-4"
            aria-label={`${dict.common.cart} (${count})`}
          >
            <ShoppingBag className="size-4.5" aria-hidden="true" />
            <span className="hidden sm:inline xl:hidden 2xl:inline">{dict.common.cart}</span>
            <span
              className={cn(
                "flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold tabular-nums",
                count > 0 ? "bg-signal text-signal-foreground" : "bg-primary-foreground/20",
              )}
            >
              {count}
            </span>
          </button>
        </div>
      </div>
    </header>
  )
}

export function MobileCategoryStrip() {
  const { dict } = useI18n()
  const lp = useLocalizedPath()
  const pathname = usePathname()
  const navItems = getNavItems(dict)

  return (
    <nav aria-label="Categories" className="xl:hidden">
      <div className="no-scrollbar mx-auto flex max-w-7xl items-center gap-1.5 overflow-x-auto px-3 pt-2.5 pb-1 sm:px-4">
        {navItems.map((item) => {
          const target = lp(item.href)
          const isActive = pathname === target
          const isDeals = item.href === "/deals"
          return (
            <Link
              key={item.href}
              href={target}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                isActive
                  ? "bg-foreground text-background"
                  : isDeals
                    ? "bg-signal text-signal-foreground"
                    : "border border-border bg-card text-foreground/80 hover:border-primary hover:text-foreground",
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

export function MobileTabBar() {
  const { dict } = useI18n()
  const lp = useLocalizedPath()
  const pathname = usePathname()
  const { count, openCart } = useCart()
  const { openSearch } = useSearch()

  const homeHref = lp("/")
  const catalogHref = lp("/catalog")
  const accountHref = lp("/account")

  const item =
    "flex flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl py-1.5 text-[10px] font-semibold transition-colors"
  const idle = "text-muted-foreground hover:text-foreground"
  const active = "bg-primary/12 text-primary"

  return (
    <nav
      aria-label="Shortcuts"
      className="mobile-tabbar fixed inset-x-2 bottom-2 z-40 md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-stretch gap-1 rounded-3xl border border-border bg-card/90 p-1.5 shadow-lg backdrop-blur-xl supports-[backdrop-filter]:bg-card/75">
        <Link href={homeHref} className={cn(item, pathname === homeHref ? active : idle)}>
          <Home className="size-5" aria-hidden="true" />
          {dict.brandName}
        </Link>
        <Link
          href={catalogHref}
          className={cn(item, pathname.startsWith(catalogHref) ? active : idle)}
        >
          <LayoutGrid className="size-5" aria-hidden="true" />
          {dict.nav.catalog}
        </Link>
        <button type="button" onClick={openSearch} className={cn(item, idle)}>
          <Search className="size-5" aria-hidden="true" />
          {dict.common.search}
        </button>
        <Link href={accountHref} className={cn(item, pathname.startsWith(accountHref) ? active : idle)}>
          <User className="size-5" aria-hidden="true" />
          {dict.common.account}
        </Link>
        <button type="button" onClick={openCart} className={cn(item, idle, "relative")}>
          <span className="relative">
            <ShoppingBag className="size-5" aria-hidden="true" />
            {count > 0 && (
              <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-signal px-1 text-[9px] font-bold text-signal-foreground tabular-nums">
                {count}
              </span>
            )}
          </span>
          {dict.common.cart}
        </button>
      </div>
    </nav>
  )
}
