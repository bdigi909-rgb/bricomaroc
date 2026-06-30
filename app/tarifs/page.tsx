import Link from 'next/link'

export default function TarifsPage() {
  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-[#1B7A56]">🔧 BricoMaroc</Link>
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-800">← Accueil</Link>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Tarifs & Plans
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Choisissez le plan adapté à votre activité. Commencez gratuitement,
            évoluez selon vos besoins.
          </p>
        </div>

        {/* PLANS */}
        <div className="grid grid-cols-3 gap-6 mb-12">
          {[
            {
              nom: 'Gratuit',
              prix: '0',
              periode: 'pour toujours',
              couleur: 'bg-white',
              btnCouleur: 'border border-[#1B7A56] text-[#1B7A56] hover:bg-green-50',
              badge: null,
              commission: '10%',
              features: [
                '✓ Profil artisan complet',
                '✓ Réception des demandes',
                '✓ Messagerie clients',
                '✓ Système d\'avis',
                '✓ Badge vérifié',
                '✓ 10% de commission',
                '✗ Mise en avant profil',
                '✗ Statistiques avancées',
                '✗ Support prioritaire',
              ],
            },
            {
              nom: 'Pro',
              prix: '199',
              periode: 'MAD / mois',
              couleur: 'bg-white border-2 border-[#1B7A56]',
              btnCouleur: 'bg-[#1B7A56] text-white hover:bg-[#155f42]',
              badge: '⭐ Populaire',
              commission: '8%',
              features: [
                '✓ Tout du plan Gratuit',
                '✓ Commission réduite 8%',
                '✓ Profil mis en avant',
                '✓ Badge Pro visible',
                '✓ Statistiques de visites',
                '✓ Support prioritaire 48h',
                '✓ Devis illimités',
                '✓ Apparition en premier',
                '✗ Support dédié 24h',
              ],
            },
            {
              nom: 'Elite',
              prix: '399',
              periode: 'MAD / mois',
              couleur: 'bg-gradient-to-br from-yellow-400 to-yellow-500',
              btnCouleur: 'bg-gray-900 text-white hover:bg-gray-800',
              badge: '👑 Premium',
              commission: '5%',
              features: [
                '✓ Tout du plan Pro',
                '✓ Commission réduite 5%',
                '✓ Badge Elite exclusif',
                '✓ Position #1 dans recherche',
                '✓ Support dédié 24h/24',
                '✓ Manager de compte',
                '✓ Statistiques premium',
                '✓ Accès beta fonctionnalités',
                '✓ Facturation mensuelle',
              ],
            },
          ].map(plan => (
            <div key={plan.nom}
              className={`${plan.couleur} rounded-2xl p-6 shadow-sm relative`}>
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-[#1B7A56] text-white text-xs font-bold
                    px-3 py-1 rounded-full whitespace-nowrap">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h2 className={`text-xl font-bold mb-2 ${
                  plan.nom === 'Elite' ? 'text-gray-900' : 'text-gray-900'
                }`}>
                  {plan.nom}
                </h2>
                <div className="flex items-end justify-center gap-1">
                  <span className={`text-4xl font-bold ${
                    plan.nom === 'Elite' ? 'text-gray-900' : 'text-gray-900'
                  }`}>
                    {plan.prix}
                  </span>
                  {plan.prix !== '0' && (
                    <span className={`text-sm mb-1 ${
                      plan.nom === 'Elite' ? 'text-gray-700' : 'text-gray-500'
                    }`}>
                      {plan.periode}
                    </span>
                  )}
                  {plan.prix === '0' && (
                    <span className="text-sm mb-1 text-gray-500">MAD</span>
                  )}
                </div>
                <div className={`mt-2 text-sm font-semibold px-3 py-1 rounded-full inline-block ${
                  plan.nom === 'Elite'
                    ? 'bg-gray-900/10 text-gray-900'
                    : 'bg-green-100 text-[#1B7A56]'
                }`}>
                  Commission {plan.commission}
                </div>
              </div>

              <ul className="space-y-2 mb-6">
                {plan.features.map(f => (
                  <li key={f} className={`text-sm flex items-start gap-2 ${
                    f.startsWith('✗')
                      ? plan.nom === 'Elite' ? 'text-gray-500' : 'text-gray-400'
                      : plan.nom === 'Elite' ? 'text-gray-800' : 'text-gray-700'
                  }`}>
                    {f}
                  </li>
                ))}
              </ul>

              <Link href="/auth/register?role=artisan"
                className={`block text-center font-semibold py-3 rounded-xl
                  transition-colors ${plan.btnCouleur}`}>
                {plan.prix === '0' ? 'Commencer gratuitement' : `Passer au plan ${plan.nom}`}
              </Link>
            </div>
          ))}
        </div>

        {/* COMPARAISON DÉTAILLÉE */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-12">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Comparaison détaillée</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3 font-semibold text-gray-600 w-1/2">Fonctionnalité</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">Gratuit</th>
                <th className="text-center px-4 py-3 font-semibold text-[#1B7A56]">Pro</th>
                <th className="text-center px-4 py-3 font-semibold text-yellow-600">Elite</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[
                { feature: 'Profil artisan', free: '✅', pro: '✅', elite: '✅' },
                { feature: 'Réception demandes', free: '✅', pro: '✅', elite: '✅' },
                { feature: 'Messagerie clients', free: '✅', pro: '✅', elite: '✅' },
                { feature: 'Commission', free: '10%', pro: '8%', elite: '5%' },
                { feature: 'Badge vérifié', free: '✅', pro: '✅', elite: '✅' },
                { feature: 'Badge Pro/Elite', free: '❌', pro: '⭐ Pro', elite: '👑 Elite' },
                { feature: 'Mise en avant', free: '❌', pro: '✅', elite: '✅ Top' },
                { feature: 'Statistiques', free: '❌', pro: '✅', elite: '✅ Premium' },
                { feature: 'Support', free: 'Standard', pro: 'Prioritaire', elite: '24h/24' },
                { feature: 'Manager de compte', free: '❌', pro: '❌', elite: '✅' },
              ].map(row => (
                <tr key={row.feature} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-gray-700">{row.feature}</td>
                  <td className="px-4 py-3 text-center text-gray-500">{row.free}</td>
                  <td className="px-4 py-3 text-center text-[#1B7A56] font-medium">{row.pro}</td>
                  <td className="px-4 py-3 text-center text-yellow-600 font-medium">{row.elite}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-12">
          <h2 className="font-bold text-gray-900 mb-4">Questions fréquentes</h2>
          <div className="space-y-3">
            {[
              { q: 'Puis-je changer de plan à tout moment ?', r: 'Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. Le changement prend effet immédiatement.' },
              { q: 'La commission est-elle prélevée sur chaque mission ?', r: 'Oui, la commission est prélevée sur chaque paiement effectué via BricoMaroc. Les paiements directs hors plateforme sont interdits.' },
              { q: 'Y a-t-il un engagement minimum ?', r: 'Non, les plans sont sans engagement. Vous pouvez annuler à tout moment sans frais.' },
              { q: 'Comment fonctionne la mise en avant ?', r: 'Les artisans Pro et Elite apparaissent en premier dans les résultats de recherche et reçoivent plus de demandes.' },
              { q: 'Le plan Gratuit est-il vraiment gratuit ?', r: 'Oui, totalement gratuit. Vous payez uniquement une commission de 10% sur les missions réalisées via la plateforme.' },
            ].map((faq, i) => (
              <details key={i} className="group border border-gray-100 rounded-xl">
                <summary className="flex items-center justify-between px-4 py-3 cursor-pointer
                  font-medium text-gray-900 hover:text-[#1B7A56]">
                  {faq.q}
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="px-4 pb-3 text-sm text-gray-500">{faq.r}</p>
              </details>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-br from-[#1B7A56] to-[#155f42] rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-2">Prêt à développer votre activité ?</h2>
          <p className="text-green-100 mb-6">
            Rejoignez des centaines d'artisans qui font confiance à BricoMaroc
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/auth/register?role=artisan"
              className="bg-white text-[#1B7A56] font-semibold px-6 py-3 rounded-xl
                hover:bg-green-50 transition-colors">
              Commencer gratuitement
            </Link>
            <Link href="/premium"
              className="bg-[#E8622A] text-white font-semibold px-6 py-3 rounded-xl
                hover:bg-[#d45520] transition-colors">
              Voir les plans Premium
            </Link>
          </div>
        </div>
      </div>

      <footer className="border-t border-gray-200 mt-8 py-8 text-center">
        <p className="text-sm text-gray-400">© 2026 BricoMaroc — Tous droits réservés</p>
      </footer>
    </div>
  )
}
