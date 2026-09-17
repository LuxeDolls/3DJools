"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useI18n, useLocalizedPath } from "@/components/i18n-provider"
import { getInstallmentDict } from "@/lib/i18n/installments"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function ApplicationLookup() {
  const { locale } = useI18n()
  const t = getInstallmentDict(locale)
  const lp = useLocalizedPath()
  const router = useRouter()
  const [ref, setRef] = useState("")

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const clean = ref.trim().toUpperCase()
        if (clean) router.push(lp(`/installments/${clean}`))
      }}
      className="flex gap-2"
    >
      <Input
        value={ref}
        onChange={(e) => setRef(e.target.value)}
        placeholder="INST-XXXXXX"
        className="font-mono uppercase"
      />
      <Button type="submit">{t.lookupCta}</Button>
    </form>
  )
}
