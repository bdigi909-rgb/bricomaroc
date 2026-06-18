import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'BricoMaroc — Artisans vérifiés au Maroc',
    template: '%s | BricoMaroc',
  },
  description:
    'Trouvez un plombier, électricien, peintre ou menuisier qualifié et vérifié près de chez vous au Maroc. Avis clients, tarifs transparents, intervention rapide.',
  keywords: [
    'artisan Maroc', 'plombier Marrakech', 'électricien Casablanca',
    'bricolage Maroc', 'dépannage domicile', 'artisan vérifié',
  ],
  authors: [{ name: 'BricoMaroc' }],
  creator: 'BricoMaroc',
  metadataBase: new URL('https://bricomaroc.ma'),
  openGraph: {
    type: 'website',
    locale: 'fr_MA',
    url: 'https://bricomaroc.ma',
    title: 'BricoMaroc — Artisans vérifiés au Maroc',
    description: 'La plateforme de confiance pour trouver un artisan qualifié près de chez vous.',
    siteName: 'BricoMaroc',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'BricoMaroc' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BricoMaroc',
    description: 'Artisans vérifiés au Maroc',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true, follow: true,
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
      <body className="min-h-screen bg-sand antialiased">
        {children}
      </body>
    </html>
  )
}
