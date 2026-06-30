import Link from 'next/link'

export default function CommentCaMarchePage() {
  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      {/* NAVBAR */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-[#1B7A56]">🔧 BricoMaroc</Link>
        <div className="flex items-center gap-4">
          <Link href="/artisans" className="text-sm text-gray-600 hover:text-gray-900">Trouver un artisan</Link>
          <Link href="/auth/register?role=artisan" className="text-sm text-gray-600 hover:text-gray-900">Devenir artisan</Link>
          <Link href="/auth/login" className="text-sm font-semibold text-[#1B7A56] hover:underline">Connexion</Link>
        </div>
      </nav>

      {/* HERO */}
      <div className="bg-gradient-to-br from-[#1B7A56] to-[#155f42] text-white px-6 py-16 text-center">
        <h1 className="text-4xl font-bold mb-4">Comment ça marche ?</h1>
        <p className="text-lg text-green-100 max-w-xl mx-auto">
          Trouvez un artisan de confiance en quelques minutes, ou développez votre activité partout au Maroc.
        </p>
        <div className="flex justify-center gap-12 mt-10">
          {[
            { num: '4+', label: 'Artisans vérifiés' },
            { num: '4.8★', label: 'Note moyenne' },
            { num: '100%', label: 'Sécurisé' },
          ].map(s => (
            <div key={s.label}>
              <div className="text-3xl font-bold">{s.num}</div>
              <div className="text-green-200 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-16">

        {/* POUR LES CLIENTS */}
        <section>
          <div className="text-center mb-10">
            <span className="bg-green-100 text-[#1B7A56] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
              Pour les clients
            </span>
            <h2 className="text-2xl font-bold text-gray-900 mt-3">Trouvez votre artisan en 4 étapes</h2>
          </div>

          <div className="space-y-4">
            {[
              {
                num: '1',
                title: 'Publiez votre demande',
                desc: 'Décrivez vos travaux, ajoutez des photos et précisez votre budget. Cela prend moins de 2 minutes.',
                color: 'bg-[#1B7A56]',
              },
              {
                num: '2',
                title: 'Recevez des propositions',
                desc: 'Les artisans disponibles dans votre zone et qualifiés pour le métier vous contactent directement.',
                color: 'bg-[#1B7A56]',
              },
              {
                num: '3',
                title: 'Choisissez en confiance',
                desc: 'Comparez les profils, les avis vérifiés et les tarifs. Vous décidez librement, sans pression.',
                color: 'bg-[#1B7A56]',
              },
              {
                num: '4',
                title: "Notez l'intervention",
                desc: 'Une fois les travaux terminés, votre avis aide la communauté à identifier les meilleurs artisans.',
                color: 'bg-[#1B7A56]',
              },
            ].map((step, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-sm flex items-start gap-5">
                <div className={`${step.color} text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0`}>
                  {step.num}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-orange-50 rounded-2xl p-5 border border-orange-100">
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-[#E8622A]">💡 Bon à savoir —</span>{' '}
              Le devis est toujours gratuit et sans engagement. Vous payez uniquement lorsque vous acceptez l'intervention.
            </p>
          </div>

          <div className="mt-6 text-center">
            <Link href="/demandes/nouvelle"
              className="inline-block bg-[#1B7A56] text-white font-semibold px-8 py-3 rounded-xl hover:bg-[#155f42] transition-colors">
              Poster une demande →
            </Link>
          </div>
        </section>

        {/* DIVIDER */}
        <div className="border-t border-gray-200" />

        {/* POUR LES ARTISANS */}
        <section>
          <div className="text-center mb-10">
            <span className="bg-orange-100 text-[#E8622A] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
              Pour les artisans
            </span>
            <h2 className="text-2xl font-bold text-gray-900 mt-3">Développez votre activité au Maroc</h2>
          </div>

          <div className="space-y-4">
            {[
              {
                num: '1',
                title: 'Créez votre profil',
                desc: "Inscrivez-vous gratuitement, présentez vos compétences et votre zone d'intervention.",
                color: 'bg-[#E8622A]',
              },
              {
                num: '2',
                title: 'Vérifiez votre identité',
                desc: 'Téléversez votre CIN pour obtenir le badge "Vérifié" qui rassure les clients.',
                color: 'bg-[#E8622A]',
              },
              {
                num: '3',
                title: 'Recevez des demandes',
                desc: 'Consultez les demandes correspondant à vos métiers, en temps réel sur votre tableau de bord.',
                color: 'bg-[#E8622A]',
              },
              {
                num: '4',
                title: 'Développez votre réputation',
                desc: 'Chaque mission terminée et chaque avis positif renforcent votre visibilité sur la plateforme.',
                color: 'bg-[#E8622A]',
              },
            ].map((step, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-sm flex items-start gap-5">
                <div className={`${step.color} text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0`}>
                  {step.num}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-green-50 rounded-2xl p-5 border border-green-100">
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-[#1B7A56]">✓ Aucun frais d'inscription —</span>{' '}
              BricoMaroc prélève uniquement une petite commission sur les missions réalisées via la plateforme.
            </p>
          </div>

          <div className="mt-6 text-center">
            <Link href="/auth/register?role=artisan"
              className="inline-block bg-[#E8622A] text-white font-semibold px-8 py-3 rounded-xl hover:bg-[#d45520] transition-colors">
              Rejoindre la plateforme →
            </Link>
          </div>
        </section>

        {/* DIVIDER */}
        <div className="border-t border-gray-200" />

        {/* CONFIANCE & SÉCURITÉ */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900">Confiance & sécurité</h2>
            <p className="text-gray-500 text-sm mt-2">Ce qui fait la différence BricoMaroc</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: '🪪', title: 'Vérification CIN', desc: 'Chaque artisan vérifié a confirmé son identité avec sa carte nationale.' },
              { icon: '⭐', title: 'Avis authentiques', desc: 'Seuls les clients ayant terminé une mission peuvent laisser un avis.' },
              { icon: '💳', title: 'Paiement sécurisé', desc: 'Vos paiements sont protégés et ne sont libérés qu\'après validation.' },
              { icon: '🚫', title: 'Exclusion automatique', desc: 'Les artisans mal notés de façon répétée sont retirés de la plateforme.' },
            ].map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-sm">
                <div className="text-2xl mb-2">{f.icon}</div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">{f.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="bg-gradient-to-br from-[#1B7A56] to-[#155f42] rounded-2xl p-10 text-center text-white">
          <h2 className="text-2xl font-bold mb-2">Prêt à commencer ?</h2>
          <p className="text-green-100 text-sm mb-8">
            Rejoignez des milliers de clients et d'artisans dans tout le Maroc
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/artisans"
              className="bg-[#E8622A] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#d45520] transition-colors">
              Trouver un artisan
            </Link>
            <Link href="/auth/register?role=artisan"
              className="bg-white text-[#1B7A56] font-semibold px-6 py-3 rounded-xl hover:bg-green-50 transition-colors">
              Devenir artisan
            </Link>
          </div>
        </section>

      </div>

      {/* FOOTER */}
      <footer className="border-t border-gray-200 mt-8 py-8 text-center">
        <p className="text-sm text-gray-400">© 2026 BricoMaroc — La plateforme de confiance pour vos travaux au Maroc</p>
        <p className="text-sm text-[#1B7A56] font-semibold mt-1">www.bricomaroc.ma</p>
      </footer>
    </div>
  )
}
