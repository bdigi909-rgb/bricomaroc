import { NextRequest, NextResponse } from 'next/server'
import {
  validateDemande,
  validateProfilArtisan,
  validateInscription,
  validateDevis,
  validateTicket,
  sanitize,
} from '@/lib/validation'

export async function POST(req: NextRequest) {
  try {
    const { type, data } = await req.json()

    // Sanitiser toutes les données texte
    const sanitized = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        typeof value === 'string' ? sanitize(value) : value,
      ])
    )

    let result

    switch (type) {
      case 'demande':
        result = validateDemande(sanitized)
        break
      case 'profil_artisan':
        result = validateProfilArtisan(sanitized)
        break
      case 'inscription':
        result = validateInscription(sanitized)
        break
      case 'devis':
        result = validateDevis(sanitized)
        break
      case 'ticket':
        result = validateTicket(sanitized)
        break
      default:
        return NextResponse.json({ error: 'Type de validation inconnu' }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
