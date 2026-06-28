'use client'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SuiviMissionPage({ params }: { params: { id: string } }) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const router = useRouter()
  const [demande, setDemande] = useState<any>(null)
  const [devis, setDevis] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isArtisan, setIsArtisan] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUser(user)

      const { data: dem } = await supabase
        .from('demandes')
        .select(`
          *,
          categorie:categories(nom, icone),
          client:users!demandes_client_id_fkey(full_name, phone),
          artisan:artisans(id, user_id, tarif_min, tarif_max, note_moyenne, user:users(full_name, phone))
        `)
        .eq('id', params.id)
        .single() as { data: any }

      if (!dem) { router.push('/'); return }
      setDemande(dem)

      // Vérifier si artisan
      const { data: artisanData } = await supabase
        .from('artisans')
        .select('id')
        .eq('user_id', user.id)
        .single() as { data: any }
      setIsArtisan(!!artisanData)

      // Charger le devis
      const { data: devisData } = await supabase
        .from('devis')
        .select('*')
        .eq('demande_id', params.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single() as { data: any }
      setDevis(devisData)

      setLoading(false)
    }
    load()
  }, [])

  async function marquerEnCours() {
    await supabase.from('demandes').update({ statut: 'in_progress' }).eq('id', params.id)
    setDemande((prev: any) => ({ ...prev, statut: 'in_progress' }))
  }

  async function marquerTermine() {
    await supabase.from('demandes').update({
      statut: 'completed',
      completed_at: new Date().toISOString(),
    }).eq('id', params.id)
    setDemande((prev: any) => ({ ...prev, statut: 'completed' }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center">
        <div className="text-gray-500">Chargement...</div>
      </div>
    )
  }

  // Étapes de la timeline
  const etapes = [
    {
      key: 'pending',
      label: 'Demande publiée',
      desc: 'Votre demande est visible par les artisans',
      icon: '📋',
      date: demande?.created_at,
    },
    {
      key: 'accepted',
      label: 'Artisan assigné',
      desc: devis ? `Devis accepté — ${devis.total} MAD` : 'Artisan a accepté la demande',
      icon: '✅',
      date: demande?.accepted_at,
    },
    {
      key: 'in_progress',
      label: 'Travaux en cours',
      desc: "L'artisan est sur place et réalise les travaux",
      icon: '🔧',
      date: null,
    },
    {
      key: 'completed',
      label: 'Mission terminée',
      desc: 'Travaux validés, paiement libéré',
      icon: '🎉',
      date: demande?.completed_at,
    },
  ]

  const statutOrder = ['pending', 'accepted', 'in_progress', 'completed']
  const currentIndex = statutOrder.indexOf(demande?.statut)

  function getEtapeStatus(etapeKey: string) {
    const etapeIndex = statutOrder.indexOf(etapeKey)
    if (etapeIndex < currentIndex) return 'done'
    if (etapeIndex === currentIndex) return 'active'
    return 'pending'
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-[#1B7A56]">🔧 BricoMaroc</Link>
        <Link href={isArtisan ? '/dashboard' : '/espace-client'}
          className="text-sm text-gray-500 hover:text-gray-800">
          ← Retour
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Suivi de mission</h1>

        {/* RÉSUMÉ */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">{demande?.categorie?.icone}</span>
            <div>
              <h3 className="font-bold text-gray-900">{demande?.titre}</h3>
              <p className="text-sm text-gray-500">{demande?.categorie?.nom}</p>
            </div>
            <span className={`ml-auto text-xs px-3 py-1 rounded-full font-medium ${
              demande?.statut === 'completed' ? 'bg-green-100 text-green-700' :
              demande?.statut === 'in_progress' ? 'bg-blue-100 text-blue-700' :
              demande?.statut === 'accepted' ? 'bg-yellow-100 text-yellow-700' :
              'bg-gray-100 text-gray-600'
            }`}>
              {demande?.statut === 'completed' ? '✅ Terminée' :
               demande?.statut === 'in_progress' ? '🔧 En cours' :
               demande?.statut === 'accepted' ? '✓ Acceptée' : '⏳ En attente'}
            </span>
          </div>

          {/* Infos client / artisan */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">Client</p>
              <p className="font-semibold text-gray-900">{demande?.client?.full_name}</p>
              {isArtisan && <p className="text-xs text-gray-500">{demande?.client?.phone}</p>}
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">Artisan</p>
              <p className="font-semibold text-gray-900">
                {demande?.artisan?.user?.full_name ?? 'Non assigné'}
              </p>
              {!isArtisan && demande?.artisan?.user?.phone && (
                <p className="text-xs text-gray-500">{demande.artisan.user.phone}</p>
              )}
            </div>
          </div>
        </div>

        {/* DEVIS */}
        {devis && (
          <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
            <h2 className="font-bold text-gray-900 mb-3">💼 Devis accepté</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Main d'œuvre</span>
                <span className="font-medium">{devis.main_oeuvre} MAD</span>
              </div>
              {devis.materiaux > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Matériaux</span>
                  <span className="font-medium">{devis.materiaux} MAD</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Déplacement</span>
                <span className="font-medium">{devis.deplacement} MAD</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-100">
                <span className="font-bold text-gray-900">Total</span>
                <span className="font-bold text-[#1B7A56] text-lg">{devis.total} MAD</span>
              </div>
              {devis.duree_estimee && (
                <p className="text-xs text-gray-400">Durée estimée : {devis.duree_estimee}</p>
              )}
            </div>
          </div>
        )}

        {/* TIMELINE */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <h2 className="font-bold text-gray-900 mb-6">📍 Progression</h2>
          <div className="space-y-0">
            {etapes.map((etape, index) => {
              const status = getEtapeStatus(etape.key)
              return (
                <div key={etape.key} className="flex gap-4">
                  {/* INDICATEUR */}
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg
                      flex-shrink-0 transition-all ${
                      status === 'done' ? 'bg-[#1B7A56] text-white' :
                      status === 'active' ? 'bg-[#1B7A56] text-white ring-4 ring-green-100' :
                      'bg-gray-100 text-gray-400'
                    }`}>
                      {status === 'done' ? '✓' : etape.icon}
                    </div>
                    {index < etapes.length - 1 && (
                      <div className={`w-0.5 h-12 mt-1 ${
                        status === 'done' ? 'bg-[#1B7A56]' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>

                  {/* CONTENU */}
                  <div className="pb-8 flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`font-semibold text-sm ${
                        status === 'pending' ? 'text-gray-400' : 'text-gray-900'
                      }`}>
                        {etape.label}
                      </p>
                      {status === 'active' && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          En cours
                        </span>
                      )}
                    </div>
                    <p className={`text-xs mt-0.5 ${
                      status === 'pending' ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      {etape.desc}
                    </p>
                    {etape.date && (
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(etape.date).toLocaleDateString('fr-FR', {
                          day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ACTIONS ARTISAN */}
        <Link href={`/suivi/${demande.id}`}
  className="text-xs border border-gray-200 text-gray-600 font-medium
    px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors text-center">
  📍 Suivi
</Link>
        {isArtisan && (
          <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
            <h2 className="font-bold text-gray-900 mb-4">Actions</h2>
            <div className="flex gap-3">
              {demande?.statut === 'accepted' && (
                <button onClick={marquerEnCours}
                  className="flex-1 bg-blue-500 text-white font-semibold py-3 rounded-xl
                    hover:bg-blue-600 transition-colors">
                  🔧 Démarrer les travaux
                </button>
              )}
              {demande?.statut === 'in_progress' && (
                <button onClick={marquerTermine}
                  className="flex-1 bg-[#1B7A56] text-white font-semibold py-3 rounded-xl
                    hover:bg-[#155f42] transition-colors">
                  ✅ Marquer comme terminé
                </button>
              )}
              {demande?.statut === 'completed' && (
                <p className="text-green-600 font-medium text-sm">
                  ✅ Mission terminée avec succès
                </p>
              )}
            </div>
          </div>
        )}

        {/* ACTIONS CLIENT */}
        <Link href={`/suivi/${demande.id}`}
  className="text-xs border border-gray-200 text-gray-600 font-medium
    px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors text-center">
  📍 Suivi
</Link>
        {!isArtisan && demande?.statut === 'completed' && (
          <div className="flex gap-3">
            <Link href={`/avis/${demande.id}`}
              className="flex-1 bg-yellow-400 text-gray-900 font-semibold py-3 rounded-xl
                hover:bg-yellow-500 transition-colors text-center">
              ⭐ Donner un avis
            </Link>
            <Link href={`/paiement/${demande.id}`}
              className="flex-1 bg-[#1B7A56] text-white font-semibold py-3 rounded-xl
                hover:bg-[#155f42] transition-colors text-center">
              💳 Payer
            </Link>
          </div>
        )}

        {/* MESSAGERIE */}
        <div className="mt-4">
          <Link href={`/messages/${demande?.id}`}
            className="w-full block text-center border border-gray-200 text-gray-600
              font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors">
            💬 Ouvrir la messagerie
          </Link>
        </div>
      </div>
    </div>
  )
}