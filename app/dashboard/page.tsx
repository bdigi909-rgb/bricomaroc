'use client'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Notifications from '@/components/layout/Notifications'

export default function DashboardArtisanPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const router = useRouter()

  const [artisan, setArtisan] = useState<any>(null)
  const [demandes, setDemandes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: artisanData } = await supabase
        .from('artisans')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (!artisanData) { router.push('/'); return }
      setArtisan(artisanData)

      const { data: demandesData } = await supabase
        .from('demandes')
        .select('*, categorie:categories(nom, icone)')
        .eq('statut', 'pending')
        .is('artisan_id', null)
        .order('created_at', { ascending: false })
        .limit(20)

      setDemandes(demandesData ?? [])
      setLoading(false)
    }
    load()
  }, [])

  async function accepterDemande(demandeId: string) {
    await supabase.from('demandes').update({
      artisan_id: artisan.id,
      statut: 'accepted',
    }).eq('id', demandeId)
    setDemandes(prev => prev.filter(d => d.id !== demandeId))
  }

  const urgenceColor: Record<string, string> = {
    normal: 'bg-green-100 text-green-700',
    urgent: 'bg-yellow-100 text-yellow-700',
    very_urgent: 'bg-red-100 text-red-700',
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
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-[#1B7A56]">🔧 BricoMaroc</Link>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">
            {artisan?.disponible ? '🟢 Disponible' : '🔴 Indisponible'}
          </span>
          {artisan?.plan && artisan.plan !== 'free' && (
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${
              artisan.plan === 'elite' ? 'bg-yellow-400 text-gray-900' : 'bg-[#1B7A56] text-white'
            }`}>
              {artisan.plan === 'elite' ? '👑 Élite' : '⭐ Pro'}
            </span>
          )}
          <Link href="/profil"
            className="text-xs border border-gray-200 text-gray-600 font-semibold
              px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
            👤 Mon profil
          </Link>
          <Link href="/parrainage"
            className="text-xs border border-gray-200 text-gray-600 font-semibold
              px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
            🎁 Parrainage
          </Link>
          <Link href="/carte-id"
  className="text-xs border border-gray-200 text-gray-600 font-semibold
    px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
  🪪 Ma carte
</Link>
          <Link href="/premium"
            className="text-xs bg-yellow-400 text-gray-900 font-semibold
              px-3 py-1.5 rounded-lg hover:bg-yellow-500 transition-colors">
            ⭐ Premium
          </Link>
          <Link href="/dashboard/finances"
  className="text-xs border border-gray-200 text-gray-600 font-semibold
    px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
  💰 Finances
</Link>
<Link href="/dashboard/agenda"
  className="text-xs border border-gray-200 text-gray-600 font-semibold
    px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
  📅 Agenda
</Link>
          {artisan && <Notifications userId={artisan.user_id} />}
          <button onClick={async () => {
            await supabase.auth.signOut()
            router.push('/')
          }} className="text-xs text-red-500 hover:text-red-700">
            Déconnexion
          </button>
        </div>
             </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Note moyenne', value: artisan?.note_moyenne?.toFixed(1) ?? '0.0', icon: '⭐' },
            { label: 'Missions', value: artisan?.nb_missions ?? 0, icon: '✅' },
            { label: 'Avis', value: artisan?.nb_avis ?? 0, icon: '💬' },
            { label: 'Wallet', value: `${artisan?.solde_wallet ?? 0} MAD`, icon: '💰' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl p-4 shadow-sm text-center">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        <h2 className="font-bold text-gray-900 text-lg mb-4">
          Nouvelles demandes ({demandes.length})
        </h2>

        {demandes.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-gray-500">Aucune nouvelle demande pour le moment</p>
          </div>
        ) : (
          <div className="space-y-4">
            {demandes.map(demande => (
              <div key={demande.id}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="text-lg">{demande.categorie?.icone}</span>
                      <h3 className="font-bold text-gray-900">{demande.titre}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                        ${urgenceColor[demande.urgence]}`}>
                        {urgenceLabel[demande.urgence]}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{demande.description}</p>
                    <div className="flex gap-4 text-xs text-gray-500 flex-wrap">
                      <span>📍 {demande.quartier || demande.adresse}</span>
                      {demande.budget_min && (
                        <span>💰 {demande.budget_min}–{demande.budget_max} MAD</span>
                      )}
                      <span>🕐 {new Date(demande.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button onClick={() => accepterDemande(demande.id)}
                      className="bg-[#1B7A56] text-white text-sm font-semibold
                        px-4 py-2 rounded-xl hover:bg-[#155f42] transition-colors">
                      ✓ Accepter
                    </button>
                    <Link href={`/dashboard/devis/${demande.id}`}
                      className="bg-orange-500 text-white text-sm font-semibold
                        px-4 py-2 rounded-xl hover:bg-orange-600 transition-colors text-center">
                      📋 Devis
                    </Link>
                    <Link href={`/messages/${demande.id}`}
                      className="border border-gray-200 text-gray-600 text-sm font-semibold
                        px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors text-center">
                      💬 Message
                    </Link>
                    <Link href={`/suivi/${demande.id}`}
                      className="border border-blue-200 text-blue-600 text-sm font-semibold
                        px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors text-center">
                      📍 Suivi
                    </Link>
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