import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import type { Metadata } from 'next'

const VILLES: Record<string, { nom: string, region: string, description: string }> = {
  'marrakech': { nom: 'Marrakech', region: 'Marrakech-Safi', description: 'Trouvez un artisan verife a Marrakech. Plombier, electricien, peintre disponibles rapidement dans la ville ocre.' },
  'casablanca': { nom: 'Casablanca', region: 'Grand Casablanca', description: 'Artisans qualifies a Casablanca. Devis gratuit, intervention rapide dans tout le Grand Casablanca.' },
  'rabat': { nom: 'Rabat', region: 'Rabat-Sale-Kenitra', description: 'Trouvez un artisan a Rabat. Professionnels verifies pour tous vos travaux dans la capitale.' },
  'fes': { nom: 'Fes', region: 'Fes-Meknes', description: 'Artisans disponibles a Fes. Plomberie, electricite, peinture et plus encore dans la ville imperiale.' },
  'tanger': { nom: 'Tanger', region: 'Tanger-Tetouan-Al Hoceima', description: 'Trouvez un artisan a Tanger. Professionnels qualifies pour vos travaux dans le nord du Maroc.' },
  'agadir': { nom: 'Agadir', region: 'Souss-Massa', description: 'Artisans verifies a Agadir. Intervention rapide pour tous vos travaux dans la perle du Souss.' },
  'meknes': { nom: 'Meknes', region: 'Fes-Meknes', description: 'Trouvez un artisan a Meknes. Professionnels disponibles pour vos travaux dans la ville ismaelienne.' },
  'oujda': { nom: 'Oujda', region: 'Oriental', description: 'Artisans qualifies a Oujda. Devis gratuit et intervention rapide dans la capitale de l\'oriental.' },
  'tetouan': { nom: 'Tetouan', region: 'Tanger-Tetouan-Al Hoceima', description: 'Trouvez un artisan a Tetouan. Professionnels verifies pour tous vos besoins en travaux.' },
  'safi': { nom: 'Safi', region: 'Marrakech-Safi', description: 'Artisans disponibles a Safi. Plomberie, electricite et renovation dans la ville des potiers.' },
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const villeData = VILLES[params.slug.toLowerCase()]
  if (!villeData) return { title: 'Ville non trouvee | BricoMaroc' }

  return {
    title: `Artisans a ${villeData.nom} — Plombier, Electricien, Peintre | BricoMaroc`,
    description: villeData.description,
    openGraph: {
      title: `Artisans verifies a ${villeData.nom} | BricoMaroc`,
      description: villeData.description,
      url: `https://bricomaroc.vercel.app/artisans/${params.slug}`,
    },
  }
}

export async function generateStaticParams() {
  return Object.keys(VILLES).map(ville => ({ ville }))
}

export default async function ArtisansVillePage({ params }: { params: { slug: string } }) {
  const villeData = VILLES[params.slug.toLowerCase()]

  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  )

  const { data: artisans } = await supabase
    .from('artisans')
    .select('*, user:users(full_name), categories:artisan_categories(categorie:categories(nom, icone))')
    .eq('statut', 'verified')
    .ilike('ville', villeData?.nom ?? params.slug)
    .order('note_moyenne', { ascending: false })
    .limit(20) as { data: any[] | null }

  if (!villeData) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Ville non trouvee</h1>
          <Link href="/artisans" className="text-[#1B7A56] hover:underline">
            Voir tous les artisans
          </Link>
        </div>
      </div>
    )
  }

  const CATEGORIES = ['Plomberie', 'Electricite', 'Peinture', 'Climatisation', 'Menuiserie', 'Carrelage']

  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-[#1B7A56]">BricoMaroc</Link>
        <Link href="/artisans" className="text-sm text-gray-500 hover:text-gray-800">
          Tous les artisans
        </Link>
      </nav>

      {/* HERO SEO */}
      <div className="bg-gradient-to-br from-[#1B7A56] to-[#0f4a33] text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-3">
            Artisans verifies a {villeData.nom}
          </h1>
          <p className="text-green-200 text-lg mb-2">{villeData.region}</p>
          <p className="text-green-100 max-w-2xl mx-auto text-sm">
            {villeData.description}
          </p>
          <div className="flex justify-center gap-6 mt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{artisans?.length ?? 0}</p>
              <p className="text-green-200 text-sm">Artisans disponibles</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">4.8</p>
              <p className="text-green-200 text-sm">Note moyenne</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">24h</p>
              <p className="text-green-200 text-sm">Delai intervention</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        {/* CATEGORIES */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-3">
            Nos services a {villeData.nom}
          </h2>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <Link key={cat}
                href={`/artisans?ville=${villeData.nom}&q=${cat}`}
                className="px-3 py-1.5 bg-green-50 text-[#1B7A56] rounded-full text-sm
                  font-medium hover:bg-green-100 transition-colors">
                {cat}
              </Link>
            ))}
          </div>
        </div>

        {/* ARTISANS */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {artisans?.length ?? 0} artisans a {villeData.nom}
          </h2>

          {!artisans || artisans.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
              <div className="text-4xl mb-3">🔧</div>
              <p className="text-gray-500 mb-4">
                Aucun artisan disponible a {villeData.nom} pour le moment
              </p>
              <Link href="/artisans/inscription"
                className="bg-[#1B7A56] text-white font-semibold px-6 py-3 rounded-xl
                  hover:bg-[#155f42] transition-colors inline-block">
                Devenir artisan a {villeData.nom}
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

        {/* FAQ SEO */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">
            Questions frequentes — Artisans a {villeData.nom}
          </h2>
          <div className="space-y-3">
            {[
              {
                q: `Comment trouver un plombier a ${villeData.nom} ?`,
                r: `Sur BricoMaroc, postez votre demande en 2 minutes et recevez des devis d\'artisans verifies a ${villeData.nom}. Intervention possible sous 24h.`
              },
              {
                q: `Quel est le tarif d\'un electricien a ${villeData.nom} ?`,
                r: `Les electriciens a ${villeData.nom} pratiquent des tarifs entre 100 et 300 MAD/h selon la complexite des travaux. Demandez un devis gratuit.`
              },
              {
                q: `Les artisans BricoMaroc a ${villeData.nom} sont-ils verifies ?`,
                r: `Oui, tous nos artisans sont verifies par notre equipe. Nous controlons leur identite, leurs competences et leurs references avant validation.`
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

        {/* VILLES VOISINES */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-3">Artisans dans d\'autres villes</h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(VILLES)
              .filter(([key]) => key !== params.slug.toLowerCase())
              .map(([key, ville]) => (
                <Link key={key} href={`/villes/${key}`}
                  className="px-3 py-1.5 border border-gray-200 text-gray-600 rounded-full
                    text-sm hover:border-[#1B7A56] hover:text-[#1B7A56] transition-colors">
                  {ville.nom}
                </Link>
              ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-br from-[#1B7A56] to-[#0f4a33] rounded-2xl p-6 text-white text-center">
          <h2 className="text-xl font-bold mb-2">
            Besoin d\'un artisan a {villeData.nom} ?
          </h2>
          <p className="text-green-200 text-sm mb-4">
            Postez votre demande gratuitement et recevez des devis sous 24h
          </p>
          <Link href="/demandes/nouvelle"
            className="bg-white text-[#1B7A56] font-semibold px-6 py-3 rounded-xl
              hover:bg-green-50 transition-colors inline-block">
            Poster une demande gratuite
          </Link>
        </div>
      </div>

      {/* FOOTER SEO */}
      <footer className="border-t border-gray-200 mt-8 py-6 px-4">
        <div className="max-w-4xl mx-auto text-center text-sm text-gray-400">
          <p>BricoMaroc — Artisans verifies a {villeData.nom}, {villeData.region}</p>
          <p className="mt-1">
            Plombier, Electricien, Peintre, Menuisier, Carreleur a {villeData.nom}
          </p>
        </div>
      </footer>
    </div>
  )
}