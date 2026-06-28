'use client'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { exportToCsv } from '@/lib/exportCsv'

const ADMIN_EMAIL = 'bdigi909@gmail.com'

export default function AdminStatsPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>({})
  const [topArtisans, setTopArtisans] = useState<any[]>([])
  const [demandesParMois, setDemandesParMois] = useState<any[]>([])
  const [caParMois, setCaParMois] = useState<any[]>([])
  const [categoriesStats, setCategoriesStats] = useState<any[]>([])
  const [conversionStats, setConversionStats] = useState<any>({})
  const [paiements, setPaiements] = useState<any[]>([])
  const [onglet, setOnglet] = useState<'overview' | 'revenus' | 'artisans'>('overview')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.email !== ADMIN_EMAIL) { router.push('/'); return }

      const [artisansRes, demandesRes, usersRes, avisRes, paiementsRes] = await Promise.all([
        supabase.from('artisans').select('id, statut, note_moyenne, nb_missions, plan, created_at, user_id, ville'),
        supabase.from('demandes').select('id, statut, created_at, categorie_id'),
        supabase.from('users').select('id, role, created_at'),
        supabase.from('avis').select('note_globale, created_at'),
        supabase.from('paiements').select('montant_total, created_at, statut, client_id, artisan_id'),
      ])

      const demandes = demandesRes.data ?? []
      const artisans = artisansRes.data ?? []
      const users = usersRes.data ?? []
      const avis = avisRes.data ?? []
      const paiementsData = paiementsRes.data ?? []
      setPaiements(paiementsData)

      const caTotal = paiementsData.reduce((sum: number, p: any) => sum + (p.montant_total ?? 0), 0)
      const caCommission = Math.round(caTotal * 0.1 / 100)
      const demandesTotal = demandes.length
      const demandesTerminees = demandes.filter((d: any) => d.statut === 'completed').length
      const tauxCompletion = demandesTotal > 0 ? Math.round(demandesTerminees / demandesTotal * 100) : 0
      const notes = avis.map((a: any) => a.note_globale).filter(Boolean)
      const noteMoyenne = notes.length > 0
        ? (notes.reduce((a: number, b: number) => a + b, 0) / notes.length).toFixed(1)
        : '0.0'

      setStats({
        caTotal: Math.round(caTotal / 100),
        caCommission,
        nbArtisans: artisans.length,
        nbArtisansVerifies: artisans.filter((a: any) => a.statut === 'verified').length,
        nbArtisansPremium: artisans.filter((a: any) => a.plan && a.plan !== 'free').length,
        nbDemandes: demandesTotal,
        nbClients: users.filter((u: any) => u.role === 'client').length,
        tauxCompletion,
        noteMoyenne,
        nbAvis: avis.length,
        nbPaiements: paiementsData.length,
        panierMoyen: paiementsData.length > 0 ? Math.round(caTotal / paiementsData.length / 100) : 0,
      })

      setConversionStats({
        pending: demandes.filter((d: any) => d.statut === 'pending').length,
        accepted: demandes.filter((d: any) => d.statut === 'accepted').length,
        in_progress: demandes.filter((d: any) => d.statut === 'in_progress').length,
        completed: demandesTerminees,
        cancelled: demandes.filter((d: any) => d.statut === 'cancelled').length,
      })

      // Demandes et CA par mois (6 derniers mois)
      const mois = []
      const caM = []
      for (let i = 5; i >= 0; i--) {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        const label = date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })
        const moisNum = date.getMonth()
        const anneeNum = date.getFullYear()
        const count = demandes.filter((d: any) => {
          const d2 = new Date(d.created_at)
          return d2.getMonth() === moisNum && d2.getFullYear() === anneeNum
        }).length
        const ca = paiementsData.filter((p: any) => {
          const d2 = new Date(p.created_at)
          return d2.getMonth() === moisNum && d2.getFullYear() === anneeNum
        }).reduce((sum: number, p: any) => sum + (p.montant_total ?? 0), 0) / 100
        mois.push({ label, count })
        caM.push({ label, ca: Math.round(ca) })
      }
      setDemandesParMois(mois)
      setCaParMois(caM)

      // Top artisans
      const artisansTries = [...artisans].sort((a: any, b: any) => b.nb_missions - a.nb_missions).slice(0, 5)
      const userIds2 = artisansTries.map((a: any) => a.user_id)
      const { data: topUsers } = await supabase.from('users').select('id, full_name').in('id', userIds2)
      const topUsersMap = Object.fromEntries((topUsers ?? []).map((u: any) => [u.id, u]))
      setTopArtisans(artisansTries.map((a: any) => ({ ...a, user: topUsersMap[a.user_id] ?? null })))

      // Stats categories
      const { data: cats } = await supabase.from('categories').select('id, nom, icone') as { data: any[] | null }
      const catsStats = (cats ?? []).map((cat: any) => ({
        ...cat,
        count: demandes.filter((d: any) => d.categorie_id === cat.id).length,
      })).sort((a: any, b: any) => b.count - a.count)
      setCategoriesStats(catsStats)

      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Chargement des statistiques...</div>
      </div>
    )
  }

  const maxDemandes = Math.max(...demandesParMois.map(m => m.count), 1)
  const maxCA = Math.max(...caParMois.map(m => m.ca), 1)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-[#1B7A56]">BricoMaroc</span>
          <span className="text-gray-400 text-sm">/ Admin / Statistiques</span>
        </div>
        <Link href="/admin" className="text-xs text-gray-400 hover:text-white">
          Admin
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">

        {/* ONGLETS */}
        <div className="flex gap-2">
          {[
            { key: 'overview', label: 'Vue generale' },
            { key: 'revenus', label: 'Revenus detailles' },
            { key: 'artisans', label: 'Top artisans' },
          ].map(o => (
            <button key={o.key} onClick={() => setOnglet(o.key as any)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                onglet === o.key
                  ? 'bg-[#1B7A56] text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}>
              {o.label}
            </button>
          ))}
        </div>

        {/* VUE GENERALE */}
        {onglet === 'overview' && (
          <div className="space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'CA Total', value: `${stats.caTotal} MAD`, icon: '💰', color: 'bg-green-50 border-green-200' },
                { label: 'Commission (10%)', value: `${stats.caCommission} MAD`, icon: '📊', color: 'bg-blue-50 border-blue-200' },
                { label: 'Paiements', value: stats.nbPaiements, icon: '💳', color: 'bg-purple-50 border-purple-200' },
                { label: 'Panier moyen', value: `${stats.panierMoyen} MAD`, icon: '🛒', color: 'bg-yellow-50 border-yellow-200' },
              ].map(s => (
                <div key={s.label} className={`${s.color} border rounded-2xl p-4 text-center`}>
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <div className="text-2xl font-bold text-gray-900">{s.value}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Artisans', value: stats.nbArtisans, icon: '🔧', color: 'bg-green-50 border-green-200' },
                { label: 'Clients', value: stats.nbClients, icon: '👥', color: 'bg-blue-50 border-blue-200' },
                { label: 'Demandes', value: stats.nbDemandes, icon: '📋', color: 'bg-orange-50 border-orange-200' },
                { label: 'Note moyenne', value: `${stats.noteMoyenne}⭐`, icon: '🌟', color: 'bg-yellow-50 border-yellow-200' },
              ].map(s => (
                <div key={s.label} className={`${s.color} border rounded-2xl p-4 text-center`}>
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <div className="text-2xl font-bold text-gray-900">{s.value}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            {/* GRAPHIQUE DEMANDES */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-6">Demandes par mois</h2>
              <div className="flex items-end gap-3 h-40">
                {demandesParMois.map(m => (
                  <div key={m.label} className="flex-1 flex flex-col items-center gap-1">
                    {m.count > 0 && (
                      <span className="text-xs font-semibold text-gray-600">{m.count}</span>
                    )}
                    <div className="w-full bg-[#1B7A56] rounded-t-lg transition-all"
                      style={{ height: `${Math.max((m.count / maxDemandes) * 120, m.count > 0 ? 8 : 2)}px` }} />
                    <span className="text-xs text-gray-400">{m.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* FUNNEL CONVERSION */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-4">Funnel de conversion</h2>
              <div className="space-y-3">
                {[
                  { label: 'Demandes en attente', value: conversionStats.pending, color: 'bg-yellow-400' },
                  { label: 'Demandes acceptees', value: conversionStats.accepted, color: 'bg-blue-400' },
                  { label: 'En cours', value: conversionStats.in_progress, color: 'bg-purple-400' },
                  { label: 'Terminees', value: conversionStats.completed, color: 'bg-green-500' },
                  { label: 'Annulees', value: conversionStats.cancelled, color: 'bg-red-400' },
                ].map(f => (
                  <div key={f.label} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-36">{f.label}</span>
                    <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${f.color} rounded-full transition-all`}
                        style={{ width: `${Math.max((f.value / (stats.nbDemandes || 1)) * 100, 2)}%` }} />
                    </div>
                    <span className="text-xs font-bold text-gray-900 w-6">{f.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CATEGORIES */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-4">Demandes par categorie</h2>
              <div className="space-y-3">
                {categoriesStats.filter((c: any) => c.count > 0).map((cat: any) => (
                  <div key={cat.id} className="flex items-center gap-3">
                    <span className="text-lg w-6">{cat.icone}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600">{cat.nom}</span>
                        <span className="font-semibold text-gray-900">{cat.count}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#1B7A56] rounded-full"
                          style={{ width: `${(cat.count / Math.max(...categoriesStats.map((c: any) => c.count), 1)) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* REVENUS DETAILLES */}
        {onglet === 'revenus' && (
          <div className="space-y-6">
            {/* KPIs revenus */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-[#1B7A56] to-[#0f4a33] rounded-2xl p-6 text-white col-span-1">
                <p className="text-green-200 text-sm mb-1">CA Total BricoMaroc</p>
                <p className="text-4xl font-bold">{stats.caTotal} MAD</p>
                <p className="text-green-300 text-xs mt-2">{stats.nbPaiements} paiements</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
                <p className="text-gray-500 text-sm mb-1">Commission percue</p>
                <p className="text-3xl font-bold text-[#1B7A56]">{stats.caCommission} MAD</p>
                <p className="text-gray-400 text-xs mt-2">10% du CA total</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
                <p className="text-gray-500 text-sm mb-1">Panier moyen</p>
                <p className="text-3xl font-bold text-gray-900">{stats.panierMoyen} MAD</p>
                <p className="text-gray-400 text-xs mt-2">par mission</p>
              </div>
            </div>

            {/* GRAPHIQUE CA MENSUEL */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-gray-900">CA mensuel (6 derniers mois)</h2>
                <button onClick={() => exportToCsv('ca-mensuel', caParMois)}
                  className="text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600">
                  Exporter CSV
                </button>
              </div>
              <div className="flex items-end gap-3 h-48">
                {caParMois.map(m => (
                  <div key={m.label} className="flex-1 flex flex-col items-center gap-1">
                    {m.ca > 0 && (
                      <span className="text-xs font-semibold text-gray-600">{m.ca}</span>
                    )}
                    <div className="w-full bg-[#1B7A56] rounded-t-lg transition-all"
                      style={{ height: `${Math.max((m.ca / maxCA) * 160, m.ca > 0 ? 8 : 2)}px` }} />
                    <span className="text-xs text-gray-400">{m.label}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-sm">
                <span className="text-gray-500">Total 6 mois</span>
                <span className="font-bold text-gray-900">
                  {caParMois.reduce((sum, m) => sum + m.ca, 0)} MAD
                </span>
              </div>
            </div>

            {/* HISTORIQUE PAIEMENTS */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-bold text-gray-900">
                  Historique paiements ({paiements.length})
                </h2>
                <button onClick={() => exportToCsv('paiements', paiements.map(p => ({
                  montant: ((p.montant_total ?? 0) / 100).toFixed(0) + ' MAD',
                  statut: p.statut,
                  date: new Date(p.created_at).toLocaleDateString('fr-FR'),
                })))}
                  className="text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600">
                  Exporter CSV
                </button>
              </div>
              {paiements.length === 0 ? (
                <div className="p-8 text-center text-gray-400">Aucun paiement</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-6 py-3 font-semibold text-gray-600">Date</th>
                      <th className="text-left px-6 py-3 font-semibold text-gray-600">Montant</th>
                      <th className="text-left px-6 py-3 font-semibold text-gray-600">Commission</th>
                      <th className="text-left px-6 py-3 font-semibold text-gray-600">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {paiements.slice(0, 20).map(p => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-6 py-3 text-gray-500">
                          {new Date(p.created_at).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-3 font-bold text-gray-900">
                          {((p.montant_total ?? 0) / 100).toFixed(0)} MAD
                        </td>
                        <td className="px-6 py-3 text-[#1B7A56] font-semibold">
                          {((p.montant_total ?? 0) / 100 * 0.1).toFixed(0)} MAD
                        </td>
                        <td className="px-6 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            p.statut === 'released' ? 'bg-green-100 text-green-700' :
                            p.statut === 'held' ? 'bg-blue-100 text-blue-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {p.statut === 'released' ? 'Paye' :
                             p.statut === 'held' ? 'En attente' : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* TOP ARTISANS */}
        {onglet === 'artisans' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">Top artisans par missions</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {topArtisans.map((a, i) => (
                  <div key={a.id} className="px-6 py-4 flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center
                      text-sm font-bold text-white ${
                      i === 0 ? 'bg-yellow-400' :
                      i === 1 ? 'bg-gray-400' :
                      i === 2 ? 'bg-orange-400' : 'bg-gray-300'
                    }`}>
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{a.user?.full_name ?? 'N/A'}</p>
                      <p className="text-xs text-gray-500">{a.ville} — Plan {a.plan}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{a.nb_missions} missions</p>
                      <p className="text-xs text-gray-500">Note : {a.note_moyenne?.toFixed(1)}</p>
                    </div>
                    <Link href={`/artisans/${a.id}`}
                      className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg
                        hover:bg-[#1B7A56] hover:text-white transition-colors">
                      Voir profil
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* ARTISANS PAR PLAN */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-4">Repartition par plan</h2>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { plan: 'free', label: 'Gratuit', color: 'bg-gray-100 text-gray-700' },
                  { plan: 'pro', label: 'Pro', color: 'bg-blue-100 text-blue-700' },
                  { plan: 'elite', label: 'Elite', color: 'bg-yellow-100 text-yellow-700' },
                ].map(p => (
                  <div key={p.plan} className={`${p.color} rounded-xl p-4 text-center`}>
                    <p className="text-2xl font-bold">{stats.nbArtisans}</p>
                    <p className="text-sm font-medium mt-1">{p.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}