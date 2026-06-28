'use client'
import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function InscriptionArtisanPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const router = useRouter()

  const [etape, setEtape] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Étape 1 — Compte
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')

  // Étape 2 — Profil
  const [ville, setVille] = useState('Marrakech')
  const [bio, setBio] = useState('')
  const [tarifMin, setTarifMin] = useState('')
  const [tarifMax, setTarifMax] = useState('')
  const [anneesExp, setAnneesExp] = useState('')
  const [categoriesSelected, setCategoriesSelected] = useState<string[]>([])

  const villes = ['Marrakech', 'Casablanca', 'Rabat', 'Fès', 'Tanger',
    'Agadir', 'Meknès', 'Oujda', 'Tétouan', 'Safi']

  const categoriesDisponibles = [
    { id: '1', nom: 'Plomberie', icone: '🔧' },
    { id: '2', nom: 'Électricité', icone: '⚡' },
    { id: '3', nom: 'Peinture', icone: '🎨' },
    { id: '4', nom: 'Climatisation', icone: '❄️' },
    { id: '5', nom: 'Menuiserie', icone: '🪵' },
    { id: '6', nom: 'Carrelage', icone: '🪟' },
    { id: '7', nom: 'Maçonnerie', icone: '🏗️' },
    { id: '8', nom: 'Jardinage', icone: '🌿' },
    { id: '9', nom: 'Serrurerie', icone: '🔒' },
    { id: '10', nom: 'Bricolage', icone: '🛠️' },
  ]

  function toggleCategorie(id: string) {
    setCategoriesSelected(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  async function inscrire() {
    if (!fullName || !email || !password || !phone) {
      setError('Veuillez remplir tous les champs obligatoires.')
      return
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }
    if (categoriesSelected.length === 0) {
      setError('Sélectionnez au moins un métier.')
      return
    }

    setLoading(true)
    setError('')

    // Créer le compte
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role: 'artisan' }
      }
    })

    if (authError) { setError(authError.message); setLoading(false); return }

    const userId = authData.user?.id
    if (!userId) { setError('Erreur lors de la création du compte.'); setLoading(false); return }

    // Créer le profil user
    await supabase.from('users').upsert({
      id: userId,
      full_name: fullName,
      email,
      phone,
      role: 'artisan',
      ville,
    })

    // Créer le profil artisan
    const { data: artisanData } = await supabase.from('artisans').insert({
      user_id: userId,
      ville,
      bio,
      tarif_min: tarifMin ? parseInt(tarifMin) : 100,
      tarif_max: tarifMax ? parseInt(tarifMax) : 300,
      annees_experience: anneesExp ? parseInt(anneesExp) : 0,
      statut: 'pending',
      disponible: true,
      devis_gratuit: true,
      note_moyenne: 0,
      nb_avis: 0,
      nb_missions: 0,
      rayon_km: 15,
      jours_dispo: [1, 2, 3, 4, 5],
      heure_debut: '08:00',
      heure_fin: '18:00',
      langues: ['fr', 'ar'],
      plan: 'free',
    }).select('id').single() as { data: any }

    // Lier les catégories
    if (artisanData?.id) {
      const { data: cats } = await supabase
        .from('categories').select('id, nom') as { data: any[] | null }

      const catsToLink = (cats ?? []).filter(c =>
        categoriesSelected.some(sel => {
          const found = categoriesDisponibles.find(d => d.id === sel)
          return found?.nom === c.nom
        })
      )

      for (const cat of catsToLink) {
        await supabase.from('artisan_categories').insert({
          artisan_id: artisanData.id,
          categorie_id: cat.id,
        })
      }
    }

    // Email de bienvenue
    await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: email,
        subject: 'Bienvenue sur BricoMaroc ! 🔧',
        type: 'inscription',
        data: { nom: fullName, role: 'artisan' },
      }),
    })

    setLoading(false)
    setEtape(3)
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-[#1B7A56]">🔧 BricoMaroc</Link>
        <Link href="/artisans" className="text-sm text-gray-500 hover:text-gray-800">← Retour</Link>
      </nav>

      <div className="max-w-lg mx-auto px-4 py-10">

        {/* ÉTAPE 3 — SUCCÈS */}
        {etape === 3 ? (
          <div className="bg-white rounded-2xl p-10 shadow-sm text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Inscription réussie !
            </h1>
            <p className="text-gray-500 mb-2">
              Bienvenue sur BricoMaroc, <strong>{fullName}</strong> !
            </p>
            <p className="text-gray-500 text-sm mb-6">
              Votre profil est en cours de vérification par notre équipe.
              Vous recevrez un email dès que votre compte sera validé.
            </p>
            <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 mb-6 text-sm text-yellow-800">
              ⏳ Validation sous 24-48h ouvrables
            </div>
            <div className="flex flex-col gap-3">
              <Link href="/dashboard"
                className="bg-[#1B7A56] text-white font-semibold py-3 rounded-xl
                  hover:bg-[#155f42] transition-colors">
                Accéder à mon dashboard
              </Link>
              <Link href="/"
                className="border border-gray-200 text-gray-600 font-semibold py-3 rounded-xl
                  hover:bg-gray-50 transition-colors">
                Retour à l'accueil
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* HEADER */}
            <div className="text-center mb-8">
              <div className="text-4xl mb-3">🔧</div>
              <h1 className="text-2xl font-bold text-gray-900">Devenir artisan BricoMaroc</h1>
              <p className="text-gray-500 text-sm mt-2">
                Rejoignez des centaines d'artisans vérifiés et recevez des clients qualifiés
              </p>
            </div>

            {/* AVANTAGES */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                { icon: '🆓', title: 'Gratuit', desc: '0% commission au départ' },
                { icon: '✅', title: 'Vérifié', desc: 'Badge de confiance' },
                { icon: '📱', title: 'Simple', desc: 'Gérez tout en ligne' },
              ].map(a => (
                <div key={a.title} className="bg-white rounded-xl p-3 text-center shadow-sm">
                  <div className="text-2xl mb-1">{a.icon}</div>
                  <p className="font-bold text-gray-900 text-sm">{a.title}</p>
                  <p className="text-xs text-gray-500">{a.desc}</p>
                </div>
              ))}
            </div>

            {/* PROGRESS */}
            <div className="flex items-center gap-2 mb-6">
              {[1, 2].map(i => (
                <div key={i} className="flex items-center gap-2 flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center
                    text-sm font-bold flex-shrink-0 ${
                    etape >= i ? 'bg-[#1B7A56] text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {i}
                  </div>
                  <div className={`h-1 flex-1 rounded-full ${
                    i < 2 ? etape > i ? 'bg-[#1B7A56]' : 'bg-gray-200' : 'hidden'
                  }`} />
                </div>
              ))}
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
                {error}
              </div>
            )}

            {/* ÉTAPE 1 — COMPTE */}
            {etape === 1 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
                <h2 className="font-bold text-gray-900">👤 Vos informations</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom complet *
                  </label>
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                    placeholder="Mohammed Alami"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                      focus:outline-none focus:ring-2 focus:ring-[#1B7A56]" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                      focus:outline-none focus:ring-2 focus:ring-[#1B7A56]" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone *
                  </label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="06XXXXXXXX"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                      focus:outline-none focus:ring-2 focus:ring-[#1B7A56]" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mot de passe * (min. 6 caractères)
                  </label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                      focus:outline-none focus:ring-2 focus:ring-[#1B7A56]" />
                </div>

                <button onClick={() => {
                  if (!fullName || !email || !phone || !password) {
                    setError('Veuillez remplir tous les champs.')
                    return
                  }
                  setError('')
                  setEtape(2)
                }}
                  className="w-full bg-[#1B7A56] text-white font-semibold py-3 rounded-xl
                    hover:bg-[#155f42] transition-colors">
                  Continuer →
                </button>

                <p className="text-center text-sm text-gray-500">
                  Déjà artisan ?{' '}
                  <Link href="/auth/login" className="text-[#1B7A56] font-medium hover:underline">
                    Se connecter
                  </Link>
                </p>
              </div>
            )}

            {/* ÉTAPE 2 — PROFIL */}
            {etape === 2 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
                <h2 className="font-bold text-gray-900">🔧 Votre profil artisan</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vos métiers * (sélectionnez au moins 1)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {categoriesDisponibles.map(cat => (
                      <button key={cat.id} onClick={() => toggleCategorie(cat.id)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm
                          font-medium border-2 transition-all ${
                          categoriesSelected.includes(cat.id)
                            ? 'border-[#1B7A56] bg-green-50 text-[#1B7A56]'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}>
                        <span>{cat.icone}</span>
                        <span>{cat.nom}</span>
                        {categoriesSelected.includes(cat.id) && <span className="ml-auto">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                  <select value={ville} onChange={e => setVille(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                      focus:outline-none focus:ring-2 focus:ring-[#1B7A56]">
                    {villes.map(v => <option key={v}>{v}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio / Description
                  </label>
                  <textarea value={bio} onChange={e => setBio(e.target.value)}
                    placeholder="Décrivez votre expérience et vos spécialités..."
                    rows={3}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                      focus:outline-none focus:ring-2 focus:ring-[#1B7A56] resize-none" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tarif min (MAD/h)
                    </label>
                    <input type="number" value={tarifMin} onChange={e => setTarifMin(e.target.value)}
                      placeholder="100"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                        focus:outline-none focus:ring-2 focus:ring-[#1B7A56]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tarif max (MAD/h)
                    </label>
                    <input type="number" value={tarifMax} onChange={e => setTarifMax(e.target.value)}
                      placeholder="300"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                        focus:outline-none focus:ring-2 focus:ring-[#1B7A56]" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Années d'expérience
                  </label>
                  <input type="number" value={anneesExp} onChange={e => setAnneesExp(e.target.value)}
                    placeholder="5"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                      focus:outline-none focus:ring-2 focus:ring-[#1B7A56]" />
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setEtape(1)}
                    className="flex-1 border border-gray-200 text-gray-600 font-semibold
                      py-3 rounded-xl hover:bg-gray-50 transition-colors">
                    ← Retour
                  </button>
                  <button onClick={inscrire} disabled={loading}
                    className="flex-1 bg-[#1B7A56] text-white font-semibold py-3 rounded-xl
                      hover:bg-[#155f42] transition-colors disabled:opacity-50">
                    {loading ? 'Inscription...' : "S'inscrire 🎉"}
                  </button>
                </div>

                <p className="text-xs text-gray-400 text-center">
                  En vous inscrivant, vous acceptez nos{' '}
                  <Link href="/cgu" className="text-[#1B7A56] hover:underline">CGU</Link>
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}