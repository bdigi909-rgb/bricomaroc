import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { data: artisans } = await supabase
      .from('artisans')
      .select('id, nb_missions, note_moyenne, nb_avis, created_at, badge_special')
      .eq('statut', 'verified')

    const maintenant = new Date()
    const moisDernier = new Date()
    moisDernier.setMonth(moisDernier.getMonth() - 1)

    const updates: any[] = []

    for (const artisan of artisans ?? []) {
      let badge_special = null

      const createdAt = new Date(artisan.created_at)
      const joursDepuisInscription = Math.floor(
        (maintenant.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
      )

      // Badge "Nouveau" — inscrit depuis moins de 30 jours
      if (joursDepuisInscription <= 30) {
        badge_special = 'nouveau'
      }

      // Badge "Fiable" — plus de 20 missions ET note >= 4.5
      if (artisan.nb_missions >= 20 && artisan.note_moyenne >= 4.5) {
        badge_special = 'fiable'
      }

      // Badge "Top du mois" — plus de 50 missions ET note >= 4.7
      if (artisan.nb_missions >= 50 && artisan.note_moyenne >= 4.7) {
        badge_special = 'top_mois'
      }

      // Badge "Expert" — plus de 100 missions ET note >= 4.8
      if (artisan.nb_missions >= 100 && artisan.note_moyenne >= 4.8) {
        badge_special = 'expert'
      }

      if (badge_special !== artisan.badge_special) {
        updates.push({
          id: artisan.id,
          badge_special,
          badge_date: badge_special ? maintenant.toISOString() : null,
        })
      }
    }

    // Appliquer les mises à jour
    for (const update of updates) {
      await supabase.from('artisans')
        .update({ badge_special: update.badge_special, badge_date: update.badge_date })
        .eq('id', update.id)
    }

    return NextResponse.json({
      success: true,
      updated: updates.length,
      message: `${updates.length} badges mis à jour`,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ message: 'API Badges BricoMaroc — POST pour recalculer' })
}
