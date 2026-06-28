'use client'
import { useState, useEffect } from 'react'

export default function RemboursementsAdmin({ supabase }: { supabase: any }) {
  const [remboursements, setRemboursements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filtre, setFiltre] = useState<'tous' | 'pending' | 'approved' | 'rejected'>('tous')
  const [reponse, setReponse] = useState<Record<string, string>>({})

  useEffect(() => { charger() }, [])

  async function charger() {
    const { data } = await supabase
      .from('remboursements')
      .select('*, client:users!remboursements_client_id_fkey(full_name, email), demande:demandes(titre), paiement:paiements(montant_total)')
      .order('created_at', { ascending: false }) as { data: any[] | null }
    setRemboursements(data ?? [])
    setLoading(false)
  }

  async function approuver(id: string) {
    await supabase.from('remboursements').update({
      statut: 'approved',
      reponse_admin: reponse[id] || 'Votre demande de remboursement a ete approuvee.',
      updated_at: new Date().toISOString(),
    }).eq('id', id)

    const remb = remboursements.find(r => r.id === id)
    if (remb?.client_id) {
      await supabase.from('notifications').insert({
        user_id: remb.client_id,
        titre: 'Remboursement approuve',
        message: 'Votre demande de remboursement a ete approuvee. Le virement sera effectue sous 5-7 jours.',
        type: 'success',
        lien: '/remboursement',
      })
    }

    setRemboursements(prev => prev.map(r =>
      r.id === id ? { ...r, statut: 'approved', reponse_admin: reponse[id] } : r
    ))
  }

  async function rejeter(id: string) {
    await supabase.from('remboursements').update({
      statut: 'rejected',
      reponse_admin: reponse[id] || 'Votre demande de remboursement a ete refusee.',
      updated_at: new Date().toISOString(),
    }).eq('id', id)

    const remb = remboursements.find(r => r.id === id)
    if (remb?.client_id) {
      await supabase.from('notifications').insert({
        user_id: remb.client_id,
        titre: 'Remboursement refuse',
        message: reponse[id] || 'Votre demande de remboursement a ete refusee.',
        type: 'error',
        lien: '/remboursement',
      })
    }

    setRemboursements(prev => prev.map(r =>
      r.id === id ? { ...r, statut: 'rejected', reponse_admin: reponse[id] } : r
    ))
  }

  async function marquerTraite(id: string) {
    await supabase.from('remboursements').update({
      statut: 'processed',
      updated_at: new Date().toISOString(),
    }).eq('id', id)
    setRemboursements(prev => prev.map(r =>
      r.id === id ? { ...r, statut: 'processed' } : r
    ))
  }

  const rembFiltres = remboursements.filter(r => {
    if (filtre === 'tous') return true
    return r.statut === filtre
  })

  const nbPending = remboursements.filter(r => r.statut === 'pending').length
  const totalApprouves = remboursements
    .filter(r => r.statut === 'approved' || r.statut === 'processed')
    .reduce((sum, r) => sum + (r.montant ?? 0), 0)

  const statutBadge: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    processed: 'bg-blue-100 text-blue-700',
  }

  const statutLabel: Record<string, string> = {
    pending: 'En attente',
    approved: 'Approuve',
    rejected: 'Refuse',
    processed: 'Traite',
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Chargement...</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          Remboursements ({remboursements.length})
          {nbPending > 0 && (
            <span className="ml-2 text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
              {nbPending} en attente
            </span>
          )}
        </h2>
        <div className="flex gap-2">
          {[
            { key: 'tous', label: `Tous (${remboursements.length})` },
            { key: 'pending', label: `En attente (${nbPending})` },
            { key: 'approved', label: 'Approuves' },
            { key: 'rejected', label: 'Refuses' },
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

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{nbPending}</div>
          <div className="text-xs text-gray-500 mt-1">En attente</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">
            {remboursements.filter(r => r.statut === 'approved' || r.statut === 'processed').length}
          </div>
          <div className="text-xs text-gray-500 mt-1">Approuves</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{totalApprouves.toFixed(0)} MAD</div>
          <div className="text-xs text-gray-500 mt-1">Total rembourse</div>
        </div>
      </div>

      {/* LISTE */}
      {rembFiltres.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <div className="text-4xl mb-3">💸</div>
          <p className="text-gray-500">Aucune demande dans cette categorie</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rembFiltres.map(r => (
            <div key={r.id} className={`bg-white rounded-2xl p-5 shadow-sm border-2 ${
              r.statut === 'pending' ? 'border-yellow-200' :
              r.statut === 'approved' ? 'border-green-200' :
              r.statut === 'rejected' ? 'border-red-200' : 'border-blue-200'
            }`}>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statutBadge[r.statut]}`}>
                      {statutLabel[r.statut]}
                    </span>
                    <span className="font-bold text-gray-900">{r.montant?.toFixed(0)} MAD</span>
                  </div>
                  <p className="font-semibold text-gray-900 text-sm mb-1">
                    {r.demande?.titre ?? 'Mission'}
                  </p>
                  <p className="text-xs text-gray-500 mb-1">{r.raison}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>Client : {r.client?.full_name ?? 'N/A'}</span>
                    <span>•</span>
                    <span>{r.client?.email}</span>
                    <span>•</span>
                    <span>{new Date(r.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              </div>

              {r.reponse_admin && (
                <div className="bg-gray-50 rounded-xl p-3 mb-3 text-xs text-gray-600">
                  <span className="font-semibold">Reponse admin : </span>
                  {r.reponse_admin}
                </div>
              )}

              {r.statut === 'pending' && (
                <div className="space-y-3">
                  <textarea
                    value={reponse[r.id] ?? ''}
                    onChange={e => setReponse(prev => ({ ...prev, [r.id]: e.target.value }))}
                    placeholder="Reponse au client (optionnel)..."
                    rows={2}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm
                      focus:outline-none focus:ring-2 focus:ring-[#1B7A56] resize-none"
                  />
                  <div className="flex gap-3">
                    <button onClick={() => approuver(r.id)}
                      className="flex-1 bg-green-500 text-white font-semibold py-2.5 rounded-xl
                        hover:bg-green-600 transition-colors text-sm">
                      Approuver le remboursement
                    </button>
                    <button onClick={() => rejeter(r.id)}
                      className="flex-1 bg-red-500 text-white font-semibold py-2.5 rounded-xl
                        hover:bg-red-600 transition-colors text-sm">
                      Refuser
                    </button>
                  </div>
                </div>
              )}

              {r.statut === 'approved' && (
                <button onClick={() => marquerTraite(r.id)}
                  className="w-full bg-blue-500 text-white font-semibold py-2.5 rounded-xl
                    hover:bg-blue-600 transition-colors text-sm">
                  Marquer comme traite (virement effectue)
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}