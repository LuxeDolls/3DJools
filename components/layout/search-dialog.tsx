"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowUpRight, CornerDownLeft, Search } from "lucide-react"
import { useI18n, useLocalizedPath } from "@/components/i18n-provider"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { getNavItems } from "./nav-items"
import { cn } from "@/lib/utils"

const QUICK_TERMS = ["Bambu Lab", "Prusa", "PLA", "Resin", "xTool", "AMS"]

export function SearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { dict } = useI18n()
  const lp = useLocalizedPath()
  const router = useRouter()
  const [query, setQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const navItems = getNavItems(dict).filter((i) => i.href.startsWith("/catalog/"))

  useEffect(() => {
    if (open) {
      const id = window.setTimeout(() => inputRef.current?.focus(), 40)
      return () => window.clearTimeout(id)
    }
  }, [open])

  function go(term: string) {
    const q = term.trim()
    if (!q) return
    router.push(lp(`/search?q=${encodeURIComponent(q)}`))
    onOpenChange(false)
    setQuery("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="top-4 max-w-[calc(100%-1.5rem)] translate-y-0 gap-0 overflow-hidden rounded-3xl border-border p-0 sm:top-[12vh] sm:max-w-xl"
      >
        <DialogTitle className="sr-only">{dict.common.search}</DialogTitle>
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault()
            go(query)
          }}
          className="flex items-center gap-3 border-b border-border px-4 sm:px-5"
        >
          <Search className="size-5 shrink-0 text-primary" aria-hidden="true" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={dict.common.searchPlaceholder}
            aria-label={dict.common.search}
            className="h-14 w-full bg-transparent text-base outline-none placeholder:text-muted-foreground sm:h-16 sm:text-lg"
          />
          <kbd className="hidden shrink-0 items-center gap-1 rounded-md border border-border bg-secondary px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground sm:inline-flex">
            <CornerDownLeft className="size-3" aria-hidden="true" />
            Enter
          </kbd>
        </form>

        <div className="flex flex-col gap-5 p-4 sm:p-5">
          <div className="flex flex-col gap-2">
            <p className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
              {dict.common.search}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_TERMS.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => go(term)}
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
              {dict.nav.catalog}
            </p>
            <ul className="grid grid-cols-2 gap-1.5">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={lp(item.href)}
                    onClick={() => onOpenChange(false)}
                    className={cn(
                      "group flex items-center justify-between rounded-xl bg-secondary px-3 py-2.5 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground",
                    )}
                  >
                    {item.label}
                    <ArrowUpRight
                      className="size-4 opacity-50 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
