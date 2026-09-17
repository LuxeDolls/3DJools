"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import type { Locale } from "@/lib/i18n/config"
import { localizedPath } from "@/lib/i18n/paths"

export function SignOutButton({ locale, label }: { locale: Locale; label: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSignOut() {
    setLoading(true)
    try {
      await authClient.signOut()
      router.push(localizedPath(locale, "/sign-in"))
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleSignOut} disabled={loading}>
      {label}
    </Button>
  )
}
