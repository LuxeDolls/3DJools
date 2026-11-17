"use client"

import type { Locale } from "@/lib/i18n/config"
import type { Dictionary } from "@/lib/i18n/dictionaries/en"
import { ThemeProvider } from "@/components/theme-provider"
import { I18nProvider } from "@/components/i18n-provider"
import { CartProvider } from "@/components/cart/cart-provider"
import { CartDrawer } from "@/components/cart/cart-drawer"
import { ChatWidget } from "@/components/chat/chat-widget"
import { Header, MobileCategoryStrip, MobileTabBar } from "@/components/layout/header"
import { SearchProvider } from "@/components/layout/search-provider"
import { GatewayNotice } from "@/components/layout/gateway-notice"
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
          <SearchProvider>
            <GatewayNotice locale={locale} dict={dict} />
            <SaleBanner locale={locale} dict={dict} />
            <Header />
            <MobileCategoryStrip />
            <main className="min-h-[60vh] pb-24 md:pb-0">{children}</main>
            <MobileTabBar />
            <CartDrawer />
            <ChatWidget />
            <CookieConsent />
            <Toaster position="top-center" />
          </SearchProvider>
        </CartProvider>
      </I18nProvider>
    </ThemeProvider>
  )
}
