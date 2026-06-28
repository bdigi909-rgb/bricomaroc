'use client'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ParrainageClientPage() {
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
  const [codeInput, setCodeInput] = useState('')
  const [applying, setApplying] = useState(false)
  const [applyMsg, setApplyMsg] = useState('')
  const [applyError, setApplyError] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) { router.push('/auth/login'); return }
      setUser(currentUser)

      // Charger ou créer parrainage
      let { data: parrainageData } = await supabase
        .from('parrainage_clients')
        .select('*')
        .eq('parrain_id', currentUser.id)
        .single() as { data: any }

      if (!parrainageData) {
        const code = 'CLI' + Math.random().toString(36).substring(2, 8).toUpperCase()
        const { data: newParrainage } = await supabase
          .from('parrainage_clients')
          .insert({ parrain_id: currentUser.id, code })
          .select('*').single() as { data: any }
        parrainageData = newParrainage
      }

      setParrainage(parrainageData)

      // Utilisations
      const { data: utilisationsData } = await supabase
        .from('parrainage_client_utilisations')
        .select('*, filleul:users!parrainage_client_utilisations_filleul_id_fkey(full_name, created_at)')
        .eq('parrain_id', currentUser.id)
        .order('created_at', { ascending: false }) as { data: any[] | null }

      setUtilisations(utilisationsData ?? [])
      setLoading(false)
    }
    load()
  }, [])

  async function copierCode() {
    await navigator.clipboard.writeText(parrainage?.code ?? '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function partagerWhatsApp() {
    const msg = `Rejoins BricoMaroc et trouve des artisans verifies ! Utilise mon code ${parrainage?.code} pour obtenir 200 points de fidelite. https://bricomaroc.vercel.app/auth/register?ref=${parrainage?.code}`
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
  }

  async function appliquerCode() {
    if (!codeInput.trim()) { setApplyError('Entrez un code'); return }
    if (codeInput.toUpperCase() === parrainage?.code) {
      setApplyError('Vous ne pouvez pas utiliser votre propre code')
      return
    }

    setApplying(true)
    setApplyError('')
    setApplyMsg('')

    // Vérifier si code valide
    const { data: parrainData } = await supabase
      .from('parrainage_clients')
      .select('*, parrain:users!parrainage_clients_parrain_id_fkey(full_name)')
      .eq('code', codeInput.toUpperCase())
      .single() as { data: any }

    if (!parrainData) {
      setApplyError('Code invalide')
      setApplying(false)
      return
    }

    // Vérifier si déjà utilisé
    const { data: existing } = await supabase
      .from('parrainage_client_utilisations')
      .select('id')
      .eq('filleul_id', user.id)
      .single() as { data: any }

    if (existing) {
      setApplyError('Vous avez déjà utilisé un code parrainage')
      setApplying(false)
      return
    }

    // Enregistrer utilisation
    await supabase.from('parrainage_client_utilisations').insert({
      code: codeInput.toUpperCase(),
      parrain_id: parrainData.parrain_id,
      filleul_id: user.id,
      points: 200,
    })

    // Mettre à jour compteur parrain
    await supabase.from('parrainage_clients').update({
      nb_utilises: (parrainData.nb_utilises ?? 0) + 1,
      points_gagnes: (parrainData.points_gagnes ?? 0) + 200,
    }).eq('id', parrainData.id)

    // Ajouter points fidélité au parrain
    await supabase.from('fidelite').upsert({
      client_id: parrainData.parrain_id,
      points: 200,
    }, { onConflict: 'client_id' })

    await supabase.from('fidelite_historique').insert({
      client_id: parrainData.parrain_id,
      points: 200,
      type: 'parrainage',
      description: 'Parrainage client accepte',
    })

    // Notification au parrain
    await supabase.from('notifications').insert({
      user_id: parrainData.parrain_id,
      titre: 'Nouveau filleul !',
      message: `Quelqu\'un a utilise votre code parrainage. Vous gagnez 200 points !`,
      type: 'success',
      lien: '/parrainage-client',
    })

    setApplyMsg(`Code applique ! ${parrainData.parrain?.full_name} a gagne 200 points.`)
    setCodeInput('')
    setApplying(false)
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
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-[#1B7A56]">BricoMaroc</Link>
        <Link href="/espace-client" className="text-sm text-gray-500 hover:text-gray-800">
          Mon espace
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Parrainage client</h1>
          <p className="text-gray-500 text-sm mt-1">
            Invitez vos amis et gagnez des points fidelite
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Amis parraines', value: parrainage?.nb_utilises ?? 0, icon: '👥' },
            { label: 'Points gagnes', value: parrainage?.points_gagnes ?? 0, icon: '🎁' },
            { label: 'Points par filleul', value: 200, icon: '⭐' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-4 text-center shadow-sm">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* MON CODE */}
        <div className="bg-gradient-to-br from-[#1B7A56] to-[#0f4a33] rounded-2xl p-6 text-white">
          <h2 className="font-bold text-lg mb-1">Mon code parrainage</h2>
          <p className="text-green-200 text-sm mb-4">
            Partagez ce code avec vos amis. Ils obtiennent 200 points et vous aussi !
          </p>
          <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3 mb-4">
            <span className="text-2xl font-bold tracking-widest flex-1">
              {parrainage?.code}
            </span>
            <button onClick={copierCode}
              className="bg-white text-[#1B7A56] font-semibold px-4 py-2 rounded-lg
                hover:bg-green-50 transition-colors text-sm">
              {copied ? 'Copie !' : 'Copier'}
            </button>
          </div>
          <div className="flex gap-3">
            <button onClick={partagerWhatsApp}
              className="flex-1 bg-green-500 text-white font-semibold py-2.5 rounded-xl
                hover:bg-green-600 transition-colors text-sm">
              Partager sur WhatsApp
            </button>
            <button onClick={() => {
              const url = `https://bricomaroc.vercel.app/auth/register?ref=${parrainage?.code}`
              navigator.clipboard.writeText(url)
              alert('Lien copie !')
            }}
              className="flex-1 bg-white/20 text-white font-semibold py-2.5 rounded-xl
                hover:bg-white/30 transition-colors text-sm">
              Copier le lien
            </button>
          </div>
        </div>

        {/* UTILISER UN CODE */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-2">Utiliser un code parrainage</h2>
          <p className="text-gray-500 text-sm mb-4">
            Un ami vous a partage son code ? Entrez-le pour obtenir 200 points !
          </p>

          {applyMsg && (
            <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-xl mb-3">
              {applyMsg}
            </div>
          )}
          {applyError && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-3">
              {applyError}
            </div>
          )}

          <div className="flex gap-3">
            <input
              type="text"
              value={codeInput}
              onChange={e => setCodeInput(e.target.value.toUpperCase())}
              placeholder="Ex: CLI7X9K2"
              maxLength={10}
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm
                focus:outline-none focus:ring-2 focus:ring-[#1B7A56] font-mono tracking-wider"
            />
            <button onClick={appliquerCode} disabled={applying}
              className="bg-[#1B7A56] text-white font-semibold px-5 py-3 rounded-xl
                hover:bg-[#155f42] transition-colors disabled:opacity-50">
              {applying ? '...' : 'Appliquer'}
            </button>
          </div>
        </div>

        {/* COMMENT CA MARCHE */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">Comment ca marche ?</h2>
          <div className="space-y-3">
            {[
              { step: '1', text: 'Partagez votre code unique avec vos amis', icon: '📤' },
              { step: '2', text: 'Votre ami s\'inscrit sur BricoMaroc et entre votre code', icon: '📝' },
              { step: '3', text: 'Vous gagnez tous les deux 200 points de fidelite', icon: '🎁' },
              { step: '4', text: 'Utilisez vos points pour obtenir des reductions', icon: '💰' },
            ].map(item => (
              <div key={item.step} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#1B7A56] text-white rounded-full flex items-center
                  justify-center text-sm font-bold flex-shrink-0">
                  {item.step}
                </div>
                <span className="text-xl">{item.icon}</span>
                <p className="text-sm text-gray-600">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* HISTORIQUE */}
        {utilisations.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">
                Mes filleuls ({utilisations.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-50">
              {utilisations.map(u => (
                <div key={u.id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {u.filleul?.full_name ?? 'Client'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(u.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <span className="text-green-600 font-bold text-sm">+{u.points} pts</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Link href="/fidelite"
          className="block text-center text-sm text-[#1B7A56] font-medium hover:underline">
          Voir mon programme fidelite →
        </Link>
      </div>
    </div>
  )
}