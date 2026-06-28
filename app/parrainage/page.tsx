'use client'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ParrainagePage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const router = useRouter()

  const [user, setUser] = useState<any>(null)
  const [parrainage, setParrainage] = useState<any>(null)
  const [utilisations, setUtilisations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [codeParrain, setCodeParrain] = useState('')
  const [applyLoading, setApplyLoading] = useState(false)
  const [applySuccess, setApplySuccess] = useState('')
  const [applyError, setApplyError] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) { router.push('/auth/login'); return }
      setUser(currentUser)

      // Chercher le code de parrainage existant
      const { data: parrainageData } = await supabase
        .from('parrainages')
        .select('*')
        .eq('parrain_id', currentUser.id)
        .single() as { data: any }

      if (parrainageData) {
        setParrainage(parrainageData)

        // Charger les utilisations
        const { data: utilData } = await supabase
          .from('parrainage_utilisations')
          .select('*, filleul:users!parrainage_utilisations_filleul_id_fkey(full_name, created_at)')
          .eq('parrain_id', currentUser.id)
          .order('created_at', { ascending: false }) as { data: any[] | null }

        setUtilisations(utilData ?? [])
      } else {
        // Créer un code automatiquement
        const code = generateCode(currentUser.email ?? 'user')
        const { data: newParrainage } = await supabase
          .from('parrainages')
          .insert({
            parrain_id: currentUser.id,
            code,
          })
          .select('*')
          .single() as { data: any }

        setParrainage(newParrainage)
      }

      setLoading(false)
    }
    load()
  }, [])

  function generateCode(email: string): string {
    const prefix = email.split('@')[0].substring(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, '')
    const suffix = Math.random().toString(36).substring(2, 6).toUpperCase()
    return `${prefix}${suffix}`
  }

  async function copierCode() {
    if (!parrainage?.code) return
    await navigator.clipboard.writeText(parrainage.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function appliquerCode() {
    if (!codeParrain.trim()) return
    setApplyLoading(true)
    setApplyError('')
    setApplySuccess('')

    // Vérifier si le code existe
    const { data: parrainData } = await supabase
      .from('parrainages')
      .select('*, parrain:users!parrainages_parrain_id_fkey(full_name)')
      .eq('code', codeParrain.toUpperCase().trim())
      .single() as { data: any }

    if (!parrainData) {
      setApplyError('Code de parrainage invalide.')
      setApplyLoading(false)
      return
    }

    if (parrainData.parrain_id === user.id) {
      setApplyError('Vous ne pouvez pas utiliser votre propre code.')
      setApplyLoading(false)
      return
    }

    // Vérifier si déjà utilisé
    const { data: dejaUtilise } = await supabase
      .from('parrainage_utilisations')
      .select('id')
      .eq('filleul_id', user.id)
      .single() as { data: any }

    if (dejaUtilise) {
      setApplyError('Vous avez déjà utilisé un code de parrainage.')
      setApplyLoading(false)
      return
    }

    // Enregistrer l'utilisation
    await supabase.from('parrainage_utilisations').insert({
      code: codeParrain.toUpperCase().trim(),
      parrain_id: parrainData.parrain_id,
      filleul_id: user.id,
    })

    // Incrémenter le compteur
    await supabase.from('parrainages').update({
      nb_utilises: (parrainData.nb_utilises ?? 0) + 1,
    }).eq('id', parrainData.id)

    // Bonus : 1 mois premium gratuit pour le filleul (simulation)
    setApplySuccess(`Code appliqué ! Vous bénéficiez d'une commission réduite grâce à ${parrainData.parrain?.full_name}.`)
    setCodeParrain('')
    setApplyLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center">
        <div className="text-gray-500">Chargement...</div>
      </div>
    )
  }

  const lienParrainage = `https://bricomaroc.vercel.app/auth/register?code=${parrainage?.code}`

  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-[#1B7A56]">🔧 BricoMaroc</Link>
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-800">← Dashboard</Link>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🎁 Parrainage</h1>
          <p className="text-gray-500">
            Invitez des artisans et bénéficiez d'avantages exclusifs
          </p>
        </div>

        {/* COMMENT ÇA MARCHE */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">Comment ça marche ?</h2>
          <div className="space-y-4">
            {[
              { num: '1', title: 'Partagez votre code', desc: 'Envoyez votre code unique à vos collègues artisans' },
              { num: '2', title: 'Ils s\'inscrivent', desc: 'Ils créent leur compte avec votre code de parrainage' },
              { num: '3', title: 'Vous gagnez', desc: 'Pour chaque filleul actif, votre commission baisse de 2%' },
            ].map(step => (
              <div key={step.num} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-[#1B7A56] text-white flex items-center
                  justify-center font-bold text-sm flex-shrink-0">
                  {step.num}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{step.title}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MON CODE */}
        <div className="bg-gradient-to-br from-[#1B7A56] to-[#155f42] rounded-2xl p-6 text-white">
          <h2 className="font-bold mb-4 text-lg">Mon code de parrainage</h2>

          <div className="bg-white/20 rounded-xl p-4 flex items-center justify-between mb-4">
            <span className="text-3xl font-bold tracking-widest">{parrainage?.code}</span>
            <button onClick={copierCode}
              className="bg-white text-[#1B7A56] font-semibold text-sm px-4 py-2 rounded-lg
                hover:bg-green-50 transition-colors">
              {copied ? '✓ Copié !' : 'Copier'}
            </button>
          </div>

          <div className="flex gap-3 text-sm">
            {[
              { label: 'Filleuls', value: parrainage?.nb_utilises ?? 0 },
              { label: 'Commission réduite', value: `${(parrainage?.nb_utilises ?? 0) * 2}%` },
            ].map(s => (
              <div key={s.label} className="flex-1 bg-white/10 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-green-200 text-xs mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* PARTAGER */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">Partager mon lien</h2>
          <div className="flex gap-2">
            <input type="text" readOnly value={lienParrainage}
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm
                text-gray-500 bg-gray-50" />
            <button onClick={() => {
              navigator.clipboard.writeText(lienParrainage)
              setCopied(true)
              setTimeout(() => setCopied(false), 2000)
            }}
              className="bg-[#1B7A56] text-white font-semibold px-4 py-3 rounded-xl
                hover:bg-[#155f42] transition-colors text-sm flex-shrink-0">
              {copied ? '✓' : 'Copier'}
            </button>
          </div>
          <div className="flex gap-3 mt-3">
            <a href={`https://wa.me/?text=Rejoignez BricoMaroc avec mon code ${parrainage?.code} : ${lienParrainage}`}
              target="_blank" rel="noopener noreferrer"
              className="flex-1 bg-green-500 text-white font-semibold py-2.5 rounded-xl
                hover:bg-green-600 transition-colors text-center text-sm">
              📱 WhatsApp
            </a>
            <a href={`sms:?body=Rejoignez BricoMaroc avec mon code ${parrainage?.code} : ${lienParrainage}`}
              className="flex-1 bg-blue-500 text-white font-semibold py-2.5 rounded-xl
                hover:bg-blue-600 transition-colors text-center text-sm">
              💬 SMS
            </a>
          </div>
        </div>

        {/* UTILISER UN CODE */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-2">Vous avez un code de parrainage ?</h2>
          <p className="text-sm text-gray-500 mb-4">
            Entrez le code d'un artisan qui vous a invité pour bénéficier d'avantages.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={codeParrain}
              onChange={e => setCodeParrain(e.target.value.toUpperCase())}
              placeholder="Ex: YOUS1A2B"
              maxLength={10}
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm
                focus:outline-none focus:ring-2 focus:ring-[#1B7A56] uppercase"
            />
            <button onClick={appliquerCode} disabled={applyLoading || !codeParrain.trim()}
              className="bg-[#E8622A] text-white font-semibold px-4 py-3 rounded-xl
                hover:bg-[#d45520] transition-colors text-sm flex-shrink-0 disabled:opacity-50">
              {applyLoading ? '...' : 'Appliquer'}
            </button>
          </div>
          {applySuccess && (
            <div className="mt-3 bg-green-50 text-green-700 text-sm px-4 py-3 rounded-xl">
              ✅ {applySuccess}
            </div>
          )}
          {applyError && (
            <div className="mt-3 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">
              {applyError}
            </div>
          )}
        </div>

        {/* LISTE FILLEULS */}
        {utilisations.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">
              Mes filleuls ({utilisations.length})
            </h2>
            <div className="space-y-3">
              {utilisations.map((u, i) => (
                <div key={u.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-[#1B7A56] text-white flex items-center
                    justify-center text-sm font-bold">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-gray-900">
                      {u.filleul?.full_name ?? 'Artisan'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Inscrit le {new Date(u.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                    -2% commission
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}