'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const VILLES_COORDS: Record<string, { nom: string; lat: number; lng: number }> = {
  'Marrakech': { nom: 'Marrakech', lat: 31.6295, lng: -7.9811 },
  'Casablanca': { nom: 'Casablanca', lat: 33.5731, lng: -7.5898 },
  'Rabat': { nom: 'Rabat', lat: 34.0209, lng: -6.8416 },
  'Fès': { nom: 'Fès', lat: 34.0181, lng: -5.0078 },
  'Tanger': { nom: 'Tanger', lat: 35.7595, lng: -5.8340 },
  'Agadir': { nom: 'Agadir', lat: 30.4278, lng: -9.5981 },
  'Meknès': { nom: 'Meknès', lat: 33.8935, lng: -5.5473 },
  'Oujda': { nom: 'Oujda', lat: 34.6814, lng: -1.9086 },
  'Tétouan': { nom: 'Tétouan', lat: 35.5785, lng: -5.3684 },
  'Safi': { nom: 'Safi', lat: 32.2994, lng: -9.2372 },
}

function distance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

export default function Geolocalisation() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [villeDetectee, setVilleDetectee] = useState('')

  function localiser() {
    if (!navigator.geolocation) {
      setError('Geolocalisation non supportee par votre navigateur')
      return
    }

    setLoading(true)
    setError('')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords

        // Trouver la ville la plus proche
        let villeProche = 'Marrakech'
        let distanceMin = Infinity

        Object.entries(VILLES_COORDS).forEach(([nom, coords]) => {
          const dist = distance(latitude, longitude, coords.lat, coords.lng)
          if (dist < distanceMin) {
            distanceMin = dist
            villeProche = nom
          }
        })

        setVilleDetectee(villeProche)
        setLoading(false)

        // Rediriger vers artisans de cette ville
        router.push(`/artisans?ville=${villeProche}`)
      },
      (err) => {
        setLoading(false)
        if (err.code === 1) {
          setError('Permission refusee. Autorisez la geolocalisation dans votre navigateur.')
        } else {
          setError('Impossible de determiner votre position.')
        }
      },
      { timeout: 10000, maximumAge: 300000 }
    )
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button onClick={localiser} disabled={loading}
        className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700
          font-medium px-4 py-2.5 rounded-xl hover:bg-gray-50 hover:border-[#1B7A56]
          transition-all disabled:opacity-50 text-sm shadow-sm">
        {loading ? (
          <>
            <span className="animate-spin">⏳</span>
            Localisation en cours...
          </>
        ) : (
          <>
            📍 Artisans pres de moi
          </>
        )}
      </button>

      {villeDetectee && (
        <p className="text-xs text-green-600 font-medium">
          Ville detectee : {villeDetectee}
        </p>
      )}

      {error && (
        <p className="text-xs text-red-500 text-center max-w-xs">{error}</p>
      )}
    </div>
  )
}