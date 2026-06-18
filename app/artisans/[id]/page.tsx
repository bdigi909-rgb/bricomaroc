import { getArtisanById } from '@/lib/artisans'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default async function ArtisanPage({ params }: { params: { id: string } }) {
  const artisan = await getArtisanById(params.id)
  if (!artisan) notFound()

  const user = (artisan as any).user ?? { full_name: 'Artisan', avatar_url: null }
  const categories = (artisan as any).categories ?? []
  const avis = (artisan as any).avis ?? []
  const portfolio = (artisan as any).portfolio ?? []

  const initials = (user.full_name ?? 'A')
    .split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()

  const jours = ['', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      {/* NAVBAR */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-[#1B7A56]">
          🔧 BricoMaroc
        </Link>
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-800">← Retour</Link>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        {/* CARTE PROFIL PRINCIPALE */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex gap-5 items-start">
            {/* AVATAR */}
            <div className="relative flex-shrink-0">
              {user.avatar_url ? (
                <Image src={user.avatar_url} alt={user.full_name}
                  width={80} height={80} className="rounded-full object-cover" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-[#1B7A56] flex items-center justify-center
                  text-white text-2xl font-bold">
                  {initials}
                </div>
              )}
              {(artisan as any).disponible && (
                <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500
                  rounded-full border-2 border-white" />
              )}
            </div>

            {/* INFOS PRINCIPALES */}
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">{user.full_name}</h1>
                {(artisan as any).badge === 'elite' && (
                  <span className="text-xs font-bold bg-yellow-100 text-yellow-700
                    px-2 py-1 rounded-full">★ Élite</span>
                )}
                {(artisan as any).cin_verifie && (
                  <span className="text-xs font-bold bg-green-100 text-green-700
                    px-2 py-1 rounded-full">✓ Vérifié</span>
                )}
              </div>

              {/* CATÉGORIES */}
              <div className="flex gap-2 flex-wrap mt-2">
                {categories.map((cat: any) => (
                  <span key={cat.categorie?.id}
                    className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                    {cat.categorie?.icone} {cat.categorie?.nom}
                  </span>
                ))}
              </div>

              {/* STATS */}
              <div className="flex gap-6 mt-3 text-sm">
                <div className="text-center">
                  <div className="font-bold text-gray-900 text-lg">
                    {(artisan as any).note_moyenne?.toFixed(1)}
                  </div>
                  <div className="text-gray-500">Note</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-gray-900 text-lg">
                    {(artisan as any).nb_avis}
                  </div>
                  <div className="text-gray-500">Avis</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-gray-900 text-lg">
                    {(artisan as any).nb_missions}
                  </div>
                  <div className="text-gray-500">Missions</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-gray-900 text-lg">
                    {(artisan as any).annees_experience}
                  </div>
                  <div className="text-gray-500">Ans exp.</div>
                </div>
              </div>
            </div>

            {/* TARIF + CTA */}
            <div className="text-right flex-shrink-0">
              <div className="text-2xl font-bold text-gray-900">
                {(artisan as any).tarif_min}–{(artisan as any).tarif_max}
                <span className="text-sm font-normal text-gray-500"> MAD/h</span>
              </div>
              {(artisan as any).devis_gratuit && (
                <div className="text-xs text-green-600 font-medium mt-1">Devis gratuit</div>
              )}
              <button className="mt-3 w-full bg-[#1B7A56] text-white font-semibold
                px-6 py-3 rounded-xl hover:bg-[#155f42] transition-colors">
                Contacter
              </button>
            </div>
          </div>

          {/* BIO */}
          {(artisan as any).bio && (
            <p className="mt-4 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
              {(artisan as any).bio}
            </p>
          )}

          {/* LOCALISATION + LANGUES */}
          <div className="flex gap-6 mt-4 text-sm text-gray-500 border-t border-gray-100 pt-4">
            <span>📍 {(artisan as any).ville} — rayon {(artisan as any).rayon_km} km</span>
            <span>🌐 {(artisan as any).langues?.join(', ')}</span>
            {(artisan as any).urgences_24h && (
              <span className="text-red-600 font-medium">🚨 Urgences 24h/24</span>
            )}
          </div>
        </div>

        {/* DISPONIBILITÉS */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">Disponibilités</h2>
          <div className="flex gap-2 flex-wrap">
            {jours.slice(1).map((jour, i) => (
              <div key={jour}
                className={`px-3 py-2 rounded-xl text-sm font-medium ${
                  (artisan as any).jours_dispo?.includes(i + 1)
                    ? 'bg-[#1B7A56] text-white'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                {jour}
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-3">
            {(artisan as any).heure_debut?.slice(0,5)} – {(artisan as any).heure_fin?.slice(0,5)}
          </p>
        </div>

        {/* PORTFOLIO */}
        {portfolio.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">Réalisations</h2>
            <div className="grid grid-cols-3 gap-3">
              {portfolio.map((item: any) => (
                <div key={item.id} className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                  <Image src={item.photo_url} alt={item.titre ?? 'Réalisation'}
                    width={200} height={200} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AVIS */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">
            Avis clients ({avis.length})
          </h2>
          {avis.length === 0 ? (
            <p className="text-gray-400 text-sm">Aucun avis pour le moment.</p>
          ) : (
            <div className="space-y-4">
              {avis.map((a: any) => (
                <div key={a.id} className="border-b border-gray-100 pb-4 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center
                        justify-center text-xs font-bold text-gray-600">
                        {a.client?.full_name?.[0] ?? '?'}
                      </div>
                      <span className="font-medium text-sm text-gray-800">
                        {a.client?.full_name ?? 'Client'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {'★'.repeat(a.note_globale)}
                      <span className="text-xs text-gray-400 ml-1">
                        {new Date(a.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                  {a.commentaire && (
                    <p className="text-sm text-gray-600">{a.commentaire}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}