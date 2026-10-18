"use client"

import { useState } from "react"
import { CheckCircle2, RefreshCw, Send } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { refreshContactCaptcha, submitContactMessage } from "@/lib/actions/contact"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export function ContactForm({ captcha }: { captcha: { token: string; svg: string } }) {
  const { dict, locale } = useI18n()
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [challenge, setChallenge] = useState(captcha)

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const form = new FormData(e.currentTarget)
    try {
      const result = await submitContactMessage({
        name: String(form.get("name") ?? ""),
        email: String(form.get("email") ?? ""),
        subject: String(form.get("subject") ?? ""),
        orderRef: String(form.get("orderRef") ?? ""),
        message: String(form.get("message") ?? ""),
        locale,
        captchaToken: challenge.token,
        captchaAnswer: String(form.get("captcha") ?? ""),
      })
      if (result.ok) {
        setSent(true)
      } else {
        setChallenge(await refreshContactCaptcha())
        setError(result.error === "captcha" ? dict.contact.captchaError : dict.contact.errorText)
      }
    } catch {
      setError(dict.contact.errorText)
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 p-8 text-center">
        <CheckCircle2 className="size-10 text-primary" />
        <h2 className="font-heading text-lg font-bold text-foreground">{dict.contact.sentTitle}</h2>
        <p className="max-w-sm text-sm text-muted-foreground">{dict.contact.sentText}</p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">{dict.contact.name}</Label>
          <Input id="name" name="name" required autoComplete="name" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">{dict.contact.email}</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="orderRef">{dict.contact.orderRef}</Label>
          <Input id="orderRef" name="orderRef" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="subject">{dict.contact.subject}</Label>
          <Input id="subject" name="subject" required />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="message">{dict.contact.message}</Label>
        <Textarea id="message" name="message" required rows={6} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="captcha">{dict.contact.captchaLabel}</Label>
        <div className="flex flex-wrap items-center gap-3">
          <div
            className="overflow-hidden rounded-md border border-border bg-secondary"
            dangerouslySetInnerHTML={{ __html: challenge.svg }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              setChallenge(await refreshContactCaptcha())
              setError(null)
            }}
          >
            <RefreshCw className="size-4" />
            {dict.contact.captchaRefresh}
          </Button>
        </div>
        <Input id="captcha" name="captcha" required autoComplete="off" spellCheck={false} maxLength={8} className="max-w-40 uppercase" />
      </div>
      <Button type="submit" size="lg" disabled={loading}>
        <Send className="size-4" />
        {dict.contact.send}
      </Button>
    </form>
  )
}
