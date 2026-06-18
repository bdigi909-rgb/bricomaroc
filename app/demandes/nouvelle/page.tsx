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

  // Champs formulaire
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

  useEffect(() => {
    supabase.from('categories').select('*').order('position').then(({ data }) => {
      if (data) setCategories(data)
    })
  }, [])

  async function handleSubmit() {
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }

    const { error: err } = await supabase.from('demandes').insert({
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
    })

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-md text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-xl font-bold text-gray-900">Demande envoyée !</h2>
          <p className="text-gray-500 text-sm mt-2">
            Les artisans disponibles vont vous contacter rapidement.
          </p>
          <Link href="/"
            className="mt-6 block w-full bg-[#1B7A56] text-white font-semibold
              py-3 rounded-xl hover:bg-[#155f42] transition-colors text-center">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      {/* NAVBAR */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-[#1B7A56]">🔧 BricoMaroc</Link>
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-800">← Retour</Link>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* HEADER */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Nouvelle demande</h1>
          <p className="text-gray-500 text-sm mt-1">Décrivez votre besoin en quelques étapes</p>
          {/* PROGRESS */}
          <div className="flex justify-center gap-2 mt-4">
            {[1, 2, 3].map(s => (
              <div key={s} className={`h-1.5 w-16 rounded-full transition-all ${
                step >= s ? 'bg-[#1B7A56]' : 'bg-gray-200'}`} />
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">Étape {step} sur 3</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">

          {/* ÉTAPE 1 — Catégorie */}
          {step === 1 && (
            <div>
              <h2 className="font-bold text-gray-900 mb-4">De quel service avez-vous besoin ?</h2>
              <div className="grid grid-cols-2 gap-3">
                {categories.map(cat => (
                  <button key={cat.id} onClick={() => setCategorieId(cat.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      categorieId === cat.id
                        ? 'border-[#1B7A56] bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                    <div className="text-2xl mb-1">{cat.icone}</div>
                    <div className="font-semibold text-sm text-gray-800">{cat.nom}</div>
                  </button>
                ))}
              </div>
              <button onClick={() => categorieId && setStep(2)}
                disabled={!categorieId}
                className="w-full mt-6 bg-[#1B7A56] text-white font-semibold py-3 rounded-xl
                  hover:bg-[#155f42] transition-colors disabled:opacity-40">
                Continuer →
              </button>
            </div>
          )}

          {/* ÉTAPE 2 — Description */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-bold text-gray-900 mb-4">Décrivez votre besoin</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre de la demande
                </label>
                <input type="text" value={titre} onChange={e => setTitre(e.target.value)}
                  placeholder="Ex: Fuite d'eau sous l'évier"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                    focus:outline-none focus:ring-2 focus:ring-[#1B7A56]" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description détaillée
                </label>
                <textarea value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="Décrivez le problème, les dimensions, les contraintes..."
                  rows={4}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                    focus:outline-none focus:ring-2 focus:ring-[#1B7A56] resize-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Urgence</label>
                <div className="flex gap-2">
                  {[
                    { value: 'normal', label: '🟢 Normal', desc: 'Dans la semaine' },
                    { value: 'urgent', label: '🟡 Urgent', desc: 'Dans 48h' },
                    { value: 'very_urgent', label: '🔴 Très urgent', desc: 'Aujourd\'hui' },
                  ].map(u => (
                    <button key={u.value}
                      onClick={() => setUrgence(u.value as any)}
                      className={`flex-1 p-3 rounded-xl border-2 text-center text-xs transition-all ${
                        urgence === u.value
                          ? 'border-[#1B7A56] bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                      <div className="font-semibold">{u.label}</div>
                      <div className="text-gray-500 mt-0.5">{u.desc}</div>
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
                <button onClick={() => titre && description && setStep(3)}
                  disabled={!titre || !description}
                  className="flex-1 bg-[#1B7A56] text-white font-semibold py-3 rounded-xl
                    hover:bg-[#155f42] transition-colors disabled:opacity-40">
                  Continuer →
                </button>
              </div>
            </div>
          )}

          {/* ÉTAPE 3 — Localisation + Budget */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-bold text-gray-900 mb-4">Localisation et budget</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                <input type="text" value={adresse} onChange={e => setAdresse(e.target.value)}
                  placeholder="Ex: 12 Rue Ibn Battouta, Guéliz"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                    focus:outline-none focus:ring-2 focus:ring-[#1B7A56]" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quartier</label>
                <input type="text" value={quartier} onChange={e => setQuartier(e.target.value)}
                  placeholder="Ex: Guéliz, Médina, Hivernage..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                    focus:outline-none focus:ring-2 focus:ring-[#1B7A56]" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date souhaitée (optionnel)
                </label>
                <input type="date" value={dateSouhaitee}
                  onChange={e => setDateSouhaitee(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                    focus:outline-none focus:ring-2 focus:ring-[#1B7A56]" />
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Budget min (MAD)
                  </label>
                  <input type="number" value={budgetMin}
                    onChange={e => setBudgetMin(e.target.value)}
                    placeholder="100"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                      focus:outline-none focus:ring-2 focus:ring-[#1B7A56]" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Budget max (MAD)
                  </label>
                  <input type="number" value={budgetMax}
                    onChange={e => setBudgetMax(e.target.value)}
                    placeholder="500"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                      focus:outline-none focus:ring-2 focus:ring-[#1B7A56]" />
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <input type="checkbox" id="flexible" checked={flexible}
                  onChange={e => setFlexible(e.target.checked)}
                  className="w-4 h-4 accent-[#1B7A56]" />
                <label htmlFor="flexible" className="text-sm text-gray-700">
                  Je suis flexible sur les dates et horaires
                </label>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep(2)}
                  className="flex-1 border border-gray-200 text-gray-600 font-semibold
                    py-3 rounded-xl hover:bg-gray-50 transition-colors">
                  ← Retour
                </button>
                <button onClick={handleSubmit}
                  disabled={!adresse || loading}
                  className="flex-1 bg-[#1B7A56] text-white font-semibold py-3 rounded-xl
                    hover:bg-[#155f42] transition-colors disabled:opacity-40">
                  {loading ? 'Envoi...' : '✓ Envoyer ma demande'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}