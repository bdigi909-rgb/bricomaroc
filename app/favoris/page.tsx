'use client'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function FavorisPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const router = useRouter()

  const [user, setUser] = useState<any>(null)
  const [favoris, setFavoris] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUser(user)

      const { data } = await supabase
        .from('favoris')
        .select('*, artisan:artisans(*, user:users(full_name, avatar_url))')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false }) as { data: any[] | null }

      // Enrichir avec users
      const artisanIds = (data ?? []).map((f: any) => f.artisan?.user_id)
      const { data: usersData } = await supabase
        .from('users')
        .select('*')
        .in('id', artisanIds)
      const usersMap = Object.fromEntries((usersData ?? []).map((u: any) => [u.id, u]))
      const enriched = (data ?? []).map((f: any) => ({
        ...f,
        artisan: { ...f.artisan, user: usersMap[f.artisan?.user_id] ?? null }
      }))

      setFavoris(enriched)
      setLoading(false)
    }
    load()
  }, [])

  async function retirerFavori(favoriId: string) {
    await supabase.from('favoris').delete().eq('id', favoriId)
    setFavoris(prev => prev.filter(f => f.id !== favoriId))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center">
        <div className="text-gray-500">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-[#1B7A56]">🔧 BricoMaroc</Link>
        <Link href="/espace-client" className="text-sm text-gray-500 hover:text-gray-800">← Retour</Link>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mes artisans favoris</h1>
            <p className="text-gray-500 text-sm mt-1">{favoris.length} artisan{favoris.length > 1 ? 's' : ''} sauvegardé{favoris.length > 1 ? 's' : ''}</p>
          </div>
          <Link href="/artisans"
            className="bg-[#1B7A56] text-white font-semibold px-5 py-3 rounded-xl
              hover:bg-[#155f42] transition-colors text-sm">
            + Trouver des artisans
          </Link>
        </div>

        {favoris.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <div className="text-5xl mb-4">❤️</div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Aucun favori pour le moment</h2>
            <p className="text-gray-500 text-sm mb-6">
              Ajoutez des artisans en favoris pour les retrouver facilement.
            </p>
            <Link href="/artisans"
              className="bg-[#1B7A56] text-white font-semibold px-6 py-3 rounded-xl
                hover:bg-[#155f42] transition-colors inline-block">
              Parcourir les artisans
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {favoris.map(favori => {
              const artisan = favori.artisan
              const user = artisan?.user
              const initials = (user?.full_name ?? 'A')
                .split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()

              return (
                <div key={favori.id}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-start gap-4">
                    {/* AVATAR */}
                    <div className="w-14 h-14 rounded-full bg-[#1B7A56] flex items-center
                      justify-center text-white font-bold text-lg flex-shrink-0">
                      {initials}
                    </div>

                    {/* INFOS */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-bold text-gray-900">{user?.full_name ?? 'Artisan'}</h3>
                        {artisan?.cin_verifie && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            ✓ Vérifié
                          </span>
                        )}
                        {artisan?.badge === 'elite' && (
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                            👑 Élite
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mb-2">{artisan?.bio}</p>
                      <div className="flex gap-4 text-xs text-gray-500">
                        <span>⭐ {artisan?.note_moyenne?.toFixed(1)} ({artisan?.nb_avis} avis)</span>
                        <span>✅ {artisan?.nb_missions} missions</span>
                        <span>📍 {artisan?.ville}</span>
                        <span>💰 {artisan?.tarif_min}–{artisan?.tarif_max} MAD/h</span>
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <Link href={`/artisans/${artisan?.id}`}
                        className="bg-[#1B7A56] text-white text-sm font-semibold
                          px-4 py-2 rounded-xl hover:bg-[#155f42] transition-colors text-center">
                        Voir profil
                      </Link>
                      <Link href={`/demandes/nouvelle`}
                        className="bg-orange-500 text-white text-sm font-semibold
                          px-4 py-2 rounded-xl hover:bg-orange-600 transition-colors text-center">
                        Contacter
                      </Link>
                      <button onClick={() => retirerFavori(favori.id)}
                        className="border border-red-200 text-red-500 text-sm font-medium
                          px-4 py-2 rounded-xl hover:bg-red-50 transition-colors">
                        ❤️ Retirer
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
