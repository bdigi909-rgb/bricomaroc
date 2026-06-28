import Link from 'next/link'
import { notFound } from 'next/navigation'

const ARTICLES: Record<string, any> = {
  'fuite-eau-urgence': {
    titre: 'Que faire en cas de fuite d\'eau urgente ?',
    categorie: '🔧 Plomberie',
    date: '20 juin 2026',
    duree: '3 min',
    image: '💧',
    contenu: [
      {
        type: 'intro',
        texte: 'Une fuite d\'eau peut causer des dégâts considérables en très peu de temps. Eau sur le parquet, plafond qui s\'effondre, moisissures... Voici les bons réflexes à adopter immédiatement.'
      },
      {
        type: 'h2',
        texte: '1. Coupez l\'eau immédiatement'
      },
      {
        type: 'p',
        texte: 'Le premier geste est de couper l\'arrivée d\'eau. Le robinet d\'arrêt général se trouve généralement sous l\'évier de la cuisine, dans la cave ou près du compteur d\'eau. Tournez-le dans le sens des aiguilles d\'une montre pour fermer.'
      },
      {
        type: 'conseil',
        texte: '💡 Conseil : Repérez dès maintenant votre robinet d\'arrêt général pour agir vite en cas d\'urgence.'
      },
      {
        type: 'h2',
        texte: '2. Coupez l\'électricité si nécessaire'
      },
      {
        type: 'p',
        texte: 'Si l\'eau touche des prises électriques ou des équipements, coupez le disjoncteur général. L\'eau et l\'électricité ne font pas bon ménage — c\'est une question de sécurité absolue.'
      },
      {
        type: 'h2',
        texte: '3. Évaluez les dégâts'
      },
      {
        type: 'p',
        texte: 'Identifiez la source de la fuite : robinet, joint, tuyau, radiateur... Prenez des photos pour votre assurance. Si la fuite vient d\'un appartement voisin, informez immédiatement le syndic ou votre voisin.'
      },
      {
        type: 'h2',
        texte: '4. Appelez un plombier d\'urgence'
      },
      {
        type: 'p',
        texte: 'Pour les fuites importantes, n\'attendez pas. Sur BricoMaroc, vous pouvez trouver des plombiers disponibles en urgence 24h/24 à Marrakech et dans les principales villes du Maroc.'
      },
      {
        type: 'conseil',
        texte: '⚠️ Attention : Évitez de réparer vous-même si vous n\'êtes pas qualifié. Une mauvaise réparation peut aggraver les dégâts.'
      },
      {
        type: 'h2',
        texte: '5. Déclarez le sinistre à votre assurance'
      },
      {
        type: 'p',
        texte: 'Si les dégâts sont importants, contactez votre assurance dans les 5 jours ouvrables. Conservez toutes les factures de réparation.'
      },
    ],
    articlesSimilaires: ['economiser-electricite', 'entretien-climatisation'],
  },
  'choisir-artisan': {
    titre: 'Comment choisir un bon artisan ? Les critères essentiels',
    categorie: '🔧 Conseils',
    date: '5 juin 2026',
    duree: '4 min',
    image: '⭐',
    contenu: [
      {
        type: 'intro',
        texte: 'Confier ses travaux à un artisan est une décision importante. Pour éviter les mauvaises surprises, voici les critères essentiels à vérifier avant de signer.'
      },
      {
        type: 'h2',
        texte: '1. Vérifiez les avis et la réputation'
      },
      {
        type: 'p',
        texte: 'Consultez les avis laissés par d\'autres clients. Sur BricoMaroc, tous les avis sont vérifiés — seuls les clients ayant réellement effectué une mission peuvent en laisser un. Méfiez-vous des profils sans avis ou avec uniquement des avis 5 étoiles.'
      },
      {
        type: 'h2',
        texte: '2. Demandez plusieurs devis'
      },
      {
        type: 'p',
        texte: 'Ne signez jamais avec le premier artisan venu. Demandez minimum 3 devis pour comparer les prix et les prestations. Un devis trop bas peut cacher des prestations incomplètes.'
      },
      {
        type: 'conseil',
        texte: '💡 Sur BricoMaroc, le devis est toujours gratuit et sans engagement.'
      },
      {
        type: 'h2',
        texte: '3. Vérifiez son expérience'
      },
      {
        type: 'p',
        texte: 'Demandez des références de chantiers similaires. Un artisan sérieux sera toujours prêt à vous montrer ses réalisations précédentes. Sur BricoMaroc, chaque profil affiche le nombre de missions réalisées.'
      },
      {
        type: 'h2',
        texte: '4. Exigez un devis écrit détaillé'
      },
      {
        type: 'p',
        texte: 'Un bon devis doit détailler : les matériaux utilisés, la main d\'œuvre, les délais d\'intervention et les conditions de paiement. Méfiez-vous des devis trop vagues.'
      },
    ],
    articlesSimilaires: ['budget-renovation', 'fuite-eau-urgence'],
  },
}

// Articles par défaut pour les IDs non trouvés
function getArticle(id: string) {
  return ARTICLES[id] ?? null
}

export default function ArticlePage({ params }: { params: { id: string } }) {
  const article = getArticle(params.id)
  if (!article) notFound()

  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-[#1B7A56]">🔧 BricoMaroc</Link>
        <Link href="/blog" className="text-sm text-gray-500 hover:text-gray-800">← Blog</Link>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* HEADER */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">{article.image}</div>
          <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
            {article.categorie}
          </span>
          <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-2">{article.titre}</h1>
          <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
            <span>📅 {article.date}</span>
            <span>⏱ {article.duree} de lecture</span>
          </div>
        </div>

        {/* CONTENU */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 space-y-4">
          {article.contenu.map((bloc: any, i: number) => {
            if (bloc.type === 'intro') return (
              <p key={i} className="text-gray-600 leading-relaxed text-base font-medium
                border-l-4 border-[#1B7A56] pl-4">
                {bloc.texte}
              </p>
            )
            if (bloc.type === 'h2') return (
              <h2 key={i} className="text-lg font-bold text-gray-900 mt-6">{bloc.texte}</h2>
            )
            if (bloc.type === 'p') return (
              <p key={i} className="text-gray-600 leading-relaxed">{bloc.texte}</p>
            )
            if (bloc.type === 'conseil') return (
              <div key={i} className="bg-green-50 border border-green-100 rounded-xl p-4 text-sm text-gray-700">
                {bloc.texte}
              </div>
            )
            return null
          })}
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-br from-[#1B7A56] to-[#155f42] rounded-2xl
          p-6 text-white text-center mb-6">
          <h2 className="font-bold text-lg mb-2">Besoin d'un artisan qualifié ?</h2>
          <p className="text-green-100 text-sm mb-4">
            Trouvez un professionnel vérifié près de chez vous
          </p>
          <Link href="/demandes/nouvelle"
            className="bg-[#E8622A] text-white font-semibold px-6 py-2.5 rounded-xl
              hover:bg-[#d45520] transition-colors inline-block text-sm">
            Poster une demande gratuite →
          </Link>
        </div>

        {/* RETOUR */}
        <div className="text-center">
          <Link href="/blog"
            className="text-sm text-[#1B7A56] font-medium hover:underline">
            ← Voir tous les articles
          </Link>
        </div>
      </div>
    </div>
  )
}