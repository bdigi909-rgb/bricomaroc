'use client'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { compressImage } from '@/lib/useImageCompress'

export default function ProfilArtisanPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const router = useRouter()

  const [artisan, setArtisan] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [bio, setBio] = useState('')
  const [tarifMin, setTarifMin] = useState('')
  const [tarifMax, setTarifMax] = useState('')
  const [anneesExp, setAnneesExp] = useState('')
  const [ville, setVille] = useState('Marrakech')
  const [rayonKm, setRayonKm] = useState('15')
  const [disponible, setDisponible] = useState(true)
  const [urgences24h, setUrgences24h] = useState(false)
  const [devisGratuit, setDevisGratuit] = useState(true)
  const [joursDispoSelected, setJoursDispoSelected] = useState<number[]>([1, 2, 3, 4, 5])
  const [heureDebut, setHeureDebut] = useState('08:00')
  const [heureFin, setHeureFin] = useState('18:00')
  const [fraisDeplacement, setFraisDeplacement] = useState('50')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [portfolioPhotos, setPortfolioPhotos] = useState<any[]>([])
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false)

  const villes = ['Marrakech', 'Casablanca', 'Rabat', 'Fès', 'Tanger',
    'Agadir', 'Meknès', 'Oujda', 'Tétouan', 'Safi']
  const jours = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

  useEffect(() => {
    async function load() {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) { router.push('/auth/login'); return }
      setUser(currentUser)

      const { data: userData } = await supabase
        .from('users').select('*').eq('id', currentUser.id).single() as { data: any }
      if (userData) {
        setFullName(userData.full_name ?? '')
        setPhone(userData.phone ?? '')
      }

      const { data: artisanData } = await supabase
        .from('artisans').select('*').eq('user_id', currentUser.id).single() as { data: any }
      if (!artisanData) { router.push('/'); return }
      setArtisan(artisanData)

      setBio(artisanData.bio ?? '')
      setTarifMin(artisanData.tarif_min?.toString() ?? '')
      setTarifMax(artisanData.tarif_max?.toString() ?? '')
      setAnneesExp(artisanData.annees_experience?.toString() ?? '')
      setVille(artisanData.ville ?? 'Marrakech')
      setRayonKm(artisanData.rayon_km?.toString() ?? '15')
      setDisponible(artisanData.disponible ?? true)
      setUrgences24h(artisanData.urgences_24h ?? false)
      setDevisGratuit(artisanData.devis_gratuit ?? true)
      setJoursDispoSelected(artisanData.jours_dispo ?? [1, 2, 3, 4, 5])
      setHeureDebut(artisanData.heure_debut?.slice(0, 5) ?? '08:00')
      setHeureFin(artisanData.heure_fin?.slice(0, 5) ?? '18:00')
      setFraisDeplacement(artisanData.frais_deplacement?.toString() ?? '50')

      const { data: portfolioData } = await supabase
        .from('portfolio').select('*').eq('artisan_id', artisanData.id)
        .order('created_at', { ascending: false }) as { data: any[] | null }
      setPortfolioPhotos(portfolioData ?? [])

      setLoading(false)
    }
    load()
  }, [])

  function toggleJour(jour: number) {
    setJoursDispoSelected(prev =>
      prev.includes(jour) ? prev.filter(j => j !== jour) : [...prev, jour].sort()
    )
  }

  async function sauvegarder() {
    setSaving(true)
    setError('')
    setSuccess(false)

    const { error: userError } = await supabase
      .from('users').update({ full_name: fullName, phone }).eq('id', user.id)
    if (userError) { setError(userError.message); setSaving(false); return }

    const { error: artisanError } = await supabase
      .from('artisans').update({
        bio,
        tarif_min: tarifMin ? parseInt(tarifMin) : null,
        tarif_max: tarifMax ? parseInt(tarifMax) : null,
        annees_experience: anneesExp ? parseInt(anneesExp) : null,
        ville,
        rayon_km: rayonKm ? parseInt(rayonKm) : 15,
        disponible,
        urgences_24h: urgences24h,
        devis_gratuit: devisGratuit,
        jours_dispo: joursDispoSelected,
        heure_debut: heureDebut,
        heure_fin: heureFin,
        frais_deplacement: fraisDeplacement ? parseInt(fraisDeplacement) : 50,
      }).eq('id', artisan.id)

    if (artisanError) { setError(artisanError.message); setSaving(false); return }

    setSuccess(true)
    setSaving(false)
    setTimeout(() => setSuccess(false), 3000)
  }

  async function uploadPortfolioPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploadingPortfolio(true)

    for (let file of Array.from(files)) {
  file = await compressImage(file, { quality: 80, maxWidth: 1200, maxHeight: 1200 })
      const fileExt = file.name.split('.').pop()
      const fileName = `${artisan.id}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('portfolio').upload(fileName, file, { upsert: true })

      if (!uploadError) {
        const { data } = supabase.storage.from('portfolio').getPublicUrl(fileName)
        const { data: photoData } = await supabase.from('portfolio').insert({
          artisan_id: artisan.id,
          photo_url: data.publicUrl,
          titre: file.name,
        }).select('*').single() as { data: any }

        if (photoData) setPortfolioPhotos(prev => [photoData, ...prev])
      }
    }
    setUploadingPortfolio(false)
  }

  async function supprimerPhoto(photoId: string) {
    await supabase.from('portfolio').delete().eq('id', photoId)
    setPortfolioPhotos(prev => prev.filter(p => p.id !== photoId))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center">
        <div className="text-gray-500">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <Link href="/" className="text-xl font-bold text-[#1B7A56]">🔧 BricoMaroc</Link>
        <div className="flex items-center gap-3">
          {success && (
            <span className="text-sm text-green-600 font-medium bg-green-50 px-3 py-1.5 rounded-lg">
              ✅ Profil sauvegardé !
            </span>
          )}
          <button onClick={sauvegarder} disabled={saving}
            className="bg-[#1B7A56] text-white font-semibold px-5 py-2 rounded-xl
              hover:bg-[#155f42] transition-colors disabled:opacity-50">
            {saving ? 'Sauvegarde...' : '💾 Sauvegarder'}
          </button>
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-800">← Dashboard</Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Mon profil</h1>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
        )}

        {/* INFORMATIONS PERSONNELLES */}
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900">👤 Informations personnelles</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                focus:outline-none focus:ring-2 focus:ring-[#1B7A56]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
              placeholder="06XXXXXXXX"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                focus:outline-none focus:ring-2 focus:ring-[#1B7A56]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
            <select value={ville} onChange={e => setVille(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                focus:outline-none focus:ring-2 focus:ring-[#1B7A56]">
              {villes.map(v => <option key={v}>{v}</option>)}
            </select>
          </div>
        </div>

        {/* PRÉSENTATION */}
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900">📝 Présentation</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio / Description</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)}
              placeholder="Décrivez votre expérience, vos spécialités..."
              rows={4}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                focus:outline-none focus:ring-2 focus:ring-[#1B7A56] resize-none" />
            <p className="text-xs text-gray-400 mt-1">{bio.length}/500 caractères</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Années d'expérience</label>
            <input type="number" value={anneesExp} onChange={e => setAnneesExp(e.target.value)}
              min="0" max="50"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                focus:outline-none focus:ring-2 focus:ring-[#1B7A56]" />
          </div>
        </div>

        {/* TARIFS */}
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900">💰 Tarifs</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tarif min (MAD/h)</label>
              <input type="number" value={tarifMin} onChange={e => setTarifMin(e.target.value)}
                placeholder="100"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                  focus:outline-none focus:ring-2 focus:ring-[#1B7A56]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tarif max (MAD/h)</label>
              <input type="number" value={tarifMax} onChange={e => setTarifMax(e.target.value)}
                placeholder="300"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                  focus:outline-none focus:ring-2 focus:ring-[#1B7A56]" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Frais de déplacement (MAD)</label>
            <input type="number" value={fraisDeplacement}
              onChange={e => setFraisDeplacement(e.target.value)}
              placeholder="50"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                focus:outline-none focus:ring-2 focus:ring-[#1B7A56]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rayon d'intervention (km)</label>
            <input type="number" value={rayonKm} onChange={e => setRayonKm(e.target.value)}
              placeholder="15"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                focus:outline-none focus:ring-2 focus:ring-[#1B7A56]" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input type="checkbox" id="devisGratuit" checked={devisGratuit}
                onChange={e => setDevisGratuit(e.target.checked)}
                className="w-4 h-4 accent-[#1B7A56]" />
              <label htmlFor="devisGratuit" className="text-sm text-gray-700">Devis gratuit</label>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="urgences" checked={urgences24h}
                onChange={e => setUrgences24h(e.target.checked)}
                className="w-4 h-4 accent-[#1B7A56]" />
              <label htmlFor="urgences" className="text-sm text-gray-700">
                Disponible pour urgences 24h/24
              </label>
            </div>
          </div>
        </div>

        {/* DISPONIBILITÉS */}
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900">📅 Disponibilités</h2>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <input type="checkbox" id="disponible" checked={disponible}
              onChange={e => setDisponible(e.target.checked)}
              className="w-4 h-4 accent-[#1B7A56]" />
            <label htmlFor="disponible" className="text-sm font-medium text-gray-700">
              Je suis disponible pour de nouvelles missions
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Jours travaillés</label>
            <div className="flex gap-2 flex-wrap">
              {jours.map((jour, i) => (
                <button key={jour} onClick={() => toggleJour(i + 1)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    joursDispoSelected.includes(i + 1)
                      ? 'bg-[#1B7A56] text-white'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}>
                  {jour}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Heure début</label>
              <input type="time" value={heureDebut} onChange={e => setHeureDebut(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                  focus:outline-none focus:ring-2 focus:ring-[#1B7A56]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Heure fin</label>
              <input type="time" value={heureFin} onChange={e => setHeureFin(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                  focus:outline-none focus:ring-2 focus:ring-[#1B7A56]" />
            </div>
          </div>
        </div>

        {/* PORTFOLIO */}
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900">📸 Galerie portfolio</h2>
          <p className="text-sm text-gray-500">
            Ajoutez des photos de vos réalisations pour convaincre vos clients.
          </p>
          <label className="block cursor-pointer">
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center
              hover:border-[#1B7A56] hover:bg-green-50 transition-colors">
              <div className="text-3xl mb-2">📷</div>
              <p className="text-sm font-medium text-gray-700">
                {uploadingPortfolio ? 'Upload en cours...' : 'Cliquez pour ajouter une photo'}
              </p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG — Max 5MB</p>
            </div>
            <input type="file" accept="image/*" multiple
              onChange={uploadPortfolioPhoto}
              className="hidden" disabled={uploadingPortfolio} />
          </label>

          {portfolioPhotos.length > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {portfolioPhotos.map(photo => (
                <div key={photo.id} className="relative group aspect-square">
                  <img src={photo.photo_url} alt={photo.titre ?? 'Réalisation'}
                    className="w-full h-full object-cover rounded-xl" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100
                    transition-opacity rounded-xl flex items-center justify-center">
                    <button onClick={() => supprimerPhoto(photo.id)}
                      className="bg-red-500 text-white text-xs px-3 py-1.5 rounded-lg
                        hover:bg-red-600 transition-colors">
                      🗑️ Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 text-center py-2">
              Aucune photo pour le moment
            </p>
          )}
        </div>

        {/* STATUT COMPTE */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-3">🏅 Statut du compte</h2>
          <div className="flex gap-3 flex-wrap">
            <span className={`text-sm px-3 py-1.5 rounded-full font-medium ${
              artisan?.statut === 'verified' ? 'bg-green-100 text-green-700' :
              artisan?.statut === 'pending' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {artisan?.statut === 'verified' ? '✓ Vérifié' :
               artisan?.statut === 'pending' ? '⏳ En attente de validation' : '❌ Suspendu'}
            </span>
            {artisan?.plan && artisan.plan !== 'free' && (
              <span className={`text-sm px-3 py-1.5 rounded-full font-medium ${
                artisan.plan === 'elite' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {artisan.plan === 'elite' ? '👑 Plan Élite' : '⭐ Plan Pro'}
              </span>
            )}
            <Link href="/premium"
              className="text-sm px-3 py-1.5 rounded-full font-medium bg-gray-100 text-gray-600
                hover:bg-gray-200 transition-colors">
              Upgrader mon plan →
            </Link>
          </div>
        </div>

        <button onClick={sauvegarder} disabled={saving}
          className="w-full bg-[#1B7A56] text-white font-semibold py-4 rounded-xl
            hover:bg-[#155f42] transition-colors disabled:opacity-50 text-lg">
          {saving ? 'Sauvegarde en cours...' : '💾 Sauvegarder mon profil'}
        </button>
      </div>
    </div>
  )
}