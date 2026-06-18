import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Clock, Star, CheckCircle, Zap } from 'lucide-react'
import { Badge, Stars, DisponibiliteDot } from '@/components/ui'
import type { ArtisanWithUser } from '@/types'
import { clsx } from 'clsx'

interface ArtisanCardProps {
  artisan: ArtisanWithUser
  compact?: boolean
}

// Couleur avatar selon le nom
function getAvatarColor(name: string): string {
  const colors = [
    '#1A56A0', '#A0510A', '#1B7A56', '#6A3BAE',
    '#C04040', '#D4880A', '#2E86C1', '#C0392B',
  ]
  const idx = name.charCodeAt(0) % colors.length
  return colors[idx]
}

export default function ArtisanCard({ artisan, compact }: ArtisanCardProps) {
 const user = artisan.user ?? { full_name: 'Artisan', avatar_url: null }
const initials = (user.full_name ?? 'A').split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase()
  const color = getAvatarColor(user.full_name)
  const categories = artisan.categories?.slice(0,3) ?? []

  return (
    <Link
      href={`/artisans/${artisan.id}`}
      className={clsx(
        'block bg-white border border-[var(--color-border)] rounded-2xl p-4',
        'hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-green-300'
      )}
    >
      <div className="flex gap-3 items-start">

        {/* AVATAR */}
        <div className="relative flex-shrink-0">
          {user.avatar_url ? (
            <Image
              src={user.avatar_url}
              alt={user.full_name}
              width={48} height={48}
              className="rounded-full object-cover ring-2 ring-white"
            />
          ) : (
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm text-white ring-2 ring-white"
              style={{ background: color }}
            >
              {initials}
            </div>
          )}
          {/* Online indicator */}
          {artisan.disponible && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
          )}
        </div>

        {/* INFOS */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
            <span className="text-[15px] font-bold text-ink truncate">{user.full_name}</span>
            {artisan.badge === 'elite' && (
              <span className="text-[10px] font-bold bg-gold-50 text-gold-600 px-1.5 py-0.5 rounded-full">★ Élite</span>
            )}
            {artisan.cin_verifie && artisan.badge !== 'elite' && (
              <CheckCircle size={13} className="text-green-500 flex-shrink-0" />
            )}
          </div>

          {/* CATÉGORIES */}
          <div className="flex gap-1 flex-wrap mb-1.5">
            {categories.map(cat => (
              <span key={(cat as any).categorie?.id ?? cat.id}
                className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                {(cat as any).categorie?.icone} {(cat as any).categorie?.nom ?? ''}
              </span>
            ))}
          </div>

          {/* NOTE + LOCALISATION */}
          <div className="flex items-center gap-3 text-xs text-muted">
            <div className="flex items-center gap-1">
              <Stars note={artisan.note_moyenne} size="sm" />
              <span className="font-semibold text-ink">{artisan.note_moyenne.toFixed(1)}</span>
              <span>({artisan.nb_avis})</span>
            </div>
            <div className="flex items-center gap-0.5">
              <MapPin size={11} />
              <span>{artisan.quartiers?.[0] ?? artisan.ville}</span>
            </div>
          </div>
        </div>

        {/* TARIF + DISPO */}
        <div className="text-right flex-shrink-0">
          <p className="text-sm font-bold text-ink">
            {artisan.tarif_min}–{artisan.tarif_max}
            <span className="text-xs font-normal text-muted"> MAD/h</span>
          </p>
          <DisponibiliteDot disponible={artisan.disponible} />
        </div>
      </div>

      {/* TAGS SPÉCIALITÉS */}
      {!compact && artisan.categories && artisan.categories.length > 0 && (
        <div className="flex gap-1.5 flex-wrap mt-3">
          {['Fuite d\'eau', 'Chauffe-eau', 'Débouchage'].slice(0, 3).map(tag => (
            <span key={tag} className="text-[11px] bg-sand text-muted px-2 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* BOUTONS */}
      {!compact && (
        <div className="flex gap-2 mt-3">
          <span className="flex-1 text-center text-xs font-semibold py-2 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-colors">
            Contacter
          </span>
          <span className="text-xs font-semibold py-2 px-3 rounded-xl border border-[var(--color-border)] text-muted hover:bg-sand transition-colors">
            Voir profil
          </span>
        </div>
      )}
    </Link>
  )
}
