'use client'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'

export default function ComparerPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [artisans, setArtisans] = useState<any[]>([])
  const [selectionnes, setSelectionnes] = useState<any[]>([])
  const [recherche, setRecherche] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('artisans')
        .select('*')
        .eq('statut', 'verified')
        .order('note_moyenne', { ascending: false })
        .limit(50) as { data: any[] | null }

      const userIds = (data ?? []).map(a => a.user_id)
      const { data: usersData } = await supabase
        .from('users').select('*').in('id', userIds)
      const usersMap = Object.fromEntries((usersData ?? []).map((u: any) => [u.id, u]))
      setArtisans((data ?? []).map(a => ({ ...a, user: usersMap[a.user_id] ?? null })))
      setLoading(false)
    }
    load()
  }, [])

  function ajouterArtisan(artisan: any) {
    if (selectionnes.length >= 3) return
    if (selectionnes.find(a => a.id === artisan.id)) return
    setSelectionnes(prev => [...prev, artisan])
  }

  function retirerArtisan(artisanId: string) {
    setSelectionnes(prev => prev.filter(a => a.id !== artisanId))
  }

  const artisansFiltres = artisans.filter(a =>
    a.user?.full_name?.toLowerCase().includes(recherche.toLowerCase()) ||
    a.ville?.toLowerCase().includes(recherche.toLowerCase())
  )

  function Stars({ note }: { note: number }) {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <span key={i} className={i <= Math.round(note) ? 'text-yellow-400' : 'text-gray-200'}>
            ★
          </span>
        ))}
      </div>
    )
  }

  function CompareRow({ label, values, highlight }: {
    label: string
    values: (string | number | boolean | null)[]
    highlight?: boolean
  }) {
    return (
      <tr className={highlight ? 'bg-green-50' : 'bg-white hover:bg-gray-50'}>
        <td className="px-4 py-3 text-sm font-medium text-gray-600 w-40">{label}</td>
        {values.map((val, i) => (
          <td key={i} className="px-4 py-3 text-sm text-center font-semibold text-gray-900">
            {val === true ? '✅' : val === false ? '❌' : val ?? '—'}
          </td>
        ))}
        {/* Colonnes vides si moins de 3 artisans */}
        {Array.from({ length: 3 - values.length }).map((_, i) => (
          <td key={`empty-${i}`} className="px-4 py-3 text-center text-gray-300">—</td>
        ))}
      </tr>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-[#1B7A56]">🔧 BricoMaroc</Link>
        <Link href="/artisans" className="text-sm text-gray-500 hover:text-gray-800">← Artisans</Link>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">⚖️ Comparer des artisans</h1>
          <p className="text-gray-500 text-sm">Sélectionnez jusqu'à 3 artisans pour les comparer</p>
        </div>

        <div className="grid grid-cols-3 gap-6">

          {/* SÉLECTEUR */}
          <div className="col-span-1">
            <div className="bg-white rounded-2xl p-4 shadow-sm sticky top-4">
              <h2 className="font-bold text-gray-900 mb-3 text-sm">
                Artisans sélectionnés ({selectionnes.length}/3)
              </h2>

              {/* ARTISANS SÉLECTIONNÉS */}
              <div className="space-y-2 mb-4">
                {selectionnes.map(a => (
                  <div key={a.id} className="flex items-center gap-2 p-2 bg-green-50
                    border border-green-200 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-[#1B7A56] text-white text-xs
                      font-bold flex items-center justify-center flex-shrink-0">
                      {(a.user?.full_name ?? 'A').split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-900 flex-1 truncate">
                      {a.user?.full_name}
                    </span>
                    <button onClick={() => retirerArtisan(a.id)}
                      className="text-red-400 hover:text-red-600 text-lg leading-none">
                      ×
                    </button>
                  </div>
                ))}
                {Array.from({ length: 3 - selectionnes.length }).map((_, i) => (
                  <div key={i} className="p-2 border-2 border-dashed border-gray-200
                    rounded-xl text-center text-xs text-gray-400">
                    + Ajouter un artisan
                  </div>
                ))}
              </div>

              {/* RECHERCHE */}
              <input type="text" value={recherche}
                onChange={e => setRecherche(e.target.value)}
                placeholder="Rechercher un artisan..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm
                  focus:outline-none focus:ring-2 focus:ring-[#1B7A56] mb-3" />

              {/* LISTE */}
              <div className="space-y-1 max-h-80 overflow-y-auto">
                {loading ? (
                  <p className="text-xs text-gray-400 text-center py-4">Chargement...</p>
                ) : artisansFiltres.map(artisan => {
                  const isSelected = selectionnes.find(a => a.id === artisan.id)
                  return (
                    <button key={artisan.id}
                      onClick={() => ajouterArtisan(artisan)}
                      disabled={!!isSelected || selectionnes.length >= 3}
                      className={`w-full text-left p-2 rounded-xl text-sm transition-all ${
                        isSelected
                          ? 'bg-green-50 text-green-700 cursor-not-allowed'
                          : selectionnes.length >= 3
                          ? 'opacity-40 cursor-not-allowed'
                          : 'hover:bg-gray-50 cursor-pointer'
                      }`}>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#1B7A56] text-white text-xs
                          font-bold flex items-center justify-center flex-shrink-0">
                          {(artisan.user?.full_name ?? 'A').split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate text-xs">
                            {artisan.user?.full_name}
                          </p>
                          <p className="text-gray-400 text-xs">
                            ⭐ {artisan.note_moyenne?.toFixed(1)} · {artisan.ville}
                          </p>
                        </div>
                        {isSelected && <span className="text-green-500 text-xs">✓</span>}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* TABLEAU COMPARATIF */}
          <div className="col-span-2">
            {selectionnes.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 shadow-sm text-center">
                <div className="text-5xl mb-4">⚖️</div>
                <h2 className="font-bold text-gray-900 mb-2">Aucun artisan sélectionné</h2>
                <p className="text-gray-500 text-sm">
                  Choisissez 2 ou 3 artisans dans la liste pour les comparer
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

                {/* HEADERS */}
                <div className="grid gap-4 p-4 border-b border-gray-100"
                  style={{ gridTemplateColumns: `160px repeat(3, 1fr)` }}>
                  <div />
                  {selectionnes.map(a => (
                    <div key={a.id} className="text-center">
                      <div className="w-14 h-14 rounded-full bg-[#1B7A56] text-white text-lg
                        font-bold flex items-center justify-center mx-auto mb-2">
                        {(a.user?.full_name ?? 'A').split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                      </div>
                      <p className="font-bold text-gray-900 text-sm">{a.user?.full_name}</p>
                      <div className="flex justify-center mt-1">
                        <Stars note={a.note_moyenne ?? 0} />
                      </div>
                      {a.cin_verifie && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5
                          rounded-full mt-1 inline-block">✓ Vérifié</span>
                      )}
                    </div>
                  ))}
                  {Array.from({ length: 3 - selectionnes.length }).map((_, i) => (
                    <div key={i} className="text-center text-gray-200 text-3xl">+</div>
                  ))}
                </div>

                {/* TABLEAU */}
                <table className="w-full">
                  <tbody className="divide-y divide-gray-50">
                    <CompareRow
                      label="Note globale"
                      values={selectionnes.map(a => `⭐ ${a.note_moyenne?.toFixed(1)}`)}
                      highlight
                    />
                    <CompareRow
                      label="Nombre d'avis"
                      values={selectionnes.map(a => `${a.nb_avis} avis`)}
                    />
                    <CompareRow
                      label="Missions réalisées"
                      values={selectionnes.map(a => `${a.nb_missions} missions`)}
                      highlight
                    />
                    <CompareRow
                      label="Tarif horaire"
                      values={selectionnes.map(a => `${a.tarif_min}–${a.tarif_max} MAD/h`)}
                    />
                    <CompareRow
                      label="Frais déplacement"
                      values={selectionnes.map(a => `${a.frais_deplacement ?? 50} MAD`)}
                      highlight
                    />
                    <CompareRow
                      label="Expérience"
                      values={selectionnes.map(a => `${a.annees_experience ?? 0} ans`)}
                    />
                    <CompareRow
                      label="Ville"
                      values={selectionnes.map(a => a.ville ?? '—')}
                      highlight
                    />
                    <CompareRow
                      label="Rayon intervention"
                      values={selectionnes.map(a => `${a.rayon_km ?? 15} km`)}
                    />
                    <CompareRow
                      label="Disponible"
                      values={selectionnes.map(a => a.disponible)}
                      highlight
                    />
                    <CompareRow
                      label="Devis gratuit"
                      values={selectionnes.map(a => a.devis_gratuit)}
                    />
                    <CompareRow
                      label="Urgences 24h"
                      values={selectionnes.map(a => a.urgences_24h)}
                      highlight
                    />
                    <CompareRow
                      label="Badge"
                      values={selectionnes.map(a =>
                        a.badge === 'elite' ? '👑 Élite' :
                        a.badge === 'verified' ? '⭐ Pro' : '—'
                      )}
                    />
                  </tbody>
                </table>

                {/* BOUTONS */}
                <div className="p-4 border-t border-gray-100"
                  style={{ display: 'grid', gridTemplateColumns: `160px repeat(3, 1fr)`, gap: '16px' }}>
                  <div />
                  {selectionnes.map(a => (
                    <div key={a.id} className="flex flex-col gap-2">
                      <Link href={`/artisans/${a.id}`}
                        className="block text-center bg-[#1B7A56] text-white font-semibold
                          py-2 rounded-xl hover:bg-[#155f42] transition-colors text-sm">
                        Voir profil
                      </Link>
                      <Link href="/demandes/nouvelle"
                        className="block text-center border border-gray-200 text-gray-600
                          font-semibold py-2 rounded-xl hover:bg-gray-50 transition-colors text-sm">
                        Contacter
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
