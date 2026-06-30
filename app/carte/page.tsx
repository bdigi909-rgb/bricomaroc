'use client'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'
import dynamic from 'next/dynamic'

// Charger la carte dynamiquement (pas de SSR)
const MapComponent = dynamic(() => import('@/components/carte/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
      <div className="text-gray-500">Chargement de la carte...</div>
    </div>
  ),
})

export default function CartePage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [artisans, setArtisans] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [categorieFiltre, setCategorieFiltre] = useState('')
  const [villeFiltre, setVilleFiltre] = useState('Marrakech')
  const [selectedArtisan, setSelectedArtisan] = useState<any>(null)

  const villes = ['Marrakech', 'Casablanca', 'Rabat', 'Fès', 'Tanger', 'Agadir']

  // Coordonnées des villes marocaines
  const villesCoords: Record<string, [number, number]> = {
    'Marrakech': [31.6295, -7.9811],
    'Casablanca': [33.5731, -7.5898],
    'Rabat': [34.0209, -6.8416],
    'Fès': [34.0331, -5.0003],
    'Tanger': [35.7595, -5.8340],
    'Agadir': [30.4278, -9.5981],
    'Meknès': [33.8935, -5.5473],
    'Oujda': [34.6867, -1.9114],
    'Tétouan': [35.5785, -5.3684],
    'Safi': [32.2994, -9.2372],
  }

  useEffect(() => {
    async function load() {
      const { data: cats } = await supabase
        .from('categories').select('*').order('position') as { data: any[] | null }
      setCategories(cats ?? [])

      await chargerArtisans()
    }
    load()
  }, [])

  useEffect(() => {
    chargerArtisans()
  }, [villeFiltre, categorieFiltre])

  async function chargerArtisans() {
    setLoading(true)

    const { data } = await supabase
      .from('artisans')
      .select('*, categories:artisan_categories(categorie:categories(*))')
      .eq('statut', 'verified')
      .eq('ville', villeFiltre) as { data: any[] | null }

    const userIds = (data ?? []).map(a => a.user_id)
    const { data: usersData } = await supabase
      .from('users').select('*').in('id', userIds)
    const usersMap = Object.fromEntries((usersData ?? []).map((u: any) => [u.id, u]))

    let enriched = (data ?? []).map(a => ({
      ...a,
      user: usersMap[a.user_id] ?? null,
      // Coordonnées simulées autour de la ville
      lat: (villesCoords[villeFiltre]?.[0] ?? 31.6295) + (Math.random() - 0.5) * 0.1,
      lng: (villesCoords[villeFiltre]?.[1] ?? -7.9811) + (Math.random() - 0.5) * 0.1,
    }))

    if (categorieFiltre) {
      const cat = categories.find(c => c.id === categorieFiltre)
      if (cat) {
        enriched = enriched.filter(a =>
          a.categories?.some((c: any) => c.categorie?.id === cat.id)
        )
      }
    }

    setArtisans(enriched)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-[#1B7A56]">🔧 BricoMaroc</Link>
        <Link href="/artisans" className="text-sm text-gray-500 hover:text-gray-800">← Liste</Link>
      </nav>

      {/* FILTRES */}
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-4 flex-wrap">
        <select value={villeFiltre} onChange={e => setVilleFiltre(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm
            focus:outline-none focus:ring-2 focus:ring-[#1B7A56]">
          {villes.map(v => <option key={v}>{v}</option>)}
        </select>

        <select value={categorieFiltre} onChange={e => setCategorieFiltre(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm
            focus:outline-none focus:ring-2 focus:ring-[#1B7A56]">
          <option value="">Tous les métiers</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.icone} {cat.nom}</option>
          ))}
        </select>

        <span className="text-sm text-gray-500">
          {loading ? 'Recherche...' : `${artisans.length} artisan${artisans.length > 1 ? 's' : ''}`}
        </span>
      </div>

      <div className="flex flex-1 h-[calc(100vh-120px)]">
        {/* CARTE */}
        <div className="flex-1 relative">
          {!loading && (
            <MapComponent
              artisans={artisans}
              center={villesCoords[villeFiltre] ?? [31.6295, -7.9811]}
              onSelectArtisan={setSelectedArtisan}
            />
          )}
        </div>

        {/* SIDEBAR */}
        <div className="w-80 bg-white border-l border-gray-100 overflow-y-auto">
          {selectedArtisan ? (
            <div className="p-5">
              <button onClick={() => setSelectedArtisan(null)}
                className="text-sm text-gray-500 hover:text-gray-800 mb-4 block">
                ← Tous les artisans
              </button>
              <div className="text-center mb-4">
                <div className="w-16 h-16 rounded-full bg-[#1B7A56] text-white text-2xl
                  font-bold flex items-center justify-center mx-auto mb-2">
                  {(selectedArtisan.user?.full_name ?? 'A').split(' ')
                    .map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                </div>
                <h3 className="font-bold text-gray-900">{selectedArtisan.user?.full_name}</h3>
                <p className="text-sm text-gray-500">
                  ⭐ {selectedArtisan.note_moyenne?.toFixed(1)} ({selectedArtisan.nb_avis} avis)
                </p>
              </div>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex flex-wrap gap-1">
                  {selectedArtisan.categories?.slice(0, 3).map((c: any) => (
                    <span key={c.categorie?.id}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {c.categorie?.icone} {c.categorie?.nom}
                    </span>
                  ))}
                </div>
                <p className="text-gray-500">
                  💰 {selectedArtisan.tarif_min}–{selectedArtisan.tarif_max} MAD/h
                </p>
                <p className="text-gray-500">✅ {selectedArtisan.nb_missions} missions</p>
                <p className="text-gray-500">📍 Rayon {selectedArtisan.rayon_km} km</p>
                {selectedArtisan.disponible && (
                  <p className="text-green-600 font-medium">🟢 Disponible maintenant</p>
                )}
              </div>
              <Link href={`/artisans/${selectedArtisan.id}`}
                className="w-full block text-center bg-[#1B7A56] text-white font-semibold
                  py-3 rounded-xl hover:bg-[#155f42] transition-colors mb-2">
                Voir le profil
              </Link>
              <Link href={`/demandes/nouvelle`}
                className="w-full block text-center border border-gray-200 text-gray-600
                  font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors">
                Contacter
              </Link>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              <h2 className="font-bold text-gray-900 text-sm px-1">
                {artisans.length} artisan{artisans.length > 1 ? 's' : ''} à {villeFiltre}
              </h2>
              {artisans.map(artisan => (
                <div key={artisan.id}
                  onClick={() => setSelectedArtisan(artisan)}
                  className="p-3 rounded-xl border border-gray-100 hover:border-[#1B7A56]
                    cursor-pointer transition-colors hover:bg-green-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#1B7A56] text-white text-sm
                      font-bold flex items-center justify-center flex-shrink-0">
                      {(artisan.user?.full_name ?? 'A').split(' ')
                        .map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">
                        {artisan.user?.full_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        ⭐ {artisan.note_moyenne?.toFixed(1)} · {artisan.tarif_min}–{artisan.tarif_max} MAD/h
                      </p>
                    </div>
                    {artisan.disponible && (
                      <div className="w-2.5 h-2.5 bg-green-500 rounded-full flex-shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
