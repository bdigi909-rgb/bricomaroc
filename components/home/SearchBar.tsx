'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin } from 'lucide-react'
import { Button } from '@/components/ui'

const VILLES = ['Marrakech', 'Casablanca', 'Rabat', 'Fès', 'Agadir', 'Tanger', 'Meknès', 'Oujda']

export default function SearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [ville, setVille] = useState('Marrakech')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (ville) params.set('ville', ville)
    router.push(`/artisans?${params.toString()}`)
  }

  return (
    <form
      onSubmit={handleSearch}
      className="flex gap-2 flex-wrap bg-white rounded-2xl p-2 shadow-card-hover"
    >
      {/* RECHERCHE MÉTIER */}
      <div className="flex-[2] min-w-[160px] flex items-center gap-2 border border-[var(--color-border)] rounded-xl px-3 h-11">
        <Search size={16} className="text-muted flex-shrink-0" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Plomberie, électricité, peinture…"
          className="flex-1 text-sm text-ink placeholder:text-muted bg-transparent outline-none"
        />
      </div>

      {/* VILLE */}
      <div className="flex-1 min-w-[130px] flex items-center gap-2 border border-[var(--color-border)] rounded-xl px-3 h-11">
        <MapPin size={15} className="text-muted flex-shrink-0" />
        <select
          value={ville}
          onChange={e => setVille(e.target.value)}
          className="flex-1 text-sm text-ink bg-transparent outline-none cursor-pointer appearance-none"
        >
          {VILLES.map(v => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
      </div>

      {/* BOUTON */}
      <Button type="submit" variant="primary" size="md" className="h-11 min-w-[110px]">
        Rechercher
      </Button>
    </form>
  )
}
