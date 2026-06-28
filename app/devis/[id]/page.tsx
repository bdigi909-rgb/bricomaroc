'use client'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function DevisPage({ params }: { params: { id: string } }) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const router = useRouter()

  const [user, setUser] = useState<any>(null)
  const [devis, setDevis] = useState<any>(null)
  const [demande, setDemande] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<'client' | 'artisan' | null>(null)

  const [showContreOffre, setShowContreOffre] = useState(false)
  const [montantContreOffre, setMontantContreOffre] = useState('')
  const [messageContreOffre, setMessageContreOffre] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) { router.push('/auth/login'); return }
      setUser(currentUser)

      const { data: devisData } = await supabase
        .from('devis')
        .select('*, artisan:artisans(id, user_id, ville, user:users(full_name, phone))')
        .eq('id', params.id)
        .single() as { data: any }

      if (!devisData) { router.push('/'); return }
      setDevis(devisData)

      const { data: demandeData } = await supabase
        .from('demandes')
        .select('*, categorie:categories(nom, icone), client:users!demandes_client_id_fkey(full_name)')
        .eq('id', devisData.demande_id)
        .single() as { data: any }

      setDemande(demandeData)

      // Déterminer le rôle
      if (demandeData?.client_id === currentUser.id) {
        setRole('client')
      } else if (devisData?.artisan?.user_id === currentUser.id) {
        setRole('artisan')
      }

      setLoading(false)
    }
    load()
  }, [])

  async function accepterDevis() {
    setSending(true)
    await supabase.from('devis').update({
      statut: 'accepted',
      accepted_at: new Date().toISOString(),
    }).eq('id', params.id)

    await supabase.from('demandes').update({ statut: 'accepted' }).eq('id', devis.demande_id)

    await supabase.from('notifications').insert({
      user_id: devis.artisan?.user_id,
      titre: 'Devis accepte !',
      message: `Votre devis de ${devis.total} MAD a ete accepte.`,
      type: 'success',
      lien: `/messages/${devis.demande_id}`,
    })

    await supabase.from('messages').insert({
      demande_id: devis.demande_id,
      sender_id: user.id,
      receiver_id: devis.artisan?.user_id,
      contenu: `J'ai accepte votre devis de ${devis.total} MAD. Quand pouvez-vous intervenir ?`,
      type: 'text',
    })

    setDevis((prev: any) => ({ ...prev, statut: 'accepted' }))
    setSending(false)
    router.push(`/messages/${devis.demande_id}`)
  }

  async function refuserDevis() {
    setSending(true)
    await supabase.from('devis').update({ statut: 'rejected' }).eq('id', params.id)

    await supabase.from('notifications').insert({
      user_id: devis.artisan?.user_id,
      titre: 'Devis refuse',
      message: `Votre devis de ${devis.total} MAD a ete refuse.`,
      type: 'error',
      lien: `/messages/${devis.demande_id}`,
    })

    setDevis((prev: any) => ({ ...prev, statut: 'rejected' }))
    setSending(false)
  }

  async function envoyerContreOffre() {
    if (!montantContreOffre || parseFloat(montantContreOffre) <= 0) {
      alert('Entrez un montant valide')
      return
    }
    setSending(true)

    // Sauvegarder historique
    const historique = devis.historique ?? []
    historique.push({
      type: 'contre_offre',
      montant: parseFloat(montantContreOffre),
      message: messageContreOffre,
      par: role,
      date: new Date().toISOString(),
    })

    await supabase.from('devis').update({
      contre_offre_montant: parseFloat(montantContreOffre),
      contre_offre_message: messageContreOffre,
      contre_offre_statut: 'pending',
      statut: 'negotiation',
      historique,
    }).eq('id', params.id)

    // Notifier l'autre partie
    const destinataireId = role === 'client'
      ? devis.artisan?.user_id
      : demande?.client_id

    await supabase.from('notifications').insert({
      user_id: destinataireId,
      titre: 'Contre-offre recue',
      message: `Une contre-offre de ${montantContreOffre} MAD a ete proposee.`,
      type: 'info',
      lien: `/devis/${params.id}`,
    })

    await supabase.from('messages').insert({
      demande_id: devis.demande_id,
      sender_id: user.id,
      receiver_id: destinataireId,
      contenu: `Je propose une contre-offre de ${montantContreOffre} MAD. ${messageContreOffre}`,
      type: 'text',
    })

    setDevis((prev: any) => ({
      ...prev,
      contre_offre_montant: parseFloat(montantContreOffre),
      contre_offre_message: messageContreOffre,
      contre_offre_statut: 'pending',
      statut: 'negotiation',
      historique,
    }))

    setShowContreOffre(false)
    setMontantContreOffre('')
    setMessageContreOffre('')
    setSending(false)
  }

  async function accepterContreOffre() {
    setSending(true)

    const historique = devis.historique ?? []
    historique.push({
      type: 'contre_offre_acceptee',
      montant: devis.contre_offre_montant,
      par: role,
      date: new Date().toISOString(),
    })

    await supabase.from('devis').update({
      total: devis.contre_offre_montant,
      contre_offre_statut: 'accepted',
      statut: 'accepted',
      accepted_at: new Date().toISOString(),
      historique,
    }).eq('id', params.id)

    await supabase.from('demandes').update({ statut: 'accepted' }).eq('id', devis.demande_id)

    const destinataireId = role === 'client'
      ? devis.artisan?.user_id
      : demande?.client_id

    await supabase.from('notifications').insert({
      user_id: destinataireId,
      titre: 'Contre-offre acceptee !',
      message: `La contre-offre de ${devis.contre_offre_montant} MAD a ete acceptee.`,
      type: 'success',
      lien: `/messages/${devis.demande_id}`,
    })

    setDevis((prev: any) => ({
      ...prev,
      total: devis.contre_offre_montant,
      contre_offre_statut: 'accepted',
      statut: 'accepted',
      historique,
    }))

    setSending(false)
    router.push(`/messages/${devis.demande_id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center">
        <div className="text-gray-500">Chargement...</div>
      </div>
    )
  }

  const statutBadge: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    sent: 'bg-yellow-100 text-yellow-700',
    accepted: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    negotiation: 'bg-blue-100 text-blue-700',
    expired: 'bg-gray-100 text-gray-600',
  }

  const statutLabel: Record<string, string> = {
    pending: 'En attente',
    sent: 'En attente',
    accepted: 'Accepte',
    rejected: 'Refuse',
    negotiation: 'En negotiation',
    expired: 'Expire',
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-[#1B7A56]">BricoMaroc</Link>
        <Link href={role === 'client' ? '/espace-client' : '/dashboard'}
          className="text-sm text-gray-500 hover:text-gray-800">
          {role === 'client' ? 'Mon espace' : 'Dashboard'}
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Devis</h1>
          <p className="text-gray-500 text-sm mt-1">
            {demande?.categorie?.icone} {demande?.titre}
          </p>
        </div>

        {/* STATUT */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className={`text-sm px-3 py-1.5 rounded-full font-medium ${statutBadge[devis.statut]}`}>
              {statutLabel[devis.statut]}
            </span>
            <span className="text-xs text-gray-400">
              {new Date(devis.created_at).toLocaleDateString('fr-FR')}
            </span>
          </div>

          {/* DETAIL DEVIS */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Main d'oeuvre</span>
              <span className="font-medium">{devis.main_oeuvre} MAD</span>
            </div>
            {devis.materiaux > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Materiaux</span>
                <span className="font-medium">{devis.materiaux} MAD</span>
              </div>
            )}
            {devis.deplacement > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Deplacement</span>
                <span className="font-medium">{devis.deplacement} MAD</span>
              </div>
            )}
            <div className="border-t border-gray-100 pt-3 flex justify-between">
              <span className="font-bold text-gray-900">Total</span>
              <span className="font-bold text-[#1B7A56] text-xl">{devis.total} MAD</span>
            </div>
          </div>

          {devis.description && (
            <div className="mt-4 bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
              {devis.description}
            </div>
          )}

          <div className="flex gap-4 mt-4 text-xs text-gray-400">
            {devis.duree_estimee && <span>Duree : {devis.duree_estimee}h</span>}
            {devis.valable_jours && <span>Valable {devis.valable_jours} jours</span>}
          </div>
        </div>

        {/* ARTISAN */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-3">Artisan</h2>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1B7A56] text-white font-bold
              flex items-center justify-center">
              {(devis.artisan?.user?.full_name ?? 'A')[0].toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{devis.artisan?.user?.full_name}</p>
              <p className="text-xs text-gray-500">{devis.artisan?.ville}</p>
            </div>
            <Link href={`/artisans/${devis.artisan?.id}`}
              className="ml-auto text-xs bg-gray-100 text-gray-600 px-3 py-1.5
                rounded-lg hover:bg-[#1B7A56] hover:text-white transition-colors">
              Voir profil
            </Link>
          </div>
        </div>

        {/* HISTORIQUE NEGOCIATION */}
        {devis.historique && devis.historique.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-3">Historique de negociation</h2>
            <div className="space-y-3">
              {devis.historique.map((h: any, i: number) => (
                <div key={i} className={`p-3 rounded-xl text-sm ${
                  h.type === 'contre_offre_acceptee'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-blue-50 text-blue-700'
                }`}>
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold">
                      {h.type === 'contre_offre' ? 'Contre-offre' : 'Acceptee'} par {h.par === 'client' ? 'le client' : "l'artisan"}
                    </span>
                    <span className="font-bold">{h.montant} MAD</span>
                  </div>
                  {h.message && <p className="text-xs opacity-75">{h.message}</p>}
                  <p className="text-xs opacity-50 mt-1">
                    {new Date(h.date).toLocaleDateString('fr-FR', {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CONTRE-OFFRE EN ATTENTE */}
        {devis.statut === 'negotiation' && devis.contre_offre_statut === 'pending' && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
            <h2 className="font-bold text-blue-900 mb-2">Contre-offre proposee</h2>
            <p className="text-2xl font-bold text-blue-600 mb-1">
              {devis.contre_offre_montant} MAD
            </p>
            {devis.contre_offre_message && (
              <p className="text-sm text-blue-700 mb-4">{devis.contre_offre_message}</p>
            )}

            {/* Le destinataire peut accepter ou faire une nouvelle contre-offre */}
            <div className="flex gap-3">
              <button onClick={accepterContreOffre} disabled={sending}
                className="flex-1 bg-green-500 text-white font-semibold py-2.5 rounded-xl
                  hover:bg-green-600 transition-colors text-sm disabled:opacity-50">
                Accepter {devis.contre_offre_montant} MAD
              </button>
              <button onClick={() => setShowContreOffre(true)}
                className="flex-1 bg-blue-500 text-white font-semibold py-2.5 rounded-xl
                  hover:bg-blue-600 transition-colors text-sm">
                Nouvelle contre-offre
              </button>
            </div>
          </div>
        )}

        {/* ACTIONS CLIENT */}
       {role === 'client' && (devis.statut === 'pending' || devis.statut === 'sent') && (
          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
            <h2 className="font-bold text-gray-900">Votre decision</h2>
            <div className="flex gap-3">
              <button onClick={accepterDevis} disabled={sending}
                className="flex-1 bg-[#1B7A56] text-white font-semibold py-3 rounded-xl
                  hover:bg-[#155f42] transition-colors disabled:opacity-50">
                Accepter {devis.total} MAD
              </button>
              <button onClick={() => setShowContreOffre(!showContreOffre)}
                className="flex-1 bg-blue-500 text-white font-semibold py-3 rounded-xl
                  hover:bg-blue-600 transition-colors">
                Negocier
              </button>
              <button onClick={refuserDevis} disabled={sending}
                className="flex-1 bg-red-500 text-white font-semibold py-3 rounded-xl
                  hover:bg-red-600 transition-colors disabled:opacity-50">
                Refuser
              </button>
            </div>
          </div>
        )}

        {/* ACTIONS ARTISAN */}
        {role === 'artisan' && (devis.statut === 'pending' || devis.statut === 'sent') && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-3">En attente de reponse du client</h2>
            <div className="flex gap-3">
              <button onClick={() => setShowContreOffre(!showContreOffre)}
                className="flex-1 bg-blue-500 text-white font-semibold py-3 rounded-xl
                  hover:bg-blue-600 transition-colors">
                Modifier mon offre
              </button>
              <Link href={`/messages/${devis.demande_id}`}
                className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl
                  hover:bg-gray-200 transition-colors text-center text-sm">
                Messagerie
              </Link>
            </div>
          </div>
        )}

        {/* FORMULAIRE CONTRE-OFFRE */}
        {showContreOffre && (
          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="font-bold text-gray-900">
              {role === 'client' ? 'Votre contre-offre' : 'Modifier votre offre'}
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Montant propose (MAD) *
              </label>
              <input type="number"
                value={montantContreOffre}
                onChange={e => setMontantContreOffre(e.target.value)}
                placeholder={`Devis original : ${devis.total} MAD`}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                  focus:outline-none focus:ring-2 focus:ring-[#1B7A56]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message (optionnel)
              </label>
              <textarea
                value={messageContreOffre}
                onChange={e => setMessageContreOffre(e.target.value)}
                placeholder="Expliquez votre contre-offre..."
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                  focus:outline-none focus:ring-2 focus:ring-[#1B7A56] resize-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowContreOffre(false)}
                className="flex-1 border border-gray-200 text-gray-600 font-semibold
                  py-3 rounded-xl hover:bg-gray-50 transition-colors">
                Annuler
              </button>
              <button onClick={envoyerContreOffre} disabled={sending}
                className="flex-1 bg-blue-500 text-white font-semibold py-3 rounded-xl
                  hover:bg-blue-600 transition-colors disabled:opacity-50">
                {sending ? 'Envoi...' : 'Envoyer la contre-offre'}
              </button>
            </div>
          </div>
        )}

        {/* DEVIS ACCEPTE */}
        {devis.statut === 'accepted' && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
            <div className="text-3xl mb-2">🎉</div>
            <h2 className="font-bold text-green-700 mb-1">Devis accepte !</h2>
            <p className="text-green-600 text-sm mb-4">
              Montant final : {devis.total} MAD
            </p>
            <Link href={`/messages/${devis.demande_id}`}
              className="bg-[#1B7A56] text-white font-semibold px-6 py-2.5 rounded-xl
                hover:bg-[#155f42] transition-colors inline-block text-sm">
              Continuer dans la messagerie
            </Link>
          </div>
        )}

        {/* DEVIS REFUSE */}
        {devis.statut === 'rejected' && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center">
            <div className="text-3xl mb-2">❌</div>
            <h2 className="font-bold text-red-700 mb-1">Devis refuse</h2>
            <Link href="/artisans"
              className="bg-[#1B7A56] text-white font-semibold px-6 py-2.5 rounded-xl
                hover:bg-[#155f42] transition-colors inline-block text-sm mt-3">
              Trouver un autre artisan
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}