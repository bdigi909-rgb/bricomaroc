// Validation côté serveur pour BricoMaroc

export interface ValidationResult {
  valid: boolean
  errors: Record<string, string>
}

// Valider email
export function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email) && email.length <= 255
}

// Valider téléphone marocain
export function validatePhone(phone: string): boolean {
  const cleaned = phone.replace(/\s/g, '')
  return /^(\+212|0)[5-7]\d{8}$/.test(cleaned)
}

// Valider mot de passe
export function validatePassword(password: string): {
  valid: boolean
  message: string
} {
  if (password.length < 6) return { valid: false, message: 'Min. 6 caractères' }
  if (password.length > 100) return { valid: false, message: 'Max. 100 caractères' }
  return { valid: true, message: '' }
}

// Sanitiser texte (enlever HTML dangereux)
export function sanitize(text: string): string {
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim()
}

// Valider demande
export function validateDemande(data: any): ValidationResult {
  const errors: Record<string, string> = {}

  if (!data.titre || data.titre.trim().length < 5) {
    errors.titre = 'Le titre doit contenir au moins 5 caractères'
  }
  if (data.titre && data.titre.length > 200) {
    errors.titre = 'Le titre ne peut pas dépasser 200 caractères'
  }

  if (!data.description || data.description.trim().length < 10) {
    errors.description = 'La description doit contenir au moins 10 caractères'
  }
  if (data.description && data.description.length > 2000) {
    errors.description = 'La description ne peut pas dépasser 2000 caractères'
  }

  if (!data.categorie_id) {
    errors.categorie_id = 'Veuillez sélectionner une catégorie'
  }

  if (!data.ville || data.ville.trim().length < 2) {
    errors.ville = 'Veuillez sélectionner une ville'
  }

  if (data.budget_min && data.budget_max) {
    if (parseInt(data.budget_min) > parseInt(data.budget_max)) {
      errors.budget = 'Le budget minimum ne peut pas être supérieur au maximum'
    }
  }

  if (data.budget_min && parseInt(data.budget_min) < 0) {
    errors.budget_min = 'Le budget ne peut pas être négatif'
  }

  if (data.budget_max && parseInt(data.budget_max) > 100000) {
    errors.budget_max = 'Budget maximum trop élevé'
  }

  return { valid: Object.keys(errors).length === 0, errors }
}

// Valider profil artisan
export function validateProfilArtisan(data: any): ValidationResult {
  const errors: Record<string, string> = {}

  if (!data.bio || data.bio.trim().length < 10) {
    errors.bio = 'La bio doit contenir au moins 10 caractères'
  }
  if (data.bio && data.bio.length > 500) {
    errors.bio = 'La bio ne peut pas dépasser 500 caractères'
  }

  if (!data.tarif_min || parseInt(data.tarif_min) < 50) {
    errors.tarif_min = 'Le tarif minimum doit être au moins 50 MAD'
  }
  if (!data.tarif_max || parseInt(data.tarif_max) > 5000) {
    errors.tarif_max = 'Le tarif maximum ne peut pas dépasser 5000 MAD'
  }
  if (data.tarif_min && data.tarif_max) {
    if (parseInt(data.tarif_min) > parseInt(data.tarif_max)) {
      errors.tarif = 'Le tarif minimum ne peut pas être supérieur au maximum'
    }
  }

  if (data.rayon_km && (parseInt(data.rayon_km) < 1 || parseInt(data.rayon_km) > 100)) {
    errors.rayon_km = 'Le rayon doit être entre 1 et 100 km'
  }

  if (data.annees_experience && parseInt(data.annees_experience) > 50) {
    errors.annees_experience = 'Les années d\'expérience ne peuvent pas dépasser 50'
  }

  return { valid: Object.keys(errors).length === 0, errors }
}

// Valider inscription
export function validateInscription(data: any): ValidationResult {
  const errors: Record<string, string> = {}

  if (!data.full_name || data.full_name.trim().length < 2) {
    errors.full_name = 'Le nom doit contenir au moins 2 caractères'
  }
  if (data.full_name && data.full_name.length > 100) {
    errors.full_name = 'Le nom ne peut pas dépasser 100 caractères'
  }

  if (!data.email || !validateEmail(data.email)) {
    errors.email = 'Adresse email invalide'
  }

  if (data.phone && !validatePhone(data.phone)) {
    errors.phone = 'Numéro de téléphone marocain invalide (ex: 0612345678)'
  }

  const passwordCheck = validatePassword(data.password ?? '')
  if (!passwordCheck.valid) {
    errors.password = passwordCheck.message
  }

  return { valid: Object.keys(errors).length === 0, errors }
}

// Valider devis
export function validateDevis(data: any): ValidationResult {
  const errors: Record<string, string> = {}

  if (!data.main_oeuvre || parseFloat(data.main_oeuvre) < 0) {
    errors.main_oeuvre = 'La main d\'oeuvre ne peut pas être négative'
  }
  if (data.main_oeuvre && parseFloat(data.main_oeuvre) > 100000) {
    errors.main_oeuvre = 'Montant trop élevé'
  }

  if (data.materiaux && parseFloat(data.materiaux) < 0) {
    errors.materiaux = 'Les matériaux ne peuvent pas être négatifs'
  }

  if (data.deplacement && parseFloat(data.deplacement) < 0) {
    errors.deplacement = 'Les frais de déplacement ne peuvent pas être négatifs'
  }

  if (!data.valable_jours || parseInt(data.valable_jours) < 1) {
    errors.valable_jours = 'Le devis doit être valable au moins 1 jour'
  }
  if (data.valable_jours && parseInt(data.valable_jours) > 90) {
    errors.valable_jours = 'Le devis ne peut pas être valable plus de 90 jours'
  }

  return { valid: Object.keys(errors).length === 0, errors }
}

// Valider ticket support
export function validateTicket(data: any): ValidationResult {
  const errors: Record<string, string> = {}

  if (!data.sujet || data.sujet.trim().length < 5) {
    errors.sujet = 'Le sujet doit contenir au moins 5 caractères'
  }
  if (data.sujet && data.sujet.length > 200) {
    errors.sujet = 'Le sujet ne peut pas dépasser 200 caractères'
  }

  if (!data.message || data.message.trim().length < 10) {
    errors.message = 'Le message doit contenir au moins 10 caractères'
  }
  if (data.message && data.message.length > 2000) {
    errors.message = 'Le message ne peut pas dépasser 2000 caractères'
  }

  return { valid: Object.keys(errors).length === 0, errors }
}