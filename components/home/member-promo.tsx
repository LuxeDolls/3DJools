"use client"

import Link from "next/link"
import { BadgePercent, Check } from "lucide-react"
import { useI18n, useLocalizedPath } from "@/components/i18n-provider"
import { useSession } from "@/lib/auth-client"

export function MemberPromo() {
  const { dict } = useI18n()
  const lp = useLocalizedPath()
  const { data: session, isPending } = useSession()
  const isMember = Boolean(session?.user)

  return (
    <section aria-labelledby="member-promo-title" className="mx-auto max-w-7xl px-4 py-6">
      <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-primary/10 px-6 py-8 sm:px-10 sm:py-9">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-10 hidden select-none font-heading text-[9rem] font-black leading-none text-primary/10 sm:block"
        >
          {dict.promo.memberBadge}
        </div>

        {isMember ? (
          <div className="relative flex flex-col gap-2">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
              <Check className="size-3.5" />
              {dict.promo.memberBadge}
            </span>
            <h2 id="member-promo-title" className="font-heading text-2xl font-bold text-balance text-foreground">
              {dict.promo.memberActiveTitle}
            </h2>
            <p className="max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground">
              {dict.promo.memberActiveText}
            </p>
          </div>
        ) : (
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2">
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                <BadgePercent className="size-3.5" />
                {dict.promo.memberEyebrow}
              </span>
              <h2 id="member-promo-title" className="font-heading text-2xl font-bold text-balance text-foreground sm:text-3xl">
                {dict.promo.memberTitle}
              </h2>
              <p className="max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground">
                {dict.promo.memberText}
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:items-end">
              <Link
                href={lp("/sign-up")}
                className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                aria-disabled={isPending}
              >
                {dict.promo.memberCtaGuest}
              </Link>
              <Link
                href={lp("/sign-in")}
                className="text-center text-xs font-medium text-primary underline-offset-4 hover:underline"
              >
                {dict.promo.memberCtaSignIn}
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
