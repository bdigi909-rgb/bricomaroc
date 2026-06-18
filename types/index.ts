// ============================================================
// BricoMaroc — TypeScript Types
// ============================================================

export type UserRole = 'client' | 'artisan' | 'admin'
export type ArtisanStatus = 'pending' | 'verified' | 'suspended' | 'excluded'
export type ArtisanBadge = 'none' | 'verified' | 'elite'
export type DemandeStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'
export type UrgenceLevel = 'normal' | 'urgent' | 'very_urgent'
export type DevisStatus = 'draft' | 'sent' | 'accepted' | 'rejected'
export type PaymentStatus = 'pending' | 'held' | 'released' | 'refunded'
export type PaymentMethod = 'cmi' | 'stripe' | 'cash' | 'wallet'

export interface User {
  id: string
  email: string
  phone?: string
  full_name: string
  avatar_url?: string
  role: UserRole
  ville?: string
  quartier?: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  slug: string
  nom: string
  nom_ar?: string
  icone: string
  couleur: string
  position: number
  active: boolean
}

export interface Artisan {
  id: string
  user_id: string
  bio?: string
  annees_experience: number
  langues: string[]
  ville: string
  quartiers: string[]
  rayon_km: number
  latitude?: number
  longitude?: number
  statut: ArtisanStatus
  badge: ArtisanBadge
  cin_verifie: boolean
  disponible: boolean
  jours_dispo: number[]
  heure_debut: string
  heure_fin: string
  urgences_24h: boolean
  frais_deplacement: number
  tarif_min: number
  tarif_max: number
  devis_gratuit: boolean
  note_moyenne: number
  nb_avis: number
  nb_missions: number
  taux_reponse: number
  plan: 'free' | 'pro' | 'vip'
  solde_wallet: number
  created_at: string
  updated_at: string
  // Relations jointes
  user?: User
  categories?: Category[]
  avis?: Avis[]
  portfolio?: Portfolio[]
}

export interface ArtisanWithUser extends Artisan {
  user: User
  categories: Category[]
}

export interface Demande {
  id: string
  client_id: string
  artisan_id?: string
  categorie_id: string
  titre: string
  description: string
  photos_urls: string[]
  adresse: string
  quartier?: string
  latitude?: number
  longitude?: number
  urgence: UrgenceLevel
  date_souhaitee?: string
  heure_souhaitee?: string
  flexible: boolean
  budget_min?: number
  budget_max?: number
  budget_ia_min?: number
  budget_ia_max?: number
  statut: DemandeStatus
  created_at: string
  updated_at: string
  accepted_at?: string
  completed_at?: string
  // Relations
  client?: User
  artisan?: ArtisanWithUser
  categorie?: Category
  devis?: Devis[]
  messages?: Message[]
}

export interface Message {
  id: string
  demande_id: string
  sender_id: string
  receiver_id: string
  contenu?: string
  type: 'text' | 'image' | 'devis' | 'system'
  media_url?: string
  devis_id?: string
  lu: boolean
  created_at: string
  sender?: User
}

export interface Avis {
  id: string
  demande_id: string
  client_id: string
  artisan_id: string
  note_globale: number
  note_qualite?: number
  note_ponctualite?: number
  note_comm?: number
  note_prix?: number
  commentaire?: string
  tags: string[]
  photos_avant: string[]
  photos_apres: string[]
  conteste: boolean
  reponse_artisan?: string
  created_at: string
  client?: User
}

export interface Devis {
  id: string
  demande_id: string
  artisan_id: string
  main_oeuvre: number
  materiaux: number
  deplacement: number
  total: number
  description?: string
  duree_estimee?: string
  valable_jours: number
  statut: DevisStatus
  created_at: string
}

export interface Portfolio {
  id: string
  artisan_id: string
  categorie_id?: string
  titre?: string
  description?: string
  photo_url: string
  position: number
  created_at: string
}

export interface Paiement {
  id: string
  demande_id: string
  client_id: string
  artisan_id: string
  montant_total: number
  commission_rate: number
  commission_amt: number
  montant_artisan: number
  methode: PaymentMethod
  statut: PaymentStatus
  cmi_ref?: string
  stripe_ref?: string
  created_at: string
  released_at?: string
}

// ============================================================
// API Response types
// ============================================================

export interface SearchArtisansParams {
  categorie?: string
  ville?: string
  disponible?: boolean
  note_min?: number
  badge?: ArtisanBadge
  page?: number
  limit?: number
}

export interface SearchArtisansResult {
  artisans: ArtisanWithUser[]
  total: number
  page: number
  limit: number
  has_more: boolean
}

export interface BudgetEstimation {
  categorie: string
  type_travaux: string
  min: number
  max: number
  moyenne: number
  nb_missions_base: number
  conseil: string
}
