'use client'
import { useState, useEffect, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function MessagesPage({ params }: { params: { id: string } }) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [demande, setDemande] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUser(user)

      const { data: dem } = await supabase
        .from('demandes')
        .select(`
          *,
          categorie:categories(nom, icone),
          client:users!demandes_client_id_fkey(full_name),
          artisan:artisans(user_id, user:users(full_name))
        `)
        .eq('id', params.id)
        .single() as { data: any }

      if (!dem) { router.push('/'); return }
      setDemande(dem)

      // Charger les messages
      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .eq('demande_id', params.id)
        .order('created_at', { ascending: true }) as { data: any[] | null }

      // Enrichir avec les noms des senders
      const senderIds = [...new Set((msgs ?? []).map((m: any) => m.sender_id))]
      const { data: sendersData } = await supabase
        .from('users')
        .select('id, full_name')
        .in('id', senderIds)
      const sendersMap = Object.fromEntries((sendersData ?? []).map((u: any) => [u.id, u]))
      const enrichedMsgs = (msgs ?? []).map((m: any) => ({
        ...m,
        sender: sendersMap[m.sender_id] ?? { full_name: 'Inconnu' }
      }))

      setMessages(enrichedMsgs)
      setLoading(false)

      await supabase
        .from('messages')
        .update({ lu: true })
        .eq('demande_id', params.id)
        .neq('sender_id', user.id)
    }
    load()
  }, [])

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel(`messages:${params.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `demande_id=eq.${params.id}`,
        },
        async (payload) => {
          const { data: sender } = await supabase
            .from('users')
            .select('full_name')
            .eq('id', payload.new.sender_id)
            .single() as { data: any }

          const msg = { ...payload.new, sender }
          setMessages(prev => [...prev, msg])
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [params.id])

  // Scroll automatique
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

async function sendMessage() {
    if (!newMessage.trim() || !user || !demande) return
    setSending(true)

    const receiverId = demande.client_id === user.id
      ? demande.artisan?.user_id
      : demande.client_id

    if (!receiverId) {
      alert('Aucun artisan assigne a cette demande.')
      setSending(false)
      return
    }

 await supabase.from('messages').insert({
      demande_id: params.id,
      sender_id: user.id,
      receiver_id: receiverId,
      contenu: newMessage.trim(),
      type: 'text',
    })

    setNewMessage('')
    setSending(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center">
        <div className="text-gray-500">Chargement...</div>
      </div>
    )
  }

  const clientName = demande?.client?.full_name ?? 'Client'
  const artisanName = demande?.artisan?.user?.full_name ?? 'Artisan'
  const otherName = demande?.client_id === user?.id ? artisanName : clientName

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col">
      {/* HEADER */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <Link href={demande?.client_id === user?.id ? '/espace-client' : '/dashboard'}
          className="text-gray-500 hover:text-gray-800">
          ←
        </Link>
        <div className="flex-1">
          <div className="font-bold text-gray-900 text-sm">{otherName}</div>
          <div className="text-xs text-gray-500">
            {demande?.categorie?.icone} {demande?.titre}
          </div>
        </div>
        <div className={`text-xs px-2 py-1 rounded-full font-medium ${
          demande?.statut === 'pending' ? 'bg-yellow-100 text-yellow-700' :
          demande?.statut === 'accepted' ? 'bg-blue-100 text-blue-700' :
          'bg-green-100 text-green-700'
        }`}>
          {demande?.statut === 'pending' ? 'En attente' :
           demande?.statut === 'accepted' ? 'Acceptée' : 'Terminée'}
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 text-sm py-12">
            Aucun message pour le moment.<br />
            Commencez la conversation !
          </div>
        )}

        {messages.map((msg: any) => {
          const isMe = msg.sender_id === user?.id
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${
                isMe
                  ? 'bg-[#1B7A56] text-white rounded-br-sm'
                  : 'bg-white text-gray-900 rounded-bl-sm shadow-sm'
              }`}>
                {!isMe && (
                  <div className="text-xs font-semibold mb-1 text-[#1B7A56]">
                    {msg.sender?.full_name ?? 'Inconnu'}
                  </div>
                )}
                <p className="leading-relaxed">{msg.contenu}</p>
                <div className={`text-xs mt-1 ${isMe ? 'text-green-200' : 'text-gray-400'}`}>
                  {new Date(msg.created_at).toLocaleTimeString('fr-FR', {
                    hour: '2-digit', minute: '2-digit'
                  })}
                  {isMe && msg.lu && <span className="ml-1">✓✓</span>}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div className="bg-white border-t border-gray-100 px-4 py-3 sticky bottom-0">
        <div className="flex gap-2 items-end max-w-4xl mx-auto">
          <textarea
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendMessage()
              }
            }}
            placeholder="Écrire un message..."
            rows={1}
            className="flex-1 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm
              focus:outline-none focus:ring-2 focus:ring-[#1B7A56] resize-none"
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || sending}
            className="bg-[#1B7A56] text-white w-10 h-10 rounded-full flex items-center
              justify-center hover:bg-[#155f42] transition-colors disabled:opacity-40 flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}