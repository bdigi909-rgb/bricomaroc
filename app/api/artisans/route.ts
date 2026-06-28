import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getCache, setCache } from '@/lib/cache'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const ville = searchParams.get('ville') ?? ''
    const categorie = searchParams.get('categorie') ?? ''
    const q = searchParams.get('q') ?? ''
    const limit = parseInt(searchParams.get('limit') ?? '20')

    const cacheKey = `artisans:${ville}:${categorie}:${q}:${limit}`
    const cached = getCache(cacheKey)
    if (cached) {
      return NextResponse.json({ artisans: cached, cached: true })
    }

    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: (name) => cookieStore.get(name)?.value } }
    )

    let query = supabase
      .from('artisans')
      .select('*, user:users(full_name, phone), categories:artisan_categories(categorie:categories(nom, icone))')
      .eq('statut', 'verified')
      .eq('disponible', true)
      .order('note_moyenne', { ascending: false })
      .limit(limit)

    if (ville) query = query.ilike('ville', `%${ville}%`)

    const { data: artisans } = await query as { data: any[] | null }

    // Cache 5 minutes
    setCache(cacheKey, artisans ?? [], 300)

    return NextResponse.json({ artisans: artisans ?? [], cached: false })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}