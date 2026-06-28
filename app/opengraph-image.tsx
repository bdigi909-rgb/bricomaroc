import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'BricoMaroc - Artisans verifies au Maroc'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #1B7A56 0%, #0f4a33 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
        }}
      >
        {/* Cercles décoratifs */}
        <div style={{
          position: 'absolute', top: -80, right: -80,
          width: 300, height: 300,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
          display: 'flex',
        }} />
        <div style={{
          position: 'absolute', bottom: -60, left: -60,
          width: 200, height: 200,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
          display: 'flex',
        }} />

        {/* Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          marginBottom: 40,
        }}>
          <div style={{
            width: 80, height: 80,
            background: 'white',
            borderRadius: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 40,
          }}>
            🔧
          </div>
          <span style={{
            fontSize: 56,
            fontWeight: 800,
            color: 'white',
            letterSpacing: -2,
          }}>
            BricoMaroc
          </span>
        </div>

        {/* Titre principal */}
        <div style={{
          fontSize: 36,
          fontWeight: 600,
          color: 'rgba(255,255,255,0.9)',
          textAlign: 'center',
          maxWidth: 800,
          lineHeight: 1.3,
          marginBottom: 24,
        }}>
          Trouvez un artisan de confiance pres de chez vous
        </div>

        {/* Sous-titre */}
        <div style={{
          fontSize: 24,
          color: 'rgba(255,255,255,0.7)',
          textAlign: 'center',
          maxWidth: 700,
          marginBottom: 48,
        }}>
          Plombier, electricien, peintre... Verifies et disponibles
        </div>

        {/* Badges */}
        <div style={{
          display: 'flex',
          gap: 16,
        }}>
          {['Artisans verifies', 'Devis gratuit', 'Paiement securise'].map(badge => (
            <div key={badge} style={{
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: 100,
              padding: '10px 24px',
              color: 'white',
              fontSize: 18,
              fontWeight: 500,
              display: 'flex',
            }}>
              {badge}
            </div>
          ))}
        </div>

        {/* URL */}
        <div style={{
          position: 'absolute',
          bottom: 30,
          color: 'rgba(255,255,255,0.5)',
          fontSize: 18,
          display: 'flex',
        }}>
          bricomaroc.vercel.app
        </div>
      </div>
    ),
    { ...size }
  )
}