'use client'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CreerDevisPage({ params }: { params: { id: string } }) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const router = useRouter()

  const [demande, setDemande] = useState<any>(null)
  const [artisan, setArtisan] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [mainOeuvre, setMainOeuvre] = useState(200)
  const [materiaux, setMateriaux] = useState(0)
  const [deplacement, setDeplacement] = useState(50)
  const [description, setDescription] = useState('')
  const [dureeEstimee, setDureeEstimee] = useState('2h')
  const [valableJours, setValableJours] = useState(7)

  const total = mainOeuvre + materiaux + deplacement

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: artisanData } = await supabase
        .from('artisans')
        .select('*')
        .eq('user_id', user.id)
        .single() as { data: any }

      if (!artisanData) { router.push('/'); return }
      setArtisan(artisanData)

      const { data: demandeData } = await supabase
        .from('demandes')
        .select('*, categorie:categories(nom, icone), client:users!demandes_client_id_fkey(full_name)')
        .eq('id', params.id)
        .single() as { data: any }

      if (!demandeData) { router.push('/dashboard'); return }
      setDemande(demandeData)

      // Pré-remplir avec le budget du client si disponible
      if (demandeData.budget_min) {
        setMainOeuvre(demandeData.budget_min)
      }
      if (artisanData.frais_deplacement) {
        setDeplacement(artisanData.frais_deplacement)
      }

      setLoading(false)
    }
    load()
  }, [])

  async function envoyerDevis() {
    setSending(true)
    setError('')

    const { error: devisError } = await supabase.from('devis').insert({
      demande_id: params.id,
      artisan_id: artisan.id,
      main_oeuvre: mainOeuvre,
      materiaux,
      deplacement,
      description,
      duree_estimee: dureeEstimee,
      valable_jours: valableJours,
      statut: 'sent',
    })

    if (devisError) {
      setError(devisError.message)
      setSending(false)
      return
    }

    // Mettre à jour le statut de la demande
    await supabase.from('demandes').update({
      artisan_id: artisan.id,
      statut: 'accepted',
    }).eq('id', params.id)

    // Envoyer un message automatique dans la messagerie
    await supabase.from('messages').insert({
      demande_id: params.id,
      sender_id: artisan.user_id,
      receiver_id: demande.client_id,
      contenu: `J'ai envoyé un devis pour votre demande "${demande.titre}" : ${total} MAD (${dureeEstimee}). Valable ${valableJours} jours.`,
      type: 'text',
    })

    setSuccess(true)
    setSending(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center">
        <div className="text-gray-500">Chargement...</div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-md text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-gray-900">Devis envoyé !</h2>
          <p className="text-gray-500 text-sm mt-2">
            Le client a été notifié et peut accepter votre devis.
          </p>
          <Link href="/dashboard"
            className="mt-6 block w-full bg-[#1B7A56] text-white font-semibold
              py-3 rounded-xl hover:bg-[#155f42] transition-colors text-center">
            Retour au dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="text-xl font-bold text-[#1B7A56]">🔧 BricoMaroc</Link>
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-800">← Dashboard</Link>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Créer un devis</h1>

        {/* RÉSUMÉ DEMANDE */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">{demande?.categorie?.icone}</span>
            <div>
              <h3 className="font-bold text-gray-900">{demande?.titre}</h3>
              <p className="text-sm text-gray-500">Client : {demande?.client?.full_name}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3">{demande?.description}</p>
          {demande?.budget_min && (
            <p className="text-xs text-gray-400 mt-2">
              Budget client : {demande.budget_min}–{demande.budget_max} MAD
            </p>
          )}
        </div>

        {/* FORMULAIRE DEVIS */}
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-5">

          {/* MAIN D'ŒUVRE */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Main d'œuvre (MAD)
            </label>
            <input type="number" value={mainOeuvre}
              onChange={e => setMainOeuvre(parseInt(e.target.value) || 0)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                focus:outline-none focus:ring-2 focus:ring-[#1B7A56]" />
          </div>

          {/* MATÉRIAUX */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Matériaux (MAD)
            </label>
            <input type="number" value={materiaux}
              onChange={e => setMateriaux(parseInt(e.target.value) || 0)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                focus:outline-none focus:ring-2 focus:ring-[#1B7A56]" />
          </div>

          {/* DÉPLACEMENT */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Frais de déplacement (MAD)
            </label>
            <input type="number" value={deplacement}
              onChange={e => setDeplacement(parseInt(e.target.value) || 0)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                focus:outline-none focus:ring-2 focus:ring-[#1B7A56]" />
          </div>

          {/* TOTAL */}
          <div className="bg-green-50 rounded-xl p-4 flex justify-between items-center">
            <span className="font-bold text-gray-900">Total</span>
            <span className="text-2xl font-bold text-[#1B7A56]">{total} MAD</span>
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Description des travaux
            </label>
            <textarea value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Détaillez les travaux inclus dans ce devis..."
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                focus:outline-none focus:ring-2 focus:ring-[#1B7A56] resize-none" />
          </div>

          {/* DURÉE + VALIDITÉ */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Durée estimée
              </label>
              <select value={dureeEstimee} onChange={e => setDureeEstimee(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                  focus:outline-none focus:ring-2 focus:ring-[#1B7A56]">
                {['1h', '2h', '3h', '4h', 'Demi-journée', '1 jour', '2 jours', '1 semaine'].map(d => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Valable (jours)
              </label>
              <select value={valableJours} onChange={e => setValableJours(parseInt(e.target.value))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                  focus:outline-none focus:ring-2 focus:ring-[#1B7A56]">
                {[3, 7, 14, 30].map(j => (
                  <option key={j} value={j}>{j} jours</option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
          )}

          <button onClick={envoyerDevis} disabled={sending}
            className="w-full bg-[#1B7A56] text-white font-semibold py-3 rounded-xl
              hover:bg-[#155f42] transition-colors disabled:opacity-50">
            {sending ? 'Envoi...' : `Envoyer le devis — ${total} MAD`}
          </button>
        </div>
      </div>
    </div>
  )
}