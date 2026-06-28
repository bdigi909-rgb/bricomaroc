'use client'
import { useState, useEffect } from 'react'

export default function AvisAdmin({ supabase }: { supabase: any }) {
  const [avis, setAvis] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filtre, setFiltre] = useState<'tous' | 'signales' | 'masques'>('tous')

  useEffect(() => { chargerAvis() }, [])

  async function chargerAvis() {
    const { data } = await supabase
      .from('avis')
      .select('*, client:users!avis_client_id_fkey(full_name, email), artisan:artisans(ville, user:users!artisans_user_id_fkey(full_name))')
      .order('created_at', { ascending: false }) as { data: any[] | null }
    setAvis(data ?? [])
    setLoading(false)
  }

  async function supprimerAvis(id: string) {
    if (!confirm('Supprimer cet avis ?')) return
    await supabase.from('avis').delete().eq('id', id)
    setAvis(prev => prev.filter(a => a.id !== id))
  }

  async function masquerAvis(id: string, masque: boolean) {
    await supabase.from('avis').update({ masque: !masque }).eq('id', id)
    setAvis(prev => prev.map(a => a.id === id ? { ...a, masque: !masque } : a))
  }

  async function signalerAvis(id: string, signale: boolean) {
    await supabase.from('avis').update({ signale: !signale }).eq('id', id)
    setAvis(prev => prev.map(a => a.id === id ? { ...a, signale: !signale } : a))
  }

  const avisFiltres = avis.filter(a => {
    if (filtre === 'signales') return a.signale
    if (filtre === 'masques') return a.masque
    return true
  })

  const nbSignales = avis.filter(a => a.signale).length
  const nbMasques = avis.filter(a => a.masque).length

  function etoiles(note: number) {
    return '⭐'.repeat(note) + '☆'.repeat(5 - note)
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Chargement...</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          Gestion des avis ({avis.length})
        </h2>
        <div className="flex gap-2">
          {[
            { key: 'tous', label: `Tous (${avis.length})` },
            { key: 'signales', label: `Signales (${nbSignales})` },
            { key: 'masques', label: `Masques (${nbMasques})` },
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

      {avisFiltres.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center">
          <div className="text-4xl mb-3">⭐</div>
          <p className="text-gray-500">Aucun avis dans cette categorie</p>
        </div>
      ) : (
        <div className="space-y-3">
          {avisFiltres.map(a => (
            <div key={a.id} className={`bg-white rounded-2xl p-5 shadow-sm border-2 ${
              a.signale ? 'border-red-200' : a.masque ? 'border-gray-200' : 'border-transparent'
            }`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-[#1B7A56] text-white text-xs
                      font-bold flex items-center justify-center">
                      {(a.client?.full_name ?? 'U')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {a.client?.full_name ?? 'Client'}
                      </p>
                      <p className="text-xs text-gray-400">{a.client?.email}</p>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      <span className="text-sm">{etoiles(a.note ?? 0)}</span>
                      <span className="font-bold text-[#1B7A56]">{a.note}/5</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{a.commentaire}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>Artisan : {a.artisan?.user?.full_name ?? 'Inconnu'}</span>
                    <span>•</span>
                    <span>{new Date(a.created_at).toLocaleDateString('fr-FR')}</span>
                    {a.signale && <span className="text-red-500 font-semibold">Signale</span>}
                    {a.masque && <span className="text-gray-500 font-semibold">Masque</span>}
                  </div>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button onClick={() => masquerAvis(a.id, a.masque)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                      a.masque
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}>
                    {a.masque ? 'Afficher' : 'Masquer'}
                  </button>
                  <button onClick={() => signalerAvis(a.id, a.signale)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                      a.signale
                        ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                        : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                    }`}>
                    {a.signale ? 'Valider' : 'Signaler'}
                  </button>
                  <button onClick={() => supprimerAvis(a.id)}
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