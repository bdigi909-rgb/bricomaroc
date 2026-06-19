// ============================================================
// BricoMaroc — Artisans Data Layer
// ============================================================

import { createServerSupabaseClient } from './supabase'
import type {
  ArtisanWithUser,
  SearchArtisansParams,
  SearchArtisansResult,
  BudgetEstimation,
} from '@/types'

// ============================================================
// Recherche artisans avec filtres
// ============================================================
export async function searchArtisans(
  params: SearchArtisansParams
): Promise<SearchArtisansResult> {
  const supabase = createServerSupabaseClient()
  const { categorie, ville = 'Marrakech', disponible, note_min, badge, page = 1, limit = 12 } = params
  const offset = (page - 1) * limit

  let query = supabase
    .from('artisans')
    .select(`
      *,
      user:users!artisans_user_id_fkey(*),
      categories:artisan_categories(
        categorie:categories(*)
      )
    `, { count: 'exact' })
    .eq('statut', 'verified')
    .eq('ville', ville)
    .order('note_moyenne', { ascending: false })
    .order('nb_missions', { ascending: false })
    .range(offset, offset + limit - 1)

  if (disponible !== undefined) query = query.eq('disponible', disponible)
  if (note_min) query = query.gte('note_moyenne', note_min)
  if (badge) query = query.eq('badge', badge)

  if (categorie) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorie)
      .single() as { data: { id: string } | null }

    if (cat) {
      const { data: artisanIds } = await supabase
        .from('artisan_categories')
        .select('artisan_id')
        .eq('categorie_id', cat.id) as { data: { artisan_id: string }[] | null }

      const ids = artisanIds?.map(a => a.artisan_id) ?? []
      if (ids.length > 0) query = query.in('id', ids)
    }
  }

  const { data, count, error } = await query

  const userIds = (data ?? []).map((a: any) => a.user_id)
  const { data: usersData } = await supabase
    .from('users')
    .select('*')
    .in('id', userIds)

  const usersMap = Object.fromEntries((usersData ?? []).map((u: any) => [u.id, u]))
  const enrichedData = (data ?? []).map((a: any) => ({
    ...a,
    user: usersMap[a.user_id] ?? null
  }))

  if (error) throw new Error(`searchArtisans: ${error.message}`)

  return {
    artisans: enrichedData as unknown as ArtisanWithUser[],
    total: count ?? 0,
    page,
    limit,
    has_more: (count ?? 0) > offset + limit,
  }
}

// ============================================================
// Artisan par ID
// ============================================================
export async function getArtisanById(id: string): Promise<ArtisanWithUser | null> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from('artisans')
    .select(`
      *,
      user:users!artisans_user_id_fkey(*),
      categories:artisan_categories(
        categorie:categories(*)
      ),
      avis(
        *,
        client:users(full_name, avatar_url)
      ),
      portfolio(*)
    `)
    .eq('id', id)
    .eq('statut', 'verified')
    .single()

  if (error || !data) return null
  return data as unknown as ArtisanWithUser
}

// ============================================================
// Artisans disponibles en urgence (proche)
// ============================================================
export async function getArtisansUrgence(
  categorie_slug: string,
  lat?: number,
  lng?: number
): Promise<ArtisanWithUser[]> {
  const supabase = createServerSupabaseClient()
  const { data: cat } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', categorie_slug)
    .single() as { data: { id: string } | null }

  if (!cat) return []

  const { data: artisanIds } = await supabase
    .from('artisan_categories')
    .select('artisan_id')
    .eq('categorie_id', cat.id) as { data: { artisan_id: string }[] | null }

  const ids = artisanIds?.map(a => a.artisan_id) ?? []
  if (ids.length === 0) return []

  const { data, error } = await supabase
    .from('artisans')
    .select(`*, user:users!artisans_user_id_fkey(*)`)
    .in('id', ids)
    .eq('statut', 'verified')
    .eq('disponible', true)
    .order('note_moyenne', { ascending: false })
    .limit(10)

  if (error) return []
  return (data ?? []) as unknown as ArtisanWithUser[]
}

// ============================================================
// Estimation budget IA
// ============================================================
export async function estimerBudgetIA(
  categorie_slug: string,
  type_travaux: string,
  surface?: number
): Promise<BudgetEstimation> {
  const supabase = createServerSupabaseClient()

  const { data: historique } = await supabase
    .from('devis')
    .select(`
      total,
      demande:demandes(
        categorie:categories(slug)
      )
    `)
    .eq('statut', 'accepted')
    .limit(100)
const devisCategorie = (historique as any[] ?? []).filter(
    (d: any) => d.demande?.categorie?.slug === categorie_slug
  )

  const totaux = devisCategorie.map(d => d.total)
  const moyenne = totaux.length > 0
    ? Math.round(totaux.reduce((a, b) => a + b, 0) / totaux.length)
    : 300

  const multiplicateur = surface ? Math.max(1, surface / 20) : 1

  const min = Math.round(moyenne * 0.6 * multiplicateur)
  const max = Math.round(moyenne * 1.4 * multiplicateur)

  const conseils: Record<string, string> = {
    plomberie: 'Demandez toujours un devis avant intervention. Le prix varie selon la complexité de la fuite.',
    electricite: 'Vérifiez que l\'artisan est certifié. Un tableau électrique complet coûte 800-2000 MAD.',
    peinture: 'Le prix dépend de la surface et du nombre de couches. Demandez un devis au m².',
    climatisation: 'L\'installation inclut généralement la mise en service. Vérifiez la garantie pièces.',
    menuiserie: 'Le bois massif coûte plus cher que l\'aggloméré. Précisez vos préférences dans la demande.',
  }

  return {
    categorie: categorie_slug,
    type_travaux,
    min,
    max,
    moyenne,
    nb_missions_base: totaux.length,
    conseil: conseils[categorie_slug] ?? 'Demandez un devis gratuit avant de vous engager.',
  }
}

// ============================================================
// Stats plateforme pour la page d'accueil
// ============================================================
export async function getPlatformeStats() {
  const supabase = createServerSupabaseClient()

  const [artisansRes, missionsRes, avisRes] = await Promise.all([
    supabase.from('artisans').select('id', { count: 'exact' }).eq('statut', 'verified'),
    supabase.from('demandes').select('id', { count: 'exact' }).eq('statut', 'completed'),
    supabase.from('avis').select('note_globale'),
  ])

  const notes = (avisRes.data as any[] ?? []).map((a: any) => a.note_globale)
  const moyenneGlobale = notes.length > 0
    ? (notes.reduce((a, b) => a + b, 0) / notes.length).toFixed(1)
    : '4.8'

  return {
    nb_artisans: artisansRes.count ?? 0,
    nb_missions: missionsRes.count ?? 0,
    note_moyenne: parseFloat(moyenneGlobale),
  }
}