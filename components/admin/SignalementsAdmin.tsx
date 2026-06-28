'use client'
import { useState, useEffect } from 'react'

export default function SignalementsAdmin({ supabase }: { supabase: any }) {
  const [signalements, setSignalements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filtre, setFiltre] = useState<'tous' | 'pending' | 'traite'>('tous')

  useEffect(() => { charger() }, [])

  async function charger() {
    const { data } = await supabase
      .from('signalements')
     .select('*, signaleur:users!signalements_reporter_id_fkey(full_name, email)')
      .order('created_at', { ascending: false }) as { data: any[] | null }
    setSignalements(data ?? [])
    setLoading(false)
  }

  async function traiter(id: string) {
    await supabase.from('signalements').update({ statut: 'traite' }).eq('id', id)
    setSignalements(prev => prev.map(s => s.id === id ? { ...s, statut: 'traite' } : s))
  }

  async function rejeter(id: string) {
    await supabase.from('signalements').update({ statut: 'rejete' }).eq('id', id)
    setSignalements(prev => prev.map(s => s.id === id ? { ...s, statut: 'rejete' } : s))
  }

  async function supprimer(id: string) {
    if (!confirm('Supprimer ce signalement ?')) return
    await supabase.from('signalements').delete().eq('id', id)
    setSignalements(prev => prev.filter(s => s.id !== id))
  }

  const filtres = signalements.filter(s => {
    if (filtre === 'pending') return s.statut === 'pending' || !s.statut
    if (filtre === 'traite') return s.statut === 'traite' || s.statut === 'rejete'
    return true
  })

  const nbPending = signalements.filter(s => !s.statut || s.statut === 'pending').length

  if (loading) return <div className="p-8 text-center text-gray-500">Chargement...</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          Signalements ({signalements.length})
          {nbPending > 0 && (
            <span className="ml-2 text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
              {nbPending} en attente
            </span>
          )}
        </h2>
        <div className="flex gap-2">
          {[
            { key: 'tous', label: `Tous (${signalements.length})` },
            { key: 'pending', label: `En attente (${nbPending})` },
            { key: 'traite', label: 'Traites' },
          ].map(f => (
            <button key={f.key} onClick={() => setFiltre(f.key as any)}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                filtre === f.key
                  ? 'bg-[#1B7A56] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtres.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center">
          <div className="text-4xl mb-3">✅</div>
          <p className="text-gray-500">Aucun signalement dans cette categorie</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtres.map(s => (
            <div key={s.id} className={`bg-white rounded-2xl p-5 shadow-sm border-2 ${
              !s.statut || s.statut === 'pending'
                ? 'border-red-200'
                : s.statut === 'traite'
                ? 'border-green-200'
                : 'border-gray-200'
            }`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      !s.statut || s.statut === 'pending'
                        ? 'bg-red-100 text-red-700'
                        : s.statut === 'traite'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {!s.statut || s.statut === 'pending' ? 'En attente' :
                       s.statut === 'traite' ? 'Traite' : 'Rejete'}
                    </span>
                    {s.type && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {s.type}
                      </span>
                    )}
                  </div>

                  <p className="font-semibold text-gray-900 text-sm mb-1">
                    {s.raison ?? s.message ?? 'Signalement sans description'}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>Par : {s.signaleur?.full_name ?? 'Anonyme'}</span>
                    <span>•</span>
                    <span>{new Date(s.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 flex-shrink-0">
                  {(!s.statut || s.statut === 'pending') && (
                    <>
                      <button onClick={() => traiter(s.id)}
                        className="text-xs px-3 py-1.5 rounded-lg font-medium
                          bg-green-100 text-green-700 hover:bg-green-200 transition-colors">
                        Traiter
                      </button>
                      <button onClick={() => rejeter(s.id)}
                        className="text-xs px-3 py-1.5 rounded-lg font-medium
                          bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-colors">
                        Rejeter
                      </button>
                    </>
                  )}
                  <button onClick={() => supprimer(s.id)}
                    className="text-xs px-3 py-1.5 rounded-lg font-medium
                      bg-red-100 text-red-600 hover:bg-red-200 transition-colors">
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}