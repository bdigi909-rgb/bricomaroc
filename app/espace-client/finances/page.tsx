'use client'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { generateFactureClientPDF } from '@/lib/generateFactureClient'

export default function FinancesClientPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const router = useRouter()

  const [user, setUser] = useState<any>(null)
  const [paiements, setPaiements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) { router.push('/auth/login'); return }
      setUser(currentUser)

      const { data: paiementsData } = await supabase
        .from('paiements')
        .select('*, demande:demandes(titre, artisan_id), artisan:artisans(ville, user_id)')
        .eq('client_id', currentUser.id)
        .order('created_at', { ascending: false }) as { data: any[] | null }

      // Enrichir avec noms artisans
      const artisanUserIds = (paiementsData ?? []).map(p => p.artisan?.user_id).filter(Boolean)
      const { data: usersData } = await supabase
        .from('users').select('id, full_name').in('id', artisanUserIds)
      const usersMap = Object.fromEntries((usersData ?? []).map((u: any) => [u.id, u]))

      const enriched = (paiementsData ?? []).map(p => ({
        ...p,
        artisanNom: usersMap[p.artisan?.user_id]?.full_name ?? 'Artisan',
      }))

      setPaiements(enriched)
      setLoading(false)
    }
    load()
  }, [])

  const totalDepense = paiements.reduce((sum, p) => sum + (p.montant_total ?? 0), 0) / 100
  const nbMissions = paiements.length
  const panierMoyen = nbMissions > 0 ? totalDepense / nbMissions : 0

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
        <Link href="/espace-client" className="text-sm text-gray-500 hover:text-gray-800">
          ← Mes demandes
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">💳 Mes paiements</h1>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total dépensé', value: `${totalDepense.toFixed(0)} MAD`, icon: '💰', color: 'bg-blue-50 border-blue-200' },
            { label: 'Missions payées', value: nbMissions, icon: '✅', color: 'bg-green-50 border-green-200' },
            { label: 'Panier moyen', value: `${panierMoyen.toFixed(0)} MAD`, icon: '📊', color: 'bg-purple-50 border-purple-200' },
          ].map(kpi => (
            <div key={kpi.label} className={`${kpi.color} border rounded-2xl p-5 text-center`}>
              <div className="text-2xl mb-2">{kpi.icon}</div>
              <div className="text-2xl font-bold text-gray-900">{kpi.value}</div>
              <div className="text-xs text-gray-500 mt-1">{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* HISTORIQUE */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">
              Historique des paiements ({paiements.length})
            </h2>
          </div>

          {paiements.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl mb-3">💳</div>
              <p className="text-gray-500 mb-4">Aucun paiement pour le moment</p>
              <Link href="/artisans"
                className="bg-[#1B7A56] text-white font-semibold px-6 py-3 rounded-xl
                  hover:bg-[#155f42] transition-colors inline-block">
                Trouver un artisan
              </Link>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Mission</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Artisan</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Date</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Montant</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Statut</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Facture</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paiements.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium text-gray-900">
                      {p.demande?.titre ?? 'Mission'}
                    </td>
                    <td className="px-6 py-3 text-gray-500">{p.artisanNom}</td>
                    <td className="px-6 py-3 text-gray-500">
                      {new Date(p.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-3 font-bold text-gray-900">
                      {((p.montant_total ?? 0) / 100).toFixed(0)} MAD
                    </td>
                    <td className="px-6 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        p.statut === 'released' ? 'bg-green-100 text-green-700' :
                        p.statut === 'held' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {p.statut === 'released' ? '✅ Payé' :
                         p.statut === 'held' ? '🔒 En attente' : '⏳ Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-3">
  <button
    onClick={() => generateFactureClientPDF({
      numero: p.id.substring(0, 8).toUpperCase(),
      date: new Date(p.created_at).toLocaleDateString('fr-FR'),
      clientNom: user?.email ?? 'Client',
      clientVille: 'Maroc',
      artisanNom: p.artisanNom ?? 'Artisan',
      artisanVille: 'Maroc',
      missionTitre: p.demande?.titre ?? 'Mission',
      montant: (p.montant_total ?? 0) / 100,
      statut: p.statut,
    })}
    className="text-xs bg-gray-100 text-gray-600 font-medium px-3 py-1.5
      rounded-lg hover:bg-[#1B7A56] hover:text-white transition-colors">
    📄 PDF
  </button>
</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* CONSEILS */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-3">💡 Conseils</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Demandez toujours un devis écrit avant de valider une mission</p>
            <p>• Comparez 2-3 artisans avant de choisir</p>
            <p>• Laissez un avis après chaque mission pour aider la communauté</p>
            <p>• En cas de litige, contactez notre support</p>
          </div>
        </div>
      </div>
    </div>
  )
}
