import Link from 'next/link'

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-[#1B7A56]">🔧 BricoMaroc</Link>
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-800">← Accueil</Link>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mentions Légales</h1>
        <p className="text-gray-500 text-sm mb-10">Dernière mise à jour : juin 2026</p>

        <div className="space-y-8 text-gray-700">

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Éditeur du site</h2>
            <div className="bg-white rounded-xl p-5 space-y-2 text-sm">
              <div className="flex gap-3"><span className="text-gray-500 w-32">Nom</span><span className="font-medium">BricoMaroc</span></div>
              <div className="flex gap-3"><span className="text-gray-500 w-32">Siège social</span><span className="font-medium">Marrakech, Maroc</span></div>
              <div className="flex gap-3"><span className="text-gray-500 w-32">Email</span><span className="font-medium">contact@bricomaroc.ma</span></div>
              <div className="flex gap-3"><span className="text-gray-500 w-32">Site web</span><span className="font-medium">bricomaroc.vercel.app</span></div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Hébergement</h2>
            <div className="bg-white rounded-xl p-5 space-y-2 text-sm">
              <div className="flex gap-3"><span className="text-gray-500 w-32">Hébergeur</span><span className="font-medium">Vercel Inc.</span></div>
              <div className="flex gap-3"><span className="text-gray-500 w-32">Adresse</span><span className="font-medium">340 Pine Street, San Francisco, CA 94104, USA</span></div>
              <div className="flex gap-3"><span className="text-gray-500 w-32">Site web</span><span className="font-medium">vercel.com</span></div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Base de données</h2>
            <div className="bg-white rounded-xl p-5 space-y-2 text-sm">
              <div className="flex gap-3"><span className="text-gray-500 w-32">Fournisseur</span><span className="font-medium">Supabase Inc.</span></div>
              <div className="flex gap-3"><span className="text-gray-500 w-32">Site web</span><span className="font-medium">supabase.com</span></div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Propriété intellectuelle</h2>
            <p className="leading-relaxed">
              L'ensemble du contenu de ce site (textes, images, logos, icônes) est la propriété
              exclusive de BricoMaroc et est protégé par les lois marocaines et internationales
              sur la propriété intellectuelle. Toute reproduction, même partielle, est interdite
              sans autorisation écrite préalable.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Cookies</h2>
            <p className="leading-relaxed">
              BricoMaroc utilise des cookies techniques nécessaires au fonctionnement de la
              plateforme (authentification, préférences). Aucun cookie publicitaire n'est utilisé.
              En utilisant notre service, vous acceptez l'utilisation de ces cookies essentiels.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Loi applicable</h2>
            <p className="leading-relaxed">
              Les présentes mentions légales sont soumises au droit marocain. En cas de litige,
              les tribunaux de Marrakech seront seuls compétents.
            </p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-wrap gap-4">
          <Link href="/"
            className="bg-[#1B7A56] text-white font-semibold px-6 py-3 rounded-xl
              hover:bg-[#155f42] transition-colors">
            Retour à l'accueil
          </Link>
          <Link href="/cgu"
            className="border border-gray-200 text-gray-600 font-semibold px-6 py-3 rounded-xl
              hover:bg-gray-50 transition-colors">
            CGU →
          </Link>
        </div>
      </div>

      <footer className="border-t border-gray-200 mt-8 py-8 text-center">
        <p className="text-sm text-gray-400">© 2026 BricoMaroc — Tous droits réservés</p>
      </footer>
    </div>
  )
}