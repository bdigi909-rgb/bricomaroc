import jsPDF from 'jspdf'

interface FactureClientData {
  numero: string
  date: string
  clientNom: string
  clientVille: string
  artisanNom: string
  artisanVille: string
  missionTitre: string
  montant: number
  statut: string
}

export function generateFactureClientPDF(data: FactureClientData) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  // HEADER
  doc.setFillColor(27, 122, 86)
  doc.rect(0, 0, pageWidth, 45, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text('BricoMaroc', 15, 18)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('La plateforme de confiance pour vos travaux au Maroc', 15, 28)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(`FACTURE CLIENT N° ${data.numero}`, pageWidth - 15, 18, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(`Date : ${data.date}`, pageWidth - 15, 28, { align: 'right' })

  // TITRE
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text('RECU DE PAIEMENT', pageWidth / 2, 58, { align: 'center' })

  // PARTIES
  doc.setFillColor(247, 245, 240)
  doc.rect(10, 65, 90, 45, 'F')
  doc.rect(110, 65, 90, 45, 'F')

  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(27, 122, 86)
  doc.text('CLIENT', 15, 75)
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'normal')
  doc.text(data.clientNom, 15, 84)
  doc.text(`Ville : ${data.clientVille}`, 15, 92)
  doc.text('Ci-apres "Le Client"', 15, 100)

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(27, 122, 86)
  doc.text('ARTISAN', 115, 75)
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'normal')
  doc.text(data.artisanNom, 115, 84)
  doc.text(`Ville : ${data.artisanVille}`, 115, 92)
  doc.text('Ci-apres "L\'Artisan"', 115, 100)

  // DETAIL MISSION
  doc.setFillColor(27, 122, 86)
  doc.rect(10, 118, pageWidth - 20, 9, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('DETAIL DE LA MISSION', 15, 124)

  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(data.missionTitre, 15, 137)

  // TABLEAU MONTANT
  doc.setFillColor(247, 245, 240)
  doc.rect(10, 148, pageWidth - 20, 8, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('Description', 15, 154)
  doc.text('Montant', pageWidth - 15, 154, { align: 'right' })

  doc.line(10, 158, pageWidth - 10, 158)
  doc.setFont('helvetica', 'normal')
  doc.text('Prestation artisan', 15, 166)
  doc.text(`${data.montant.toFixed(0)} MAD`, pageWidth - 15, 166, { align: 'right' })

  doc.line(10, 170, pageWidth - 10, 170)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setFillColor(27, 122, 86)
  doc.rect(10, 172, pageWidth - 20, 12, 'F')
  doc.setTextColor(255, 255, 255)
  doc.text('TOTAL PAYE', 15, 180)
  doc.text(`${data.montant.toFixed(0)} MAD`, pageWidth - 15, 180, { align: 'right' })

  // STATUT
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(10)
  const statutLabel = data.statut === 'released' ? 'PAYE' : 'EN ATTENTE'
  const r = data.statut === 'released' ? 27 : 200
  const g = data.statut === 'released' ? 122 : 100
  const b = data.statut === 'released' ? 86 : 0
  doc.setTextColor(r, g, b)
  doc.setFont('helvetica', 'bold')
  doc.text(`Statut : ${statutLabel}`, 15, 200)

  // INFO PAIEMENT
  doc.setTextColor(100, 100, 100)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text('Paiement securise via BricoMaroc', 15, 212)
  doc.text(`Reference : ${data.numero}`, 15, 220)
  doc.text(`Genere le : ${new Date().toLocaleDateString('fr-FR')}`, 15, 228)

  // FOOTER
  doc.setTextColor(150, 150, 150)
  doc.setFontSize(8)
  doc.line(10, 270, pageWidth - 10, 270)
  doc.text('BricoMaroc — contact@bricomaroc.ma — bricomaroc.vercel.app', pageWidth / 2, 277, { align: 'center' })
  doc.text('© 2026 BricoMaroc — Tous droits reserves', pageWidth / 2, 283, { align: 'center' })

  doc.save(`facture-client-${data.numero}.pdf`)
}