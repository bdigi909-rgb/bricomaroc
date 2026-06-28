'use client'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AvisAdmin from '@/components/admin/AvisAdmin'
import SignalementsAdmin from '@/components/admin/SignalementsAdmin'
import NewsletterAdmin from '@/components/admin/NewsletterAdmin'
import LogsAdmin from '@/components/admin/LogsAdmin'
import { exportToCsv } from '@/lib/exportCsv'
import RemboursementsAdmin from '@/components/admin/RemboursementsAdmin'

const ADMIN_EMAIL = 'bdigi909@gmail.com'

export default function AdminPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [onglet, setOnglet] = useState('dashboard')
  const [stats, setStats] = useState<any>({})
  const [artisans, setArtisans] = useState<any[]>([])
  const [demandes, setDemandes] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [tickets, setTickets] = useState<any[]>([])
  const [ticketSelectionne, setTicketSelectionne] = useState<any>(null)
  const [reponse, setReponse] = useState('')
  const [repondreLoading, setRepondreLoading] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.email !== ADMIN_EMAIL) { router.push('/'); return }

      const [a, d, u, s, p, t] = await Promise.all([
        supabase.from('artisans').select('id', { count: 'exact' }),
        supabase.from('demandes').select('id', { count: 'exact' }),
        supabase.from('users').select('id', { count: 'exact' }),
        supabase.from('signalements').select('id', { count: 'exact' }),
        supabase.from('paiements').select('montant_total'),
        supabase.from('tickets').select('*').order('created_at', { ascending: false }),
      ])

      const ca = (p.data ?? []).reduce((sum: number, p: any) => sum + p.montant_total, 0)

      setStats({
        artisans: a.count ?? 0,
        demandes: d.count ?? 0,
        users: u.count ?? 0,
        signalements: s.count ?? 0,
        ca: Math.round(ca / 100),
        tickets_ouverts: (t.data ?? []).filter((t: any) => t.statut === 'open').length,
      })

      setTickets(t.data ?? [])

      const { data: artisansData } = await supabase
        .from('artisans').select('*')
        .order('created_at', { ascending: false }).limit(50) as { data: any[] | null }

      const userIds = (artisansData ?? []).map((a: any) => a.user_id)
      const { data: usersData } = await supabase.from('users').select('*').in('id', userIds)
      const usersMap = Object.fromEntries((usersData ?? []).map((u: any) => [u.id, u]))
      setArtisans((artisansData ?? []).map((a: any) => ({ ...a, user: usersMap[a.user_id] ?? null })))

      const { data: demandesData } = await supabase
        .from('demandes').select('*, categorie:categories(nom, icone)')
        .order('created_at', { ascending: false }).limit(30) as { data: any[] | null }
      setDemandes(demandesData ?? [])

      const { data: allUsers } = await supabase
        .from('users').select('*')
        .order('created_at', { ascending: false }).limit(50) as { data: any[] | null }
      setUsers(allUsers ?? [])

      setLoading(false)
    }
    load()
  }, [])

  async function validerArtisan(artisanId: string) {
    await supabase.from('artisans').update({ statut: 'verified', cin_verifie: true }).eq('id', artisanId)
    setArtisans(prev => prev.map(a => a.id === artisanId ? { ...a, statut: 'verified', cin_verifie: true } : a))
    const artisan = artisans.find(a => a.id === artisanId)
    if (artisan?.user?.email) {
      await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: artisan.user.email,
          subject: 'Votre profil BricoMaroc a ete valide !',
          type: 'artisan_valide',
          data: { nom: artisan.user.full_name },
        }),
      })
    }
  }

  async function rejeterArtisan(artisanId: string) {
    await supabase.from('artisans').update({ statut: 'suspended' }).eq('id', artisanId)
    setArtisans(prev => prev.map(a => a.id === artisanId ? { ...a, statut: 'suspended' } : a))
  }

  async function suspendreArtisan(artisanId: string) {
    await supabase.from('artisans').update({ statut: 'suspended' }).eq('id', artisanId)
    setArtisans(prev => prev.map(a => a.id === artisanId ? { ...a, statut: 'suspended' } : a))
  }

  async function repondreTicket() {
    if (!reponse.trim() || !ticketSelectionne) return
    setRepondreLoading(true)
    await supabase.from('tickets').update({
      reponse, statut: 'resolved', updated_at: new Date().toISOString(),
    }).eq('id', ticketSelectionne.id)
    await supabase.from('notifications').insert({
      user_id: ticketSelectionne.user_id,
      titre: 'Reponse a votre ticket',
      message: `Notre equipe a repondu a votre ticket "${ticketSelectionne.sujet}".`,
      type: 'info', lien: '/support',
    })
    setTickets(prev => prev.map(t =>
      t.id === ticketSelectionne.id ? { ...t, reponse, statut: 'resolved' } : t
    ))
    setTicketSelectionne({ ...ticketSelectionne, reponse, statut: 'resolved' })
    setReponse('')
    setRepondreLoading(false)
  }

  async function changerStatutTicket(ticketId: string, statut: string) {
    await supabase.from('tickets').update({ statut }).eq('id', ticketId)
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, statut } : t))
    if (ticketSelectionne?.id === ticketId) {
      setTicketSelectionne((prev: any) => ({ ...prev, statut }))
    }
  }

  function exportUsers() {
    exportToCsv('users', users.map(u => ({
      nom: u.full_name ?? '',
      email: u.email ?? '',
      role: u.role ?? '',
      ville: u.ville ?? '',
      telephone: u.phone ?? '',
      inscription: new Date(u.created_at).toLocaleDateString('fr-FR'),
    })))
  }

  function exportArtisans() {
    exportToCsv('artisans', artisans.map(a => ({
      nom: a.user?.full_name ?? '',
      email: a.user?.email ?? '',
      ville: a.ville ?? '',
      statut: a.statut ?? '',
      note: a.note_moyenne ?? 0,
      nb_missions: a.nb_missions ?? 0,
      plan: a.plan ?? 'free',
    })))
  }

  function exportDemandes() {
    exportToCsv('demandes', demandes.map(d => ({
      titre: d.titre ?? '',
      categorie: d.categorie?.nom ?? '',
      statut: d.statut ?? '',
      urgence: d.urgence ?? '',
      budget_min: d.budget_min ?? '',
      budget_max: d.budget_max ?? '',
      date: new Date(d.created_at).toLocaleDateString('fr-FR'),
    })))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Chargement admin...</div>
      </div>
    )
  }

  const statutBadge: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    verified: 'bg-green-100 text-green-800',
    suspended: 'bg-red-100 text-red-800',
    excluded: 'bg-gray-100 text-gray-800',
  }

  const ticketStatutBadge: Record<string, string> = {
    open: 'bg-yellow-100 text-yellow-700',
    in_progress: 'bg-blue-100 text-blue-700',
    resolved: 'bg-green-100 text-green-700',
    closed: 'bg-gray-100 text-gray-600',
  }

  const ticketStatutLabel: Record<string, string> = {
    open: 'Ouvert',
    in_progress: 'En cours',
    resolved: 'Resolu',
    closed: 'Ferme',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-[#1B7A56]">BricoMaroc</span>
          <span className="text-gray-400 text-sm">/ Admin</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={async () => {
            const res = await fetch('/api/badges', { method: 'POST' })
            const data = await res.json()
            alert(`Badges mis a jour : ${data.updated} artisans`)
 }}
            className="text-xs bg-yellow-400 text-gray-900 font-semibold px-3 py-1.5
              rounded-lg hover:bg-yellow-500 transition-colors">
            Recalculer badges
          </button>
          <button onClick={async () => {
            const { getCacheStats } = await import('@/lib/cache')
            const stats = getCacheStats()
            alert(`Cache: ${stats.valid} entrees valides, ${stats.expired} expirees`)
          }}
            className="text-xs bg-purple-500 text-white font-semibold px-3 py-1.5
              rounded-lg hover:bg-purple-600 transition-colors">
            Stats cache
          </button>
          <Link href="/admin/stats"
            className="text-xs bg-blue-500 text-white font-semibold
              px-3 py-1.5 rounded-lg hover:bg-blue-600 transition-colors">
            Statistiques
          </Link>
          <Link href="/" className="text-xs text-gray-400 hover:text-white">Site</Link>
        </div>
      </div>

      <div className="flex">
        <div className="w-56 bg-gray-800 min-h-screen text-white p-4">
          <nav className="space-y-1">
            {[
              { key: 'dashboard', label: 'Dashboard' },
              { key: 'artisans', label: 'Artisans', badge: artisans.filter(a => a.statut === 'pending').length },
              { key: 'demandes', label: 'Demandes' },
              { key: 'users', label: 'Utilisateurs' },
              { key: 'tickets', label: 'Tickets', badge: tickets.filter(t => t.statut === 'open').length },
              { key: 'avis', label: 'Avis', badge: 0 },
              { key: 'signalements', label: 'Signalements', badge: stats.signalements ?? 0 },
              { key: 'newsletter', label: 'Newsletter', badge: 0 },
              { key: 'logs', label: 'Logs', badge: 0 },
              { key: 'remboursements', label: 'Remboursements', badge: stats.remboursements_pending ?? 0 },
            ].map(item => (
              <button key={item.key}
                onClick={() => { setOnglet(item.key); setTicketSelectionne(null) }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center justify-between ${
                  onglet === item.key ? 'bg-[#1B7A56] text-white' : 'text-gray-300 hover:bg-gray-700'
                }`}>
                <span>{item.label}</span>
                {item.badge ? (
                  <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1 p-6">

          {onglet === 'dashboard' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
              </div>
              <div className="grid grid-cols-5 gap-4 mb-8">
                {[
                  { label: 'Artisans', value: stats.artisans, icon: '🔧', color: 'bg-green-50 border-green-200' },
                  { label: 'Demandes', value: stats.demandes, icon: '📋', color: 'bg-blue-50 border-blue-200' },
                  { label: 'Utilisateurs', value: stats.users, icon: '👥', color: 'bg-purple-50 border-purple-200' },
                  { label: 'Tickets ouverts', value: stats.tickets_ouverts, icon: '🎧', color: 'bg-orange-50 border-orange-200' },
                  { label: 'CA Total', value: `${stats.ca} MAD`, icon: '💰', color: 'bg-yellow-50 border-yellow-200' },
                ].map(s => (
                  <div key={s.label} className={`${s.color} border rounded-2xl p-4 text-center`}>
                    <div className="text-2xl mb-1">{s.icon}</div>
                    <div className="text-2xl font-bold text-gray-900">{s.value}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <h2 className="font-bold text-gray-900 mb-4">
                  Artisans en attente ({artisans.filter(a => a.statut === 'pending').length})
                </h2>
                {artisans.filter(a => a.statut === 'pending').length === 0 ? (
                  <p className="text-gray-400 text-sm">Aucun artisan en attente</p>
                ) : (
                  <div className="space-y-3">
                    {artisans.filter(a => a.statut === 'pending').slice(0, 5).map(a => (
                      <div key={a.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl">
                        <div>
                          <p className="font-semibold text-sm text-gray-900">{a.user?.full_name ?? 'N/A'}</p>
                          <p className="text-xs text-gray-500">{a.user?.email} · {a.ville}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => validerArtisan(a.id)}
                            className="bg-green-500 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-green-600">
                            Valider
                          </button>
                          <button onClick={() => rejeterArtisan(a.id)}
                            className="bg-red-500 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-red-600">
                            Rejeter
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {onglet === 'artisans' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Gestion des artisans ({artisans.length})</h1>
                <button onClick={exportArtisans}
                  className="bg-green-500 text-white font-semibold px-4 py-2 rounded-xl
                    hover:bg-green-600 transition-colors text-sm">
                  Exporter CSV
                </button>
              </div>
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Nom</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Email</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Ville</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Note</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Statut</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {artisans.map(a => (
                      <tr key={a.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {a.user?.full_name ?? 'N/A'}
                          {a.cin_verifie && <span className="ml-1 text-green-500 text-xs">✓</span>}
                        </td>
                        <td className="px-4 py-3 text-gray-500">{a.user?.email ?? 'N/A'}</td>
                        <td className="px-4 py-3 text-gray-500">{a.ville}</td>
                        <td className="px-4 py-3">
                          <span className="font-semibold">⭐ {a.note_moyenne?.toFixed(1)}</span>
                          <span className="text-gray-400 text-xs ml-1">({a.nb_avis})</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${statutBadge[a.statut]}`}>
                            {a.statut}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            {a.statut === 'pending' && (
                              <button onClick={() => validerArtisan(a.id)}
                                className="bg-green-500 text-white text-xs px-2 py-1 rounded-lg hover:bg-green-600">
                                Valider
                              </button>
                            )}
                            {a.statut === 'verified' && (
                              <button onClick={() => suspendreArtisan(a.id)}
                                className="bg-red-500 text-white text-xs px-2 py-1 rounded-lg hover:bg-red-600">
                                Suspendre
                              </button>
                            )}
                            {a.statut === 'suspended' && (
                              <button onClick={() => validerArtisan(a.id)}
                                className="bg-blue-500 text-white text-xs px-2 py-1 rounded-lg hover:bg-blue-600">
                                Reactiver
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {onglet === 'demandes' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Toutes les demandes ({demandes.length})</h1>
                <button onClick={exportDemandes}
                  className="bg-green-500 text-white font-semibold px-4 py-2 rounded-xl
                    hover:bg-green-600 transition-colors text-sm">
                  Exporter CSV
                </button>
              </div>
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Titre</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Categorie</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Urgence</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Statut</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {demandes.map(d => (
                      <tr key={d.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{d.titre}</td>
                        <td className="px-4 py-3 text-gray-500">{d.categorie?.icone} {d.categorie?.nom}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            d.urgence === 'very_urgent' ? 'bg-red-100 text-red-700' :
                            d.urgence === 'urgent' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {d.urgence === 'very_urgent' ? 'Tres urgent' :
                             d.urgence === 'urgent' ? 'Urgent' : 'Normal'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            d.statut === 'completed' ? 'bg-green-100 text-green-700' :
                            d.statut === 'accepted' ? 'bg-blue-100 text-blue-700' :
                            d.statut === 'cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {d.statut}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs">
                          {new Date(d.created_at).toLocaleDateString('fr-FR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {onglet === 'users' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Utilisateurs ({users.length})</h1>
                <button onClick={exportUsers}
                  className="bg-green-500 text-white font-semibold px-4 py-2 rounded-xl
                    hover:bg-green-600 transition-colors text-sm">
                  Exporter CSV
                </button>
              </div>
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Nom</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Email</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Role</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Ville</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Inscrit le</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{u.full_name}</td>
                        <td className="px-4 py-3 text-gray-500">{u.email}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                            u.role === 'artisan' ? 'bg-green-100 text-green-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">{u.ville}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">
                          {new Date(u.created_at).toLocaleDateString('fr-FR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {onglet === 'tickets' && (
            <div className="flex gap-6 h-full">
              <div className="w-80 flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900 mb-4">
                  Tickets ({tickets.length})
                </h1>
                <div className="space-y-2">
                  {tickets.length === 0 ? (
                    <p className="text-gray-400 text-sm">Aucun ticket</p>
                  ) : (
                    tickets.map(ticket => (
                      <div key={ticket.id}
                        onClick={() => { setTicketSelectionne(ticket); setReponse('') }}
                        className={`p-3 rounded-xl cursor-pointer border transition-all ${
                          ticketSelectionne?.id === ticket.id
                            ? 'border-[#1B7A56] bg-green-50'
                            : 'border-gray-100 bg-white hover:border-gray-200'
                        }`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                            ${ticketStatutBadge[ticket.statut]}`}>
                            {ticketStatutLabel[ticket.statut]}
                          </span>
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                            ticket.priorite === 'haute' ? 'bg-red-100 text-red-600' :
                            ticket.priorite === 'normale' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-green-100 text-green-600'
                          }`}>
                            {ticket.priorite}
                          </span>
                        </div>
                        <p className="font-semibold text-sm text-gray-900 truncate">{ticket.sujet}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(ticket.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {ticketSelectionne ? (
                <div className="flex-1 bg-white rounded-2xl shadow-sm p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="font-bold text-gray-900 text-lg">{ticketSelectionne.sujet}</h2>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(ticketSelectionne.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric', month: 'long', year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {['open', 'in_progress', 'resolved', 'closed'].map(statut => (
                        <button key={statut}
                          onClick={() => changerStatutTicket(ticketSelectionne.id, statut)}
                          className={`text-xs px-2 py-1 rounded-lg font-medium transition-all ${
                            ticketSelectionne.statut === statut
                              ? 'bg-[#1B7A56] text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}>
                          {ticketStatutLabel[statut]}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <p className="text-xs font-semibold text-gray-500 mb-2">Message du client</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{ticketSelectionne.message}</p>
                  </div>
                  {ticketSelectionne.reponse && (
                    <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-6">
                      <p className="text-xs font-semibold text-[#1B7A56] mb-2">Reponse envoyee</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{ticketSelectionne.reponse}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {ticketSelectionne.reponse ? 'Modifier la reponse' : 'Repondre au ticket'}
                    </label>
                    <textarea value={reponse} onChange={e => setReponse(e.target.value)}
                      placeholder="Ecrivez votre reponse au client..."
                      rows={5}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                        focus:outline-none focus:ring-2 focus:ring-[#1B7A56] resize-none mb-3"
                    />
                    <button onClick={repondreTicket}
                      disabled={repondreLoading || !reponse.trim()}
                      className="bg-[#1B7A56] text-white font-semibold px-6 py-2.5 rounded-xl
                        hover:bg-[#155f42] transition-colors disabled:opacity-50">
                      {repondreLoading ? 'Envoi...' : 'Envoyer la reponse'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 bg-white rounded-2xl shadow-sm p-6 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <div className="text-4xl mb-3">🎧</div>
                    <p>Selectionnez un ticket pour le traiter</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {onglet === 'avis' && (
            <AvisAdmin supabase={supabase} />
          )}

          {onglet === 'signalements' && (
            <SignalementsAdmin supabase={supabase} />
          )}

          {onglet === 'newsletter' && (
            <NewsletterAdmin supabase={supabase} />
          )}
          {onglet === 'logs' && (
  <LogsAdmin supabase={supabase} />
)}
{onglet === 'remboursements' && (
  <RemboursementsAdmin supabase={supabase} />
)}

        </div>
      </div>
    </div>
  )
}