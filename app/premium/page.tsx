'use client'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const PLANS = [
  {
    id: 'pro',
    nom: 'Pro',
    prix: 199,
    periode: 'mois',
    couleur: 'border-[#1B7A56]',
    badge: 'bg-[#1B7A56] text-white',
    icon: '⭐',
    avantages: [
      'Badge "Pro" visible sur votre profil',
      'Priorité dans les résultats de recherche',
      'Jusqu\'à 20 demandes par mois',
      'Statistiques de vues du profil',
      'Support prioritaire',
    ],
  },
  {
    id: 'elite',
    nom: 'Élite',
    prix: 399,
    periode: 'mois',
    couleur: 'border-yellow-400',
    badge: 'bg-yellow-400 text-gray-900',
    icon: '👑',
    avantages: [
      'Badge "Élite" doré sur votre profil',
      'Première position dans les recherches',
      'Demandes illimitées',
      'Mise en avant sur la page d\'accueil',
      'Commission réduite à 5% (au lieu de 10%)',
      'Support dédié 7j/7',
      'Statistiques avancées',
    ],
  },
]

function PremiumForm({ plan, artisanId, onSuccess }: {
  plan: typeof PLANS[0],
  artisanId: string,
  onSuccess: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/payment/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: plan.prix,
          demandeId: artisanId,
          description: `Abonnement BricoMaroc ${plan.nom}`,
        }),
      })
      const { clientSecret, error: apiError } = await res.json()
      if (apiError) { setError(apiError); setLoading(false); return }

      const { error: stripeError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement)! },
      })

      if (stripeError) {
        setError(stripeError.message ?? 'Erreur')
        setLoading(false)
        return
      }

      onSuccess()
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border border-gray-200 rounded-xl px-4 py-4 bg-white">
        <CardElement options={{
          hidePostalCode: true,
          style: { base: { fontSize: '16px', color: '#1A1A1A' } },
        }} />
      </div>
      <p className="text-xs text-gray-400 text-center">
        Carte test : 4242 4242 4242 4242 · date future · CVC quelconque
      </p>
      {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}
      <button type="submit" disabled={!stripe || loading}
        className="w-full bg-[#1B7A56] text-white font-semibold py-3 rounded-xl
          hover:bg-[#155f42] transition-colors disabled:opacity-50">
        {loading ? 'Traitement...' : `Payer ${plan.prix} MAD / mois`}
      </button>
    </form>
  )
}

export default function PremiumPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const router = useRouter()

  const [artisan, setArtisan] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<typeof PLANS[0] | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: artisanData } = await supabase
        .from('artisans')
        .select('*, user:users(full_name)')
        .eq('user_id', user.id)
        .single() as { data: any }

      if (!artisanData) { router.push('/'); return }
      setArtisan(artisanData)
      setLoading(false)
    }
    load()
  }, [])

  async function activerPlan(planId: string) {
    const expiry = new Date()
    expiry.setMonth(expiry.getMonth() + 1)

    await supabase.from('artisans').update({
      plan: planId,
      plan_expire_at: expiry.toISOString(),
      badge: planId === 'elite' ? 'elite' : 'verified',
    }).eq('id', artisan.id)

    setSuccess(true)
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
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-xl font-bold text-gray-900">Abonnement activé !</h2>
          <p className="text-gray-500 text-sm mt-2">
            Votre badge et vos avantages sont actifs immédiatement.
          </p>
          <Link href="/dashboard"
            className="mt-6 block w-full bg-[#1B7A56] text-white font-semibold
              py-3 rounded-xl hover:bg-[#155f42] transition-colors text-center">
            Retour au dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-[#1B7A56]">🔧 BricoMaroc</Link>
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-800">← Dashboard</Link>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Passez Premium</h1>
          <p className="text-gray-500 mt-2">
            Boostez votre visibilité et recevez plus de demandes
          </p>
          {artisan?.plan && artisan.plan !== 'free' && (
            <div className="mt-4 inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
              ✅ Plan actuel : {artisan.plan.toUpperCase()} — expire le {new Date(artisan.plan_expire_at).toLocaleDateString('fr-FR')}
            </div>
          )}
        </div>

        {/* PLANS */}
        {!selectedPlan && (
          <div className="grid grid-cols-2 gap-6 mb-8">
            {PLANS.map(plan => (
              <div key={plan.id}
                className={`bg-white rounded-2xl p-6 shadow-sm border-2 ${plan.couleur} relative`}>
                {plan.id === 'elite' && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400
                    text-gray-900 text-xs font-bold px-3 py-1 rounded-full">
                    ⭐ Populaire
                  </div>
                )}

                <div className="text-center mb-6">
                  <span className="text-4xl">{plan.icon}</span>
                  <h3 className="text-xl font-bold text-gray-900 mt-2">{plan.nom}</h3>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-gray-900">{plan.prix}</span>
                    <span className="text-gray-500"> MAD / {plan.periode}</span>
                  </div>
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.avantages.map(av => (
                    <li key={av} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-[#1B7A56] font-bold mt-0.5">✓</span>
                      <span>{av}</span>
                    </li>
                  ))}
                </ul>

                <button onClick={() => setSelectedPlan(plan)}
                  className={`w-full font-semibold py-3 rounded-xl transition-colors ${
                    plan.id === 'elite'
                      ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-500'
                      : 'bg-[#1B7A56] text-white hover:bg-[#155f42]'
                  }`}>
                  Choisir {plan.nom}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* PAIEMENT */}
        {selectedPlan && (
          <div className="max-w-md mx-auto">
            <button onClick={() => setSelectedPlan(null)}
              className="text-sm text-gray-500 hover:text-gray-800 mb-4 flex items-center gap-1">
              ← Changer de plan
            </button>

            <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-900">Plan {selectedPlan.nom}</h3>
                  <p className="text-sm text-gray-500">Facturation mensuelle</p>
                </div>
                <span className="text-2xl font-bold text-[#1B7A56]">
                  {selectedPlan.prix} MAD
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-xl">
                <span>🔒</span>
                <span>Paiement sécurisé SSL via Stripe</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <Elements stripe={stripePromise}>
                <PremiumForm
                  plan={selectedPlan}
                  artisanId={artisan.id}
                  onSuccess={() => activerPlan(selectedPlan.id)}
                />
              </Elements>
            </div>
          </div>
        )}

        {/* PLAN GRATUIT */}
        <div className="mt-8 bg-white rounded-2xl p-5 shadow-sm text-center">
          <h3 className="font-bold text-gray-900 mb-2">Plan Gratuit — Ce que vous avez déjà</h3>
          <div className="flex justify-center gap-6 text-sm text-gray-500">
            <span>✓ Profil public</span>
            <span>✓ 5 demandes / mois</span>
            <span>✓ Badge vérifié</span>
            <span>✓ Commission 10%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
