'use client'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SupportPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const router = useRouter()

  const [user, setUser] = useState<any>(null)
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [onglet, setOnglet] = useState<'nouveau' | 'mes-tickets'>('nouveau')

  const [sujet, setSujet] = useState('')
  const [message, setMessage] = useState('')
  const [categorie, setCategorie] = useState('general')
  const [priorite, setPriorite] = useState('normale')

  const categories = [
    { value: 'general', label: '💬 Question générale' },
    { value: 'paiement', label: '💳 Problème de paiement' },
    { value: 'artisan', label: '🔧 Problème avec un artisan' },
    { value: 'technique', label: '⚙️ Problème technique' },
    { value: 'compte', label: '👤 Mon compte' },
    { value: 'autre', label: '📋 Autre' },
  ]

  const priorites = [
    { value: 'basse', label: '🟢 Basse' },
    { value: 'normale', label: '🟡 Normale' },
    { value: 'haute', label: '🔴 Haute — Urgente' },
  ]

  useEffect(() => {
    async function load() {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) { router.push('/auth/login'); return }
      setUser(currentUser)

      const { data } = await supabase
        .from('tickets')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false }) as { data: any[] | null }

      setTickets(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  async function envoyerTicket() {
    if (!sujet.trim() || !message.trim()) return
    setSending(true)

    const { error } = await supabase.from('tickets').insert({
      user_id: user.id,
      sujet,
      message,
      categorie,
      priorite,
      statut: 'open',
    })

    if (!error) {
      // Envoyer email à l'admin
      await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'contact@bricomaroc.ma',
          subject: `[Support] ${sujet} — Priorité ${priorite}`,
          type: 'inscription',
          data: {
            nom: `Ticket de ${user.email}`,
            role: `Catégorie: ${categorie} | Message: ${message}`,
          },
        }),
      })

      setSuccess(true)
      setSujet('')
      setMessage('')
      setCategorie('general')
      setPriorite('normale')

      // Recharger tickets
      const { data } = await supabase
        .from('tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }) as { data: any[] | null }
      setTickets(data ?? [])

      setTimeout(() => {
        setSuccess(false)
        setOnglet('mes-tickets')
      }, 2000)
    }

    setSending(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center">
        <div className="text-gray-500">Chargement...</div>
      </div>
    )
  }

  const statutBadge: Record<string, string> = {
    open: 'bg-yellow-100 text-yellow-700',
    in_progress: 'bg-blue-100 text-blue-700',
    resolved: 'bg-green-100 text-green-700',
    closed: 'bg-gray-100 text-gray-600',
  }
  const statutLabel: Record<string, string> = {
    open: '⏳ Ouvert',
    in_progress: '🔧 En cours',
    resolved: '✅ Résolu',
    closed: '🔒 Fermé',
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-[#1B7A56]">🔧 BricoMaroc</Link>
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-800">← Accueil</Link>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">🎧 Support BricoMaroc</h1>
          <p className="text-gray-500 text-sm mt-1">
            Notre équipe répond sous 24h en jours ouvrables
          </p>
        </div>

        {/* FAQ RAPIDE */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
          <h2 className="font-bold text-gray-900 mb-3">❓ Questions fréquentes</h2>
          <div className="space-y-2">
            {[
              { q: 'Comment annuler une demande ?', r: 'Allez dans Espace client → votre demande → Annuler.' },
              { q: 'Comment contacter un artisan ?', r: 'Utilisez la messagerie intégrée depuis votre demande.' },
              { q: 'Mon paiement a échoué ?', r: 'Vérifiez vos informations bancaires et réessayez. Contactez-nous si le problème persiste.' },
              { q: 'Comment signaler un artisan ?', r: 'Depuis le profil de l\'artisan, utilisez le bouton Signaler.' },
            ].map((faq, i) => (
              <details key={i} className="group">
                <summary className="flex items-center justify-between cursor-pointer
                  py-2 text-sm font-medium text-gray-700 hover:text-[#1B7A56]">
                  {faq.q}
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="text-sm text-gray-500 pb-2 pl-2">{faq.r}</p>
              </details>
            ))}
          </div>
        </div>

        {/* ONGLETS */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'nouveau', label: '✏️ Nouveau ticket' },
            { key: 'mes-tickets', label: `📋 Mes tickets (${tickets.length})` },
          ].map(tab => (
            <button key={tab.key}
              onClick={() => setOnglet(tab.key as any)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                onglet === tab.key
                  ? 'bg-[#1B7A56] text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* NOUVEAU TICKET */}
        {onglet === 'nouveau' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-gray-900">Créer un ticket</h2>

            {success && (
              <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-xl">
                ✅ Ticket envoyé ! Notre équipe vous répondra sous 24h.
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
              <select value={categorie} onChange={e => setCategorie(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                  focus:outline-none focus:ring-2 focus:ring-[#1B7A56]">
                {categories.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
              <div className="flex gap-2">
                {priorites.map(p => (
                  <button key={p.value} onClick={() => setPriorite(p.value)}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium border-2 transition-all ${
                      priorite === p.value
                        ? 'border-[#1B7A56] bg-green-50 text-[#1B7A56]'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sujet</label>
              <input type="text" value={sujet} onChange={e => setSujet(e.target.value)}
                placeholder="Décrivez brièvement votre problème..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                  focus:outline-none focus:ring-2 focus:ring-[#1B7A56]" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)}
                placeholder="Décrivez votre problème en détail..."
                rows={5}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                  focus:outline-none focus:ring-2 focus:ring-[#1B7A56] resize-none" />
            </div>

            <button onClick={envoyerTicket}
              disabled={sending || !sujet.trim() || !message.trim()}
              className="w-full bg-[#1B7A56] text-white font-semibold py-3 rounded-xl
                hover:bg-[#155f42] transition-colors disabled:opacity-50">
              {sending ? 'Envoi...' : '📤 Envoyer le ticket'}
            </button>

            <div className="text-center text-xs text-gray-400 mt-2">
              Vous pouvez aussi nous écrire à{' '}
              <a href="mailto:contact@bricomaroc.ma"
                className="text-[#1B7A56] hover:underline">
                contact@bricomaroc.ma
              </a>
            </div>
          </div>
        )}

        {/* MES TICKETS */}
        {onglet === 'mes-tickets' && (
          <div className="space-y-4">
            {tickets.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                <div className="text-4xl mb-3">🎧</div>
                <p className="text-gray-500 mb-4">Aucun ticket pour le moment</p>
                <button onClick={() => setOnglet('nouveau')}
                  className="bg-[#1B7A56] text-white font-semibold px-6 py-3 rounded-xl
                    hover:bg-[#155f42] transition-colors">
                  Créer un ticket
                </button>
              </div>
            ) : (
              tickets.map(ticket => (
                <div key={ticket.id} className="bg-white rounded-2xl p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-sm">{ticket.sujet}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(ticket.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric', month: 'long', year: 'numeric'
                        })}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0
                      ${statutBadge[ticket.statut]}`}>
                      {statutLabel[ticket.statut]}
                    </span>
                  </div>

                  <div className="flex gap-2 mb-3">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {categories.find(c => c.value === ticket.categorie)?.label ?? ticket.categorie}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      ticket.priorite === 'haute' ? 'bg-red-100 text-red-600' :
                      ticket.priorite === 'normale' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      Priorité {ticket.priorite}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3 mb-3">
                    {ticket.message}
                  </p>

                  {ticket.reponse && (
                    <div className="bg-[#1B7A56]/5 border border-[#1B7A56]/20 rounded-xl p-3">
                      <p className="text-xs font-bold text-[#1B7A56] mb-1">
                        ✅ Réponse de l'équipe BricoMaroc
                      </p>
                      <p className="text-sm text-gray-700">{ticket.reponse}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}