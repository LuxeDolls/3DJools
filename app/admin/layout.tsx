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
      <header className="sticky top-0 z-30 border-b border-border bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-3 py-3 sm:px-6 lg:px-8">
          <Link href="/admin" className="truncate font-sans text-sm font-semibold">
            3DJools · Operations
          </Link>
          <form action={adminLogout} className="shrink-0">
            <Button variant="ghost" size="sm" type="submit" className="min-h-11 md:min-h-8">
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </form>
        </div>
        <div className="mx-auto hidden max-w-6xl px-4 sm:px-6 lg:block lg:px-8">
          <AdminNav placement="desktop" />
        </div>
      </header>
      <AdminNav placement="mobile" />
      <main className="mx-auto max-w-6xl px-3 py-4 pb-[calc(9.5rem+env(safe-area-inset-bottom))] sm:px-6 lg:px-8 lg:py-8 lg:pb-8 max-lg:[&_input]:text-base max-lg:[&_select]:text-base max-lg:[&_textarea]:text-base">
        {children}
      </main>
      <Toaster position="top-center" />
    </div>
  )
}
