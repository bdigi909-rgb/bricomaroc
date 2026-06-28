import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/',
          '/dashboard',
          '/espace-client',
          '/profil',
          '/profil-client',
          '/paiement',
          '/api/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/admin',
          '/dashboard',
          '/espace-client',
          '/api/',
        ],
      },
    ],
    sitemap: 'https://bricomaroc.vercel.app/sitemap.xml',
    host: 'https://bricomaroc.vercel.app',
  }
}