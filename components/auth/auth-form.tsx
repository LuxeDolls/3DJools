"use client"

import { useState } from "react"
import Link from "next/link"
import { authClient } from "@/lib/auth-client"
import { useI18n, useLocalizedPath } from "@/components/i18n-provider"
import { Button } from "@/components/ui/button"

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const { dict, locale } = useI18n()
  const lp = useLocalizedPath()
  const t = dict.auth

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const isSignUp = mode === "sign-up"
  const social = {
    en: { google: "Continue with Google", facebook: "Continue with Facebook", linkedin: "Continue with LinkedIn" },
    de: { google: "Weiter mit Google", facebook: "Weiter mit Facebook", linkedin: "Weiter mit LinkedIn" },
    fr: { google: "Continuer avec Google", facebook: "Continuer avec Facebook", linkedin: "Continuer avec LinkedIn" },
    nl: { google: "Doorgaan met Google", facebook: "Doorgaan met Facebook", linkedin: "Doorgaan met LinkedIn" },
    it: { google: "Continua con Google", facebook: "Continua con Facebook", linkedin: "Continua con LinkedIn" },
    es: { google: "Continuar con Google", facebook: "Continuar con Facebook", linkedin: "Continuar con LinkedIn" },
  }[locale]

  async function signInWith(provider: "google" | "facebook" | "linkedin") {
    setError(null)
    setLoading(true)
    const { error } = await authClient.signIn.social({ provider, callbackURL: lp("/account") })
    setLoading(false)
    if (error) setError(t.genericError)
  }

  return (
    <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
          {isSignUp ? t.signUpTitle : t.signInTitle}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{isSignUp ? t.signUpSubtitle : t.signInSubtitle}</p>
      </div>

      <div className="flex flex-col gap-2">
        {(
          [
            ["google", social.google, "/icons/google.svg"],
            ["facebook", social.facebook, "/icons/facebook.svg"],
            ["linkedin", social.linkedin, "/icons/linkedin.svg"],
          ] as const
        ).map(([provider, label, icon]) => (
          <Button
            key={provider}
            type="button"
            variant="outline"
            disabled={loading}
            className="relative w-full"
            onClick={() => signInWith(provider)}
          >
            <img src={icon} alt="" className="absolute left-3 size-4" />
            {label}
          </Button>
        ))}
      </div>

      {error && (
        <p className="mt-4 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {isSignUp ? t.haveAccount : t.noAccount}{" "}
        <Link
          href={isSignUp ? lp("/sign-in") : lp("/sign-up")}
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          {isSignUp ? t.signInCta : t.signUpCta}
        </Link>
      </p>
    </div>
  )
}
