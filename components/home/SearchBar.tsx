'use client'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NouvelleDemandePage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const router = useRouter()

  const [step, setStep] = useState(1)
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [categorieId, setCategorieId] = useState('')
  const [titre, setTitre] = useState('')
  const [description, setDescription] = useState('')
  const [adresse, setAdresse] = useState('')
  const [quartier, setQuartier] = useState('')
  const [urgence, setUrgence] = useState<'normal' | 'urgent' | 'very_urgent'>('normal')
  const [dateSouhaitee, setDateSouhaitee] = useState('')
  const [budgetMin, setBudgetMin] = useState('')
  const [budgetMax, setBudgetMax] = useState('')
  const [flexible, setFlexible] = useState(true)
  const [ville, setVille] = useState('Marrakech')
  const [photos, setPhotos] = useState<{ url: string; file: File }[]>([])
  const [uploadingPhotos, setUploadingPhotos] = useState(false)

  const villes = ['Marrakech', 'Casablanca', 'Rabat', 'Fès', 'Tanger',
    'Agadir', 'Meknès', 'Oujda', 'Tétouan', 'Safi']

  useEffect(() => {
    supabase.from('categories').select('*').order('position').then(({ data }) => {
      if (data) setCategories(data)
    })
  }, [])

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return
    const newPhotos = Array.from(files).slice(0, 5 - photos.length).map(file => ({
      url: URL.createObjectURL(file),
      file,
    }))
    setPhotos(prev => [...prev, ...newPhotos])
  }

  function supprimerPhoto(index: number) {
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit() {
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const { data: demandeData, error: err } = await supabase.from('demandes').insert({
      client_id: user.id,
      categorie_id: categorieId,
      titre,
      description,
      adresse,
      quartier,
      urgence,
      date_souhaitee: dateSouhaitee || null,
      budget_min: budgetMin ? parseInt(budgetMin) : null,
      budget_max: budgetMax ? parseInt(budgetMax) : null,
      flexible,
      statut: 'pending',
    }).select('id').single() as { data: any, error: any }

    if (err) { setError(err.message); setLoading(false); return }

    // Upload photos
    if (photos.length > 0 && demandeData?.id) {
      setUploadingPhotos(true)
      for (const photo of photos) {
        const fileExt = photo.file.name.split('.').pop()
        const fileName = `${demandeData.id}/${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('demandes-photos').upload(fileName, photo.file, { upsert: true })

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('demandes-photos').getPublicUrl(fileName)
          await supabase.from('demande_photos').insert({
            demande_id: demandeData.id,
            photo_url: urlData.publicUrl,
          })
        }
      }
      setUploadingPhotos(false)
    }

    // Envoyer SMS aux artisans disponibles
    try {
      const { data: artisansDispos } = await supabase
        .from('artisan_categories')
        .select('artisan:artisans(user_id, ville, disponible, user:users(phone, full_name))')
        .eq('categorie_id', categorieId) as { data: any[] | null }

      const smsPromises = (artisansDispos ?? [])
        .filter((ac: any) => ac.artisan?.disponible && ac.artisan?.ville === ville)
        .slice(0, 5)
        .map(async (ac: any) => {
          const phone = ac.artisan?.user?.phone
          if (!phone) return
          await fetch('/api/sms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: phone,
              message: `BricoMaroc — Nouvelle demande "${titre}" a ${ville}. Connectez-vous sur bricomaroc.vercel.app pour repondre.`,
            }),
          })
        })
      await Promise.allSettled(smsPromises)
    } catch (smsError) {
      console.log('SMS error:', smsError)
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-md text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-xl font-bold text-gray-900">Demande envoyée !</h2>
          <p className="text-gray-500 text-sm mt-2">
            Les artisans disponibles vont vous contacter rapidement.
          </p>
          {photos.length > 0 && (
            <p className="text-xs text-green-600 mt-2">
              ✅ {photos.length} photo{photos.length > 1 ? 's' : ''} uploadée{photos.length > 1 ? 's' : ''}
            </p>
          )}
          <Link href="/espace-client"
            className="mt-6 block w-full bg-[#1B7A56] text-white font-semibold
              py-3 rounded-xl hover:bg-[#155f42] transition-colors text-center">
            Voir mes demandes
          </Link>
          <Link href="/"
            className="mt-3 block w-full border border-gray-200 text-gray-600 font-semibold
              py-3 rounded-xl hover:bg-gray-50 transition-colors text-center">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-[#1B7A56]">🔧 BricoMaroc</Link>
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-800">← Accueil</Link>
      </nav>

      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Poster une demande</h1>
          <p className="text-gray-500 text-sm mt-1">Décrivez vos travaux et recevez des devis</p>
        </div>

        {/* PROGRESS */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map(i => (
            <div key={i} className={`flex-1 h-1.5 rounded-full ${
              step >= i ? 'bg-[#1B7A56]' : 'bg-gray-200'
            }`} />
          ))}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>
        )}

        {/* ÉTAPE 1 — CATÉGORIE */}
        {step === 1 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-gray-900">1. Quel type de travaux ?</h2>
            <div className="grid grid-cols-2 gap-3">
              {categories.map(cat => (
                <button key={cat.id} onClick={() => setCategorieId(cat.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left
                    transition-all ${
                    categorieId === cat.id
                      ? 'border-[#1B7A56] bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                  <span className="text-2xl">{cat.icone}</span>
                  <span className="text-sm font-medium text-gray-900">{cat.nom}</span>
                </button>
              ))}
            </div>
            <button onClick={() => {
              if (!categorieId) { setError('Sélectionnez un type de travaux.'); return }
              setError(''); setStep(2)
            }}
              className="w-full bg-[#1B7A56] text-white font-semibold py-3 rounded-xl
                hover:bg-[#155f42] transition-colors">
              Continuer →
            </button>
          </div>
        )}

        {/* ÉTAPE 2 — DÉTAILS */}
        {step === 2 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-gray-900">2. Décrivez vos travaux</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
              <input type="text" value={titre} onChange={e => setTitre(e.target.value)}
                placeholder="Ex: Réparation fuite robinet cuisine"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                  focus:outline-none focus:ring-2 focus:ring-[#1B7A56]" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)}
                placeholder="Décrivez le problème en détail..."
                rows={4}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                  focus:outline-none focus:ring-2 focus:ring-[#1B7A56] resize-none" />
            </div>

            {/* UPLOAD PHOTOS */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📷 Photos (optionnel — max 5)
              </label>

              {photos.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {photos.map((photo, i) => (
                    <div key={i} className="relative aspect-square">
                      <img src={photo.url} alt={`Photo ${i + 1}`}
                        className="w-full h-full object-cover rounded-xl" />
                      <button onClick={() => supprimerPhoto(i)}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white
                          rounded-full text-xs flex items-center justify-center
                          hover:bg-red-600 transition-colors">
                        ×
                      </button>
                    </div>
                  ))}
                  {photos.length < 5 && (
                    <label className="aspect-square border-2 border-dashed border-gray-200
                      rounded-xl flex items-center justify-center cursor-pointer
                      hover:border-[#1B7A56] transition-colors">
                      <span className="text-2xl text-gray-400">+</span>
                      <input type="file" accept="image/*" multiple
                        onChange={handlePhotoUpload} className="hidden" />
                    </label>
                  )}
                </div>
              )}

              {photos.length === 0 && (
                <label className="block cursor-pointer">
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-5
                    text-center hover:border-[#1B7A56] hover:bg-green-50 transition-colors">
                    <div className="text-3xl mb-1">📷</div>
                    <p className="text-sm text-gray-500">Cliquez pour ajouter des photos</p>
                    <p className="text-xs text-gray-400 mt-0.5">Aide l'artisan à mieux comprendre</p>
                  </div>
                  <input type="file" accept="image/*" multiple
                    onChange={handlePhotoUpload} className="hidden" />
                </label>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Urgence</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'normal', label: '🟢 Normal' },
                  { value: 'urgent', label: '🟡 Urgent' },
                  { value: 'very_urgent', label: '🔴 Très urgent' },
                ].map(u => (
                  <button key={u.value} onClick={() => setUrgence(u.value as any)}
                    className={`py-2 rounded-xl text-xs font-medium border-2 transition-all ${
                      urgence === u.value
                        ? 'border-[#1B7A56] bg-green-50 text-[#1B7A56]'
                        : 'border-gray-200 text-gray-600'
                    }`}>
                    {u.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)}
                className="flex-1 border border-gray-200 text-gray-600 font-semibold
                  py-3 rounded-xl hover:bg-gray-50 transition-colors">
                ← Retour
              </button>
              <button onClick={() => {
                if (!titre || !description) { setError('Remplissez le titre et la description.'); return }
                setError(''); setStep(3)
              }}
                className="flex-1 bg-[#1B7A56] text-white font-semibold py-3 rounded-xl
                  hover:bg-[#155f42] transition-colors">
                Continuer →
              </button>
            </div>
          </div>
        )}

        {/* ÉTAPE 3 — LOCALISATION & BUDGET */}
        {step === 3 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-gray-900">3. Localisation & budget</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
              <select value={ville} onChange={e => setVille(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                  focus:outline-none focus:ring-2 focus:ring-[#1B7A56]">
                {villes.map(v => <option key={v}>{v}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quartier</label>
              <input type="text" value={quartier} onChange={e => setQuartier(e.target.value)}
                placeholder="Ex: Guéliz, Hivernage..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                  focus:outline-none focus:ring-2 focus:ring-[#1B7A56]" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
              <input type="text" value={adresse} onChange={e => setAdresse(e.target.value)}
                placeholder="Rue, numéro..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                  focus:outline-none focus:ring-2 focus:ring-[#1B7A56]" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date souhaitée
              </label>
              <input type="date" value={dateSouhaitee} onChange={e => setDateSouhaitee(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                  focus:outline-none focus:ring-2 focus:ring-[#1B7A56]" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Budget min (MAD)
                </label>
                <input type="number" value={budgetMin} onChange={e => setBudgetMin(e.target.value)}
                  placeholder="100"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                    focus:outline-none focus:ring-2 focus:ring-[#1B7A56]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Budget max (MAD)
                </label>
                <input type="number" value={budgetMax} onChange={e => setBudgetMax(e.target.value)}
                  placeholder="500"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                    focus:outline-none focus:ring-2 focus:ring-[#1B7A56]" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="flexible" checked={flexible}
                onChange={e => setFlexible(e.target.checked)}
                className="w-4 h-4 accent-[#1B7A56]" />
              <label htmlFor="flexible" className="text-sm text-gray-700">
                Budget flexible
              </label>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)}
                className="flex-1 border border-gray-200 text-gray-600 font-semibold
                  py-3 rounded-xl hover:bg-gray-50 transition-colors">
                ← Retour
              </button>
              <button onClick={handleSubmit} disabled={loading || uploadingPhotos}
                className="flex-1 bg-[#1B7A56] text-white font-semibold py-3 rounded-xl
                  hover:bg-[#155f42] transition-colors disabled:opacity-50">
                {loading || uploadingPhotos ? 'Envoi...' : '📤 Envoyer'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}