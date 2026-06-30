'use client'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { compressImage } from '@/lib/useImageCompress'

export default function ProfilClientPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const router = useRouter()

  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [ville, setVille] = useState('Marrakech')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [uploading, setUploading] = useState(false)

  const villes = ['Marrakech', 'Casablanca', 'Rabat', 'Fès', 'Tanger',
    'Agadir', 'Meknès', 'Oujda', 'Tétouan', 'Safi']

  useEffect(() => {
    async function load() {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) { router.push('/auth/login'); return }

      const { data: userData } = await supabase
        .from('users').select('*').eq('id', currentUser.id).single() as { data: any }

      if (userData) {
        setUser(userData)
        setFullName(userData.full_name ?? '')
        setPhone(userData.phone ?? '')
        setVille(userData.ville ?? 'Marrakech')
        setAvatarUrl(userData.avatar_url ?? '')
      }

      setLoading(false)
    }
    load()
  }, [])

  async function uploadAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    let file = e.target.files?.[0]
    if (!file) return

    setUploading(true)

    // Compression
    file = await compressImage(file, { quality: 85, maxWidth: 400, maxHeight: 400 })

    const fileName = `${user.id}.webp`
    const { error: uploadError } = await supabase.storage
      .from('avatars').upload(fileName, file, { upsert: true })

    if (!uploadError) {
      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName)
      setAvatarUrl(data.publicUrl)
    }

    setUploading(false)
  }

  async function sauvegarder() {
    setSaving(true)
    setError('')
    setSuccess(false)

    const { error: updateError } = await supabase
      .from('users')
      .update({
        full_name: fullName,
        phone,
        ville,
        avatar_url: avatarUrl || null,
      })
      .eq('id', user.id)

    if (updateError) {
      setError(updateError.message)
      setSaving(false)
      return
    }

    setSuccess(true)
    setSaving(false)
    setTimeout(() => setSuccess(false), 3000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center">
        <div className="text-gray-500">Chargement...</div>
      </div>
    )
  }

  const initials = (fullName ?? 'U').split(' ')
    .map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()

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
          <Link href="/espace-client" className="text-sm text-gray-500 hover:text-gray-800">
            ← Mes demandes
          </Link>
        </div>
      </nav>

      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Mon profil</h1>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
        )}

        {/* PHOTO */}
        <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
          <h2 className="font-bold text-gray-900 mb-4">📷 Photo de profil</h2>
          <div className="relative inline-block mb-4">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar"
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-[#1B7A56] text-white text-3xl
                font-bold flex items-center justify-center border-4 border-white shadow-md">
                {initials}
              </div>
            )}
            <label className="absolute bottom-0 right-0 bg-white border border-gray-200
              rounded-full p-1.5 cursor-pointer shadow-sm hover:bg-gray-50 transition-colors">
              <input type="file" accept="image/*" onChange={uploadAvatar}
                className="hidden" disabled={uploading} />
              <span className="text-sm">{uploading ? '⏳' : '✏️'}</span>
            </label>
          </div>
          <p className="text-xs text-gray-400">
            {uploading ? 'Compression et upload en cours...' : 'Cliquez sur ✏️ pour changer votre photo'}
          </p>
        </div>

        {/* INFORMATIONS */}
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900">👤 Informations personnelles</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
              placeholder="Mohammed Alami"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                focus:outline-none focus:ring-2 focus:ring-[#1B7A56]" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={user?.email ?? ''} disabled
              className="w-full border border-gray-100 rounded-xl px-4 py-3 text-sm
                bg-gray-50 text-gray-400 cursor-not-allowed" />
            <p className="text-xs text-gray-400 mt-1">L'email ne peut pas être modifié</p>
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

        {/* SECURITE */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-3">🔐 Sécurité</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Mot de passe</p>
              <p className="text-xs text-gray-400">Dernière modification inconnue</p>
            </div>
            <button
              onClick={async () => {
                await supabase.auth.resetPasswordForEmail(user?.email, {
                  redirectTo: 'https://bricomaroc.vercel.app/reset-password',
                })
                alert('Email de réinitialisation envoyé !')
              }}
              className="text-sm text-[#1B7A56] font-medium hover:underline">
              Modifier →
            </button>
          </div>
        </div>

        {/* DANGER ZONE */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-red-100">
          <h2 className="font-bold text-red-600 mb-3">⚠️ Zone de danger</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Supprimer mon compte</p>
              <p className="text-xs text-gray-400">Cette action est irréversible</p>
            </div>
            <button className="text-sm text-red-500 border border-red-200 font-medium
              px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
              Supprimer
            </button>
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
