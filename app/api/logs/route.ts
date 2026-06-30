import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const { action, details, userId } = await req.json()
    const ip = req.headers.get('x-forwarded-for') ?? 'unknown'

    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: (name: string) => cookieStore.get(name)?.value } }
    )

    await supabase.from('logs_activite').insert({
      user_id: userId ?? null,
      action,
      details: details ?? null,
      ip,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: (name: string) => cookieStore.get(name)?.value } }
    )

    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') ?? '50')
    const userId = searchParams.get('userId')

    let query = supabase
      .from('logs_activite')
      .select('*, user:users(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (userId) query = query.eq('user_id', userId)

    const { data } = await query as { data: any[] | null }

    return NextResponse.json({ logs: data ?? [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
