'use client'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import BadgeArtisan from '@/components/ui/BadgeArtisan'
import { schemaArtisan } from '@/lib/schema'

export default function ArtisanPage({ params }: { params: { id: string } }) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const router = useRouter()

  const [artisan, setArtisan] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isFavori, setIsFavori] = useState(false)
  const [favoriId, setFavoriId] = useState<string | null>(null)
  const [favoriLoading, setFavoriLoading] = useState(false)

  useEffect(() => {
    async function load() {
      // Charger artisan
      const { data: artisanData } = await supabase
        .from('artisans')
        .select(`
          *,
          user:users(*),
          categories:artisan_categories(categorie:categories(*)),
          avis(*, client:users(full_name, avatar_url)),
          portfolio(*)
        `)
        .eq('id', params.id)
        .single() as { data: any }

      if (!artisanData) { router.push('/artisans'); return }

      // Enrichir user
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', artisanData.user_id)
        .single() as { data: any }

      setArtisan({ ...artisanData, user: userData ?? { full_name: 'Artisan', avatar_url: null } })

      // Vérifier si connecté
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      setUser(currentUser)

      if (currentUser) {
        const { data: favData } = await supabase
          .from('favoris')
          .select('id')
          .eq('client_id', currentUser.id)
          .eq('artisan_id', params.id)
          .single() as { data: any }

        if (favData) {
          setIsFavori(true)
          setFavoriId(favData.id)
        }
      }

      setLoading(false)
    }
    load()
  }, [])

  async function toggleFavori() {
    if (!user) { router.push('/auth/login'); return }
    setFavoriLoading(true)

    if (isFavori && favoriId) {
      await supabase.from('favoris').delete().eq('id', favoriId)
      setIsFavori(false)
      setFavoriId(null)
    } else {
      const { data } = await supabase.from('favoris').insert({
        client_id: user.id,
        artisan_id: params.id,
      }).select('id').single() as { data: any }
      setIsFavori(true)
      setFavoriId(data?.id)
    }
    setFavoriLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center">
        <div className="text-gray-500">Chargement...</div>
      </div>
    )
  }

  const userArtisan = artisan?.user ?? { full_name: 'Artisan', avatar_url: null }
  const categories = artisan?.categories ?? []
  const avis = artisan?.avis ?? []
  const portfolio = artisan?.portfolio ?? []
  const initials = (userArtisan.full_name ?? 'A')
    .split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
  const jours = ['', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
  const schemaData = schemaArtisan(artisan, userArtisan)

  return (
   return (
    <div className="min-h-screen bg-[#F7F5F0]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-[#1B7A56]">
          🔧 BricoMaroc
        </Link>
        <div className="flex items-center gap-3">
          <button onClick={toggleFavori} disabled={favoriLoading}
            className={`flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-xl
              border transition-colors ${isFavori
                ? 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100'
                : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}>
            {isFavori ? '❤️' : '🤍'}
            {isFavori ? 'Sauvegardé' : 'Sauvegarder'}
          </button>
          <Link href="/artisans" className="text-sm text-gray-500 hover:text-gray-800">← Retour</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex gap-5 items-start">
            <div className="relative flex-shrink-0">
              {userArtisan.avatar_url ? (
                <Image src={userArtisan.avatar_url} alt={userArtisan.full_name}
                  width={80} height={80} className="rounded-full object-cover" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-[#1B7A56] flex items-center justify-center
                  text-white text-2xl font-bold">
                  {initials}
                </div>
              )}
              {artisan?.disponible && (
                <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500
                  rounded-full border-2 border-white" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
  <h1 className="text-2xl font-bold text-gray-900">{userArtisan.full_name}</h1>
  {artisan?.badge === 'elite' && (
    <span className="text-xs font-bold bg-yellow-100 text-yellow-700
      px-2 py-1 rounded-full">★ Élite</span>
  )}
  {artisan?.badge === 'verified' && (
    <span className="text-xs font-bold bg-blue-100 text-blue-700
      px-2 py-1 rounded-full">⭐ Pro</span>
  )}
  {artisan?.cin_verifie && (
    <span className="text-xs font-bold bg-green-100 text-green-700
      px-2 py-1 rounded-full">✓ Vérifié</span>
  )}
  <BadgeArtisan badge={artisan?.badge_special} />
</div>
              <div className="flex gap-2 flex-wrap mt-2">
                {categories.map((cat: any) => (
                  <span key={cat.categorie?.id}
                    className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                    {cat.categorie?.icone} {cat.categorie?.nom}
                  </span>
                ))}
              </div>

              <div className="flex gap-6 mt-3 text-sm">
                {[
                  { value: artisan?.note_moyenne?.toFixed(1), label: 'Note' },
                  { value: artisan?.nb_avis, label: 'Avis' },
                  { value: artisan?.nb_missions, label: 'Missions' },
                  { value: artisan?.annees_experience, label: 'Ans exp.' },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <div className="font-bold text-gray-900 text-lg">{s.value}</div>
                    <div className="text-gray-500">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-right flex-shrink-0">
              <div className="text-2xl font-bold text-gray-900">
                {artisan?.tarif_min}–{artisan?.tarif_max}
                <span className="text-sm font-normal text-gray-500"> MAD/h</span>
              </div>
              {artisan?.devis_gratuit && (
                <div className="text-xs text-green-600 font-medium mt-1">Devis gratuit</div>
              )}
              <Link href={`/demandes/nouvelle?artisan=${artisan?.id}`}
                className="mt-3 w-full bg-[#1B7A56] text-white font-semibold
                px-6 py-3 rounded-xl hover:bg-[#155f42] transition-colors text-center block">
                Contacter
              </Link>
            </div>
          </div>

          {artisan?.bio && (
            <p className="mt-4 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
              {artisan.bio}
            </p>
          )}

          <div className="flex gap-6 mt-4 text-sm text-gray-500 border-t border-gray-100 pt-4">
            <span>📍 {artisan?.ville} — rayon {artisan?.rayon_km} km</span>
            <span>🌐 {artisan?.langues?.join(', ')}</span>
            {artisan?.urgences_24h && (
              <span className="text-red-600 font-medium">🚨 Urgences 24h/24</span>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">Disponibilités</h2>
          <div className="flex gap-2 flex-wrap">
            {jours.slice(1).map((jour, i) => (
              <div key={jour}
                className={`px-3 py-2 rounded-xl text-sm font-medium ${
                  artisan?.jours_dispo?.includes(i + 1)
                    ? 'bg-[#1B7A56] text-white'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                {jour}
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-3">
            {artisan?.heure_debut?.slice(0,5)} – {artisan?.heure_fin?.slice(0,5)}
          </p>
        </div>

        {portfolio.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">Réalisations</h2>
            <div className="grid grid-cols-3 gap-3">
              {portfolio.map((item: any) => (
                <div key={item.id} className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                  <Image src={item.photo_url} alt={item.titre ?? 'Réalisation'}
                    width={200} height={200} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">Avis clients ({avis.length})</h2>
          {avis.length === 0 ? (
            <p className="text-gray-400 text-sm">Aucun avis pour le moment.</p>
          ) : (
            <div className="space-y-4">
              {avis.map((a: any) => (
                <div key={a.id} className="border-b border-gray-100 pb-4 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center
                        justify-center text-xs font-bold text-gray-600">
                        {a.client?.full_name?.[0] ?? '?'}
                      </div>
                      <span className="font-medium text-sm text-gray-800">
                        {a.client?.full_name ?? 'Client'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {'★'.repeat(a.note_globale)}
                      <span className="text-xs text-gray-400 ml-1">
                        {new Date(a.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                  {a.commentaire && (
                    <p className="text-sm text-gray-600">{a.commentaire}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}