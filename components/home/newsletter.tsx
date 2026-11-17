"use client"

import { useState } from "react"
import { ArrowRight, Check } from "lucide-react"
import { toast } from "sonner"
import { useI18n } from "@/components/i18n-provider"

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
    <section className="mx-auto max-w-7xl px-4 py-10 sm:py-16">
      <div className="relative overflow-hidden rounded-[2rem] bg-primary p-6 text-primary-foreground sm:rounded-[2.5rem] sm:p-10 lg:p-14">
        <div className="bg-dots pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
        <div className="relative grid gap-6 lg:grid-cols-2 lg:items-end lg:gap-12">
          <div className="flex flex-col gap-3">
            <h2 className="font-heading text-3xl leading-[0.95] font-extrabold text-balance sm:text-5xl">
              {dict.home.newsletterTitle}
            </h2>
            <p className="max-w-md text-pretty text-sm leading-relaxed text-primary-foreground/80">
              {dict.home.newsletterText}
            </p>
          </div>
          <form
            onSubmit={submit}
            className="flex w-full items-center gap-1.5 overflow-hidden rounded-full bg-card p-1.5 text-card-foreground shadow-[var(--shadow-float-md)]"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={dict.home.newsletterPlaceholder}
              aria-label={dict.home.newsletterPlaceholder}
              className="no-float h-11 min-w-0 flex-1 rounded-full bg-transparent px-4 text-sm outline-none placeholder:text-muted-foreground sm:h-12"
            />
            <button
              type="submit"
              className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-signal px-4 text-sm font-bold text-signal-foreground transition-transform hover:scale-[1.03] sm:h-12 sm:px-6"
            >
              {done ? <Check className="size-4" aria-hidden="true" /> : null}
              <span className="hidden sm:inline">{dict.home.newsletterCta}</span>
              <ArrowRight className="size-4 sm:hidden" aria-hidden="true" />
              <span className="sr-only sm:hidden">{dict.home.newsletterCta}</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
