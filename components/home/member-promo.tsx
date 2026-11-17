"use client"

import Link from "next/link"
import { ArrowRight, Check } from "lucide-react"
import { useI18n, useLocalizedPath } from "@/components/i18n-provider"
import { useSession } from "@/lib/auth-client"

export function MemberPromo() {
  const { dict } = useI18n()
  const lp = useLocalizedPath()
  const { data: session, isPending } = useSession()
  const isMember = Boolean(session?.user)

  return (
    <section aria-labelledby="member-promo-title" className="mx-auto max-w-7xl px-4 py-10 sm:py-16">
      <div className="relative grid overflow-hidden rounded-[2rem] bg-signal text-signal-foreground sm:rounded-[2.5rem] md:grid-cols-12">
        <div className="bg-dots pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />

        <div className="relative flex items-center justify-center border-b border-signal-foreground/15 p-6 md:col-span-5 md:border-r md:border-b-0 md:p-10">
          <p className="font-heading text-[6.5rem] leading-[0.8] font-extrabold tracking-tighter sm:text-[9rem] lg:text-[11rem]" aria-hidden="true">
            5<span className="align-top text-[0.45em]">%</span>
          </p>
        </div>

        <div className="relative flex flex-col justify-center gap-3 p-6 md:col-span-7 md:p-10 lg:p-12">
          {isMember ? (
            <>
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-signal-foreground px-3 py-1 text-xs font-semibold text-signal">
                <Check className="size-3.5" aria-hidden="true" />
                {dict.promo.memberBadge}
              </span>
              <h2 id="member-promo-title" className="font-heading text-2xl leading-tight font-bold text-balance sm:text-4xl">
                {dict.promo.memberActiveTitle}
              </h2>
              <p className="max-w-xl text-pretty text-sm leading-relaxed text-signal-foreground/80">
                {dict.promo.memberActiveText}
              </p>
            </>
          ) : (
            <>
              <p className="font-mono text-[11px] tracking-wider uppercase">{dict.promo.memberEyebrow}</p>
              <h2 id="member-promo-title" className="font-heading text-2xl leading-tight font-bold text-balance sm:text-4xl">
                {dict.promo.memberTitle}
              </h2>
              <p className="max-w-xl text-pretty text-sm leading-relaxed text-signal-foreground/80">
                {dict.promo.memberText}
              </p>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                <Link
                  href={lp("/sign-up")}
                  aria-disabled={isPending}
                  className="group inline-flex h-12 items-center justify-between gap-3 rounded-full bg-signal-foreground pr-1.5 pl-5 text-sm font-semibold text-signal transition-transform hover:scale-[1.02] sm:justify-start"
                >
                  {dict.promo.memberCtaGuest}
                  <span className="flex size-9 items-center justify-center rounded-full bg-signal text-signal-foreground">
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </Link>
                <Link
                  href={lp("/sign-in")}
                  className="text-center text-sm font-semibold underline underline-offset-4 hover:no-underline"
                >
                  {dict.promo.memberCtaSignIn}
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
