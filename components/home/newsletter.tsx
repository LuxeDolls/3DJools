"use client"

import { useState } from "react"
import { Mail, Check } from "lucide-react"
import { toast } from "sonner"
import { useI18n } from "@/components/i18n-provider"
import { Button } from "@/components/ui/button"

export function Newsletter() {
  const { dict } = useI18n()
  const [email, setEmail] = useState("")
  const [done, setDone] = useState(false)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    // Step 1: front-end only. Wiring to an email provider comes after domain setup.
    setDone(true)
    setEmail("")
    toast.success(dict.home.newsletterCta, { description: dict.home.newsletterText })
  }

  return (
    <section className="relative z-10 border-y border-border bg-secondary shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)]">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-14 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary shadow-[0_10px_25px_-5px_rgba(0,0,0,0.6)]">
          <Mail className="size-6" />
        </div>
        <div>
          <h2 className="text-balance font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {dict.home.newsletterTitle}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-pretty text-sm text-muted-foreground">
            {dict.home.newsletterText}
          </p>
        </div>
        <form onSubmit={submit} className="flex w-full max-w-md flex-col gap-2 sm:flex-row">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={dict.home.newsletterPlaceholder}
            aria-label={dict.home.newsletterPlaceholder}
            className="h-11 flex-1 rounded-md border border-input bg-background px-4 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
          />
          <Button type="submit" size="lg" className="shrink-0">
            {done ? <Check className="size-4" /> : null}
            {dict.home.newsletterCta}
          </Button>
        </form>
      </div>
    </section>
  )
}
