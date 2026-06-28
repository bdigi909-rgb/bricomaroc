'use client'
import { useState } from 'react'
import Link from 'next/link'

interface Estimation {
  min: number
  max: number
  duree: string
  details: string[]
  conseils: string[]
}

const ESTIMATIONS: Record<string, Record<string, Estimation>> = {
  plomberie: {
    fuite: { min: 200, max: 500, duree: '1-3h', details: ['Diagnostic', 'Remplacement joint ou tuyau', 'Test étanchéité'], conseils: ['Coupez l\'eau avant l\'intervention', 'Prenez des photos avant'] },
    robinet: { min: 150, max: 400, duree: '1-2h', details: ['Dépose ancien robinet', 'Pose nouveau robinet', 'Test fonctionnement'], conseils: ['Précisez la marque souhaitée', 'Vérifiez la compatibilité'] },
    wc: { min: 300, max: 800, duree: '2-4h', details: ['Diagnostic chasse', 'Remplacement mécanisme', 'Réglages'], conseils: ['Notez la référence du WC', 'Vérifiez si dépannage ou remplacement'] },
    chauffe_eau: { min: 800, max: 2500, duree: '3-6h', details: ['Dépose ancien chauffe-eau', 'Installation nouveau', 'Raccordements', 'Test'], conseils: ['Comparez électrique vs gaz', 'Vérifiez la capacité nécessaire'] },
    evacuation: { min: 400, max: 1200, duree: '2-5h', details: ['Diagnostic bouchon', 'Débouchage', 'Nettoyage'], conseils: ['Évitez les produits chimiques forts', 'Prévenez tôt'] },
  },
  electricite: {
    prise: { min: 100, max: 300, duree: '1-2h', details: ['Coupure circuit', 'Remplacement prise', 'Test sécurité'], conseils: ['Précisez 2 ou 3 broches', 'Vérifiez la puissance nécessaire'] },
    tableau: { min: 1500, max: 5000, duree: '4-8h', details: ['Audit installation', 'Remplacement tableau', 'Mise aux normes', 'Certification'], conseils: ['Obligatoire tous les 15 ans', 'Exigez un certificat de conformité'] },
    eclairage: { min: 200, max: 800, duree: '2-4h', details: ['Câblage', 'Pose luminaires', 'Réglages'], conseils: ['LED = économies 70%', 'Pensez variation d\'intensité'] },
    climatisation: { min: 2000, max: 6000, duree: '4-8h', details: ['Pose unité intérieure', 'Pose unité extérieure', 'Raccordements', 'Test froid/chaud'], conseils: ['Choisissez A++ minimum', 'Prévoyez la maintenance annuelle'] },
  },
  peinture: {
    chambre: { min: 800, max: 2000, duree: '1-2 jours', details: ['Préparation murs', 'Sous-couche', '2 couches peinture', 'Nettoyage'], conseils: ['Videz la pièce avant', 'Choisissez la couleur avec échantillon'] },
    salon: { min: 1500, max: 4000, duree: '2-3 jours', details: ['Protection sol et meubles', 'Préparation', '2-3 couches'], conseils: ['Peinture acrylique recommandée', 'Aérez bien pendant 48h'] },
    facade: { min: 3000, max: 12000, duree: '3-7 jours', details: ['Nettoyage façade', 'Traitement fissures', 'Peinture hydrofuge', '2 couches'], conseils: ['Été = meilleure saison', 'Vérifiez copropriété'] },
    plafond: { min: 500, max: 1500, duree: '1-2 jours', details: ['Protection sol', 'Enduit si nécessaire', 'Peinture blanche'], conseils: ['Blanc mat recommandé', 'Prévoyez échafaudage'] },
  },
  menuiserie: {
    porte: { min: 600, max: 2000, duree: '2-4h', details: ['Dépose ancienne porte', 'Pose nouvelle porte', 'Réglages', 'Finitions'], conseils: ['Mesurez précisément', 'Précisez sens d\'ouverture'] },
    fenetre: { min: 800, max: 3000, duree: '3-5h', details: ['Dépose', 'Pose fenêtre', 'Isolation', 'Finitions'], conseils: ['Double vitrage obligatoire', 'Vérifiez la TVA réduite'] },
    placard: { min: 1500, max: 6000, duree: '1-3 jours', details: ['Mesures', 'Fabrication', 'Installation', 'Finitions'], conseils: ['Sur mesure = meilleure utilisation', 'Matériaux: bois massif vs MDF'] },
    parquet: { min: 1200, max: 4000, duree: '1-3 jours', details: ['Préparation sol', 'Pose parquet', 'Finitions', 'Vitrification'], conseils: ['Laissez acclimater 48h', 'Flottant vs collé selon usage'] },
  },
  climatisation: {
    installation: { min: 2000, max: 6000, duree: '4-8h', details: ['Pose unité intérieure', 'Pose unité extérieure', 'Raccordements', 'Test'], conseils: ['Choisissez A++ minimum', 'Prévoyez maintenance annuelle'] },
    entretien: { min: 300, max: 600, duree: '1-2h', details: ['Nettoyage filtres', 'Vérification gaz', 'Test performances'], conseils: ['1 fois par an minimum', 'Avant l\'été idéalement'] },
    reparation: { min: 400, max: 1500, duree: '2-4h', details: ['Diagnostic', 'Réparation fuite', 'Recharge gaz'], conseils: ['Ne pas attendre la panne totale', 'Vérifiez la garantie'] },
  },
}

const CATEGORIES = [
  { id: 'plomberie', nom: 'Plomberie', icone: '🔧', travaux: [
    { id: 'fuite', label: 'Fuite d\'eau' },
    { id: 'robinet', label: 'Remplacement robinet' },
    { id: 'wc', label: 'WC / Chasse d\'eau' },
    { id: 'chauffe_eau', label: 'Chauffe-eau' },
    { id: 'evacuation', label: 'Débouchage évacuation' },
  ]},
  { id: 'electricite', nom: 'Électricité', icone: '⚡', travaux: [
    { id: 'prise', label: 'Prise électrique' },
    { id: 'tableau', label: 'Tableau électrique' },
    { id: 'eclairage', label: 'Éclairage' },
    { id: 'climatisation', label: 'Climatisation' },
  ]},
  { id: 'peinture', nom: 'Peinture', icone: '🎨', travaux: [
    { id: 'chambre', label: 'Chambre' },
    { id: 'salon', label: 'Salon / Séjour' },
    { id: 'facade', label: 'Façade extérieure' },
    { id: 'plafond', label: 'Plafond' },
  ]},
  { id: 'menuiserie', nom: 'Menuiserie', icone: '🪵', travaux: [
    { id: 'porte', label: 'Porte intérieure' },
    { id: 'fenetre', label: 'Fenêtre' },
    { id: 'placard', label: 'Placard sur mesure' },
    { id: 'parquet', label: 'Parquet' },
  ]},
  { id: 'climatisation', nom: 'Climatisation', icone: '❄️', travaux: [
    { id: 'installation', label: 'Installation' },
    { id: 'entretien', label: 'Entretien annuel' },
    { id: 'reparation', label: 'Réparation' },
  ]},
]

export default function EstimationPage() {
  const [categorieId, setCategorieId] = useState('')
  const [travailId, setTravailId] = useState('')
  const [surface, setSurface] = useState('')
  const [estimation, setEstimation] = useState<Estimation | null>(null)

  const categorieSelectionnee = CATEGORIES.find(c => c.id === categorieId)

  function calculer() {
    if (!categorieId || !travailId) return
    const est = ESTIMATIONS[categorieId]?.[travailId]
    if (!est) return

    let min = est.min
    let max = est.max

    // Ajustement selon surface
    if (surface && ['chambre', 'salon', 'facade', 'parquet'].includes(travailId)) {
      const m2 = parseInt(surface)
      const facteur = m2 / 20
      min = Math.round(est.min * facteur)
      max = Math.round(est.max * facteur)
    }

    setEstimation({ ...est, min, max })
  }

  function reset() {
    setCategorieId('')
    setTravailId('')
    setSurface('')
    setEstimation(null)
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-[#1B7A56]">🔧 BricoMaroc</Link>
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-800">← Accueil</Link>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🧮</div>
          <h1 className="text-2xl font-bold text-gray-900">Estimateur de budget</h1>
          <p className="text-gray-500 text-sm mt-2">
            Obtenez une estimation gratuite pour vos travaux au Maroc
          </p>
        </div>

        {!estimation ? (
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-6">

            {/* CATÉGORIE */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                1. Type de travaux
              </label>
              <div className="grid grid-cols-3 gap-3">
                {CATEGORIES.map(cat => (
                  <button key={cat.id} onClick={() => { setCategorieId(cat.id); setTravailId('') }}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2
                      transition-all text-center ${
                      categorieId === cat.id
                        ? 'border-[#1B7A56] bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                    <span className="text-2xl">{cat.icone}</span>
                    <span className="text-xs font-medium text-gray-700">{cat.nom}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* TRAVAIL */}
            {categorieId && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  2. Quel travail ?
                </label>
                <div className="space-y-2">
                  {categorieSelectionnee?.travaux.map(t => (
                    <button key={t.id} onClick={() => setTravailId(t.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm
                        font-medium transition-all ${
                        travailId === t.id
                          ? 'border-[#1B7A56] bg-green-50 text-[#1B7A56]'
                          : 'border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}>
                      {travailId === t.id ? '✓ ' : ''}{t.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* SURFACE */}
            {travailId && ['chambre', 'salon', 'facade', 'parquet'].includes(travailId) && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  3. Surface (m²)
                </label>
                <input type="number" value={surface} onChange={e => setSurface(e.target.value)}
                  placeholder="Ex: 20"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                    focus:outline-none focus:ring-2 focus:ring-[#1B7A56]" />
              </div>
            )}

            {/* BOUTON */}
            {travailId && (
              <button onClick={calculer}
                className="w-full bg-[#1B7A56] text-white font-semibold py-4 rounded-xl
                  hover:bg-[#155f42] transition-colors text-lg">
                🧮 Estimer le budget
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">

            {/* RÉSULTAT */}
            <div className="bg-gradient-to-br from-[#1B7A56] to-[#155f42] rounded-2xl p-6 text-white">
              <p className="text-green-200 text-sm mb-2">Estimation pour votre projet</p>
              <div className="flex items-end gap-3 mb-2">
                <span className="text-5xl font-bold">{estimation.min}</span>
                <span className="text-2xl text-green-200 mb-1">—</span>
                <span className="text-5xl font-bold">{estimation.max}</span>
                <span className="text-xl text-green-200 mb-1">MAD</span>
              </div>
              <p className="text-green-200 text-sm">
                ⏱ Durée estimée : {estimation.duree}
              </p>
            </div>

            {/* DÉTAILS */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-3">📋 Prestations incluses</h3>
              <ul className="space-y-2">
                {estimation.details.map((d, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-[#1B7A56] font-bold">✓</span>
                    {d}
                  </li>
                ))}
              </ul>
            </div>

            {/* CONSEILS */}
            <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-5">
              <h3 className="font-bold text-gray-900 mb-3">💡 Conseils</h3>
              <ul className="space-y-2">
                {estimation.conseils.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-yellow-500 mt-0.5">•</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>

            {/* AVERTISSEMENT */}
            <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500">
              ⚠️ Cette estimation est indicative. Le prix final dépend de l'état du chantier,
              des matériaux choisis et de l'artisan sélectionné. Demandez toujours 2-3 devis.
            </div>

            {/* ACTIONS */}
            <div className="flex gap-3">
              <button onClick={reset}
                className="flex-1 border border-gray-200 text-gray-600 font-semibold
                  py-3 rounded-xl hover:bg-gray-50 transition-colors">
                ← Nouvelle estimation
              </button>
              <Link href="/demandes/nouvelle"
                className="flex-1 bg-[#E8622A] text-white font-semibold py-3 rounded-xl
                  hover:bg-[#d45520] transition-colors text-center">
                📋 Poster une demande
              </Link>
            </div>

            <Link href="/artisans"
              className="block text-center text-sm text-[#1B7A56] font-medium hover:underline">
              Voir les artisans disponibles →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}