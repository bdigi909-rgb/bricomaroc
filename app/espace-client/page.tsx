'use client'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function EspaceClientPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const router = useRouter()

  const [user, setUser] = useState<any>(null)
  const [demandes, setDemandes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [onglet, setOnglet] = useState<'pending' | 'accepted' | 'completed'>('pending')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUser(user)

      const { data } = await supabase
        .from('demandes')
        .select(`
          *,
          categorie:categories(nom, icone),
          artisan:artisans(
            note_moyenne,
            tarif_min,
            tarif_max,
            user_id
          )
        `)
        .eq('client_id', user.id)
        .order('created_at', { ascending: false })

      setDemandes(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  async function annulerDemande(demandeId: string) {
    await supabase.from('demandes').update({
      statut: 'cancelled',
    }).eq('id', demandeId)
    setDemandes(prev => prev.map(d =>
      d.id === demandeId ? { ...d, statut: 'cancelled' } : d
    ))
  }

  const demandesFiltrees = demandes.filter(d => {
    if (onglet === 'pending') return d.statut === 'pending'
    if (onglet === 'accepted') return d.statut === 'accepted' || d.statut === 'in_progress'
    return d.statut === 'completed' || d.statut === 'cancelled'
  })

  const statutBadge: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    accepted: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  }
  const statutLabel: Record<string, string> = {
    pending: '⏳ En attente',
    accepted: '✅ Acceptée',
    in_progress: '🔧 En cours',
    completed: '✅ Terminée',
    cancelled: '❌ Annulée',
  }
  const urgenceLabel: Record<string, string> = {
    normal: '🟢 Normal',
    urgent: '🟡 Urgent',
    very_urgent: '🔴 Très urgent',
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
      {/* NAVBAR */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-[#1B7A56]">🔧 BricoMaroc</Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">👤 {user?.email}</span>
          <Link href="/demandes/nouvelle"
            className="bg-[#1B7A56] text-white text-sm font-semibold
              px-4 py-2 rounded-xl hover:bg-[#155f42] transition-colors">
            + Nouvelle demande
          </Link>
          <button onClick={async () => {
            await supabase.auth.signOut()
            router.push('/')
          }} className="text-xs text-red-500 hover:text-red-700">
            Déconnexion
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mes demandes</h1>
            <p className="text-gray-500 text-sm mt-1">
              {demandes.length} demande{demandes.length > 1 ? 's' : ''} au total
            </p>
          </div>
          <Link href="/demandes/nouvelle"
            className="bg-[#1B7A56] text-white font-semibold px-5 py-3 rounded-xl
              hover:bg-[#155f42] transition-colors">
            + Nouvelle demande
          </Link>
        </div>

        {/* STATS RAPIDES */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'En attente', count: demandes.filter(d => d.statut === 'pending').length, color: 'text-yellow-600', bg: 'bg-yellow-50' },
            { label: 'En cours', count: demandes.filter(d => d.statut === 'accepted' || d.statut === 'in_progress').length, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Terminées', count: demandes.filter(d => d.statut === 'completed').length, color: 'text-green-600', bg: 'bg-green-50' },
          ].map(stat => (
            <div key={stat.label} className={`${stat.bg} rounded-2xl p-4 text-center`}>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.count}</div>
              <div className="text-sm text-gray-600 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* ONGLETS */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'pending', label: 'En attente' },
            { key: 'accepted', label: 'En cours' },
            { key: 'completed', label: 'Terminées' },
          ].map(tab => (
            <button key={tab.key}
              onClick={() => setOnglet(tab.key as any)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                onglet === tab.key
                  ? 'bg-[#1B7A56] text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}>
              {tab.label}
              <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                onglet === tab.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {demandes.filter(d => {
                  if (tab.key === 'pending') return d.statut === 'pending'
                  if (tab.key === 'accepted') return d.statut === 'accepted' || d.statut === 'in_progress'
                  return d.statut === 'completed' || d.statut === 'cancelled'
                }).length}
              </span>
            </button>
          ))}
        </div>

        {/* LISTE */}
        {demandesFiltrees.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-gray-500 mb-4">Aucune demande ici</p>
            <Link href="/demandes/nouvelle"
              className="bg-[#1B7A56] text-white font-semibold px-6 py-3 rounded-xl
                hover:bg-[#155f42] transition-colors inline-block">
              Poster une demande
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {demandesFiltrees.map(demande => (
              <div key={demande.id}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* HEADER */}
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="text-lg">{demande.categorie?.icone}</span>
                      <h3 className="font-bold text-gray-900">{demande.titre}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium
                        ${statutBadge[demande.statut]}`}>
                        {statutLabel[demande.statut]}
                      </span>
                      <span className="text-xs text-gray-400">
                        {urgenceLabel[demande.urgence]}
                      </span>
                    </div>

                    {/* DESCRIPTION */}
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {demande.description}
                    </p>

                    {/* INFOS */}
                    <div className="flex gap-4 text-xs text-gray-500 flex-wrap">
                      <span>📍 {demande.quartier || demande.adresse}</span>
                      {demande.budget_min && (
                        <span>💰 {demande.budget_min}–{demande.budget_max} MAD</span>
                      )}
                      {demande.date_souhaitee && (
                        <span>📅 {new Date(demande.date_souhaitee).toLocaleDateString('fr-FR')}</span>
                      )}
                      <span>🕐 {new Date(demande.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>

                    {/* ARTISAN ASSIGNÉ */}
                    {demande.artisan && demande.statut !== 'pending' && (
                      <div className="mt-3 p-3 bg-green-50 rounded-xl text-sm">
                        <span className="font-medium text-green-700">
                          ✅ Artisan assigné — {demande.artisan.note_moyenne?.toFixed(1)}⭐
                          · {demande.artisan.tarif_min}–{demande.artisan.tarif_max} MAD/h
                        </span>
                      </div>
                    )}
                  </div>

                  {/* ACTIONS */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {demande.statut === 'pending' && (
                      <button onClick={() => annulerDemande(demande.id)}
                        className="text-xs border border-red-200 text-red-500 font-medium
                          px-3 py-2 rounded-xl hover:bg-red-50 transition-colors">
                        Annuler
                      </button>
                    )}
                    {demande.statut === 'completed' && (
                      <span className="text-xs text-green-600 font-medium">✅ Terminée</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}