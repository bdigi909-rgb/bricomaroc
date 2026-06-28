'use client'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function PushNotifications({ userId }: { userId: string }) {
  const [supported, setSupported] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setSupported(true)
      checkSubscription()
    }
  }, [])

  async function checkSubscription() {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    setSubscribed(!!sub)
  }

  async function sAbonner() {
    setLoading(true)
    try {
      const reg = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      })

      await fetch('/api/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'subscribe',
          subscription: sub,
          userId,
        }),
      })

      setSubscribed(true)
    } catch (err) {
      console.error('Push subscription error:', err)
    }
    setLoading(false)
  }

  async function seDesabonner() {
    setLoading(true)
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    if (sub) await sub.unsubscribe()
    setSubscribed(false)
    setLoading(false)
  }

  if (!supported) return null

  return (
    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
      <div>
        <p className="font-semibold text-gray-900 text-sm">
          Notifications push
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          {subscribed
            ? 'Vous recevez les alertes en temps reel'
            : 'Activez pour recevoir les alertes'}
        </p>
      </div>
      <button onClick={subscribed ? seDesabonner : sAbonner}
        disabled={loading}
        className={`text-xs font-semibold px-4 py-2 rounded-xl transition-colors ${
          subscribed
            ? 'bg-red-100 text-red-600 hover:bg-red-200'
            : 'bg-blue-500 text-white hover:bg-blue-600'
        } disabled:opacity-50`}>
        {loading ? '...' : subscribed ? 'Desactiver' : 'Activer'}
      </button>
    </div>
  )
}