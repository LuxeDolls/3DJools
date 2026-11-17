"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { SearchDialog } from "./search-dialog"

const SearchContext = createContext<{ openSearch: () => void } | null>(null)

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const openSearch = useCallback(() => setOpen(true), [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null
      const typing =
        target?.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target?.tagName ?? "")
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(true)
      } else if (e.key === "/" && !typing) {
        e.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const value = useMemo(() => ({ openSearch }), [openSearch])

  return (
    <SearchContext.Provider value={value}>
      {children}
      <SearchDialog open={open} onOpenChange={setOpen} />
    </SearchContext.Provider>
  )
}

export function useSearch() {
  const ctx = useContext(SearchContext)
  if (!ctx) throw new Error("useSearch must be used inside SearchProvider")
  return ctx
}
