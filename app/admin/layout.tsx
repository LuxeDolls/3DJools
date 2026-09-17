import type React from "react"
import Link from "next/link"
import { isAdmin } from "@/lib/admin-auth"
import { adminLogout } from "@/lib/actions/admin"
import { AdminLogin } from "@/components/admin/admin-login"
import { AdminNav } from "@/components/admin/admin-nav"
import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/sonner"
import { LogOut } from "lucide-react"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authed = await isAdmin()
  if (!authed) {
    return (
      <>
        <AdminLogin />
        <Toaster position="top-center" />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/admin" className="font-sans text-sm font-semibold">
            3DJools · Operations
          </Link>
          <form action={adminLogout}>
            <Button variant="ghost" size="sm" type="submit">
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </form>
        </div>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <AdminNav />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      <Toaster position="top-center" />
    </div>
  )
}
