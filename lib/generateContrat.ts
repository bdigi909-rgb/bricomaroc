import jsPDF from 'jspdf'

interface ContratData {
  numero: string
  date: string
  clientNom: string
  clientVille: string
  clientPhone: string
  artisanNom: string
  artisanVille: string
  artisanPhone: string
  missionTitre: string
  missionDescription: string
  montant: number
  dateDebut: string
  dateFin: string
  garantieMois: number
}

export function generateContratPDF(data: ContratData) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  // HEADER
  doc.setFillColor(27, 122, 86)
  doc.rect(0, 0, pageWidth, 40, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('BricoMaroc', 15, 18)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('La plateforme de confiance pour vos travaux au Maroc', 15, 28)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(`CONTRAT N° ${data.numero}`, pageWidth - 15, 18, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(`Date : ${data.date}`, pageWidth - 15, 28, { align: 'right' })

  // TITRE
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('CONTRAT DE PRESTATION DE SERVICES', pageWidth / 2, 55, { align: 'center' })
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)
  doc.text('Entre les soussignes :', pageWidth / 2, 63, { align: 'center' })

  // PARTIES
  doc.setTextColor(0, 0, 0)
  doc.setFillColor(247, 245, 240)
  doc.rect(10, 70, 90, 50, 'F')
  doc.rect(110, 70, 90, 50, 'F')

  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(27, 122, 86)
  doc.text('LE CLIENT', 15, 80)
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'normal')
  doc.text(data.clientNom, 15, 90)
  doc.text(`Ville : ${data.clientVille}`, 15, 98)
  doc.text(`Tel : ${data.clientPhone}`, 15, 106)
  doc.text('Ci-apres "Le Client"', 15, 114)

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(27, 122, 86)
  doc.text("L'ARTISAN", 115, 80)
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'normal')
  doc.text(data.artisanNom, 115, 90)
  doc.text(`Ville : ${data.artisanVille}`, 115, 98)
  doc.text(`Tel : ${data.artisanPhone}`, 115, 106)
  doc.text('Ci-apres "L\'Artisan"', 115, 114)

  // OBJET
  doc.setFillColor(27, 122, 86)
  doc.rect(10, 128, pageWidth - 20, 8, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('ARTICLE 1 — OBJET DU CONTRAT', 15, 134)

  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text(data.missionTitre, 15, 146)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  const descLines = doc.splitTextToSize(data.missionDescription, pageWidth - 30)
  doc.text(descLines, 15, 154)

  // DUREE
  const yDuree = 175
  doc.setFillColor(27, 122, 86)
  doc.rect(10, yDuree, pageWidth - 20, 8, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.text('ARTICLE 2 — DUREE', 15, yDuree + 6)

  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(`Date de debut : ${data.dateDebut}`, 15, yDuree + 16)
  doc.text(`Date de fin prevue : ${data.dateFin}`, 15, yDuree + 24)

  // PRIX
  const yPrix = yDuree + 35
  doc.setFillColor(27, 122, 86)
  doc.rect(10, yPrix, pageWidth - 20, 8, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.text('ARTICLE 3 — PRIX ET PAIEMENT', 15, yPrix + 6)

  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(`Montant total convenu : ${data.montant.toFixed(0)} MAD`, 15, yPrix + 16)
  doc.text('Paiement via la plateforme BricoMaroc (securise)', 15, yPrix + 24)
  doc.text('Les fonds sont bloques jusqu\'a validation des travaux par le client', 15, yPrix + 32)

  // GARANTIE
  const yGar = yPrix + 43
  doc.setFillColor(27, 122, 86)
  doc.rect(10, yGar, pageWidth - 20, 8, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.text('ARTICLE 4 — GARANTIE', 15, yGar + 6)

  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(`L'artisan garantit ses travaux pendant ${data.garantieMois} mois.`, 15, yGar + 16)
  doc.text('Tout defaut constate dans ce delai sera repare gratuitement.', 15, yGar + 24)

  // OBLIGATIONS
  const yObl = yGar + 35
  doc.setFillColor(27, 122, 86)
  doc.rect(10, yObl, pageWidth - 20, 8, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.text('ARTICLE 5 — OBLIGATIONS', 15, yObl + 6)

  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text("L'artisan s'engage a :", 15, yObl + 16)
  doc.text('• Realiser les travaux dans les regles de l\'art', 20, yObl + 24)
  doc.text('• Respecter les delais convenus', 20, yObl + 31)
  doc.text('• Utiliser des materiaux de qualite', 20, yObl + 38)

  // SIGNATURES
  const ySig = yObl + 52
  doc.setFillColor(247, 245, 240)
  doc.rect(10, ySig, pageWidth - 20, 35, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(27, 122, 86)
  doc.text('SIGNATURES', pageWidth / 2, ySig + 8, { align: 'center' })

  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'normal')
  doc.text('Signature du Client :', 20, ySig + 18)
  doc.text('Signature de l\'Artisan :', pageWidth - 80, ySig + 18)
  doc.line(15, ySig + 30, 90, ySig + 30)
  doc.line(pageWidth - 85, ySig + 30, pageWidth - 15, ySig + 30)
  doc.setFontSize(8)
  doc.setTextColor(150, 150, 150)
  doc.text(data.clientNom, 15, ySig + 34)
  doc.text(data.artisanNom, pageWidth - 85, ySig + 34)

  // FOOTER
  doc.setTextColor(150, 150, 150)
  doc.setFontSize(8)
  doc.line(10, 280, pageWidth - 10, 280)
  doc.text('BricoMaroc — contact@bricomaroc.ma — bricomaroc.vercel.app', pageWidth / 2, 285, { align: 'center' })
  doc.text('© 2026 BricoMaroc — Tous droits reserves', pageWidth / 2, 290, { align: 'center' })

  doc.save(`contrat-bricomaroc-${data.numero}.pdf`)
}