import jsPDF from 'jspdf'

interface FactureData {
  numero: string
  date: string
  artisanNom: string
  artisanVille: string
  artisanPhone?: string
  clientNom: string
  missionTitre: string
  montantBrut: number
  commission: number
  montantNet: number
  statut: string
}

export function generateFacturePDF(data: FactureData) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  // HEADER VERT
  doc.setFillColor(27, 122, 86)
  doc.rect(0, 0, pageWidth, 45, 'F')

  // LOGO + TITRE
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text('BricoMaroc', 15, 20)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('La plateforme de confiance pour vos travaux au Maroc', 15, 30)
  doc.text('bricomaroc.vercel.app', 15, 38)

  // NUMÉRO FACTURE
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(`FACTURE N° ${data.numero}`, pageWidth - 15, 20, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(`Date : ${data.date}`, pageWidth - 15, 30, { align: 'right' })

  // RESET COULEUR
  doc.setTextColor(0, 0, 0)

  // SECTION ARTISAN
  doc.setFillColor(247, 245, 240)
  doc.rect(10, 55, 90, 50, 'F')
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(27, 122, 86)
  doc.text('ARTISAN', 15, 65)
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(data.artisanNom, 15, 75)
  doc.setFontSize(9)
  doc.text(`Ville : ${data.artisanVille}`, 15, 83)
  if (data.artisanPhone) {
    doc.text(`Tel : ${data.artisanPhone}`, 15, 91)
  }

  // SECTION CLIENT
  doc.setFillColor(247, 245, 240)
  doc.rect(110, 55, 90, 50, 'F')
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(27, 122, 86)
  doc.text('CLIENT', 115, 65)
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(data.clientNom, 115, 75)

  // MISSION
  doc.setFillColor(27, 122, 86)
  doc.rect(10, 115, pageWidth - 20, 10, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('DETAIL DE LA MISSION', 15, 122)

  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(data.missionTitre, 15, 135)

  // TABLEAU MONTANTS
  doc.setFillColor(247, 245, 240)
  doc.rect(10, 150, pageWidth - 20, 8, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('Description', 15, 156)
  doc.text('Montant', pageWidth - 15, 156, { align: 'right' })

  // LIGNE 1
  doc.setFont('helvetica', 'normal')
  doc.line(10, 160, pageWidth - 10, 160)
  doc.text('Montant brut de la mission', 15, 168)
  doc.text(`${data.montantBrut.toFixed(0)} MAD`, pageWidth - 15, 168, { align: 'right' })

  // LIGNE 2
  doc.line(10, 172, pageWidth - 10, 172)
  doc.setTextColor(200, 50, 50)
  doc.text('Commission BricoMaroc (10%)', 15, 180)
  doc.text(`-${data.commission.toFixed(0)} MAD`, pageWidth - 15, 180, { align: 'right' })

  // TOTAL NET
  doc.setTextColor(0, 0, 0)
  doc.line(10, 184, pageWidth - 10, 184)
  doc.setFillColor(27, 122, 86)
  doc.rect(10, 186, pageWidth - 20, 12, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('MONTANT NET RECU', 15, 194)
  doc.text(`${data.montantNet.toFixed(0)} MAD`, pageWidth - 15, 194, { align: 'right' })

  // STATUT
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(10)
  const statutLabel = data.statut === 'released' ? 'PAYE' : 'EN ATTENTE'
  const r = data.statut === 'released' ? 27 : 200
  const g = data.statut === 'released' ? 122 : 150
  const b = data.statut === 'released' ? 86 : 0
  doc.setTextColor(r, g, b)
  doc.setFont('helvetica', 'bold')
  doc.text(`Statut : ${statutLabel}`, 15, 215)

  // NUMÉRO DE RÉFÉRENCE
  doc.setTextColor(100, 100, 100)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(`Reference : ${data.numero}`, 15, 225)
  doc.text(`Genere le : ${new Date().toLocaleDateString('fr-FR')}`, 15, 233)

  // FOOTER
  doc.setTextColor(150, 150, 150)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.line(10, 270, pageWidth - 10, 270)
  doc.text(
    'BricoMaroc — La plateforme de confiance pour vos travaux au Maroc',
    pageWidth / 2, 277, { align: 'center' }
  )
  doc.text(
    'contact@bricomaroc.ma | bricomaroc.vercel.app',
    pageWidth / 2, 283, { align: 'center' }
  )
  doc.text(
    '© 2026 BricoMaroc — Tous droits reserves',
    pageWidth / 2, 289, { align: 'center' }
  )

  // TÉLÉCHARGER
  doc.save(`facture-bricomaroc-${data.numero}.pdf`)
}