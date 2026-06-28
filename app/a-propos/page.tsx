import Link from 'next/link'

export default function AProposPage() {
  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-[#1B7A56]">🔧 BricoMaroc</Link>
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-800">← Accueil</Link>
      </nav>

      {/* HERO */}
      <div className="bg-gradient-to-br from-[#1B7A56] to-[#155f42] text-white px-6 py-20 text-center">
        <h1 className="text-4xl font-bold mb-4">Notre mission</h1>
        <p className="text-xl text-green-100 max-w-2xl mx-auto leading-relaxed">
          Connecter chaque Marocain avec l'artisan de confiance dont il a besoin,
          rapidement et en toute sécurité.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-16">

        {/* HISTOIRE */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Notre histoire</h2>
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <p className="text-gray-600 leading-relaxed mb-4">
              BricoMaroc est né d'un constat simple : trouver un artisan de confiance au Maroc
              est souvent une source de stress. Bouche à oreille, numéros glanés ici et là,
              devis surprises... Les particuliers méritaient mieux.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              En 2026, nous avons créé BricoMaroc avec une vision claire : construire la plateforme
              de référence pour les services à domicile au Maroc, en mettant la confiance et la
              transparence au cœur de chaque interaction.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Aujourd'hui, BricoMaroc connecte des centaines de clients avec des artisans vérifiés
              dans les principales villes du Maroc — Marrakech, Casablanca, Rabat, Fès, Tanger et bien d'autres.
            </p>
          </div>
        </section>

        {/* CHIFFRES */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">BricoMaroc en chiffres</h2>
          <div className="grid grid-cols-4 gap-4">
            {[
              { value: '500+', label: 'Artisans vérifiés', icon: '🔧' },
              { value: '2 000+', label: 'Missions réalisées', icon: '✅' },
              { value: '4.8★', label: 'Note moyenne', icon: '⭐' },
              { value: '10', label: 'Villes couvertes', icon: '📍' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl p-6 shadow-sm text-center">
                <div className="text-3xl mb-2">{s.icon}</div>
                <div className="text-3xl font-bold text-[#1B7A56] mb-1">{s.value}</div>
                <div className="text-sm text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* VALEURS */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Nos valeurs</h2>
          <div className="grid grid-cols-3 gap-5">
            {[
              {
                icon: '🛡️',
                titre: 'Confiance',
                desc: 'Chaque artisan est vérifié par notre équipe. CIN, assurance, références — nous contrôlons tout avant la publication du profil.',
              },
              {
                icon: '💎',
                titre: 'Qualité',
                desc: 'Les avis vérifiés de nos clients garantissent que seuls les meilleurs artisans restent visibles sur la plateforme.',
              },
              {
                icon: '🤝',
                titre: 'Équité',
                desc: 'Prix transparents, devis détaillés, commission claire. Pas de surprises pour les clients ni pour les artisans.',
              },
              {
                icon: '⚡',
                titre: 'Réactivité',
                desc: 'Besoin urgent ? Nos artisans disponibles en urgence 24h/24 interviennent rapidement partout au Maroc.',
              },
              {
                icon: '🌍',
                titre: 'Local',
                desc: 'BricoMaroc est 100% marocain. Nous soutenons les artisans locaux et contribuons à l\'économie nationale.',
              },
              {
                icon: '📱',
                titre: 'Simplicité',
                desc: 'En 3 minutes, votre demande est en ligne. En quelques heures, vous avez des devis. Simple, rapide, efficace.',
              },
            ].map(v => (
              <div key={v.titre} className="bg-white rounded-2xl p-5 shadow-sm">
                <div className="text-3xl mb-3">{v.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{v.titre}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ÉQUIPE */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Notre équipe</h2>
          <div className="grid grid-cols-3 gap-5">
            {[
              {
                nom: 'Samir Lima',
                role: 'Fondateur & CEO',
                ville: 'Marrakech',
                initiales: 'SL',
                desc: 'Entrepreneur passionné par le digital et l\'artisanat marocain. Fondateur de BricoMaroc.',
              },
              {
                nom: 'Équipe Tech',
                role: 'Développement & Design',
                ville: 'Maroc',
                initiales: '👨‍💻',
                desc: 'Notre équipe technique construit et améliore la plateforme chaque jour.',
              },
              {
                nom: 'Équipe Support',
                role: 'Service client',
                ville: 'Maroc',
                initiales: '🎧',
                desc: 'Disponibles 6j/7 pour vous aider et résoudre vos problèmes rapidement.',
              },
            ].map(m => (
              <div key={m.nom} className="bg-white rounded-2xl p-5 shadow-sm text-center">
                <div className="w-16 h-16 rounded-full bg-[#1B7A56] text-white text-xl
                  font-bold flex items-center justify-center mx-auto mb-3">
                  {m.initiales}
                </div>
                <h3 className="font-bold text-gray-900">{m.nom}</h3>
                <p className="text-sm text-[#1B7A56] font-medium">{m.role}</p>
                <p className="text-xs text-gray-400 mb-2">📍 {m.ville}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* TIMELINE */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Notre parcours</h2>
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="space-y-0">
              {[
                { date: 'Janvier 2026', titre: 'Idée & conception', desc: 'Naissance de l\'idée BricoMaroc à Marrakech.' },
                { date: 'Mars 2026', titre: 'Développement', desc: 'Début du développement de la plateforme avec Next.js et Supabase.' },
                { date: 'Juin 2026', titre: 'Lancement beta', desc: 'Premiers artisans vérifiés et premières demandes clients à Marrakech.' },
                { date: 'Fin 2026', titre: 'Expansion nationale', desc: 'Déploiement dans toutes les grandes villes du Maroc.' },
              ].map((step, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-[#1B7A56] text-white
                      flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {i + 1}
                    </div>
                    {i < 3 && <div className="w-0.5 h-10 bg-green-100 mt-1" />}
                  </div>
                  <div className="pb-6">
                    <p className="text-xs text-[#1B7A56] font-semibold">{step.date}</p>
                    <p className="font-bold text-gray-900 text-sm">{step.titre}</p>
                    <p className="text-sm text-gray-500">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CONTACT */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Nous contacter</h2>
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { icon: '📧', label: 'Email', value: 'contact@bricomaroc.ma', href: 'mailto:contact@bricomaroc.ma' },
                { icon: '📱', label: 'WhatsApp', value: '+212 6XX XXX XXX', href: 'https://wa.me/212600000000' },
                { icon: '🎧', label: 'Support', value: 'Centre d\'aide', href: '/support' },
              ].map(c => (
                <a key={c.label} href={c.href}
                  className="p-4 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="text-3xl mb-2">{c.icon}</div>
                  <p className="font-semibold text-gray-900 text-sm">{c.label}</p>
                  <p className="text-xs text-[#1B7A56] mt-0.5">{c.value}</p>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="bg-gradient-to-br from-[#1B7A56] to-[#155f42] rounded-2xl
          p-10 text-white text-center">
          <h2 className="text-2xl font-bold mb-2">Rejoignez BricoMaroc</h2>
          <p className="text-green-100 text-sm mb-8">
            Que vous soyez client ou artisan, BricoMaroc vous accompagne
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/artisans"
              className="bg-[#E8622A] text-white font-semibold px-6 py-3 rounded-xl
                hover:bg-[#d45520] transition-colors">
              Trouver un artisan
            </Link>
            <Link href="/auth/register?role=artisan"
              className="bg-white text-[#1B7A56] font-semibold px-6 py-3 rounded-xl
                hover:bg-green-50 transition-colors">
              Devenir artisan
            </Link>
          </div>
        </div>

      </div>

      <footer className="border-t border-gray-200 mt-8 py-8 text-center">
        <p className="text-sm text-gray-400">© 2026 BricoMaroc — Tous droits réservés</p>
        <div className="flex justify-center gap-6 mt-2">
          <Link href="/cgu" className="text-xs text-gray-400 hover:text-gray-600">CGU</Link>
          <Link href="/mentions-legales" className="text-xs text-gray-400 hover:text-gray-600">Mentions légales</Link>
        </div>
      </footer>
    </div>
  )
}