import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import type { Metadata } from 'next'

const SERVICES: Record<string, {
  nom: string
  icone: string
  categorie: string
  description: string
  tarif: string
  delai: string
  travaux: string[]
}> = {
  'plombier': {
    nom: 'Plombier',
    icone: '🔧',
    categorie: 'Plomberie',
    description: 'Trouvez un plombier verifie pres de chez vous. Fuite, robinet, chauffe-eau, WC — intervention rapide et devis gratuit.',
    tarif: '100-300 MAD/h',
    delai: '24h',
    travaux: ['Reparation fuite', 'Remplacement robinet', 'Installation chauffe-eau', 'Debouchage', 'Renovation salle de bain'],
  },
  'electricien': {
    nom: 'Electricien',
    icone: '⚡',
    categorie: 'Electricite',
    description: 'Electricien certifie disponible rapidement. Tableau electrique, prises, eclairage — travaux aux normes et garantis.',
    tarif: '120-350 MAD/h',
    delai: '24h',
    travaux: ['Tableau electrique', 'Installation prises', 'Eclairage LED', 'Climatisation', 'Mise aux normes'],
  },
  'peintre': {
    nom: 'Peintre',
    icone: '🎨',
    categorie: 'Peinture',
    description: 'Peintre professionnel pour vos travaux interieurs et exterieurs. Enduit, peinture, decoration — finitions impeccables.',
    tarif: '80-200 MAD/h',
    delai: '48h',
    travaux: ['Peinture interieure', 'Peinture exterieure', 'Enduit', 'Ravalement facade', 'Decoration'],
  },
  'menuisier': {
    nom: 'Menuisier',
    icone: '🪵',
    categorie: 'Menuiserie',
    description: 'Menuisier qualifie pour portes, fenetres, placards et parquet. Fabrication sur mesure et pose professionnelle.',
    tarif: '100-300 MAD/h',
    delai: '48h',
    travaux: ['Pose de portes', 'Fenetres double vitrage', 'Placards sur mesure', 'Parquet', 'Escaliers'],
  },
  'carreleur': {
    nom: 'Carreleur',
    icone: '🪟',
    categorie: 'Carrelage',
    description: 'Carreleur experimente pour sol et mur. Pose de carrelage, faience, zellige — travail soigne et durable.',
    tarif: '80-200 MAD/h',
    delai: '48h',
    travaux: ['Carrelage sol', 'Faience murale', 'Zellige', 'Renovation salle de bain', 'Terrasse'],
  },
  'climaticien': {
    nom: 'Climaticien',
    icone: '❄️',
    categorie: 'Climatisation',
    description: 'Technicien climatisation pour installation, entretien et reparation. Toutes marques, garantie 1 an.',
    tarif: '150-400 MAD/h',
    delai: '24h',
    travaux: ['Installation climatisation', 'Entretien annuel', 'Reparation panne', 'Recharge gaz', 'Nettoyage filtres'],
  },
  'macon': {
    nom: 'Macon',
    icone: '🏗️',
    categorie: 'Maconnerie',
    description: 'Macon professionnel pour gros oeuvre et renovation. Construction, demolition, enduit — travaux solides et durables.',
    tarif: '100-250 MAD/h',
    delai: '48h',
    travaux: ['Construction mur', 'Demolition', 'Enduit facade', 'Dalle beton', 'Renovation'],
  },
  'jardinier': {
    nom: 'Jardinier',
    icone: '🌿',
    categorie: 'Jardinage',
    description: 'Jardinier paysagiste pour entretien et amenagement de jardins. Taille, tonte, plantation — votre jardin en beaute.',
    tarif: '60-150 MAD/h',
    delai: '48h',
    travaux: ['Taille haie', 'Tonte pelouse', 'Plantation', 'Arrosage automatique', 'Amenagement jardin'],
  },
}

const VILLES = ['marrakech', 'casablanca', 'rabat', 'fes', 'tanger', 'agadir']
const VILLES_NOMS: Record<string, string> = {
  'marrakech': 'Marrakech', 'casablanca': 'Casablanca', 'rabat': 'Rabat',
  'fes': 'Fes', 'tanger': 'Tanger', 'agadir': 'Agadir',
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const parts = params.slug.split('-')
  const villeSlug = parts[parts.length - 1]
  const serviceSlug = parts.slice(0, -1).join('-')

  const service = SERVICES[serviceSlug] ?? SERVICES[parts[0]]
  const villeNom = VILLES_NOMS[villeSlug] ?? villeSlug

  if (!service) return { title: 'Service non trouve | BricoMaroc' }

  return {
    title: `${service.nom} a ${villeNom} — Devis gratuit | BricoMaroc`,
    description: `${service.description} Trouvez un ${service.nom.toLowerCase()} verifie a ${villeNom}. Devis gratuit, intervention sous ${service.delai}.`,
    openGraph: {
      title: `${service.nom} a ${villeNom} | BricoMaroc`,
      description: service.description,
      url: `https://bricomaroc.vercel.app/services/${params.slug}`,
    },
  }
}

export async function generateStaticParams() {
  const params = []
  for (const serviceSlug of Object.keys(SERVICES)) {
    for (const villeSlug of VILLES) {
      params.push({ slug: `${serviceSlug}-${villeSlug}` })
    }
    params.push({ slug: serviceSlug })
  }
  return params
}

export default async function ServiceVillePage({ params }: { params: { slug: string } }) {
  const parts = params.slug.split('-')
  const villeSlug = parts[parts.length - 1]
  const hasVille = VILLES.includes(villeSlug)
  const serviceSlug = hasVille ? parts.slice(0, -1).join('-') : params.slug
  const villeNom = hasVille ? VILLES_NOMS[villeSlug] : null

  const service = SERVICES[serviceSlug]

  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name: string) => cookieStore.get(name)?.value } }
  )

  let query = supabase
    .from('artisans')
    .select('*, user:users(full_name), categories:artisan_categories(categorie:categories(nom, icone))')
    .eq('statut', 'verified')
    .order('note_moyenne', { ascending: false })
    .limit(10)

  if (villeNom) {
    query = query.ilike('ville', villeNom)
  }

  const { data: artisans } = await query as { data: any[] | null }

  if (!service) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Service non trouve</h1>
          <Link href="/artisans" className="text-[#1B7A56] hover:underline">
            Voir tous les artisans
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-[#1B7A56]">BricoMaroc</Link>
        <Link href="/artisans" className="text-sm text-gray-500 hover:text-gray-800">
          Tous les artisans
        </Link>
      </nav>

      {/* HERO */}
      <div className="bg-gradient-to-br from-[#1B7A56] to-[#0f4a33] text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-5xl mb-3">{service.icone}</div>
          <h1 className="text-3xl font-bold mb-2">
            {service.nom}{villeNom ? ` a ${villeNom}` : ' au Maroc'}
          </h1>
          <p className="text-green-100 max-w-2xl mx-auto text-sm mb-6">
            {service.description}
          </p>
          <div className="flex justify-center gap-8">
            <div className="text-center">
              <p className="text-2xl font-bold">{artisans?.length ?? 0}</p>
              <p className="text-green-200 text-sm">Artisans disponibles</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{service.tarif}</p>
              <p className="text-green-200 text-sm">Tarif moyen</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{service.delai}</p>
              <p className="text-green-200 text-sm">Delai intervention</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        {/* TRAVAUX */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-3">
            Travaux realises par nos {service.nom.toLowerCase()}s
          </h2>
          <div className="flex flex-wrap gap-2">
            {service.travaux.map(t => (
              <span key={t} className="px-3 py-1.5 bg-green-50 text-[#1B7A56] rounded-full
                text-sm font-medium">
                {service.icone} {t}
              </span>
            ))}
          </div>
        </div>

        {/* ARTISANS */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {artisans?.length ?? 0} {service.nom.toLowerCase()}s
            {villeNom ? ` a ${villeNom}` : ' disponibles'}
          </h2>

          {!artisans || artisans.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
              <div className="text-4xl mb-3">{service.icone}</div>
              <p className="text-gray-500 mb-4">
                Aucun {service.nom.toLowerCase()} disponible pour le moment
              </p>
              <Link href="/demandes/nouvelle"
                className="bg-[#1B7A56] text-white font-semibold px-6 py-3 rounded-xl
                  hover:bg-[#155f42] transition-colors inline-block">
                Poster une demande
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {artisans.map(artisan => (
                <div key={artisan.id}
                  className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#1B7A56] text-white text-xl
                    font-bold flex items-center justify-center flex-shrink-0">
                    {(artisan.user?.full_name ?? 'A')[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900">
                        {artisan.user?.full_name ?? 'Artisan'}
                      </h3>
                      {artisan.cin_verifie && (
                        <span className="text-xs bg-green-100 text-green-700
                          px-2 py-0.5 rounded-full font-medium">
                          Verifie
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {artisan.categories?.slice(0, 3).map((cat: any) => (
                        <span key={cat.categorie?.nom}
                          className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          {cat.categorie?.icone} {cat.categorie?.nom}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>⭐ {artisan.note_moyenne?.toFixed(1)} ({artisan.nb_avis} avis)</span>
                      <span>📍 {artisan.ville}</span>
                      <span>💰 {artisan.tarif_min}–{artisan.tarif_max} MAD/h</span>
                    </div>
                  </div>
                  <Link href={`/artisans/${artisan.id}`}
                    className="bg-[#1B7A56] text-white font-semibold px-4 py-2 rounded-xl
                      hover:bg-[#155f42] transition-colors text-sm flex-shrink-0">
                    Voir profil
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">
            Questions frequentes
          </h2>
          <div className="space-y-3">
            {[
              {
                q: `Quel est le tarif d'un ${service.nom.toLowerCase()}${villeNom ? ` a ${villeNom}` : ''} ?`,
                r: `Le tarif moyen est de ${service.tarif}. Le prix exact depend de la complexite des travaux. Demandez un devis gratuit sur BricoMaroc.`
              },
              {
                q: `Sous quel delai peut intervenir un ${service.nom.toLowerCase()} ?`,
                r: `Nos ${service.nom.toLowerCase()}s peuvent intervenir sous ${service.delai} en general. Pour les urgences, certains artisans sont disponibles le jour meme.`
              },
              {
                q: `Les ${service.nom.toLowerCase()}s BricoMaroc sont-ils verifies ?`,
                r: `Oui, tous nos artisans sont verifies par notre equipe. Nous controlons leur identite, competences et references avant validation.`
              },
            ].map((faq, i) => (
              <details key={i} className="border border-gray-100 rounded-xl">
                <summary className="px-4 py-3 cursor-pointer font-medium text-gray-900
                  hover:text-[#1B7A56] text-sm">
                  {faq.q}
                </summary>
                <p className="px-4 pb-3 text-sm text-gray-500">{faq.r}</p>
              </details>
            ))}
          </div>
        </div>

        {/* AUTRES VILLES */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-3">
            {service.nom} dans d'autres villes
          </h2>
          <div className="flex flex-wrap gap-2">
            {VILLES.filter(v => v !== villeSlug).map(v => (
              <Link key={v} href={`/services/${serviceSlug}-${v}`}
                className="px-3 py-1.5 border border-gray-200 text-gray-600 rounded-full
                  text-sm hover:border-[#1B7A56] hover:text-[#1B7A56] transition-colors">
                {service.nom} a {VILLES_NOMS[v]}
              </Link>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-br from-[#1B7A56] to-[#0f4a33] rounded-2xl p-6 text-white text-center">
          <h2 className="text-xl font-bold mb-2">
            Besoin d'un {service.nom.toLowerCase()}{villeNom ? ` a ${villeNom}` : ''} ?
          </h2>
          <p className="text-green-200 text-sm mb-4">
            Devis gratuit — Reponse sous {service.delai} — Artisans verifies
          </p>
          <Link href="/demandes/nouvelle"
            className="bg-white text-[#1B7A56] font-semibold px-6 py-3 rounded-xl
              hover:bg-green-50 transition-colors inline-block">
            Poster une demande gratuite
          </Link>
        </div>

        {/* AUTRES SERVICES */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-3">Autres services</h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(SERVICES)
              .filter(([key]) => key !== serviceSlug)
              .map(([key, srv]) => (
                <Link key={key}
                  href={`/services/${key}${villeSlug && hasVille ? `-${villeSlug}` : ''}`}
                  className="px-3 py-1.5 border border-gray-200 text-gray-600 rounded-full
                    text-sm hover:border-[#1B7A56] hover:text-[#1B7A56] transition-colors">
                  {srv.icone} {srv.nom}
                </Link>
              ))}
          </div>
        </div>
      </div>

      <footer className="border-t border-gray-200 mt-8 py-6 px-4">
        <div className="max-w-4xl mx-auto text-center text-sm text-gray-400">
          <p>BricoMaroc — {service.nom}{villeNom ? ` a ${villeNom}` : ' au Maroc'}</p>
          <p className="mt-1">{service.travaux.join(', ')}</p>
        </div>
      </footer>
    </div>
  )
}