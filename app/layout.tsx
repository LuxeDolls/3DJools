import Script from 'next/script'
import { OptionalAnalytics } from '@/components/legal/optional-analytics'
import { OrganizationJsonLd } from '@/components/legal/organization-jsonld'
import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'DnD3D — 3D Printers, Filament & Accessories',
    template: '%s · DnD3D',
  },
  description:
    'Top-tier 3D printers, filament and accessories at honest prices. Free shipping on every order across the EU. Bambu Lab, Prusa, Creality, Anycubic, Elegoo and more.',
  generator: 'v0.app',
  metadataBase: new URL('https://www.3djools.com'),
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
    { media: '(prefers-color-scheme: dark)', color: '#16181d' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`bg-background ${inter.variable} ${spaceGrotesk.variable}`}
      suppressHydrationWarning
    >
      <head>
        <Script id="google-consent" strategy="beforeInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  functionality_storage: 'denied',
  personalization_storage: 'denied',
  security_storage: 'granted',
  wait_for_update: 500
});
try {
  var saved = JSON.parse(localStorage.getItem('voltika-cookie-consent') || 'null');
  if (saved && saved.value === 'all') {
    gtag('consent', 'update', {
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
  }
} catch (e) {}`}
        </Script>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-MKK9CLYCYB" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`gtag('js', new Date());
gtag('config', 'G-MKK9CLYCYB');`}
        </Script>
      </head>
      <body className="font-sans antialiased">
        <OrganizationJsonLd />
        {children}
        <OptionalAnalytics />
      </body>
    </html>
  )
}
