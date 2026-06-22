'use client'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

function CheckoutForm({ demande, onSuccess }: { demande: any, onSuccess: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [amount, setAmount] = useState(demande?.budget_min ?? 200)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return

    setLoading(true)
    setError('')

    try {
      // Créer le payment intent
      const res = await fetch('/api/payment/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          demandeId: demande.id,
          description: demande.titre,
        }),
      })
      const { clientSecret, error: apiError } = await res.json()

      if (apiError) {
        setError(apiError)
        setLoading(false)
        return
      }

      // Confirmer le paiement
      const { error: stripeError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      })

      if (stripeError) {
        setError(stripeError.message ?? 'Erreur de paiement')
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Montant (MAD)
        </label>
        <input
          type="number"
          value={amount}
          onChange={e => setAmount(parseInt(e.target.value))}
          min={50}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
            focus:outline-none focus:ring-2 focus:ring-[#1B7A56]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Informations de carte
        </label>
        <div className="border border-gray-200 rounded-xl px-4 py-4 bg-white">
         <CardElement options={{
  hidePostalCode: true,
  style: {
    base: {
      fontSize: '16px',
      color: '#1A1A1A',
      '::placeholder': { color: '#9CA3AF' },
    },
  },
}} />
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Pour tester : carte 4242 4242 4242 4242, date future, CVC quelconque
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-[#1B7A56] text-white font-semibold py-3 rounded-xl
          hover:bg-[#155f42] transition-colors disabled:opacity-50">
        {loading ? 'Traitement...' : `Payer ${amount} MAD`}
      </button>
    </form>
  )
}

export default function PaiementPage({ params }: { params: { id: string } }) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const router = useRouter()
  const [demande, setDemande] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data } = await supabase
        .from('demandes')
        .select('*, categorie:categories(nom, icone)')
        .eq('id', params.id)
        .single() as { data: any }

      if (!data) { router.push('/'); return }
      setDemande(data)
      setLoading(false)
    }
    load()
  }, [])

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
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-gray-900">Paiement réussi !</h2>
          <p className="text-gray-500 text-sm mt-2">
            Votre paiement a été traité avec succès.
          </p>
          <Link href="/espace-client"
            className="mt-6 block w-full bg-[#1B7A56] text-white font-semibold
              py-3 rounded-xl hover:bg-[#155f42] transition-colors text-center">
            Voir mes demandes
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-[#1B7A56]">🔧 BricoMaroc</Link>
        <Link href="/espace-client" className="text-sm text-gray-500 hover:text-gray-800">← Retour</Link>
      </nav>

      <div className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Paiement sécurisé</h1>
        <p className="text-gray-500 text-sm mb-6">Powered by Stripe</p>

        {/* RÉSUMÉ DEMANDE */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{demande?.categorie?.icone}</span>
            <div>
              <h3 className="font-bold text-gray-900">{demande?.titre}</h3>
              <p className="text-sm text-gray-500">{demande?.categorie?.nom}</p>
            </div>
          </div>
          {demande?.budget_min && (
            <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-sm">
              <span className="text-gray-500">Budget prévu</span>
              <span className="font-semibold text-gray-900">
                {demande.budget_min}–{demande.budget_max} MAD
              </span>
            </div>
          )}
        </div>

        {/* FORMULAIRE STRIPE */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-green-600">🔒</span>
            <span className="text-sm text-gray-600">Paiement sécurisé SSL</span>
          </div>
          <Elements stripe={stripePromise}>
            <CheckoutForm demande={demande} onSuccess={() => setSuccess(true)} />
          </Elements>
        </div>
      </div>
    </div>
  )
}