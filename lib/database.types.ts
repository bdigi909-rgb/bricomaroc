// ============================================================
// BricoMaroc — Database Types (Supabase generated format)
// Génère automatiquement avec : npx supabase gen types typescript
// Ceci est une version manuelle simplifiée correspondant au schéma SQL
// ============================================================

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          phone: string | null
          full_name: string
          avatar_url: string | null
          role: 'client' | 'artisan' | 'admin'
          ville: string | null
          quartier: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string
        }
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      categories: {
        Row: {
          id: string
          slug: string
          nom: string
          nom_ar: string | null
          icone: string
          couleur: string
          position: number
          active: boolean
        }
        Insert: Omit<Database['public']['Tables']['categories']['Row'], 'id'> & { id?: string }
        Update: Partial<Database['public']['Tables']['categories']['Insert']>
      }
      artisans: {
        Row: {
          id: string
          user_id: string
          bio: string | null
          annees_experience: number
          langues: string[]
          ville: string
          quartiers: string[]
          rayon_km: number
          latitude: number | null
          longitude: number | null
          statut: 'pending' | 'verified' | 'suspended' | 'excluded'
          badge: 'none' | 'verified' | 'elite'
          cin_verifie: boolean
          cin_recto_url: string | null
          cin_verso_url: string | null
          selfie_url: string | null
          assurance_url: string | null
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
          delai_moyen_reponse: number
          plan: string
          plan_expire_at: string | null
          solde_wallet: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['artisans']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string
        }
        Update: Partial<Database['public']['Tables']['artisans']['Insert']>
      }
      demandes: {
        Row: {
          id: string
          client_id: string
          artisan_id: string | null
          categorie_id: string
          titre: string
          description: string
          photos_urls: string[]
          adresse: string
          quartier: string | null
          latitude: number | null
          longitude: number | null
          urgence: 'normal' | 'urgent' | 'very_urgent'
          date_souhaitee: string | null
          heure_souhaitee: string | null
          flexible: boolean
          budget_min: number | null
          budget_max: number | null
          statut: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'
          created_at: string
          updated_at: string
          accepted_at: string | null
          completed_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['demandes']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string
        }
        Update: Partial<Database['public']['Tables']['demandes']['Insert']>
      }
      avis: {
        Row: {
          id: string
          demande_id: string
          client_id: string
          artisan_id: string
          note_globale: number
          note_qualite: number | null
          note_ponctualite: number | null
          note_comm: number | null
          note_prix: number | null
          commentaire: string | null
          tags: string[]
          photos_avant: string[]
          photos_apres: string[]
          conteste: boolean
          contestation_text: string | null
          reponse_artisan: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['avis']['Row'], 'id' | 'created_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['avis']['Insert']>
      }
      messages: {
        Row: {
          id: string
          demande_id: string
          sender_id: string
          receiver_id: string
          contenu: string | null
          type: string
          media_url: string | null
          devis_id: string | null
          lu: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['messages']['Row'], 'id' | 'created_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['messages']['Insert']>
      }
    }
  }
}
