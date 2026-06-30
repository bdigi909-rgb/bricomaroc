import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getCache, setCache } from '@/lib/cache'

export async function GET(req: NextRequest) {
  try {
    const cacheKey = 'stats:platform'
    const cached = getCache(cacheKey)
    if (cached) {
      return NextResponse.json({ ...cached, cached: true })
    }

    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: (name: string) => cookieStore.get(name)?.value } }
    )

    const [artisansRes, demandesRes, avisRes] = await Promise.all([
      supabase.from('artisans').select('id', { count: 'exact' }).eq('statut', 'verified'),
      supabase.from('demandes').select('id', { count: 'exact' }).eq('statut', 'completed'),
      supabase.from('avis').select('note_globale'),
    ])

    const notes = (avisRes.data ?? []).map((a: any) => a.note_globale).filter(Boolean)
    const noteMoyenne = notes.length > 0
      ? (notes.reduce((a: number, b: number) => a + b, 0) / notes.length).toFixed(1)
      : '5.0'

    const stats = {
      nb_artisans: artisansRes.count ?? 0,
      nb_missions: demandesRes.count ?? 0,
      note_moyenne: noteMoyenne,
    }

    // Cache 10 minutes
    setCache(cacheKey, stats, 600)

    return NextResponse.json({ ...stats, cached: false })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
