import { MetadataRoute } from 'next'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const BASE_URL = 'https://bricomaroc.vercel.app'

const VILLES = [
  'marrakech', 'casablanca', 'rabat', 'fes',
  'tanger', 'agadir', 'meknes', 'oujda', 'tetouan', 'safi'
]

const SERVICES = [
  'plombier', 'electricien', 'peintre', 'menuisier',
  'carreleur', 'climaticien', 'macon', 'jardinier'
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  )

  // Pages statiques
  const pagesStatiques: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/artisans`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/demandes/nouvelle`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/estimation`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/carte`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/comparer`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/tarifs`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    { url: `${BASE_URL}/a-propos`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/comment-ca-marche`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/support`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/cgu`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE_URL}/mentions-legales`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
  ]

  // Pages artisans dynamiques
  const { data: artisans } = await supabase
    .from('artisans')
    .select('id, updated_at')
    .eq('statut', 'verified') as { data: any[] | null }

  const pagesArtisans: MetadataRoute.Sitemap = (artisans ?? []).map(a => ({
    url: `${BASE_URL}/artisans/${a.id}`,
    lastModified: new Date(a.updated_at ?? new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Pages villes
  const pagesVilles: MetadataRoute.Sitemap = VILLES.map(ville => ({
    url: `${BASE_URL}/villes/${ville}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Pages services par ville
  const pagesServices: MetadataRoute.Sitemap = []
  for (const service of SERVICES) {
    // Page service général
    pagesServices.push({
      url: `${BASE_URL}/services/${service}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })
    // Page service par ville
    for (const ville of VILLES) {
      pagesServices.push({
        url: `${BASE_URL}/services/${service}-${ville}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      })
    }
  }

  // Pages blog
  const { data: articles } = await supabase
    .from('blog_articles')
    .select('id, updated_at')
    .eq('publie', true) as { data: any[] | null }

  const pagesBlog: MetadataRoute.Sitemap = (articles ?? []).map(a => ({
    url: `${BASE_URL}/blog/${a.id}`,
    lastModified: new Date(a.updated_at ?? new Date()),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }))

  return [
    ...pagesStatiques,
    ...pagesArtisans,
    ...pagesVilles,
    ...pagesServices,
    ...pagesBlog,
  ]
}