import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'


export async function POST(req: NextRequest) {
  try {
    if (process.env.VAPID_EMAIL && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_EMAIL,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  )
}
    const { action, subscription, userId, title, body, url } = await req.json()

    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: (name: string) => cookieStore.get(name)?.value } }
    )

    // Sauvegarder subscription
    if (action === 'subscribe') {
      await supabase.from('push_subscriptions').upsert({
        user_id: userId,
        subscription: JSON.stringify(subscription),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
      return NextResponse.json({ success: true })
    }

    // Envoyer notification
    if (action === 'send') {
      const { data: subs } = await supabase
        .from('push_subscriptions')
        .select('subscription')
        .eq('user_id', userId) as { data: any[] | null }

      for (const sub of subs ?? []) {
        try {
          await webpush.sendNotification(
            JSON.parse(sub.subscription),
            JSON.stringify({ title, body, url: url ?? '/' })
          )
        } catch (err) {
          console.log('Push error:', err)
        }
      }
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Action inconnue' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
