import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-lg">

        {/* ILLUSTRATION */}
        <div className="relative mb-8">
          <div className="text-8xl mb-4">🔧</div>
          <div className="absolute -top-2 -right-8 text-4xl animate-bounce">❓</div>
          <div className="absolute -bottom-2 -left-8 text-3xl animate-pulse">🪛</div>
        </div>

        {/* CODE 404 */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="h-0.5 w-16 bg-[#1B7A56]" />
          <span className="text-7xl font-extrabold text-[#1B7A56]">404</span>
          <div className="h-0.5 w-16 bg-[#1B7A56]" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Page introuvable !
        </h1>
        <p className="text-gray-500 leading-relaxed mb-8">
          On dirait que cette page est partie en mission sans prévenir. 
          Même nos meilleurs artisans ne la trouvent pas ! 
          Retournez à l'accueil pour continuer.
        </p>

        {/* ACTIONS */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
          <Link href="/"
            className="bg-[#1B7A56] text-white font-semibold px-6 py-3 rounded-xl
              hover:bg-[#155f42] transition-colors">
            🏠 Retour à l'accueil
          </Link>
          <Link href="/artisans"
            className="border border-gray-200 text-gray-600 font-semibold px-6 py-3
              rounded-xl hover:bg-gray-50 transition-colors">
            🔧 Trouver un artisan
          </Link>
          <Link href="/support"
            className="border border-gray-200 text-gray-600 font-semibold px-6 py-3
              rounded-xl hover:bg-gray-50 transition-colors">
            🎧 Contacter le support
          </Link>
        </div>

        {/* LIENS RAPIDES */}
        <div className="bg-white rounded-2xl p-5 shadow-sm text-left">
          <p className="text-sm font-semibold text-gray-700 mb-3">
            Pages populaires :
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { href: '/artisans', label: '🔧 Trouver un artisan' },
              { href: '/demandes/nouvelle', label: '📋 Poster une demande' },
              { href: '/comment-ca-marche', label: '❓ Comment ça marche' },
              { href: '/blog', label: '📚 Blog & Conseils' },
              { href: '/auth/register', label: '👤 Créer un compte' },
              { href: '/a-propos', label: 'ℹ️ À propos' },
            ].map(link => (
              <Link key={link.href} href={link.href}
                className="text-sm text-[#1B7A56] hover:underline py-1">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-6">
          BricoMaroc — La plateforme de confiance pour vos travaux au Maroc
        </p>
      </div>
    </div>
  )
}
