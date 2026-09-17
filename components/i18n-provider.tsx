"use client"

import { createContext, useContext } from "react"
import type { Locale } from "@/lib/i18n/config"
import type { Dictionary } from "@/lib/i18n/dictionaries/en"
import { localizedPath } from "@/lib/i18n/paths"

interface I18nContextValue {
  locale: Locale
  dict: Dictionary
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({
  locale,
  dict,
  children,
}: {
  locale: Locale
  dict: Dictionary
  children: React.ReactNode
}) {
  return <I18nContext.Provider value={{ locale, dict }}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error("useI18n must be used within I18nProvider")
  return ctx
}

/** Convenience hook returning a localized-path builder bound to the current locale. */
export function useLocalizedPath() {
  const { locale } = useI18n()
  return (path?: string) => localizedPath(locale, path)
}
