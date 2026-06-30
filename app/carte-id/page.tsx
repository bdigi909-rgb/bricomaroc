'use client'
import { useState, useEffect, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import QRCode from 'qrcode'

export default function CarteIdPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [artisan, setArtisan] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) { router.push('/auth/login'); return }

      const { data: userData } = await supabase
        .from('users').select('*').eq('id', currentUser.id).single() as { data: any }
      setUser(userData)

      const { data: artisanData } = await supabase
        .from('artisans')
        .select('*, categories:artisan_categories(categorie:categories(nom, icone))')
        .eq('user_id', currentUser.id).single() as { data: any }

      if (!artisanData) { router.push('/'); return }
      setArtisan(artisanData)
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    if (!loading && artisan && canvasRef.current) {
      const profileUrl = `https://bricomaroc.vercel.app/artisans/${artisan.id}`
      QRCode.toCanvas(canvasRef.current, profileUrl, {
        width: 120,
        margin: 1,
        color: { dark: '#1B7A56', light: '#FFFFFF' },
      })
    }
  }, [loading, artisan])

  async function copierLien() {
    const url = `https://bricomaroc.vercel.app/artisans/${artisan?.id}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function partagerWhatsApp() {
    const url = `https://bricomaroc.vercel.app/artisans/${artisan?.id}`
    const msg = `Bonjour ! Je suis artisan sur BricoMaroc. Consultez mon profil : ${url}`
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center">
        <div className="text-gray-500">Chargement...</div>
      </div>
    )
  }

  const initials = (user?.full_name ?? 'A')
    .split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
  const categories = artisan?.categories?.slice(0, 3) ?? []

  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <button onClick={() => router.push('/')}
          className="text-xl font-bold text-[#1B7A56]">
          BricoMaroc
        </button>
        <button onClick={() => router.push('/dashboard')}
          className="text-sm text-gray-500 hover:text-gray-800">
          Dashboard
        </button>
      </nav>

      <div className="max-w-md mx-auto px-4 py-10 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Ma carte artisan</h1>
          <p className="text-gray-500 text-sm mt-1">Partagez votre profil avec vos clients</p>
        </div>

        {/* CARTE */}
        <div className="bg-gradient-to-br from-[#1B7A56] to-[#0f4a33] rounded-3xl p-6
          shadow-xl text-white overflow-hidden relative">
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/5" />
          <div className="absolute -left-4 -bottom-8 w-24 h-24 rounded-full bg-white/5" />

          <div className="flex items-center gap-2 mb-5">
            <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center">
              <span className="text-[#1B7A56] text-xs font-bold">B</span>
            </div>
            <span className="font-bold text-sm">BricoMaroc</span>
            <span className="ml-auto text-xs text-green-200">Artisan Verifie</span>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center
              justify-center text-3xl font-bold flex-shrink-0 border-2 border-white/30">
              {initials}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{user?.full_name}</h2>
              <div className="flex flex-wrap gap-1 mt-1">
                {categories.map((cat: any) => (
                  <span key={cat.categorie?.nom}
                    className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                    {cat.categorie?.nom}
                  </span>
                ))}
              </div>
              <div className="mt-2 space-y-0.5">
                <p className="text-xs text-green-200">Ville : {artisan?.ville}</p>
                <p className="text-xs text-green-200">
                  Note : {artisan?.note_moyenne?.toFixed(1)} — {artisan?.nb_missions} missions
                </p>
                <p className="text-xs text-green-200">
                  Tarif : {artisan?.tarif_min}–{artisan?.tarif_max} MAD/h
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/20 my-4" />

          <div className="flex items-center justify-between">
            <div>
              {artisan?.cin_verifie && (
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full mr-2">
                  CIN Verifie
                </span>
              )}
              {artisan?.disponible && (
                <div className="flex items-center gap-1.5 mt-2">
                  <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
                  <span className="text-xs text-green-200">Disponible maintenant</span>
                </div>
              )}
              <p className="text-xs text-green-300 mt-2">bricomaroc.vercel.app</p>
            </div>
            <div className="bg-white p-2 rounded-xl">
              <canvas ref={canvasRef} />
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="space-y-3">
          <button onClick={copierLien}
            className="w-full bg-[#1B7A56] text-white font-semibold py-3 rounded-xl
              hover:bg-[#155f42] transition-colors">
            {copied ? 'Lien copie !' : 'Copier mon lien profil'}
          </button>

          <button onClick={partagerWhatsApp}
            className="w-full bg-green-500 text-white font-semibold py-3 rounded-xl
              hover:bg-green-600 transition-colors">
            Partager sur WhatsApp
          </button>

          <button onClick={() => router.push(`/artisans/${artisan?.id}`)}
            className="w-full border border-gray-200 text-gray-600 font-semibold py-3
              rounded-xl hover:bg-gray-50 transition-colors">
            Voir mon profil public
          </button>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm text-sm text-gray-600 space-y-2">
          <p className="font-semibold text-gray-900">Comment utiliser votre carte ?</p>
          <p>Scannez le QR code pour acceder au profil</p>
          <p>Partagez le lien par WhatsApp ou SMS</p>
          <p>Ajoutez-le a vos reseaux sociaux</p>
        </div>
      </div>
    </div>
  )
}
