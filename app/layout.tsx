import { GoogleTag, GoogleTagNoScript } from '@/components/legal/google-tag'
import { OptionalAnalytics } from '@/components/legal/optional-analytics'
import { OrganizationJsonLd } from '@/components/legal/organization-jsonld'
import type { Metadata, Viewport } from 'next'
import { Bricolage_Grotesque, Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
})

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: '3DEureka — 3D Printers, Filament & Accessories',
    template: '%s · 3DEureka',
  },
  description:
    'Top-tier 3D printers, filament and accessories at honest prices. Free shipping on every order across the EU. Bambu Lab, Prusa, Creality, Anycubic, Elegoo and more.',
  generator: 'v0.app',
  metadataBase: new URL('https://3deureka.com'),
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/icon-48.png', sizes: '48x48', type: 'image/png' },
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
    { media: '(prefers-color-scheme: light)', color: '#f3f6fa' },
    { media: '(prefers-color-scheme: dark)', color: '#0f1629' },
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
      className={`bg-background ${geist.variable} ${bricolage.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        <GoogleTagNoScript />
        <GoogleTag />
        <OrganizationJsonLd />
        {children}
        <OptionalAnalytics />
      </body>
    </html>
  )
}
