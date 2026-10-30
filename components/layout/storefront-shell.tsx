"use client"

import type { Locale } from "@/lib/i18n/config"
import type { Dictionary } from "@/lib/i18n/dictionaries/en"
import { ThemeProvider } from "@/components/theme-provider"
import { I18nProvider } from "@/components/i18n-provider"
import { CartProvider } from "@/components/cart/cart-provider"
import { CartDrawer } from "@/components/cart/cart-drawer"
import { ChatWidget } from "@/components/chat/chat-widget"
import { Header, MobileCategoryStrip } from "@/components/layout/header"
import { SaleBanner } from "@/components/home/sale-banner"
import { Toaster } from "@/components/ui/sonner"
import { CookieConsent } from "@/components/legal/cookie-consent"

export function StorefrontShell({
  locale,
  dict,
  children,
}: {
  locale: Locale
  dict: Dictionary
  children: React.ReactNode
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <I18nProvider locale={locale} dict={dict}>
        <CartProvider>
          <SaleBanner locale={locale} dict={dict} />
          <Header />
          <MobileCategoryStrip />
          <main className="min-h-[60vh]">{children}</main>
          <CartDrawer />
          <ChatWidget />
          <CookieConsent />
          <Toaster position="top-center" />
        </CartProvider>
      </I18nProvider>
    </ThemeProvider>
  )
}
