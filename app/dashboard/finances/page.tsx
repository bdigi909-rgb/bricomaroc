'use client'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { generateFacturePDF } from '@/lib/generateFacture'

export default function FinancesPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const router = useRouter()

  const [artisan, setArtisan] = useState<any>(null)
  const [artisanUser, setArtisanUser] = useState<any>(null)
  const [paiements, setPaiements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [periode, setPeriode] = useState<'semaine' | 'mois' | 'annee'>('mois')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: artisanData } = await supabase
        .from('artisans').select('*').eq('user_id', user.id).single() as { data: any }
      if (!artisanData) { router.push('/'); return }
      setArtisan(artisanData)

      const { data: userData } = await supabase
        .from('users').select('*').eq('id', user.id).single() as { data: any }
      setArtisanUser(userData)

      const { data: paiementsData } = await supabase
        .from('paiements')
        .select('*, demande:demandes(titre, client_id)')
        .eq('artisan_id', artisanData.id)
        .order('created_at', { ascending: false }) as { data: any[] | null }

      setPaiements(paiementsData ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const maintenant = new Date()

  function filtrerParPeriode(paiements: any[]) {
    return paiements.filter(p => {
      const date = new Date(p.created_at)
      if (periode === 'semaine') {
        const il7jours = new Date()
        il7jours.setDate(il7jours.getDate() - 7)
        return date >= il7jours
      }
      if (periode === 'mois') {
        return date.getMonth() === maintenant.getMonth() &&
               date.getFullYear() === maintenant.getFullYear()
      }
      return date.getFullYear() === maintenant.getFullYear()
    })
  }

  const paiementsFiltres = filtrerParPeriode(paiements)
  const caTotal = paiements.reduce((sum, p) => sum + (p.montant_total ?? 0), 0) / 100
  const caPeriode = paiementsFiltres.reduce((sum, p) => sum + (p.montant_total ?? 0), 0) / 100
  const commission = 0.1
  const caNet = caPeriode * (1 - commission)
  const nbMissions = paiementsFiltres.length
  const panierMoyen = nbMissions > 0 ? caPeriode / nbMissions : 0

  const moisLabels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
    'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']

  const caParMois = moisLabels.map((label, i) => {
    const total = paiements
      .filter(p => {
        const d = new Date(p.created_at)
        return d.getMonth() === i && d.getFullYear() === maintenant.getFullYear()
      })
      .reduce((sum, p) => sum + (p.montant_total ?? 0), 0) / 100
    return { label, total }
  })

  const maxCA = Math.max(...caParMois.map(m => m.total), 1)

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
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-800">← Dashboard</Link>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">💰 Tableau financier</h1>
          <div className="flex gap-2">
            {(['semaine', 'mois', 'annee'] as const).map(p => (
              <button key={p} onClick={() => setPeriode(p)}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                  periode === p ? 'bg-[#1B7A56] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}>
                {p === 'semaine' ? '7 jours' : p === 'mois' ? 'Ce mois' : 'Cette année'}
              </button>
            ))}
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'CA brut', value: `${caPeriode.toFixed(0)} MAD`, icon: '💰', color: 'bg-green-50 border-green-200' },
            { label: 'CA net (après commission)', value: `${caNet.toFixed(0)} MAD`, icon: '✅', color: 'bg-blue-50 border-blue-200' },
            { label: 'Missions payées', value: nbMissions, icon: '🔧', color: 'bg-purple-50 border-purple-200' },
            { label: 'Panier moyen', value: `${panierMoyen.toFixed(0)} MAD`, icon: '📊', color: 'bg-yellow-50 border-yellow-200' },
          ].map(kpi => (
            <div key={kpi.label} className={`${kpi.color} border rounded-2xl p-4 text-center`}>
              <div className="text-2xl mb-1">{kpi.icon}</div>
              <div className="text-xl font-bold text-gray-900">{kpi.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* RÉSUMÉ GLOBAL */}
        <div className="bg-gradient-to-br from-[#1B7A56] to-[#155f42] rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-sm">CA total depuis le début</p>
              <p className="text-4xl font-bold mt-1">{caTotal.toFixed(0)} MAD</p>
              <p className="text-green-200 text-sm mt-1">
                {paiements.length} paiements · {artisan?.nb_missions ?? 0} missions totales
              </p>
            </div>
            <div className="text-right">
              <p className="text-green-200 text-sm">Commission BricoMaroc</p>
              <p className="text-2xl font-bold">{(caTotal * commission).toFixed(0)} MAD</p>
              <p className="text-green-200 text-sm mt-1">
                Plan {artisan?.plan ?? 'free'} — {commission * 100}%
              </p>
            </div>
          </div>
        </div>

        {/* GRAPHIQUE */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-6">📈 CA mensuel {maintenant.getFullYear()}</h2>
          <div className="flex items-end gap-2 h-40">
            {caParMois.map(m => (
              <div key={m.label} className="flex-1 flex flex-col items-center gap-1">
                {m.total > 0 && (
                  <span className="text-xs font-semibold text-gray-600">{m.total.toFixed(0)}</span>
                )}
                <div
                  className={`w-full rounded-t-lg transition-all ${
                    m.label === moisLabels[maintenant.getMonth()]
                      ? 'bg-[#1B7A56]' : 'bg-green-200'
                  }`}
                  style={{ height: `${Math.max((m.total / maxCA) * 120, m.total > 0 ? 8 : 2)}px` }}
                />
                <span className="text-xs text-gray-400">{m.label}</span>
              </div>
            ))}
          </div>
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
              <p className="text-gray-500">Aucun paiement pour le moment</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Mission</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Date</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Montant brut</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Commission</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Net reçu</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Statut</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Facture</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paiements.map(p => {
                  const montant = (p.montant_total ?? 0) / 100
                  const comm = montant * commission
                  const net = montant - comm
                  return (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 font-medium text-gray-900">
                        {p.demande?.titre ?? 'Mission'}
                      </td>
                      <td className="px-6 py-3 text-gray-500">
                        {new Date(p.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-3 font-semibold text-gray-900">
                        {montant.toFixed(0)} MAD
                      </td>
                      <td className="px-6 py-3 text-red-500">
                        -{comm.toFixed(0)} MAD
                      </td>
                      <td className="px-6 py-3 font-bold text-[#1B7A56]">
                        {net.toFixed(0)} MAD
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
                          onClick={() => generateFacturePDF({
                            numero: p.id.substring(0, 8).toUpperCase(),
                            date: new Date(p.created_at).toLocaleDateString('fr-FR'),
                            artisanNom: artisanUser?.full_name ?? 'Artisan',
                            artisanVille: artisan?.ville ?? 'Maroc',
                            artisanPhone: artisanUser?.phone ?? '',
                            clientNom: 'Client BricoMaroc',
                            missionTitre: p.demande?.titre ?? 'Mission',
                            montantBrut: montant,
                            commission: comm,
                            montantNet: net,
                            statut: p.statut,
                          })}
                          className="text-xs bg-gray-100 text-gray-600 font-medium px-3 py-1.5
                            rounded-lg hover:bg-[#1B7A56] hover:text-white transition-colors">
                          📄 PDF
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* CONSEILS */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-3">💡 Optimisez vos revenus</h2>
          <div className="space-y-2">
            {[
              { icon: '⭐', text: 'Passez au plan Pro pour réduire votre commission à 8%', href: '/premium' },
              { icon: '👑', text: 'Le plan Élite réduit la commission à 5% — idéal pour les artisans actifs', href: '/premium' },
              { icon: '📸', text: 'Ajoutez des photos à votre portfolio pour attirer plus de clients', href: '/profil' },
              { icon: '🎁', text: 'Parrainez des artisans pour réduire encore votre commission', href: '/parrainage' },
            ].map(conseil => (
              <Link key={conseil.text} href={conseil.href}
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <span className="text-lg flex-shrink-0">{conseil.icon}</span>
                <span className="text-sm text-gray-600">{conseil.text}</span>
                <span className="text-[#1B7A56] ml-auto flex-shrink-0">→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}