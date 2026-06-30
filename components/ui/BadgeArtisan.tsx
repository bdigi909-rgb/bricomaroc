export default function BadgeArtisan({ badge }: { badge?: string | null }) {
  if (!badge) return null

  const badges: Record<string, { label: string; color: string; icon: string }> = {
    nouveau: { label: 'Nouveau', color: 'bg-blue-100 text-blue-700', icon: '🌟' },
    fiable: { label: 'Fiable', color: 'bg-green-100 text-green-700', icon: '✅' },
    expert: { label: 'Expert', color: 'bg-purple-100 text-purple-700', icon: '🏆' },
    top_mois: { label: 'Top du mois', color: 'bg-yellow-100 text-yellow-700', icon: '👑' },
  }

  const b = badges[badge]
  if (!b) return null

  return (
    <span className={`text-xs px-2 py-1 rounded-full font-medium ${b.color}`}>
      {b.icon} {b.label}
    </span>
  )
}