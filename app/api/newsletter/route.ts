import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const { email, nom, type } = await req.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
    }

    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: (name) => cookieStore.get(name)?.value } }
    )

    // Vérifier si déjà inscrit
    const { data: existing } = await supabase
      .from('newsletter')
      .select('id')
      .eq('email', email)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Email déjà inscrit' }, { status: 400 })
    }

    // Inscrire
    await supabase.from('newsletter').insert({
      email,
      nom: nom ?? '',
      type: type ?? 'client',
      actif: true,
    })

    // Email de confirmation
   await fetch(`http://localhost:3000/api/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: email,
        subject: 'Bienvenue dans la newsletter BricoMaroc !',
        type: 'newsletter',
        data: { nom: nom ?? 'cher abonne' },
      }),
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}