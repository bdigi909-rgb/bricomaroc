import Link from 'next/link'

const ARTICLES = [
  {
    id: 'fuite-eau-urgence',
    titre: 'Que faire en cas de fuite d\'eau urgente ?',
    categorie: '🔧 Plomberie',
    date: '20 juin 2026',
    duree: '3 min',
    image: '💧',
    resume: 'Une fuite d\'eau peut causer des dégâts importants en quelques minutes. Voici les gestes à faire immédiatement avant l\'arrivée du plombier.',
    tags: ['urgence', 'plomberie', 'dégâts des eaux'],
  },
  {
    id: 'choisir-peinture-interieur',
    titre: 'Comment choisir la bonne peinture pour votre intérieur ?',
    categorie: '🎨 Peinture',
    date: '18 juin 2026',
    duree: '5 min',
    image: '🎨',
    resume: 'Mat, satiné, brillant... Le choix de la finition de votre peinture dépend de la pièce et de l\'usage. On vous explique tout.',
    tags: ['peinture', 'décoration', 'intérieur'],
  },
  {
    id: 'economiser-electricite',
    titre: '10 conseils pour réduire votre facture d\'électricité',
    categorie: '⚡ Électricité',
    date: '15 juin 2026',
    duree: '6 min',
    image: '⚡',
    resume: 'Des gestes simples et des installations adaptées peuvent réduire votre consommation électrique de 30%. Découvrez nos conseils.',
    tags: ['électricité', 'économie', 'énergie'],
  },
  {
    id: 'entretien-climatisation',
    titre: 'Entretien de la climatisation : quand et comment ?',
    categorie: '❄️ Climatisation',
    date: '12 juin 2026',
    duree: '4 min',
    image: '❄️',
    resume: 'Un entretien régulier de votre climatisation prolonge sa durée de vie et réduit votre consommation. Voici ce qu\'il faut savoir.',
    tags: ['climatisation', 'entretien', 'été'],
  },
  {
    id: 'poser-carrelage',
    titre: 'Poser du carrelage : guide étape par étape',
    categorie: '🪟 Carrelage',
    date: '10 juin 2026',
    duree: '8 min',
    image: '🪟',
    resume: 'La pose de carrelage demande préparation et précision. Suivez notre guide pour obtenir un résultat professionnel.',
    tags: ['carrelage', 'bricolage', 'sol'],
  },
  {
    id: 'jardinage-maroc',
    titre: 'Le jardinage au Maroc : plantes adaptées au climat',
    categorie: '🌿 Jardinage',
    date: '8 juin 2026',
    duree: '5 min',
    image: '🌿',
    resume: 'Quelles plantes choisir pour un jardin qui résiste à la chaleur marocaine ? Nos experts partagent leurs conseils.',
    tags: ['jardinage', 'plantes', 'maroc'],
  },
  {
    id: 'choisir-artisan',
    titre: 'Comment choisir un bon artisan ? Les critères essentiels',
    categorie: '🔧 Conseils',
    date: '5 juin 2026',
    duree: '4 min',
    image: '⭐',
    resume: 'Devis, références, assurance... Avant de confier vos travaux, voici les questions à poser et les points à vérifier.',
    tags: ['artisan', 'conseils', 'travaux'],
  },
  {
    id: 'budget-renovation',
    titre: 'Comment estimer le budget de votre rénovation ?',
    categorie: '💰 Budget',
    date: '2 juin 2026',
    duree: '6 min',
    image: '💰',
    resume: 'Évitez les mauvaises surprises en apprenant à estimer correctement le coût de vos travaux de rénovation au Maroc.',
    tags: ['budget', 'rénovation', 'devis'],
  },
]

export default function BlogPage() {
  const articleFeatured = ARTICLES[0]
  const articlesSecondaires = ARTICLES.slice(1)

  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-[#1B7A56]">🔧 BricoMaroc</Link>
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-800">← Accueil</Link>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📚 Blog & Conseils</h1>
          <p className="text-gray-500">Guides pratiques et conseils d'experts pour vos travaux</p>
        </div>

        {/* ARTICLE FEATURED */}
        <Link href={`/blog/${articleFeatured.id}`}
          className="block bg-white rounded-2xl shadow-sm overflow-hidden mb-8
            hover:shadow-md transition-shadow border border-gray-100">
          <div className="bg-gradient-to-br from-[#1B7A56] to-[#155f42] p-10 text-center">
            <span className="text-6xl">{articleFeatured.image}</span>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                {articleFeatured.categorie}
              </span>
              <span className="text-xs text-gray-400">⭐ À la une</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{articleFeatured.titre}</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">{articleFeatured.resume}</p>
            <div className="flex items-center justify-between">
              <div className="flex gap-3 text-xs text-gray-400">
                <span>📅 {articleFeatured.date}</span>
                <span>⏱ {articleFeatured.duree} de lecture</span>
              </div>
              <span className="text-sm font-semibold text-[#1B7A56]">Lire →</span>
            </div>
          </div>
        </Link>

        {/* GRILLE ARTICLES */}
        <div className="grid grid-cols-2 gap-5">
          {articlesSecondaires.map(article => (
            <Link key={article.id} href={`/blog/${article.id}`}
              className="bg-white rounded-2xl shadow-sm overflow-hidden
                hover:shadow-md transition-shadow border border-gray-100">
              <div className="bg-gray-50 p-6 text-center text-4xl">
                {article.image}
              </div>
              <div className="p-4">
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {article.categorie}
                </span>
                <h3 className="font-bold text-gray-900 text-sm mt-2 mb-1 line-clamp-2">
                  {article.titre}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-2 mb-3">{article.resume}</p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>⏱ {article.duree}</span>
                  <span className="text-[#1B7A56] font-medium">Lire →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* TAGS */}
        <div className="mt-10 bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">🏷️ Thèmes populaires</h2>
          <div className="flex flex-wrap gap-2">
            {['plomberie', 'électricité', 'peinture', 'carrelage', 'urgence',
              'budget', 'rénovation', 'jardinage', 'artisan', 'conseils',
              'entretien', 'énergie'].map(tag => (
              <span key={tag}
                className="text-sm bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full
                  hover:bg-[#1B7A56] hover:text-white transition-colors cursor-pointer">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 bg-gradient-to-br from-[#1B7A56] to-[#155f42] rounded-2xl
          p-8 text-white text-center">
          <h2 className="text-xl font-bold mb-2">Besoin d'un artisan ?</h2>
          <p className="text-green-100 text-sm mb-6">
            Postez votre demande gratuitement et recevez des devis sous 24h
          </p>
          <Link href="/demandes/nouvelle"
            className="bg-[#E8622A] text-white font-semibold px-8 py-3 rounded-xl
              hover:bg-[#d45520] transition-colors inline-block">
            Poster une demande →
          </Link>
        </div>
      </div>

      <footer className="border-t border-gray-200 mt-8 py-8 text-center">
        <p className="text-sm text-gray-400">© 2026 BricoMaroc — Tous droits réservés</p>
      </footer>
    </div>
  )
}