import Link from 'next/link'

export default function CGUPage() {
  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-[#1B7A56]">🔧 BricoMaroc</Link>
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-800">← Accueil</Link>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Conditions Générales d'Utilisation
        </h1>
        <p className="text-gray-500 text-sm mb-10">Dernière mise à jour : juin 2026</p>

        <div className="space-y-8 text-gray-700">

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Présentation de BricoMaroc</h2>
            <p className="leading-relaxed">
              BricoMaroc est une plateforme de mise en relation entre des particuliers (clients)
              et des professionnels du bâtiment et des services à domicile (artisans) au Maroc.
              La plateforme est accessible sur <strong>bricomaroc.vercel.app</strong> et
              exploitée par BricoMaroc, dont le siège social est au Maroc.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Acceptation des CGU</h2>
            <p className="leading-relaxed">
              L'utilisation de la plateforme BricoMaroc implique l'acceptation pleine et entière
              des présentes Conditions Générales d'Utilisation. Si vous n'acceptez pas ces
              conditions, veuillez ne pas utiliser notre service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Inscription et compte utilisateur</h2>
            <p className="leading-relaxed mb-3">
              Pour utiliser BricoMaroc, vous devez créer un compte en fournissant des informations
              exactes et complètes. Vous êtes responsable de la confidentialité de votre mot de passe
              et de toutes les activités réalisées depuis votre compte.
            </p>
            <p className="leading-relaxed">
              BricoMaroc se réserve le droit de suspendre ou supprimer tout compte en cas de
              violation des présentes CGU, de fausse déclaration ou de comportement frauduleux.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Rôle de BricoMaroc</h2>
            <p className="leading-relaxed">
              BricoMaroc agit uniquement en tant qu'intermédiaire entre les clients et les artisans.
              La plateforme ne garantit pas la qualité des prestations réalisées par les artisans et
              n'est pas partie aux contrats conclus entre les clients et les artisans. BricoMaroc
              vérifie l'identité des artisans inscrits mais ne peut garantir leurs compétences
              professionnelles.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Obligations des artisans</h2>
            <p className="leading-relaxed mb-3">Les artisans inscrits sur BricoMaroc s'engagent à :</p>
            <ul className="list-none space-y-2">
              {[
                'Fournir des informations exactes sur leurs compétences et expériences',
                'Respecter les devis fournis aux clients',
                'Réaliser les travaux dans les règles de l\'art',
                'Être titulaires de toutes les assurances professionnelles requises',
                'Ne pas solliciter les clients en dehors de la plateforme pour éviter les commissions',
                'Respecter la confidentialité des données personnelles des clients',
              ].map(item => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-[#1B7A56] font-bold mt-0.5">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Obligations des clients</h2>
            <p className="leading-relaxed mb-3">Les clients inscrits sur BricoMaroc s'engagent à :</p>
            <ul className="list-none space-y-2">
              {[
                'Décrire avec précision leurs besoins dans les demandes',
                'Honorer les rendez-vous convenus avec les artisans',
                'Payer les prestations selon les devis acceptés',
                'Laisser des avis honnêtes et objectifs',
                'Ne pas publier de demandes frauduleuses ou abusives',
              ].map(item => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-[#1B7A56] font-bold mt-0.5">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Commissions et paiements</h2>
            <p className="leading-relaxed mb-3">
              BricoMaroc prélève une commission sur chaque transaction réalisée via la plateforme :
            </p>
            <div className="bg-white rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Plan Gratuit</span>
                <span className="font-semibold">10% de commission</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Plan Pro (199 MAD/mois)</span>
                <span className="font-semibold">8% de commission</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Plan Élite (399 MAD/mois)</span>
                <span className="font-semibold">5% de commission</span>
              </div>
            </div>
            <p className="leading-relaxed mt-3">
              Les paiements sont sécurisés via Stripe. BricoMaroc ne stocke aucune donnée
              bancaire sur ses serveurs.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Avis et notation</h2>
            <p className="leading-relaxed">
              Les avis publiés sur BricoMaroc sont vérifiés — seuls les clients ayant réellement
              effectué une mission peuvent laisser un avis. BricoMaroc se réserve le droit de
              supprimer tout avis diffamatoire, offensant ou manifestement faux.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">9. Protection des données personnelles</h2>
            <p className="leading-relaxed">
              BricoMaroc collecte et traite des données personnelles conformément à la loi 09-08
              relative à la protection des personnes physiques à l'égard du traitement des données
              à caractère personnel au Maroc. Vos données sont utilisées uniquement pour le
              fonctionnement de la plateforme et ne sont pas vendues à des tiers.
              Vous disposez d'un droit d'accès, de rectification et de suppression de vos données.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">10. Responsabilité</h2>
            <p className="leading-relaxed">
              BricoMaroc ne peut être tenu responsable des dommages directs ou indirects résultant
              de l'utilisation de la plateforme, des prestations réalisées par les artisans, ou
              de l'interruption temporaire du service. La responsabilité de BricoMaroc est limitée
              au montant des commissions perçues sur la transaction concernée.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">11. Résolution des litiges</h2>
            <p className="leading-relaxed">
              En cas de litige entre un client et un artisan, BricoMaroc propose un service de
              médiation. Les parties s'engagent à tenter de résoudre le litige à l'amiable avant
              tout recours judiciaire. En cas d'échec, les tribunaux compétents de Marrakech
              seront seuls compétents.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">12. Modification des CGU</h2>
            <p className="leading-relaxed">
              BricoMaroc se réserve le droit de modifier les présentes CGU à tout moment.
              Les utilisateurs seront informés par email de toute modification importante.
              La poursuite de l'utilisation de la plateforme après notification vaut acceptation
              des nouvelles CGU.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">13. Contact</h2>
            <p className="leading-relaxed">
              Pour toute question relative aux présentes CGU, contactez-nous à :
              <a href="mailto:contact@bricomaroc.ma"
                className="text-[#1B7A56] font-medium hover:underline ml-1">
                contact@bricomaroc.ma
              </a>
            </p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-wrap gap-4">
          <Link href="/"
            className="bg-[#1B7A56] text-white font-semibold px-6 py-3 rounded-xl
              hover:bg-[#155f42] transition-colors">
            Retour à l'accueil
          </Link>
          <Link href="/mentions-legales"
            className="border border-gray-200 text-gray-600 font-semibold px-6 py-3 rounded-xl
              hover:bg-gray-50 transition-colors">
            Mentions légales →
          </Link>
        </div>
      </div>

      <footer className="border-t border-gray-200 mt-8 py-8 text-center">
        <p className="text-sm text-gray-400">© 2026 BricoMaroc — Tous droits réservés</p>
      </footer>
    </div>
  )
}