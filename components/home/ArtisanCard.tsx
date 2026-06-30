import Link from 'next/link'
import BadgeArtisan from '@/components/ui/BadgeArtisan'

export default function ArtisanCard({ artisan }: { artisan: any }) {
  return (
    <Link href={`/artisans/${artisan.id}`}
      className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all
        border border-gray-100 hover:border-[#1B7A56] block">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 rounded-2xl bg-[#1B7A56] text-white text-lg
          font-bold flex items-center justify-center flex-shrink-0">
          {(artisan.user?.full_name ?? 'A')[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-gray-900 truncate">
              {artisan.user?.full_name ?? 'Artisan'}
            </h3>
            {artisan.cin_verifie && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5
                rounded-full font-medium flex-shrink-0">
                ✓ Verifie
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            {artisan.categories?.slice(0, 2).map((cat: any, i: number) => (
              <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {cat.categorie?.icone} {cat.categorie?.nom}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
        <span>📍 {artisan.ville}</span>
        <span>⭐ {artisan.note_moyenne?.toFixed(1)} ({artisan.nb_avis} avis)</span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-[#1B7A56]">
          {artisan.tarif_min}–{artisan.tarif_max} MAD/h
        </span>
        <BadgeArtisan badge={artisan.badge_special} />
      </div>
    </Link>
  )
}