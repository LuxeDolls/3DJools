"use client"

import { Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useI18n, useLocalizedPath } from "@/components/i18n-provider"
import { cn } from "@/lib/utils"

export function SearchBar({ className, onSubmitted }: { className?: string; onSubmitted?: () => void }) {
  const { dict } = useI18n()
  const lp = useLocalizedPath()
  const router = useRouter()
  const [query, setQuery] = useState("")

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    router.push(lp(`/search?q=${encodeURIComponent(q)}`))
    onSubmitted?.()
  }

  return (
    <form onSubmit={submit} className={cn("relative w-full", className)} role="search">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={dict.common.searchPlaceholder}
        aria-label={dict.common.search}
        className="h-9 w-full rounded-lg border border-input bg-secondary/40 pl-9 pr-3 text-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-ring/40 sm:h-10 sm:rounded-md sm:text-sm"
      />
    </form>
  )
}
