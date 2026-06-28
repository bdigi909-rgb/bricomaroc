'use client'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function DonnerAvisPage({ params }: { params: { id: string } }) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const router = useRouter()

  const [demande, setDemande] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState<any>(null)

  // Notes
  const [noteGlobale, setNoteGlobale] = useState(5)
  const [noteQualite, setNoteQualite] = useState(5)
  const [notePonctualite, setNotePonctualite] = useState(5)
  const [noteComm, setNoteComm] = useState(5)
  const [notePrix, setNotePrix] = useState(5)
  const [commentaire, setCommentaire] = useState('')
  const [tags, setTags] = useState<string[]>([])

  const tagsDisponibles = [
    'Très professionnel', 'Ponctuel', 'Travail soigné',
    'Prix raisonnable', 'Rapide', 'Matériel de qualité',
    'Bon conseil', 'Propre', 'À recommander'
  ]

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
          artisan:artisans(id, note_moyenne, user:users(full_name))
        `)
        .eq('id', params.id)
        .eq('client_id', user.id)
        .single() as { data: any }

      if (!dem) { router.push('/espace-client'); return }
      if (dem.statut !== 'completed') { router.push('/espace-client'); return }
      setDemande(dem)
      setLoading(false)
    }
    load()
  }, [])

  function toggleTag(tag: string) {
    setTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  async function envoyerAvis() {
    setSending(true)
    setError('')

    const { error: avisError } = await supabase.from('avis').insert({
      demande_id: params.id,
      client_id: user.id,
      artisan_id: demande.artisan?.id,
      note_globale: noteGlobale,
      note_qualite: noteQualite,
      note_ponctualite: notePonctualite,
      note_comm: noteComm,
      note_prix: notePrix,
      commentaire,
      tags,
    })

    if (avisError) {
      setError(avisError.message)
      setSending(false)
      return
    }

    setSuccess(true)
    setSending(false)
  }

  function StarRating({ value, onChange, label }: { value: number, onChange: (n: number) => void, label: string }) {
    return (
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">{label}</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(star => (
            <button key={star} onClick={() => onChange(star)}
              className={`text-2xl transition-transform hover:scale-110 ${
                star <= value ? 'text-yellow-400' : 'text-gray-200'
              }`}>
              ★
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center">
        <div className="text-gray-500">Chargement...</div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-md text-center">
          <div className="text-6xl mb-4">⭐</div>
          <h2 className="text-xl font-bold text-gray-900">Merci pour votre avis !</h2>
          <p className="text-gray-500 text-sm mt-2">
            Votre avis aide la communauté à choisir les meilleurs artisans.
          </p>
          <Link href="/espace-client"
            className="mt-6 block w-full bg-[#1B7A56] text-white font-semibold
              py-3 rounded-xl hover:bg-[#155f42] transition-colors text-center">
            Retour à mes demandes
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-[#1B7A56]">🔧 BricoMaroc</Link>
        <Link href="/espace-client" className="text-sm text-gray-500 hover:text-gray-800">← Retour</Link>
      </nav>

      <div className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Donner un avis</h1>

        {/* RÉSUMÉ */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{demande?.categorie?.icone}</span>
            <div>
              <h3 className="font-bold text-gray-900">{demande?.titre}</h3>
              <p className="text-sm text-gray-500">
                Artisan : {demande?.artisan?.user?.full_name ?? 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-6">

          {/* NOTE GLOBALE */}
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-700 mb-3">Note globale</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} onClick={() => setNoteGlobale(star)}
                  className={`text-4xl transition-transform hover:scale-110 ${
                    star <= noteGlobale ? 'text-yellow-400' : 'text-gray-200'
                  }`}>
                  ★
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {noteGlobale === 5 ? 'Excellent !' :
               noteGlobale === 4 ? 'Très bien' :
               noteGlobale === 3 ? 'Bien' :
               noteGlobale === 2 ? 'Passable' : 'Décevant'}
            </p>
          </div>

          {/* NOTES DÉTAILLÉES */}
          <div className="space-y-3 border-t border-gray-100 pt-4">
            <p className="text-sm font-semibold text-gray-700">Notes détaillées</p>
            <StarRating value={noteQualite} onChange={setNoteQualite} label="Qualité du travail" />
            <StarRating value={notePonctualite} onChange={setNotePonctualite} label="Ponctualité" />
            <StarRating value={noteComm} onChange={setNoteComm} label="Communication" />
            <StarRating value={notePrix} onChange={setNotePrix} label="Rapport qualité/prix" />
          </div>

          {/* TAGS */}
          <div className="border-t border-gray-100 pt-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">Points positifs</p>
            <div className="flex flex-wrap gap-2">
              {tagsDisponibles.map(tag => (
                <button key={tag} onClick={() => toggleTag(tag)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                    tags.includes(tag)
                      ? 'bg-[#1B7A56] text-white border-[#1B7A56]'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}>
                  {tags.includes(tag) ? '✓ ' : ''}{tag}
                </button>
              ))}
            </div>
          </div>

          {/* COMMENTAIRE */}
          <div className="border-t border-gray-100 pt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Commentaire (optionnel)
            </label>
            <textarea value={commentaire} onChange={e => setCommentaire(e.target.value)}
              placeholder="Partagez votre expérience avec cet artisan..."
              rows={4}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                focus:outline-none focus:ring-2 focus:ring-[#1B7A56] resize-none" />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
          )}

          <button onClick={envoyerAvis} disabled={sending}
            className="w-full bg-[#1B7A56] text-white font-semibold py-3 rounded-xl
              hover:bg-[#155f42] transition-colors disabled:opacity-50">
            {sending ? 'Envoi...' : 'Publier mon avis'}
          </button>
        </div>
      </div>
    </div>
  )
}