'use client'
import { useState } from 'react'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [nom, setNom] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function sInscrire() {
    if (!email || !email.includes('@')) {
      setError('Veuillez entrer un email valide')
      return
    }

    setLoading(true)
    setError('')

    const res = await fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, nom, type: 'client' }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Une erreur est survenue')
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="bg-gradient-to-br from-[#1B7A56] to-[#0f4a33] rounded-2xl p-8 text-center text-white">
        <div className="text-4xl mb-3">🎉</div>
        <h3 className="text-xl font-bold mb-2">Inscription confirmee !</h3>
        <p className="text-green-200 text-sm">
          Merci {nom || ''}! Vous recevrez nos actualites et conseils directement dans votre boite mail.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-[#1B7A56] to-[#0f4a33] rounded-2xl p-8 text-white">
      <div className="text-center mb-6">
        <div className="text-3xl mb-2">📧</div>
        <h3 className="text-xl font-bold mb-1">Restez informé</h3>
        <p className="text-green-200 text-sm">
          Recevez nos conseils, offres et nouveautes directement dans votre boite mail
        </p>
      </div>

      <div className="space-y-3 max-w-md mx-auto">
        <input
          type="text"
          value={nom}
          onChange={e => setNom(e.target.value)}
          placeholder="Votre prenom (optionnel)"
          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm
            text-white placeholder:text-green-300 focus:outline-none focus:border-white/50"
        />
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sInscrire()}
            placeholder="votre@email.com"
            className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm
              text-white placeholder:text-green-300 focus:outline-none focus:border-white/50"
          />
          <button onClick={sInscrire} disabled={loading}
            className="bg-white text-[#1B7A56] font-semibold px-5 py-3 rounded-xl
              hover:bg-green-50 transition-colors disabled:opacity-50 whitespace-nowrap">
            {loading ? '...' : "S'inscrire"}
          </button>
        </div>

        {error && (
          <p className="text-red-300 text-xs text-center">{error}</p>
        )}

        <p className="text-green-300 text-xs text-center">
          Pas de spam. Desinscription en 1 clic.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/20">
        {[
          { icon: '💡', label: 'Conseils travaux' },
          { icon: '🎁', label: 'Offres exclusives' },
          { icon: '🔧', label: 'Nouveaux artisans' },
        ].map(item => (
          <div key={item.label} className="text-center">
            <div className="text-2xl mb-1">{item.icon}</div>
            <p className="text-xs text-green-200">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}