'use client'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { generateContratPDF } from '@/lib/generateContrat'

export default function ContratPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const router = useRouter()

  const [user, setUser] = useState<any>(null)
  const [userInfo, setUserInfo] = useState<any>(null)
  const [demandes, setDemandes] = useState<any[]>([])
  const [artisans, setArtisans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [demandeId, setDemandeId] = useState('')
  const [artisanId, setArtisanId] = useState('')
  const [montant, setMontant] = useState('')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [garantieMois, setGarantieMois] = useState('3')
  const [description, setDescription] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) { router.push('/auth/login'); return }
      setUser(currentUser)

      const { data: userData } = await supabase
        .from('users').select('*').eq('id', currentUser.id).single() as { data: any }
      setUserInfo(userData)

      const { data: demandesData } = await supabase
        .from('demandes')
        .select('*, categorie:categories(nom)')
        .eq('client_id', currentUser.id)
        .in('statut', ['accepted', 'in_progress'])
        .order('created_at', { ascending: false }) as { data: any[] | null }
      setDemandes(demandesData ?? [])

      const { data: artisansData } = await supabase
        .from('artisans')
        .select('*, user:users(full_name, phone)')
        .eq('statut', 'verified')
        .order('note_moyenne', { ascending: false })
        .limit(20) as { data: any[] | null }
      setArtisans(artisansData ?? [])

      setLoading(false)
    }
    load()
  }, [])

  function genererContrat() {
    const demande = demandes.find(d => d.id === demandeId)
    const artisan = artisans.find(a => a.id === artisanId)

    if (!demande || !artisan || !montant || !dateDebut || !dateFin) {
      alert('Veuillez remplir tous les champs obligatoires')
      return
    }

    const numero = Math.random().toString(36).substring(2, 10).toUpperCase()

    generateContratPDF({
      numero,
      date: new Date().toLocaleDateString('fr-FR'),
      clientNom: userInfo?.full_name ?? 'Client',
      clientVille: userInfo?.ville ?? 'Maroc',
      clientPhone: userInfo?.phone ?? '',
      artisanNom: artisan.user?.full_name ?? 'Artisan',
      artisanVille: artisan.ville ?? 'Maroc',
      artisanPhone: artisan.user?.phone ?? '',
      missionTitre: demande.titre,
      missionDescription: description || demande.description || '',
      montant: parseFloat(montant),
      dateDebut,
      dateFin,
      garantieMois: parseInt(garantieMois),
    })
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
          <h1 className="text-2xl font-bold text-gray-900">Contrat de prestation</h1>
          <p className="text-gray-500 text-sm mt-1">
            Generez un contrat PDF entre vous et votre artisan
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-5">
          <h2 className="font-bold text-gray-900">Informations du contrat</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mission concernee *
            </label>
            {demandes.length === 0 ? (
              <div className="bg-yellow-50 rounded-xl p-4 text-sm text-yellow-700">
                Aucune mission en cours. Un contrat ne peut etre genere que pour une mission acceptee.
              </div>
            ) : (
              <select value={demandeId} onChange={e => {
                setDemandeId(e.target.value)
                const d = demandes.find(d => d.id === e.target.value)
                if (d?.description) setDescription(d.description)
              }}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                  focus:outline-none focus:ring-2 focus:ring-[#1B7A56]">
                <option value="">Selectionnez une mission</option>
                {demandes.map(d => (
                  <option key={d.id} value={d.id}>{d.titre}</option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Artisan concerne *
            </label>
            <select value={artisanId} onChange={e => setArtisanId(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                focus:outline-none focus:ring-2 focus:ring-[#1B7A56]">
              <option value="">Selectionnez un artisan</option>
              {artisans.map(a => (
                <option key={a.id} value={a.id}>
                  {a.user?.full_name ?? 'Artisan'} — {a.ville}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description des travaux
            </label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Decrivez precisement les travaux a realiser..."
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                focus:outline-none focus:ring-2 focus:ring-[#1B7A56] resize-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Montant total (MAD) *
            </label>
            <input type="number" value={montant} onChange={e => setMontant(e.target.value)}
              placeholder="500"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                focus:outline-none focus:ring-2 focus:ring-[#1B7A56]" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de debut *
              </label>
              <input type="date" value={dateDebut} onChange={e => setDateDebut(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                  focus:outline-none focus:ring-2 focus:ring-[#1B7A56]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de fin *
              </label>
              <input type="date" value={dateFin} onChange={e => setDateFin(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                  focus:outline-none focus:ring-2 focus:ring-[#1B7A56]" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Garantie (mois)
            </label>
            <select value={garantieMois} onChange={e => setGarantieMois(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                focus:outline-none focus:ring-2 focus:ring-[#1B7A56]">
              {[1, 2, 3, 6, 12, 24].map(m => (
                <option key={m} value={m}>{m} mois</option>
              ))}
            </select>
          </div>

          <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-sm text-green-700">
            Le contrat PDF sera genere et telecharge automatiquement.
            Imprimez-le et faites-le signer par les deux parties.
          </div>

          <button onClick={genererContrat}
            className="w-full bg-[#1B7A56] text-white font-semibold py-4 rounded-xl
              hover:bg-[#155f42] transition-colors text-lg">
            Generer le contrat PDF
          </button>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-3">Pourquoi un contrat ?</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Protege les deux parties en cas de litige</p>
            <p>• Definit clairement les obligations de chacun</p>
            <p>• Precise la garantie sur les travaux</p>
            <p>• Document officiel reconnu</p>
          </div>
        </div>
      </div>
    </div>
  )
}