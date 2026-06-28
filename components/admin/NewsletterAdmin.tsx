'use client'
import { useState, useEffect } from 'react'

export default function NewsletterAdmin({ supabase }: { supabase: any }) {
  const [inscrits, setInscrits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sujet, setSujet] = useState('')
  const [contenu, setContenu] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [filtre, setFiltre] = useState<'tous' | 'client' | 'artisan'>('tous')

  useEffect(() => { charger() }, [])

  async function charger() {
    const { data } = await supabase
      .from('newsletter')
      .select('*')
      .order('created_at', { ascending: false }) as { data: any[] | null }
    setInscrits(data ?? [])
    setLoading(false)
  }

  async function desinscrire(id: string) {
    await supabase.from('newsletter').update({ actif: false }).eq('id', id)
    setInscrits(prev => prev.map(i => i.id === id ? { ...i, actif: false } : i))
  }

  async function supprimer(id: string) {
    if (!confirm('Supprimer cet inscrit ?')) return
    await supabase.from('newsletter').delete().eq('id', id)
    setInscrits(prev => prev.filter(i => i.id !== id))
  }

  const inscritsFiltres = inscrits.filter(i => {
    if (filtre === 'client') return i.type === 'client'
    if (filtre === 'artisan') return i.type === 'artisan'
    return true
  })

  const nbActifs = inscrits.filter(i => i.actif).length

  async function envoyerCampagne() {
    if (!sujet || !contenu) { alert('Remplissez le sujet et le contenu'); return }
    const destinataires = inscritsFiltres.filter(i => i.actif)
    if (destinataires.length === 0) { alert('Aucun inscrit actif'); return }
    if (!confirm(`Envoyer a ${destinataires.length} inscrits ?`)) return

    setSending(true)
    for (const inscrit of destinataires) {
      await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: inscrit.email,
          subject: sujet,
          type: 'campagne',
          data: { nom: inscrit.nom || 'Abonne', contenu },
        }),
      })
    }
    setSending(false)
    setSent(true)
    setSujet('')
    setContenu('')
    setTimeout(() => setSent(false), 3000)
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Chargement...</div>

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total inscrits', value: inscrits.length, color: 'bg-blue-50 border-blue-200' },
          { label: 'Actifs', value: nbActifs, color: 'bg-green-50 border-green-200' },
          { label: 'Desinscrits', value: inscrits.length - nbActifs, color: 'bg-red-50 border-red-200' },
          { label: 'Clients', value: inscrits.filter(i => i.type === 'client').length, color: 'bg-purple-50 border-purple-200' },
        ].map(k => (
          <div key={k.label} className={`${k.color} border rounded-2xl p-4 text-center`}>
            <div className="text-2xl font-bold text-gray-900">{k.value}</div>
            <div className="text-xs text-gray-500 mt-1">{k.label}</div>
          </div>
        ))}
      </div>

      {/* ENVOYER CAMPAGNE */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="font-bold text-gray-900 mb-4">
          Envoyer une campagne ({nbActifs} destinataires actifs)
        </h2>
        {sent && (
          <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-xl mb-4">
            Campagne envoyee avec succes !
          </div>
        )}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sujet</label>
            <input type="text" value={sujet} onChange={e => setSujet(e.target.value)}
              placeholder="Ex: Nouveautes BricoMaroc"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                focus:outline-none focus:ring-2 focus:ring-[#1B7A56]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contenu</label>
            <textarea value={contenu} onChange={e => setContenu(e.target.value)}
              placeholder="Ecrivez le contenu de votre newsletter..."
              rows={6}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                focus:outline-none focus:ring-2 focus:ring-[#1B7A56] resize-none" />
          </div>
          <div className="flex gap-3">
            <select value={filtre} onChange={e => setFiltre(e.target.value as any)}
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm
                focus:outline-none focus:ring-2 focus:ring-[#1B7A56]">
              <option value="tous">Tous ({inscrits.filter(i => i.actif).length})</option>
              <option value="client">Clients ({inscrits.filter(i => i.actif && i.type === 'client').length})</option>
              <option value="artisan">Artisans ({inscrits.filter(i => i.actif && i.type === 'artisan').length})</option>
            </select>
            <button onClick={envoyerCampagne} disabled={sending}
              className="flex-1 bg-[#1B7A56] text-white font-semibold py-3 rounded-xl
                hover:bg-[#155f42] transition-colors disabled:opacity-50">
              {sending ? 'Envoi en cours...' : 'Envoyer la campagne'}
            </button>
          </div>
        </div>
      </div>

      {/* LISTE INSCRITS */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Inscrits ({inscritsFiltres.length})</h2>
          <div className="flex gap-2">
            {[
              { key: 'tous', label: 'Tous' },
              { key: 'client', label: 'Clients' },
              { key: 'artisan', label: 'Artisans' },
            ].map(f => (
              <button key={f.key} onClick={() => setFiltre(f.key as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  filtre === f.key
                    ? 'bg-[#1B7A56] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {inscritsFiltres.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <div className="text-3xl mb-2">📧</div>
            <p>Aucun inscrit</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 font-semibold text-gray-600">Email</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600">Nom</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600">Type</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600">Statut</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600">Date</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {inscritsFiltres.map(i => (
                <tr key={i.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-gray-900">{i.email}</td>
                  <td className="px-6 py-3 text-gray-500">{i.nom || '-'}</td>
                  <td className="px-6 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      i.type === 'artisan' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {i.type}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      i.actif ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {i.actif ? 'Actif' : 'Desinscrit'}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-400 text-xs">
                    {new Date(i.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex gap-2">
                      {i.actif && (
                        <button onClick={() => desinscrire(i.id)}
                          className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1
                            rounded-lg hover:bg-yellow-200 transition-colors">
                          Desinscrire
                        </button>
                      )}
                      <button onClick={() => supprimer(i.id)}
                        className="text-xs bg-red-100 text-red-600 px-2 py-1
                          rounded-lg hover:bg-red-200 transition-colors">
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}