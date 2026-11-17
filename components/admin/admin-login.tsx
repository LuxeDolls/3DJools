"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { adminLogin } from "@/lib/actions/admin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/layout/logo"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export function AdminLogin() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await adminLogin(password)
      if (!res.ok) {
        toast.error(res.error || "Login failed")
        return
      }
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-lg border border-border bg-card p-8">
        <div className="mb-5 flex justify-center">
          <Logo />
        </div>
        <h1 className="text-center font-sans text-xl font-semibold">Admin access</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">3DEureka operations console</p>
        <div className="mt-6 grid gap-1.5">
          <Label htmlFor="admin-password">Password</Label>
          <Input
            id="admin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
        </div>
        <Button type="submit" className="mt-4 w-full" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
        </Button>
      </form>
    </div>
  )
}
