import { OptionalAnalytics } from '@/components/legal/optional-analytics'
import { OrganizationJsonLd } from '@/components/legal/organization-jsonld'
import type { Metadata, Viewport } from 'next'
import { Outfit, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
})

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
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
  metadataBase: new URL('https://www.dnd3d.com'),
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
    { media: '(prefers-color-scheme: dark)', color: '#121110' },
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
      className={`bg-background ${jakarta.variable} ${outfit.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        <OrganizationJsonLd />
        {children}
        <OptionalAnalytics />
      </body>
    </html>
  )
}
