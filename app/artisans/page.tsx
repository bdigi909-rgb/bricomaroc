'use client'
import { useState, useEffect, Suspense } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import BadgeArtisan from '@/components/ui/BadgeArtisan'

function ArtisansSearchContent() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const searchParams = useSearchParams()
  const router = useRouter()

  const [artisans, setArtisans] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [categorieSlug, setCategorieSlug] = useState(searchParams.get('q') ?? '')
  const [ville, setVille] = useState(searchParams.get('ville') ?? 'Marrakech')
  const [noteMin, setNoteMin] = useState(0)
  const [disponibleOnly, setDisponibleOnly] = useState(false)
  const [tri, setTri] = useState<'note' | 'missions'>('note')

  const villes = ['Marrakech', 'Casablanca', 'Rabat', 'Fès', 'Tanger',
    'Agadir', 'Meknès', 'Oujda', 'Tétouan', 'Safi']

  useEffect(() => {
    supabase.from('categories').select('*').order('position').then(({ data }) => {
      if (data) setCategories(data)
    })
  }, [])

  useEffect(() => {
    search()
  }, [categorieSlug, ville, noteMin, disponibleOnly, tri])

  async function search() {
    setLoading(true)

    let query = supabase
      .from('artisans')
      .select(`
        *,
        user:users(*),
        categories:artisan_categories(categorie:categories(*))
      `)
      .eq('statut', 'verified')
      .eq('ville', ville)

    if (noteMin > 0) query = query.gte('note_moyenne', noteMin)
    if (disponibleOnly) query = query.eq('disponible', true)

    if (tri === 'note') {
      query = query.order('note_moyenne', { ascending: false })
    } else {
      query = query.order('nb_missions', { ascending: false })
    }

    const { data } = await query

    const userIds = (data ?? []).map((a: any) => a.user_id)
    const { data: usersData } = await supabase.from('users').select('*').in('id', userIds)
    const usersMap = Object.fromEntries((usersData ?? []).map((u: any) => [u.id, u]))
    let enriched = (data ?? []).map((a: any) => ({ ...a, user: usersMap[a.user_id] ?? null }))

    if (categorieSlug) {
      const cat = categories.find(c => c.slug === categorieSlug)
      if (cat) {
        enriched = enriched.filter((a: any) =>
          a.categories?.some((c: any) => c.categorie?.id === cat.id)
        )
      }
    }

    setArtisans(enriched)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-[#1B7A56]">🔧 BricoMaroc</Link>
        <div className="flex items-center gap-3">
          <Link href="/comparer"
            className="text-sm border border-gray-200 text-gray-600 font-semibold
              px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors">
            ⚖️ Comparer
          </Link>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-800">← Accueil</Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Trouver un artisan</h1>

        <div className="grid grid-cols-4 gap-6">

          {/* FILTRES */}
          <div className="col-span-1">
            <div className="bg-white rounded-2xl p-5 shadow-sm sticky top-4 space-y-5">

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Métier</label>
                <select value={categorieSlug} onChange={e => setCategorieSlug(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm
                    focus:outline-none focus:ring-2 focus:ring-[#1B7A56]">
                  <option value="">Tous les métiers</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.slug}>{cat.icone} {cat.nom}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ville</label>
                <select value={ville} onChange={e => setVille(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm
                    focus:outline-none focus:ring-2 focus:ring-[#1B7A56]">
                  {villes.map(v => <option key={v}>{v}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Note minimum
                </label>
                <div className="flex gap-1">
                  {[0, 3, 4, 4.5].map(n => (
                    <button key={n} onClick={() => setNoteMin(n)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        noteMin === n ? 'bg-[#1B7A56] text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                      {n === 0 ? 'Tous' : `${n}+`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="dispo" checked={disponibleOnly}
                  onChange={e => setDisponibleOnly(e.target.checked)}
                  className="w-4 h-4 accent-[#1B7A56]" />
                <label htmlFor="dispo" className="text-sm text-gray-700">
                  Disponible maintenant
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Trier par</label>
                <select value={tri} onChange={e => setTri(e.target.value as any)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm
                    focus:outline-none focus:ring-2 focus:ring-[#1B7A56]">
                  <option value="note">Meilleure note</option>
                  <option value="missions">Plus de missions</option>
                </select>
              </div>
            </div>
          </div>

          {/* RÉSULTATS */}
          <div className="col-span-3">
            <p className="text-sm text-gray-500 mb-4">
              {loading ? 'Recherche...' : `${artisans.length} artisan${artisans.length > 1 ? 's' : ''} trouvé${artisans.length > 1 ? 's' : ''}`}
            </p>

            {loading ? (
              <div className="grid gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-2xl p-5 h-32 animate-pulse" />
                ))}
              </div>
            ) : artisans.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                <div className="text-4xl mb-3">🔍</div>
                <p className="text-gray-500">Aucun artisan trouvé avec ces critères</p>
              </div>
            ) : (
              <div className="space-y-4">
                {artisans.map(artisan => {
                  const user = artisan.user ?? { full_name: 'Artisan', avatar_url: null }
                  const initials = (user.full_name ?? 'A').split(' ')
                    .map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()

                  return (
                    <Link key={artisan.id} href={`/artisans/${artisan.id}`}
                      className="block bg-white rounded-2xl p-5 shadow-sm border border-gray-100
                        hover:shadow-md hover:-translate-y-0.5 transition-all">
                      <div className="flex gap-4 items-start">
                        <div className="relative flex-shrink-0">
                          {user.avatar_url ? (
                            <Image src={user.avatar_url} alt={user.full_name}
                              width={56} height={56} className="rounded-full object-cover" />
                          ) : (
                            <div className="w-14 h-14 rounded-full bg-[#1B7A56] flex items-center
                              justify-center text-white font-bold">
                              {initials}
                            </div>
                          )}
                          {artisan.disponible && (
                            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500
                              rounded-full border-2 border-white" />
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-gray-900">{user.full_name}</h3>
                            {artisan.cin_verifie && (
                              <span className="text-xs bg-green-100 text-green-700
                                px-2 py-0.5 rounded-full">✓ Vérifié</span>
                            )}
                            <BadgeArtisan badge={artisan.badge_special} />
                          </div>
                          <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">
                            {artisan.bio}
                          </p>
                          <div className="flex gap-1 flex-wrap mt-2">
                            {artisan.categories?.slice(0, 3).map((c: any) => (
                              <span key={c.categorie?.id}
                                className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                {c.categorie?.icone} {c.categorie?.nom}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                            <span>⭐ {artisan.note_moyenne?.toFixed(1)} ({artisan.nb_avis})</span>
                            <span>✅ {artisan.nb_missions} missions</span>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-gray-900">
                            {artisan.tarif_min}–{artisan.tarif_max}
                            <span className="text-xs font-normal text-gray-500"> MAD/h</span>
                          </p>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ArtisansSearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F7F5F0]" />}>
      <ArtisansSearchContent />
    </Suspense>
  )
}
