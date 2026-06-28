'use client'
import { useState, Suspense } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function RegisterPageContent() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const router = useRouter()
  const [step, setStep] = useState(1)

  const searchParams = useSearchParams()
  const [role, setRole] = useState<'client' | 'artisan'>(
    searchParams.get('role') === 'artisan' ? 'artisan' : 'client'
  )
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [ville, setVille] = useState('Marrakech')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const villes = ['Marrakech', 'Casablanca', 'Rabat', 'Fès', 'Tanger',
    'Agadir', 'Meknès', 'Oujda', 'Tétouan', 'Safi']

  async function handleRegister() {
    setLoading(true)
    setError('')

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role } }
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      const { error: userError } = await supabase.from('users').insert({
        id: data.user.id,
        email,
        full_name: fullName,
        phone,
        role,
        ville,
      })

      if (userError) {
        setError(userError.message)
        setLoading(false)
        return
      }

      if (role === 'artisan') {
        await supabase.from('artisans').insert({
          user_id: data.user.id,
          ville,
          statut: 'pending',
        })
      }
    }

    setSuccess(true)
    // Envoyer email de bienvenue
await fetch('/api/email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: email,
    subject: 'Bienvenue sur BricoMaroc ! 🔧',
    type: 'inscription',
    data: { nom: fullName, role },
  }),
})
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-md text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-gray-900">Compte créé !</h2>
          <p className="text-gray-500 text-sm mt-2">
            Vérifiez votre email pour confirmer votre compte.
          </p>
          <Link href="/auth/login"
            className="mt-6 block w-full bg-[#1B7A56] text-white font-semibold
              py-3 rounded-xl hover:bg-[#155f42] transition-colors text-center">
            Se connecter
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="text-2xl font-bold text-[#1B7A56]">🔧 BricoMaroc</Link>
          <h1 className="text-xl font-bold text-gray-900 mt-4">Créer un compte</h1>
          <div className="flex justify-center gap-2 mt-2">
            {[1, 2].map(s => (
              <div key={s} className={`w-8 h-1 rounded-full ${
                step >= s ? 'bg-[#1B7A56]' : 'bg-gray-200'}`} />
            ))}
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm font-medium text-gray-700 text-center">Je suis :</p>
            <div className="grid grid-cols-2 gap-3">
              {(['client', 'artisan'] as const).map(r => (
                <button key={r} onClick={() => setRole(r)}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    role === r
                      ? 'border-[#1B7A56] bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                  <div className="text-2xl mb-1">{r === 'client' ? '👤' : '🔧'}</div>
                  <div className="font-semibold text-sm capitalize">
                    {r === 'client' ? 'Client' : 'Artisan'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {r === 'client' ? 'Je cherche un artisan' : 'Je propose mes services'}
                  </div>
                </button>
              ))}
            </div>
            <button onClick={() => setStep(2)}
              className="w-full bg-[#1B7A56] text-white font-semibold py-3 rounded-xl
                hover:bg-[#155f42] transition-colors">
              Continuer →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                placeholder="Mohammed Alami"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                  focus:outline-none focus:ring-2 focus:ring-[#1B7A56]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="vous@exemple.ma"
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Min. 6 caractères"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                  focus:outline-none focus:ring-2 focus:ring-[#1B7A56]" />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep(1)}
                className="flex-1 border border-gray-200 text-gray-600 font-semibold
                  py-3 rounded-xl hover:bg-gray-50 transition-colors">
                ← Retour
              </button>
              <button onClick={handleRegister} disabled={loading}
                className="flex-2 flex-1 bg-[#1B7A56] text-white font-semibold py-3 rounded-xl
                  hover:bg-[#155f42] transition-colors disabled:opacity-50">
                {loading ? 'Création...' : 'Créer mon compte'}
              </button>
            </div>
          </div>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          Déjà un compte ?{' '}
          <Link href="/auth/login" className="text-[#1B7A56] font-semibold hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F7F5F0]" />}>
      <RegisterPageContent />
    </Suspense>
  )
}