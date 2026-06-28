'use client'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const NIVEAUX = [
  { id: 'bronze', label: 'Bronze', icon: '🥉', minPoints: 0, couleur: 'text-orange-600 bg-orange-50 border-orange-200', reduction: 0 },
  { id: 'silver', label: 'Silver', icon: '🥈', minPoints: 500, couleur: 'text-gray-500 bg-gray-50 border-gray-200', reduction: 5 },
  { id: 'gold', label: 'Gold', icon: '🥇', minPoints: 1500, couleur: 'text-yellow-600 bg-yellow-50 border-yellow-200', reduction: 10 },
  { id: 'platinum', label: 'Platinum', icon: '💎', minPoints: 3000, couleur: 'text-blue-600 bg-blue-50 border-blue-200', reduction: 15 },
]

export default function FidelitePage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const router = useRouter()

  const [fidelite, setFidelite] = useState<any>(null)
  const [historique, setHistorique] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) { router.push('/auth/login'); return }

     const { data: fideliteArray } = await supabase
  .from('fidelite')
  .select('*')
  .eq('client_id', currentUser.id) as { data: any[] | null }

console.log('fideliteArray:', fideliteArray)
const fideliteData = fideliteArray?.[0] ?? null
console.log('fideliteData:', fideliteData)
      if (!fideliteData) {
        const { data: newFidelite } = await supabase
          .from('fidelite')
          .insert({ client_id: currentUser.id, points: 0, niveau: 'bronze' })
          .select('*')
          .single() as { data: any }
        setFidelite(newFidelite ?? { points: 0, niveau: 'bronze' })
      } else {
        setFidelite(fideliteData)
      }

      const { data: historiqueData } = await supabase
        .from('fidelite_historique')
        .select('*')
        .eq('client_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(20) as { data: any[] | null }

      setHistorique(historiqueData ?? [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center">
        <div className="text-gray-500">Chargement...</div>
      </div>
    )
  }

  const niveauActuel = NIVEAUX.find(n => n.id === fidelite?.niveau) ?? NIVEAUX[0]
  const niveauSuivant = NIVEAUX[NIVEAUX.indexOf(niveauActuel) + 1]
  const pointsActuels = fidelite?.points ?? 0
  const progressPct = niveauSuivant
    ? Math.min(((pointsActuels - niveauActuel.minPoints) / (niveauSuivant.minPoints - niveauActuel.minPoints)) * 100, 100)
    : 100

  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-[#1B7A56]">🔧 BricoMaroc</Link>
        <Link href="/espace-client" className="text-sm text-gray-500 hover:text-gray-800">
          ← Mon espace
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">🎁 Programme fidelite</h1>
          <p className="text-gray-500 text-sm mt-1">
            Gagnez des points a chaque mission et profitez de reductions
          </p>
        </div>

        {/* CARTE NIVEAU */}
        <div className="bg-gradient-to-br from-[#1B7A56] to-[#0f4a33] rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-green-200 text-sm">Votre niveau</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-3xl">{niveauActuel.icon}</span>
                <span className="text-2xl font-bold">{niveauActuel.label}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-green-200 text-sm">Vos points</p>
              <p className="text-4xl font-bold">{pointsActuels}</p>
            </div>
          </div>

          {niveauSuivant && (
            <>
              <div className="flex justify-between text-xs text-green-200 mb-1">
                <span>{niveauActuel.label}</span>
                <span>{niveauSuivant.minPoints - pointsActuels} pts pour {niveauSuivant.label}</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full transition-all"
                  style={{ width: `${progressPct}%` }} />
              </div>
            </>
          )}

          {niveauActuel.reduction > 0 && (
            <div className="mt-4 bg-white/10 rounded-xl px-4 py-2 text-sm">
              Votre reduction actuelle : <strong>{niveauActuel.reduction}%</strong> sur toutes les missions
            </div>
          )}
        </div>

        {/* NIVEAUX */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">Niveaux et avantages</h2>
          <div className="space-y-3">
            {NIVEAUX.map(niveau => {
              const estActuel = niveau.id === fidelite?.niveau
              const estAtteint = pointsActuels >= niveau.minPoints
              return (
                <div key={niveau.id}
                  className={`flex items-center gap-4 p-3 rounded-xl border-2 ${
                    estActuel ? niveau.couleur : estAtteint ? 'border-gray-200 bg-gray-50' : 'border-gray-100 opacity-60'
                  }`}>
                  <span className="text-2xl">{niveau.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900">{niveau.label}</p>
                      {estActuel && (
                        <span className="text-xs bg-[#1B7A56] text-white px-2 py-0.5 rounded-full">
                          Actuel
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      A partir de {niveau.minPoints} points
                      {niveau.reduction > 0 && ` · ${niveau.reduction}% de reduction`}
                    </p>
                  </div>
                  {estAtteint && <span className="text-green-500 font-bold">✓</span>}
                </div>
              )
            })}
          </div>
        </div>

        {/* COMMENT GAGNER */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">Comment gagner des points ?</h2>
          <div className="space-y-3">
            {[
              { icon: '🔧', action: 'Completer une mission', points: '+100 pts' },
              { icon: '⭐', action: 'Laisser un avis', points: '+50 pts' },
              { icon: '💳', action: 'Payer via BricoMaroc', points: '+1 pt / MAD depense' },
              { icon: '🎁', action: 'Parrainer un ami', points: '+200 pts' },
              { icon: '📝', action: 'Completer votre profil', points: '+30 pts' },
            ].map(item => (
              <div key={item.action} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <span className="text-xl">{item.icon}</span>
                <span className="flex-1 text-sm text-gray-700">{item.action}</span>
                <span className="text-sm font-bold text-[#1B7A56]">{item.points}</span>
              </div>
            ))}
          </div>
        </div>

        {/* HISTORIQUE */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Historique des points</h2>
          </div>
          {historique.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-3xl mb-2">🎯</div>
              <p className="text-gray-500 text-sm">Aucun point gagne pour le moment</p>
              <p className="text-gray-400 text-xs mt-1">
                Completez votre premiere mission pour gagner des points !
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {historique.map(h => (
                <div key={h.id} className="px-6 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{h.description}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(h.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <span className={`font-bold text-sm ${
                    h.points > 0 ? 'text-green-600' : 'text-red-500'
                  }`}>
                    {h.points > 0 ? '+' : ''}{h.points} pts
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <Link href="/espace-client"
          className="block text-center text-sm text-[#1B7A56] font-medium hover:underline">
          Retour a mes demandes
        </Link>
      </div>
    </div>
  )
}