'use client'
import { useState, useEffect, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'

export default function Notifications({ userId }: { userId: string }) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [notifications, setNotifications] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const nonLues = notifications.filter(n => !n.lu).length

  useEffect(() => {
    // Charger notifications
    async function load() {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20) as { data: any[] | null }
      setNotifications(data ?? [])
    }
    load()

    // Realtime
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        setNotifications(prev => [payload.new, ...prev])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  // Fermer en cliquant dehors
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function marquerLu(id: string) {
    await supabase.from('notifications').update({ lu: true }).eq('id', id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, lu: true } : n))
  }

  async function marquerToutLu() {
    await supabase.from('notifications').update({ lu: true }).eq('user_id', userId)
    setNotifications(prev => prev.map(n => ({ ...n, lu: true })))
  }

  function iconType(type: string) {
    const icons: Record<string, string> = {
      devis: '📋',
      message: '💬',
      mission: '🔧',
      avis: '⭐',
      paiement: '💳',
      info: 'ℹ️',
    }
    return icons[type] ?? 'ℹ️'
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
        <span className="text-xl">🔔</span>
        {nonLues > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white
            text-xs font-bold rounded-full flex items-center justify-center">
            {nonLues > 9 ? '9+' : nonLues}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl
          border border-gray-100 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-sm">
              Notifications {nonLues > 0 && `(${nonLues})`}
            </h3>
            {nonLues > 0 && (
              <button onClick={marquerToutLu}
                className="text-xs text-[#1B7A56] hover:underline font-medium">
                Tout marquer lu
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                <div className="text-3xl mb-2">🔔</div>
                Aucune notification
              </div>
            ) : (
              notifications.map(notif => (
                <div key={notif.id}
                  onClick={() => marquerLu(notif.id)}
                  className={`px-4 py-3 border-b border-gray-50 cursor-pointer
                    hover:bg-gray-50 transition-colors ${!notif.lu ? 'bg-blue-50' : ''}`}>
                  <div className="flex items-start gap-3">
                    <span className="text-lg flex-shrink-0">{iconType(notif.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium text-gray-900 ${!notif.lu ? 'font-semibold' : ''}`}>
                        {notif.titre}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notif.created_at).toLocaleString('fr-FR', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {!notif.lu && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                    )}
                  </div>
                  {notif.lien && (
                    <Link href={notif.lien}
                      className="text-xs text-[#1B7A56] font-medium hover:underline mt-1 block">
                      Voir →
                    </Link>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="px-4 py-2 border-t border-gray-100 text-center">
            <button onClick={() => setOpen(false)}
              className="text-xs text-gray-400 hover:text-gray-600">
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}