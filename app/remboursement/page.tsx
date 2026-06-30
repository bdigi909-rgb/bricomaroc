'use client'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RemboursementPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const router = useRouter()

  const [user, setUser] = useState<any>(null)
  const [paiements, setPaiements] = useState<any[]>([])
  const [remboursements, setRemboursements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [paiementId, setPaiementId] = useState('')
  const [raison, setRaison] = useState('')
  const [raisonDetail, setRaisonDetail] = useState('')

  const RAISONS = [
    'Travaux non effectues',
    'Qualite insuffisante',
    'Artisan ne s est pas presente',
    'Travaux incomplets',
    'Prix different du devis',
    'Autre raison',
  ]

  useEffect(() => {
    async function load() {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) { router.push('/auth/login'); return }
      setUser(currentUser)

      const { data: paiementsData } = await supabase
        .from('paiements')
        .select('*, demande:demandes(titre)')
        .eq('client_id', currentUser.id)
        .eq('statut', 'released')
        .order('created_at', { ascending: false }) as { data: any[] | null }
      setPaiements(paiementsData ?? [])

      const { data: rembData } = await supabase
        .from('remboursements')
        .select('*, demande:demandes(titre), paiement:paiements(montant_total)')
        .eq('client_id', currentUser.id)
        .order('created_at', { ascending: false }) as { data: any[] | null }
      setRemboursements(rembData ?? [])

      setLoading(false)
    }
    load()
  }, [])

  async function demanderRemboursement() {
    if (!paiementId) { setError('Selectionnez un paiement'); return }
    if (!raison) { setError('Selectionnez une raison'); return }
    if (!raisonDetail || raisonDetail.trim().length < 10) {
      setError('Decrivez le probleme en detail (min. 10 caracteres)')
      return
    }

    setSending(true)
    setError('')

    const paiement = paiements.find(p => p.id === paiementId)

    const { error: err } = await supabase.from('remboursements').insert({
      client_id: user.id,
      demande_id: paiement?.demande_id ?? null,
      paiement_id: paiementId,
      montant: (paiement?.montant_total ?? 0) / 100,
      raison: `${raison} — ${raisonDetail}`,
      statut: 'pending',
    })

    if (err) { setError(err.message); setSending(false); return }

    // Notification admin
    await supabase.from('notifications').insert({
      user_id: user.id,
      titre: 'Demande de remboursement envoyee',
      message: 'Votre demande de remboursement a ete envoyee. Notre equipe la traitera sous 48h.',
      type: 'info',
      lien: '/remboursement',
    })

    setSuccess(true)
    setSending(false)
  }

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
        <Link href="/" className="text-xl font-bold text-[#1B7A56]">BricoMaroc</Link>
        <Link href="/espace-client" className="text-sm text-gray-500 hover:text-gray-800">
          Mon espace
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Demande de remboursement</h1>
          <p className="text-gray-500 text-sm mt-1">
            Signalez un probleme avec une mission payee
          </p>
        </div>

        {success ? (
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Demande envoyee !</h2>
            <p className="text-gray-500 text-sm mb-6">
              Notre equipe va examiner votre demande sous 48h ouvrables.
              Vous serez notifie par email du resultat.
            </p>
            <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700 mb-6">
              Reference : {new Date().toISOString().split('T')[0]}
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setSuccess(false); setPaiementId(''); setRaison(''); setRaisonDetail('') }}
                className="flex-1 border border-gray-200 text-gray-600 font-semibold
                  py-3 rounded-xl hover:bg-gray-50 transition-colors">
                Nouvelle demande
              </button>
              <Link href="/espace-client"
                className="flex-1 bg-[#1B7A56] text-white font-semibold py-3 rounded-xl
                  hover:bg-[#155f42] transition-colors text-center">
                Mes demandes
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-5">
            <h2 className="font-bold text-gray-900">Nouvelle demande</h2>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
            )}

            {paiements.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">💳</div>
                <p className="text-gray-500 text-sm">Aucun paiement eligible au remboursement</p>
                <p className="text-gray-400 text-xs mt-1">
                  Seules les missions payees peuvent faire l'objet d'un remboursement
                </p>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mission concernee *
                  </label>
                  <select value={paiementId} onChange={e => setPaiementId(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                      focus:outline-none focus:ring-2 focus:ring-[#1B7A56]">
                    <option value="">Selectionnez une mission</option>
                    {paiements.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.demande?.titre ?? 'Mission'} — {((p.montant_total ?? 0) / 100).toFixed(0)} MAD
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Raison du remboursement *
                  </label>
                  <div className="space-y-2">
                    {RAISONS.map(r => (
                      <button key={r} onClick={() => setRaison(r)}
                        className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm
                          transition-all ${
                          raison === r
                            ? 'border-[#1B7A56] bg-green-50 text-[#1B7A56] font-medium'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}>
                        {raison === r ? '✓ ' : ''}{r}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description detaillee *
                  </label>
                  <textarea value={raisonDetail} onChange={e => setRaisonDetail(e.target.value)}
                    placeholder="Decrivez precisement le probleme rencontre..."
                    rows={4}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                      focus:outline-none focus:ring-2 focus:ring-[#1B7A56] resize-none" />
                </div>

                <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 text-sm text-yellow-800">
                  Votre demande sera traitee sous 48h ouvrables. En cas d'approbation,
                  le remboursement sera effectue sous 5-7 jours ouvrables.
                </div>

                <button onClick={demanderRemboursement} disabled={sending}
                  className="w-full bg-[#1B7A56] text-white font-semibold py-3 rounded-xl
                    hover:bg-[#155f42] transition-colors disabled:opacity-50">
                  {sending ? 'Envoi en cours...' : 'Envoyer ma demande'}
                </button>
              </>
            )}
          </div>
        )}

        {/* HISTORIQUE */}
        {remboursements.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">
                Mes demandes ({remboursements.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-50">
              {remboursements.map(r => (
                <div key={r.id} className="px-6 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">
                        {r.demande?.titre ?? 'Mission'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{r.raison}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(r.created_at).toLocaleDateString('fr-FR')}
                      </p>
                      {r.reponse_admin && (
                        <div className="mt-2 bg-blue-50 rounded-lg px-3 py-2 text-xs text-blue-700">
                          Reponse : {r.reponse_admin}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statutBadge[r.statut]}`}>
                        {statutLabel[r.statut]}
                      </span>
                      <span className="font-bold text-gray-900 text-sm">
                        {r.montant?.toFixed(0)} MAD
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AIDE */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-3">Besoin d'aide ?</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Les remboursements sont traites sous 48h ouvrables</p>
            <p>• Le virement prend 5-7 jours ouvrables apres approbation</p>
            <p>• Pour toute question, contactez notre support</p>
          </div>
          <Link href="/support"
            className="mt-4 block text-center border border-gray-200 text-gray-600
              font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm">
            Contacter le support
          </Link>
        </div>
      </div>
    </div>
  )
}
