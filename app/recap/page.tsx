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

    function section(titre: string) {
      check(15)
      doc.setFillColor(27, 122, 86)
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

    // ── HEADER ──
    doc.setFillColor(27, 122, 86)
    doc.rect(0, 0, W, 48, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(26)
    doc.setFont('helvetica', 'bold')
    doc.text('BricoMaroc', W / 2, 20, { align: 'center' })
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text('Recapitulatif complet du projet', W / 2, 32, { align: 'center' })
    doc.setFontSize(9)
    doc.text(`Genere le ${new Date().toLocaleDateString('fr-FR')}`, W / 2, 42, { align: 'center' })
    y = 58

    // ── PAGES CREEES ──
    section('PAGES CREEES (30+)')

    sub('Pages publiques')
    item('/ — Accueil avec recherche, artisans, temoignages, newsletter')
    item('/artisans — Liste artisans avec filtres et comparateur')
    item('/artisans/[id] — Profil artisan avec avis et favoris')
    item('/artisans/inscription — Inscription artisan 3 etapes')
    item('/carte — Carte OpenStreetMap avec artisans')
    item('/comparer — Comparateur 2-3 artisans')
    item('/estimation — Estimateur budget par categorie')
    item('/tarifs — Plans Free/Pro/Elite')
    item('/blog + /blog/[id] — Blog 8 articles')
    item('/a-propos — Histoire, equipe, valeurs')
    item('/comment-ca-marche — Explication plateforme')
    item('/support — Tickets support')
    item('/cgu + /mentions-legales — Pages legales')
    item('/not-found — Page 404')
    y += 3

    sub('Espace client')
    item('/espace-client — Dashboard client avec demandes')
    item('/espace-client/finances — Historique paiements')
    item('/demandes/nouvelle — Creer demande 3 etapes + photos')
    item('/profil-client — Profil editable + avatar')
    item('/favoris — Artisans favoris')
    item('/fidelite — Programme Bronze/Silver/Gold/Platinum')
    item('/remboursement — Demande de remboursement')
    item('/contrat — Generer contrat PDF signable')
    item('/parrainage — Systeme parrainage avec code unique')
    item('/messages/[id] — Messagerie temps reel')
    item('/suivi/[id] — Suivi mission')
    item('/avis/[id] — Laisser un avis')
    item('/paiement/[id] — Paiement securise')
    y += 3

    sub('Espace artisan')
    item('/dashboard — Dashboard artisan')
    item('/dashboard/finances — Tableau financier + factures PDF')
    item('/profil — Profil artisan + portfolio photos')
    item('/carte-id — Carte identite artisan avec QR code')
    item('/premium — Plans premium')
    y += 3

    sub('Admin')
    item('/admin — Panel complet (artisans, demandes, users, tickets, avis)')
    item('/admin/stats — Statistiques avancees avec graphiques')
    y += 3

    sub('Auth')
    item('/auth/login — Connexion avec redirection')
    item('/auth/register — Inscription client/artisan')
    item('/reset-password — Reinitialisation mot de passe')
    y += 5

    // ── FONCTIONNALITES TECHNIQUES ──
    section('FONCTIONNALITES TECHNIQUES')

    sub('Backend & Base de donnees')
    item('Supabase PostgreSQL avec 20+ tables')
    item('RLS (Row Level Security) sur toutes les tables')
    item('Realtime pour notifications et messagerie')
    item('Storage buckets (avatars, portfolio, demandes-photos)')
    y += 3

    sub('APIs creees')
    item('/api/email — Emails Resend (inscription, devis, mission, newsletter)')
    item('/api/sms — SMS Twilio aux artisans')
    item('/api/push — Notifications push navigateur')
    item('/api/newsletter — Inscription newsletter')
    item('/api/compress-image — Compression Sharp (87% reduction)')
    item('/api/validate — Validation formulaires cote serveur')
    item('/api/badges — Calcul automatique badges artisans')
    y += 3

    sub('Securite')
    item('Middleware protection routes')
    item('Rate limiting API (email 5/min, SMS 3/min, auth 30/min)')
    item('Validation cote serveur tous formulaires')
    item('Sanitisation donnees utilisateur')
    y += 3

    sub('PDF generes')
    item('Factures artisan avec commission')
    item('Contrats artisan-client signables')
    y += 3

    sub('UX/UI')
    item('Dark mode (localStorage)')
    item('Multilingue FR/AR/Darija avec RTL arabe')
    item('Selecteur de langue dans navbar')
    item('Barre de recherche avec suggestions auto-complete')
    item('Notifications temps reel (cloche)')
    item('Compression images automatique')
    item('PWA (manifest, service worker, icones)')
    y += 3

    sub('SEO & Marketing')
    item('Sitemap dynamique')
    item('Robots.txt')
    item('Open Graph image generee (1200x630)')
    item('Metadonnees completes')
    item('Newsletter avec email de confirmation')
    y += 3

    sub('Admin')
    item('Validation/suspension artisans')
    item('Gestion tickets support')
    item('Moderation avis (masquer, signaler, supprimer)')
    item('Export CSV users/artisans/demandes')
    item('Statistiques CA, graphiques')
    y += 5

    // ── CE QUI RESTE ──
    section('CE QUI RESTE A FAIRE')

    sub('Pour finaliser l\'app')
    num(1, 'Deploiement Vercel — mettre en production')
    num(2, 'Domaine custom — configurer bricomaroc.ma')
    num(3, 'Stripe paiements reels — activer les vrais paiements')
    num(4, 'Email domaine — configurer @bricomaroc.ma dans Resend')
    num(5, 'SMS Twilio — activer le compte production')
    y += 3

    sub('Fonctionnalites optionnelles restantes')
    num(6, 'Pages SEO par ville — /artisans/marrakech, /artisans/casablanca')
    num(7, 'Geolocalisation — artisans pres de moi automatiquement')
    num(8, 'Tableau revenus admin — CA global avec graphiques detailles')
    num(9, 'Gestion signalements — moderer les signalements')
    num(10, 'Parrainage client — clients qui invitent d\'autres clients')
    y += 8

    // ── FOOTER ──
    const pages = doc.getNumberOfPages()
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i)
      doc.setTextColor(150, 150, 150)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.line(10, 280, W - 10, 280)
      doc.text('BricoMaroc — bricomaroc.vercel.app', W / 2, 285, { align: 'center' })
      doc.text(`Page ${i} / ${pages}`, W / 2, 290, { align: 'center' })
    }

    doc.save('BricoMaroc-Recapitulatif.pdf')
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center">
      <div className="bg-white rounded-2xl p-10 shadow-sm text-center max-w-md">
        <div className="text-5xl mb-4">📄</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Recapitulatif BricoMaroc
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          Telechargez le PDF complet du projet avec toutes les fonctionnalites
          implementees et ce qui reste a faire.
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