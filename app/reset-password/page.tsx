'use client'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const router = useRouter()

  const [etape, setEtape] = useState<'demande' | 'nouveau'>('demande')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Vérifier si on a un token de réinitialisation dans l'URL
    const hash = window.location.hash
    if (hash && hash.includes('type=recovery')) {
      setEtape('nouveau')
    }

    // Écouter l'événement de récupération de session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          setEtape('nouveau')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function envoyerEmail() {
    if (!email.trim()) return
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  async function changerMotDePasse() {
    if (!password.trim()) return
    if (password !== passwordConfirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }

    setLoading(true)
    setError('')

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/'), 2000)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* LOGO */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-[#1B7A56] rounded-xl flex items-center
              justify-center text-white text-xl">🔧</div>
            <span className="text-2xl font-bold text-gray-900">BricoMaroc</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8">

          {etape === 'demande' ? (
            <>
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">🔐</div>
                <h1 className="text-xl font-bold text-gray-900">
                  Mot de passe oublié ?
                </h1>
                <p className="text-gray-500 text-sm mt-2">
                  Entrez votre email et nous vous enverrons un lien de réinitialisation.
                </p>
              </div>

              {success ? (
                <div className="bg-green-50 border border-green-100 rounded-xl p-5 text-center">
                  <div className="text-3xl mb-2">📧</div>
                  <p className="font-semibold text-green-800 mb-1">Email envoyé !</p>
                  <p className="text-sm text-green-600">
                    Vérifiez votre boîte mail et cliquez sur le lien de réinitialisation.
                    Le lien est valable 1 heure.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {error && (
                    <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adresse email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="votre@email.com"
                      onKeyDown={e => e.key === 'Enter' && envoyerEmail()}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                        focus:outline-none focus:ring-2 focus:ring-[#1B7A56]"
                    />
                  </div>

                  <button onClick={envoyerEmail} disabled={loading || !email.trim()}
                    className="w-full bg-[#1B7A56] text-white font-semibold py-3 rounded-xl
                      hover:bg-[#155f42] transition-colors disabled:opacity-50">
                    {loading ? 'Envoi...' : '📧 Envoyer le lien'}
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">🔑</div>
                <h1 className="text-xl font-bold text-gray-900">
                  Nouveau mot de passe
                </h1>
                <p className="text-gray-500 text-sm mt-2">
                  Choisissez un nouveau mot de passe sécurisé.
                </p>
              </div>

              {success ? (
                <div className="bg-green-50 border border-green-100 rounded-xl p-5 text-center">
                  <div className="text-3xl mb-2">✅</div>
                  <p className="font-semibold text-green-800 mb-1">
                    Mot de passe mis à jour !
                  </p>
                  <p className="text-sm text-green-600">
                    Redirection en cours...
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {error && (
                    <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Min. 6 caractères"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                        focus:outline-none focus:ring-2 focus:ring-[#1B7A56]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmer le mot de passe
                    </label>
                    <input
                      type="password"
                      value={passwordConfirm}
                      onChange={e => setPasswordConfirm(e.target.value)}
                      placeholder="Répétez le mot de passe"
                      onKeyDown={e => e.key === 'Enter' && changerMotDePasse()}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                        focus:outline-none focus:ring-2 focus:ring-[#1B7A56]"
                    />
                  </div>

                  {/* INDICATEUR FORCE */}
                  {password && (
                    <div>
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className={`h-1.5 flex-1 rounded-full ${
                            password.length >= i * 3
                              ? i <= 1 ? 'bg-red-400'
                              : i <= 2 ? 'bg-yellow-400'
                              : i <= 3 ? 'bg-blue-400'
                              : 'bg-green-500'
                              : 'bg-gray-200'
                          }`} />
                        ))}
                      </div>
                      <p className="text-xs text-gray-400">
                        {password.length < 6 ? '❌ Trop court' :
                         password.length < 8 ? '🟡 Faible' :
                         password.length < 10 ? '🔵 Moyen' : '🟢 Fort'}
                      </p>
                    </div>
                  )}

                  <button onClick={changerMotDePasse}
                    disabled={loading || !password.trim() || !passwordConfirm.trim()}
                    className="w-full bg-[#1B7A56] text-white font-semibold py-3 rounded-xl
                      hover:bg-[#155f42] transition-colors disabled:opacity-50">
                    {loading ? 'Mise à jour...' : '🔑 Changer le mot de passe'}
                  </button>
                </div>
              )}
            </>
          )}

          <div className="mt-6 text-center">
            <Link href="/auth/login"
              className="text-sm text-[#1B7A56] hover:underline font-medium">
              ← Retour à la connexion
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © 2026 BricoMaroc — Tous droits réservés
        </p>
      </div>
    </div>
  )
}