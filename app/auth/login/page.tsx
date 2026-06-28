'use client'
import { useState, Suspense } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function LoginContent() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const router = useRouter()
  const searchParams = useSearchParams()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      const redirect = searchParams.get('redirect')
      await fetch('/api/logs', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'connexion',
    userId: null,
    details: { email },
  }),
})
      router.push(redirect ?? '/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-[#1B7A56]">🔧 BricoMaroc</Link>
          <h1 className="text-xl font-bold text-gray-900 mt-4">Connexion</h1>
          <p className="text-gray-500 text-sm mt-1">Accédez à votre espace</p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="vous@exemple.ma"
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                focus:outline-none focus:ring-2 focus:ring-[#1B7A56]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                focus:outline-none focus:ring-2 focus:ring-[#1B7A56]"
            />
          </div>
          <div className="text-right">
            <Link href="/reset-password"
              className="text-xs text-[#1B7A56] hover:underline">
              Mot de passe oublié ?
            </Link>
          </div>
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-[#1B7A56] text-white font-semibold py-3 rounded-xl
              hover:bg-[#155f42] transition-colors disabled:opacity-50"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </div>
        <p className="text-center text-sm text-gray-500 mt-6">
          Pas encore de compte ?{' '}
          <Link href="/auth/register" className="text-[#1B7A56] font-semibold hover:underline">
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F7F5F0]" />}>
      <LoginContent />
    </Suspense>
  )
}