"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import type { Locale } from "@/lib/i18n/config"
import { trackingPageCopy } from "@/lib/shipping/tracking"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function TrackingLookup({ locale }: { locale: Locale }) {
  const router = useRouter()
  const copy = trackingPageCopy(locale)
  const [code, setCode] = useState("")

  function submit(event: FormEvent) {
    event.preventDefault()
    const clean = code.trim().toUpperCase().replace(/\s+/g, "")
    if (!clean) return
    router.push(`/${locale}/track/${encodeURIComponent(clean)}`)
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="tracking-number">{copy.numberLabel}</Label>
        <Input
          id="tracking-number"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder={copy.placeholder}
          autoComplete="off"
          spellCheck={false}
        />
      </div>
      <Button type="submit" className="w-full">
        <Search className="size-4" />
        {copy.submit}
      </Button>
    </form>
  )
}
