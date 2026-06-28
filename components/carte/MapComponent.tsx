'use client'
import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import Link from 'next/link'
import 'leaflet/dist/leaflet.css'

// Fix icônes Leaflet Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Icône verte pour artisans disponibles
const iconVert = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

const iconGris = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, 13)
  }, [center])
  return null
}

interface Props {
  artisans: any[]
  center: [number, number]
  onSelectArtisan: (artisan: any) => void
}

export default function MapComponent({ artisans, center, onSelectArtisan }: Props) {
  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}>
      <ChangeView center={center} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {artisans.map(artisan => (
        <Marker
          key={artisan.id}
          position={[artisan.lat, artisan.lng]}
          icon={artisan.disponible ? iconVert : iconGris}
          eventHandlers={{
            click: () => onSelectArtisan(artisan),
          }}>
          <Popup>
            <div className="text-center min-w-32">
              <p className="font-bold text-gray-900">{artisan.user?.full_name}</p>
              <p className="text-xs text-gray-500 mt-1">
                ⭐ {artisan.note_moyenne?.toFixed(1)} · {artisan.tarif_min}–{artisan.tarif_max} MAD/h
              </p>
              {artisan.disponible && (
                <p className="text-xs text-green-600 font-medium mt-1">🟢 Disponible</p>
              )}
              <a href={`/artisans/${artisan.id}`}
                className="text-xs text-[#1B7A56] font-medium hover:underline mt-2 block">
                Voir profil →
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}