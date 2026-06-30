import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { createServerSupabaseClient } from '@/lib/supabase'
import { searchArtisans, getPlatformeStats } from '@/lib/artisans'
import Navbar from '@/components/layout/Navbar'
import SearchBar from '@/components/home/SearchBar'
import CategoriesGrid from '@/components/home/CategoriesGrid'
import ArtisanCard from '@/components/home/ArtisanCard'
import { ArtisanCardSkeleton, Button } from '@/components/ui'
import type { Category, ArtisanWithUser } from '@/types'
import Newsletter from '@/components/home/Newsletter'
import Geolocalisation from '@/components/ui/Geolocalisation'

export const metadata: Metadata = {
  title: 'BricoMaroc — Artisans vérifiés au Maroc',
  description:
    'Trouvez un plombier, électricien, peintre ou menuisier qualifié et vérifié près de chez vous à Marrakech et dans toutes les villes du Maroc.',
}

function HeroSection({ stats }: {
  stats: { nb_artisans: number; nb_missions: number; note_moyenne: number }
}) {
  return (
    <section className="relative bg-gradient-to-br from-green-700 via-green-500 to-green-600 overflow-hidden">
      <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute right-8 -bottom-20 w-48 h-48 rounded-full bg-white/4 pointer-events-none" />
      <div className="relative max-w-6xl mx-auto px-4 py-14 md:py-20">
        <div className="inline-flex items-center gap-2 bg-white/15 text-white/90 rounded-full px-3 py-1 text-xs font-semibold mb-4">
          <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse" />
          +{stats.nb_artisans} artisans vérifiés au Maroc
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-4 max-w-2xl tracking-tight">
          Trouvez un artisan de{' '}
          <span className="text-green-200">confiance</span>,
          <br className="hidden md:block" /> près de chez vous
        </h1>
        <p className="text-white/80 text-base md:text-lg mb-8 max-w-xl leading-relaxed">
          Plombier, électricien, peintre… Comparez les profils,
          lisez les avis et réservez en quelques minutes.
        </p>
        <div className="max-w-2xl">
          <SearchBar />
        </div>
        <div className="flex justify-center mt-3">
  <Geolocalisation />
</div>
        <div className="flex gap-6 mt-8 flex-wrap">
          {[
            { value: `${stats.nb_artisans}+`, label: 'Artisans vérifiés' },
            { value: `${stats.note_moyenne}★`, label: 'Note moyenne' },
            { value: `${stats.nb_missions}+`, label: 'Missions réalisées' },
          ].map(s => (
            <div key={s.label}>
              <p className="text-2xl font-extrabold text-white">{s.value}</p>
              <p className="text-xs text-white/70">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  const steps = [
    { num: '1', icon: '📝', title: 'Publiez votre demande', desc: 'Décrivez vos travaux avec photos en moins de 2 minutes.' },
    { num: '2', icon: '🔧', title: 'Recevez des propositions', desc: 'Les artisans disponibles dans votre zone vous contactent.' },
    { num: '3', icon: '✅', title: 'Choisissez en confiance', desc: 'Comparez les profils, avis et tarifs. Décidez librement.' },
    { num: '4', icon: '⭐', title: 'Notez l\'intervention', desc: 'Votre avis aide la communauté à choisir les meilleurs.' },
  ]
  return (
    <section className="py-14 bg-white border-y border-[var(--color-border)]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <p className="section-label mb-2">Simple et rapide</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-ink">Comment ça marche ?</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div key={step.num} className="relative text-center">
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-6 left-[calc(50%+28px)] right-0 h-0.5 bg-green-100" />
              )}
              <div className="w-14 h-14 rounded-2xl bg-green-50 border-2 border-green-100 flex items-center justify-center text-2xl mx-auto mb-4 relative z-10">
                {step.icon}
              </div>
              <h3 className="font-bold text-ink mb-1">{step.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

async function ArtisansSection() {
  const { artisans } = await searchArtisans({
    disponible: true,
    page: 1,
    limit: 6,
  })
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="section-label mb-1">Disponibles maintenant</p>
          <h2 className="text-xl font-extrabold text-ink">Artisans à Marrakech</h2>
        </div>
        <Link href="/artisans" className="text-sm font-semibold text-green-600 hover:text-green-700 transition-colors">
          Voir tout →
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {artisans.length > 0
          ? artisans.map(artisan => <ArtisanCard key={artisan.id} artisan={artisan} />)
          : Array.from({ length: 6 }).map((_, i) => <ArtisanCardSkeleton key={i} />)
        }
      </div>
      <div className="text-center mt-8">
        <Button variant="secondary" size="lg" asChild>
          <Link href="/artisans">Voir tous les artisans →</Link>
        </Button>
      </div>
    </section>
  )
}

function Testimonials() {
  const temoignages = [
    { note: 5, text: 'Youssef est arrivé en 45 minutes, a réparé la fuite proprement. Prix honnête. Je recommande vivement BricoMaroc !', auteur: 'Fatima M.', ville: 'Guéliz, Marrakech', date: 'il y a 3 jours' },
    { note: 5, text: 'Khalid a installé mon tableau électrique en une journée. Très professionnel, explique bien ce qu\'il fait.', auteur: 'Karim R.', ville: 'Hivernage, Marrakech', date: 'il y a 1 semaine' },
    { note: 4, text: 'Bon service dans l\'ensemble. Léger retard mais résultat nickel. La plateforme est très simple à utiliser.', auteur: 'Sara L.', ville: 'Médina, Marrakech', date: 'il y a 2 semaines' },
  ]
  return (
    <section className="py-14 bg-green-50 border-y border-green-100">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <p className="section-label mb-2">Ce que disent nos clients</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-ink">Des milliers de clients satisfaits</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {temoignages.map((t, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-card border border-[var(--color-border)]">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center font-bold text-sm text-green-700">
                  {t.auteur[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.auteur}</p>
                  <p className="text-xs text-muted">{t.ville}</p>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-sm stars-gold">{'★'.repeat(t.note)}{'☆'.repeat(5-t.note)}</div>
                  <p className="text-[10px] text-muted">{t.date}</p>
                </div>
              </div>
              <p className="text-sm text-muted leading-relaxed italic">"{t.text}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTAArtisan() {
  return (
    <section className="py-14">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 text-center md:text-left">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl mb-4 mx-auto md:mx-0">
              🔧
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">Vous êtes artisan ?</h2>
            <p className="text-orange-100 text-base leading-relaxed max-w-lg">
              Inscription gratuite. Recevez des demandes de clients vérifiés directement sur votre téléphone.
            </p>
            <ul className="mt-4 flex flex-col sm:flex-row gap-3 flex-wrap">
              {['0% commission au départ', 'Profil vérifié', 'Clients sérieux'].map(item => (
                <li key={item} className="flex items-center gap-1.5 text-sm text-white font-medium">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5"/>
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-shrink-0">
            <Button variant="ghost" size="lg" asChild className="bg-white text-orange-600 border-white hover:bg-orange-50 font-bold">
              <Link href="/artisans/inscription">Rejoindre la plateforme →</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="bg-white border-t border-[var(--color-border)] py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center text-xs">🔧</div>
              <span className="font-extrabold text-ink">BricoMaroc</span>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              La plateforme de confiance pour trouver un artisan qualifié au Maroc.
            </p>
          </div>
          {[
            { title: 'Clients', links: [
              { label: 'Trouver un artisan', href: '/artisans' },
              { label: 'Publier une demande', href: '/demandes/nouvelle' },
              { label: 'Comment ça marche', href: '/comment-ca-marche' },
              { label: 'Mes demandes', href: '/espace-client' },
            ]},
            { title: 'Artisans', links: [
              { label: 'Devenir artisan', href: '/auth/register?role=artisan' },
              { label: 'Tarifs & Plans', href: '/tarifs' },
              { label: 'Espace artisan', href: '/dashboard' },
              { label: 'Parrainage', href: '/parrainage' },
            ]},
            { title: 'BricoMaroc', links: [
              { label: 'À propos', href: '/a-propos' },
              { label: 'Blog', href: '/blog' },
              { label: 'Support', href: '/support' },
              { label: 'CGU', href: '/cgu' },
            ]},
          ].map(col => (
            <div key={col.title}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-3">{col.title}</h3>
              <ul className="space-y-2">
                {col.links.map((link: any) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-muted hover:text-ink transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-[var(--color-border)] pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div>
            <p className="text-xs text-muted">© 2026 BricoMaroc · Tous droits réservés</p>
            <div className="flex gap-4 mt-1">
              <Link href="/cgu" className="text-xs text-muted hover:text-gray-600">CGU</Link>
              <Link href="/mentions-legales" className="text-xs text-muted hover:text-gray-600">Mentions légales</Link>
              <Link href="/a-propos" className="text-xs text-muted hover:text-gray-600">À propos</Link>
            </div>
          </div>
          <p className="text-xs text-muted">🇲🇦 Maroc · Darija · Français · العربية</p>
        </div>
      </div>
    </footer>
  )
}

export default async function HomePage() {
  const supabase = createServerSupabaseClient()
  const [
    { data: categoriesData },
    stats,
  ] = await Promise.all([
    supabase.from('categories').select('*').eq('active', true).order('position'),
    getPlatformeStats(),
  ])
  const categories = (categoriesData ?? []) as Category[]

  return (
    <>
      <Navbar />
      <main>
        <HeroSection stats={stats} />
        <section className="max-w-6xl mx-auto px-4 py-10">
          <CategoriesGrid categories={categories} />
        </section>
        <HowItWorks />
        <section className="max-w-6xl mx-auto px-4 py-10">
          <Suspense fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <ArtisanCardSkeleton key={i} />)}
            </div>
          }>
            <ArtisansSection />
          </Suspense>
        </section>
        <Testimonials />
        <section className="max-w-2xl mx-auto px-4 py-8">
  <Newsletter />
</section>
        <CTAArtisan />
      </main>
      <Footer />
    </>
  )
}
