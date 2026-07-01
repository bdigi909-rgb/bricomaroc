import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.css'
import { schemaOrganisation, schemaWebSite } from '@/lib/schema'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
 title: {
  default: 'BricoMaroc - Artisans verifies au Maroc',
  template: '%s | BricoMaroc',
},
verification: {
  google: 'fLA8KNnzXHeLG-0WgXGYJOOvltVCLMHyyMZH0BBuV_g',
},
  description: 'Trouvez un plombier, electricien, peintre ou menuisier qualifie et verifie pres de chez vous au Maroc. Avis clients, tarifs transparents, intervention rapide.',
  keywords: [
    'artisan Maroc', 'plombier Marrakech', 'electricien Casablanca',
    'bricolage Maroc', 'depannage domicile', 'artisan verifie',
  ],
  authors: [{ name: 'BricoMaroc' }],
  creator: 'BricoMaroc',
  metadataBase: new URL('https://bricomaroc.vercel.app'),
  openGraph: {
    type: 'website',
    locale: 'fr_MA',
    url: 'https://bricomaroc.vercel.app',
    title: 'BricoMaroc - Artisans verifies au Maroc',
    description: 'La plateforme de confiance pour trouver un artisan qualifie pres de chez vous.',
    siteName: 'BricoMaroc',
    images: [{
      url: '/opengraph-image',
      width: 1200,
      height: 630,
      alt: 'BricoMaroc - Artisans verifies au Maroc',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BricoMaroc - Artisans verifies au Maroc',
    description: 'La plateforme de confiance pour trouver un artisan qualifie au Maroc.',
    images: ['/opengraph-image'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={inter.variable}>
      <head>
        <script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify(schemaOrganisation())
  }}
/>
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify(schemaWebSite())
  }}
/>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1B7A56" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="BricoMaroc" />
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
      </head>
      <body className="min-h-screen bg-sand antialiased">
        {children}
      </body>
    </html>
  )
}
