'use client'
import jsPDF from 'jspdf'

export default function RecapPage() {
  function genererPDF() {
    const doc = new jsPDF()
    const W = doc.internal.pageSize.getWidth()
    let y = 0

    function check(n = 10) {
      if (y + n > 275) { doc.addPage(); y = 20 }
    }

    function section(titre: string, couleur: [number, number, number] = [27, 122, 86]) {
      check(15)
      doc.setFillColor(...couleur)
      doc.rect(10, y, W - 20, 9, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.text(titre, 15, y + 6.5)
      y += 14
      doc.setTextColor(0, 0, 0)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
    }

    function sub(titre: string) {
      check(8)
      doc.setTextColor(27, 122, 86)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.text(titre, 15, y)
      y += 6
      doc.setTextColor(0, 0, 0)
      doc.setFont('helvetica', 'normal')
    }

    function item(text: string) {
      check(6)
      const lines = doc.splitTextToSize(`• ${text}`, W - 35)
      doc.text(lines, 18, y)
      y += lines.length * 5.5
    }

    function num(n: number, text: string) {
      check(6)
      const lines = doc.splitTextToSize(`${n}. ${text}`, W - 35)
      doc.text(lines, 18, y)
      y += lines.length * 5.5
    }

    function space() { y += 4 }

    // HEADER
    doc.setFillColor(27, 122, 86)
    doc.rect(0, 0, W, 48, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(26)
    doc.setFont('helvetica', 'bold')
    doc.text('BricoMaroc', W / 2, 20, { align: 'center' })
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text('Recapitulatif complet — Plateforme 100% Complete', W / 2, 32, { align: 'center' })
    doc.setFontSize(9)
    doc.text(`Genere le ${new Date().toLocaleDateString('fr-FR')}`, W / 2, 42, { align: 'center' })
    y = 58

    // STACK TECHNIQUE
    section('STACK TECHNIQUE')
    item('Framework : Next.js 14.2 + TypeScript + Tailwind CSS')
    item('Base de donnees : Supabase (PostgreSQL + Auth + Realtime + Storage)')
    item('Paiements : Stripe (escrow securise)')
    item('Emails : Resend | SMS : Twilio | Cartes : Leaflet + OpenStreetMap')
    item('PDF : jsPDF | Images : Sharp (compression 87%) | QR Code : qrcode')
    item('Push : Web Push API + Service Worker | Cache : en memoire avec TTL')
    item('Deploy : Vercel — bricomaroc.vercel.app')
    item('GitHub : github.com/bdigi909-rgb/bricomaroc.git')
    space()

    // PAGES
    section('PAGES CREEES (30+)')

    sub('Pages publiques')
    item('/ — Accueil : recherche, artisans, temoignages, newsletter, geolocalisation')
    item('/artisans — Liste avec filtres, badges, comparateur, geolocalisation')
    item('/artisans/[id] — Profil artisan avec avis, favoris, badges')
    item('/artisans/inscription — Inscription artisan 3 etapes')
    item('/carte — Carte OpenStreetMap interactive avec artisans')
    item('/comparer — Comparateur 2-3 artisans cote a cote')
    item('/estimation — Estimateur budget par categorie (5 categories)')
    item('/tarifs — Plans Free/Pro/Elite avec tableau comparatif')
    item('/blog + /blog/[id] — Blog 8 articles avec FAQ accordeon')
    item('/a-propos, /comment-ca-marche, /support, /cgu, /mentions-legales')
    item('/not-found — Page 404 personnalisee')
    space()

    sub('Espace client')
    item('/espace-client — Dashboard avec demandes, stats, notifications push')
    item('/espace-client/finances — Historique paiements + factures PDF client')
    item('/demandes/nouvelle — Creer demande 3 etapes + upload photos')
    item('/profil-client — Profil editable + avatar compresse')
    item('/favoris — Artisans favoris avec ajout/suppression')
    item('/fidelite — Programme Bronze/Silver/Gold/Platinum avec points')
    item('/remboursement — Demande de remboursement avec historique')
    item('/contrat — Generer contrat PDF signable entre client et artisan')
    item('/parrainage-client — Parrainage avec code unique + points fidelite')
    item('/messages/[id] — Messagerie temps reel + reponses rapides + lu/non lu')
    item('/suivi/[id] — Suivi mission en temps reel')
    item('/avis/[id] — Laisser un avis avec etoiles')
    item('/paiement/[id] — Paiement securise Stripe')
    item('/devis/[id] — Devis avec negociation et contre-offre')
    space()

    sub('Espace artisan')
    item('/dashboard — Dashboard artisan complet')
    item('/dashboard/finances — Tableau financier + factures PDF artisan')
    item('/dashboard/agenda — Calendrier disponibilites avec creneaux')
    item('/profil — Profil artisan + galerie portfolio photos')
    item('/carte-id — Carte identite artisan avec QR code')
    item('/premium — Plans premium avec avantages')
    item('/parrainage — Parrainage artisans avec code et commissions')
    space()

    sub('Admin')
    item('/admin — Panel complet (10 onglets : artisans, demandes, users, tickets, avis, signalements, newsletter, logs, remboursements)')
    item('/admin/stats — Statistiques avancees avec graphiques CA mensuel')
    space()

    sub('SEO')
    item('/villes/[slug] — 10 pages villes (marrakech, casablanca, rabat...)')
    item('/services/[slug] — 88 pages services (plombier-marrakech, electricien-casablanca...)')
    space()

    sub('Auth')
    item('/auth/login, /auth/register, /reset-password')
    space()

    // FONCTIONNALITES
    section('FONCTIONNALITES TECHNIQUES')

    sub('APIs creees')
    item('/api/email — Emails Resend (inscription, devis, mission, newsletter, campagne)')
    item('/api/sms — SMS Twilio aux artisans disponibles')
    item('/api/push — Notifications push navigateur (Web Push API)')
    item('/api/newsletter — Inscription newsletter avec confirmation email')
    item('/api/compress-image — Compression Sharp (87% reduction, 186KB → 23KB)')
    item('/api/validate — Validation formulaires cote serveur')
    item('/api/badges — Calcul automatique badges artisans')
    item('/api/artisans — API artisans avec cache 5 minutes')
    item('/api/stats — Stats plateforme avec cache 10 minutes')
    item('/api/logs — Logs activite utilisateurs (POST + GET)')
    space()

    sub('Securite')
    item('Middleware protection routes authentification')
    item('Rate limiting : email 5/min, SMS 3/min, auth 30/min')
    item('Validation et sanitisation cote serveur tous formulaires')
    item('RLS Supabase sur toutes les tables (20+ tables)')
    space()

    sub('PDF generes')
    item('Factures artisan avec commission BricoMaroc')
    item('Factures client avec recapitulatif paiement')
    item('Contrats artisan-client signables avec 5 articles legaux')
    item('Carte identite artisan avec QR code')
    space()

    sub('UX/UI')
    item('Dark mode (toggle localStorage)')
    item('Multilingue FR/AR/Darija avec RTL pour arabe')
    item('Barre de recherche avec suggestions auto-complete')
    item('Notifications temps reel (cloche Supabase Realtime)')
    item('Compression images automatique (186KB → 23KB, 87%)')
    item('PWA : manifest, service worker, icones')
    item('Open Graph image generee (1200x630) pour WhatsApp/Facebook')
    item('Geolocalisation — artisans pres de moi automatiquement')
    space()

    sub('SEO & Marketing')
    item('Sitemap dynamique — 116 URLs (pages, artisans, villes, services)')
    item('Robots.txt configure')
    item('Schema.org (Organization, WebSite, Artisan, Service, FAQ)')
    item('Metadonnees completes avec Open Graph et Twitter Cards')
    item('Newsletter avec email de confirmation')
    space()

    sub('Business')
    item('Systeme de devis avec negociation et contre-offre')
    item('Paiements Stripe en escrow securise')
    item('Programme fidelite Bronze/Silver/Gold/Platinum')
    item('Parrainage artisans et clients avec points')
    item('Systeme de remboursement complet (demande → approbation → virement)')
    item('Badges automatiques (nouveau, fiable, expert, top du mois)')
    space()

    sub('Admin')
    item('Validation/suspension artisans avec email automatique')
    item('Gestion tickets support avec reponse et changement statut')
    item('Moderation avis (masquer, signaler, supprimer)')
    item('Gestion signalements (traiter, rejeter, supprimer)')
    item('Newsletter admin (voir inscrits, envoyer campagne)')
    item('Logs activite utilisateurs avec filtres')
    item('Gestion remboursements (approuver, rejeter, marquer traite)')
    item('Export CSV users/artisans/demandes')
    item('Stats CA mensuel avec graphiques')
    item('Recalcul badges automatique')
    space()

    // BASE DE DONNEES
    section('BASE DE DONNEES — 20+ TABLES SUPABASE')
    item('users, artisans, categories, artisan_categories')
    item('demandes, demande_photos, devis, messages')
    item('avis, paiements, notifications, favoris')
    item('tickets, signalements, parrainages, parrainage_utilisations')
    item('parrainage_clients, parrainage_client_utilisations')
    item('fidelite, fidelite_historique, newsletter')
    item('push_subscriptions, remboursements, agenda_artisan, logs_activite')
    space()

    // CE QUI RESTE
    section('CE QUI RESTE POUR LA MISE EN PRODUCTION', [200, 100, 0])

    sub('Priorite 1 — Deploiement')
    num(1, 'Deployer sur Vercel (git push → vercel build automatique)')
    num(2, 'Configurer domaine custom bricomaroc.ma')
    num(3, 'Activer Stripe paiements reels (mode production)')
    num(4, 'Configurer email @bricomaroc.ma dans Resend')
    num(5, 'Activer compte SMS Twilio production')
    space()

    // FOOTER
   const pages = (doc as any).getNumberOfPages()
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i)
      doc.setTextColor(150, 150, 150)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.line(10, 280, W - 10, 280)
      doc.text('BricoMaroc — bricomaroc.vercel.app — Plateforme 100% Complete', W / 2, 285, { align: 'center' })
      doc.text(`Page ${i} / ${pages}`, W / 2, 290, { align: 'center' })
    }

    doc.save('BricoMaroc-Recapitulatif-Complet.pdf')
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center">
      <div className="bg-white rounded-2xl p-10 shadow-sm text-center max-w-md">
        <div className="text-5xl mb-4">📄</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          BricoMaroc — Recapitulatif
        </h1>
        <p className="text-gray-500 text-sm mb-2">
          Plateforme <span className="text-[#1B7A56] font-bold">100% complete</span>
        </p>
        <p className="text-gray-400 text-xs mb-6">
          30+ pages, 20+ tables, 10 APIs, 116 URLs SEO
        </p>
        <button onClick={genererPDF}
          className="w-full bg-[#1B7A56] text-white font-semibold py-4 rounded-xl
            hover:bg-[#155f42] transition-colors text-lg">
          Telecharger le PDF
        </button>
      </div>
    </div>
  )
}
