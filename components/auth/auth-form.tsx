"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { RefreshCw } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { refreshSignupCaptcha } from "@/lib/actions/signup-captcha"
import { useI18n, useLocalizedPath } from "@/components/i18n-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type CaptchaChallenge = { token: string; svg: string }

export function AuthForm({
  mode,
  errorCode,
  captcha,
}: {
  mode: "sign-in" | "sign-up"
  errorCode?: string
  captcha?: CaptchaChallenge
}) {
  const { dict, locale } = useI18n()
  const lp = useLocalizedPath()
  const router = useRouter()
  const t = dict.auth

  const [error, setError] = useState<string | null>(errorCode ? t.genericError : null)
  const [loading, setLoading] = useState(false)
  const [challenge, setChallenge] = useState(captcha ?? null)
  const [captchaAnswer, setCaptchaAnswer] = useState("")

  const isSignUp = mode === "sign-up"
  const social = {
    en: { google: "Continue with Google", facebook: "Continue with Facebook", or: "or" },
    de: { google: "Weiter mit Google", facebook: "Weiter mit Facebook", or: "oder" },
    fr: { google: "Continuer avec Google", facebook: "Continuer avec Facebook", or: "ou" },
    nl: { google: "Doorgaan met Google", facebook: "Doorgaan met Facebook", or: "of" },
    it: { google: "Continua con Google", facebook: "Continua con Facebook", or: "oppure" },
    es: { google: "Continuar con Google", facebook: "Continuar con Facebook", or: "o" },
  }[locale]

  async function refreshCaptcha() {
    const next = await refreshSignupCaptcha()
    setChallenge(next)
    setCaptchaAnswer("")
  }

  async function signInWith(provider: "google" | "facebook") {
    setError(null)
    setLoading(true)
    const { error: signInError } = await authClient.signIn.social({
      provider,
      callbackURL: `${window.location.origin}${lp("/account")}`,
      errorCallbackURL: `${window.location.origin}${lp("/sign-in")}`,
    })
    if (signInError) {
      setLoading(false)
      setError(t.genericError)
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    const form = new FormData(event.currentTarget)
    const email = String(form.get("email") ?? "").trim()
    const password = String(form.get("password") ?? "")
    const name = String(form.get("name") ?? "").trim()

    if (isSignUp && (!challenge || !captchaAnswer.trim())) {
      setError(dict.contact.captchaError)
      return
    }

    setLoading(true)
    const result = isSignUp
      ? await authClient.signUp.email({
          name,
          email,
          password,
          callbackURL: `${window.location.origin}${lp("/account")}`,
          fetchOptions: {
            headers: {
              "x-captcha-token": challenge?.token ?? "",
              "x-captcha-answer": captchaAnswer,
            },
          },
        })
      : await authClient.signIn.email({
          email,
          password,
          callbackURL: `${window.location.origin}${lp("/account")}`,
        })

    if (result.error) {
      const captchaFailed = result.error.status === 403 || result.error.code === "INVALID_CAPTCHA"
      setLoading(false)
      setError(captchaFailed ? dict.contact.captchaError : t.genericError)
      if (captchaFailed) await refreshCaptcha()
      return
    }

    router.push(lp("/account"))
    router.refresh()
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

      <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        {social.or}
        <span className="h-px flex-1 bg-border" />
      </div>

      <form className="flex flex-col gap-4" onSubmit={onSubmit}>
        {isSignUp && (
          <div className="space-y-1.5">
            <Label htmlFor="name">{t.name}</Label>
            <Input id="name" name="name" required autoComplete="name" />
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="email">{t.email}</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">{t.password}</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete={isSignUp ? "new-password" : "current-password"}
          />
          {isSignUp && <p className="text-xs text-muted-foreground">{t.passwordHint}</p>}
        </div>

        {isSignUp && challenge && (
          <div className="space-y-1.5">
            <Label htmlFor="captcha">{dict.contact.captchaLabel}</Label>
            <div className="flex flex-wrap items-center gap-3">
              <div
                className="overflow-hidden rounded-md border border-border bg-secondary"
                dangerouslySetInnerHTML={{ __html: challenge.svg }}
              />
              <Button type="button" variant="outline" onClick={refreshCaptcha}>
                <RefreshCw className="size-4" />
                {dict.contact.captchaRefresh}
              </Button>
            </div>
            <Input
              id="captcha"
              name="captcha"
              required
              autoComplete="off"
              spellCheck={false}
              maxLength={8}
              value={captchaAnswer}
              onChange={(event) => setCaptchaAnswer(event.target.value)}
              className="max-w-40 uppercase"
            />
          </div>
        )}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? t.pleaseWait : isSignUp ? t.signUpCta : t.signInCta}
        </Button>
      </form>

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
