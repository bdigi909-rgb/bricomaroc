'use client'
import { useState, useEffect } from 'react'

const ACTION_ICONS: Record<string, string> = {
  'connexion': '🔐',
  'inscription': '👤',
  'demande_creee': '📋',
  'devis_envoye': '💼',
  'paiement': '💳',
  'avis_laisse': '⭐',
  'message_envoye': '💬',
  'profil_modifie': '✏️',
  'remboursement': '💸',
  'default': '📝',
}

export default function LogsAdmin({ supabase }: { supabase: any }) {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filtre, setFiltre] = useState('')
  const [limit, setLimit] = useState(50)

  useEffect(() => { charger() }, [limit])

  async function charger() {
    const res = await fetch(`/api/logs?limit=${limit}`)
    const data = await res.json()
    setLogs(data.logs ?? [])
    setLoading(false)
  }

  const logsFiltres = logs.filter(l =>
    !filtre ||
    l.action?.toLowerCase().includes(filtre.toLowerCase()) ||
    l.user?.email?.toLowerCase().includes(filtre.toLowerCase()) ||
    l.user?.full_name?.toLowerCase().includes(filtre.toLowerCase())
  )

  async function supprimerTout() {
    if (!confirm('Supprimer tous les logs ?')) return
    await supabase.from('logs_activite').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    setLogs([])
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Chargement...</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          Logs activite ({logs.length})
        </h2>
        <div className="flex gap-2">
          <select value={limit} onChange={e => setLimit(parseInt(e.target.value))}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm
              focus:outline-none focus:ring-2 focus:ring-[#1B7A56]">
            <option value={50}>50 derniers</option>
            <option value={100}>100 derniers</option>
            <option value={200}>200 derniers</option>
          </select>
          <button onClick={charger}
            className="bg-blue-500 text-white font-semibold px-4 py-2 rounded-xl
              hover:bg-blue-600 transition-colors text-sm">
            Actualiser
          </button>
          <button onClick={supprimerTout}
            className="bg-red-100 text-red-600 font-semibold px-4 py-2 rounded-xl
              hover:bg-red-200 transition-colors text-sm">
            Vider les logs
          </button>
        </div>
      </div>

      {/* FILTRE */}
      <input type="text" value={filtre} onChange={e => setFiltre(e.target.value)}
        placeholder="Filtrer par action ou utilisateur..."
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
          focus:outline-none focus:ring-2 focus:ring-[#1B7A56]" />

      {/* STATS */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Connexions', count: logs.filter(l => l.action === 'connexion').length, color: 'bg-blue-50' },
          { label: 'Inscriptions', count: logs.filter(l => l.action === 'inscription').length, color: 'bg-green-50' },
          { label: 'Demandes', count: logs.filter(l => l.action === 'demande_creee').length, color: 'bg-orange-50' },
          { label: 'Paiements', count: logs.filter(l => l.action === 'paiement').length, color: 'bg-purple-50' },
        ].map(s => (
          <div key={s.label} className={`${s.color} rounded-xl p-3 text-center`}>
            <div className="text-xl font-bold text-gray-900">{s.count}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* LISTE LOGS */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {logsFiltres.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-4xl mb-3">📝</div>
            <p className="text-gray-500">Aucun log pour le moment</p>
            <p className="text-gray-400 text-xs mt-1">
              Les logs apparaitront au fur et a mesure des actions utilisateurs
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {logsFiltres.map(log => (
              <div key={log.id} className="px-6 py-3 flex items-start gap-4 hover:bg-gray-50">
                <span className="text-xl flex-shrink-0 mt-0.5">
                  {ACTION_ICONS[log.action] ?? ACTION_ICONS['default']}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 text-sm">{log.action}</span>
                    {log.user && (
                      <span className="text-xs text-gray-400">
                        par {log.user.full_name ?? log.user.email}
                      </span>
                    )}
                  </div>
                  {log.details && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {typeof log.details === 'object'
                        ? JSON.stringify(log.details)
                        : log.details}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    <span>{new Date(log.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                    })}</span>
                    {log.ip && log.ip !== 'unknown' && (
                      <span>IP: {log.ip}</span>
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