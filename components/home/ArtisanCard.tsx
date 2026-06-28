'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin } from 'lucide-react'
import { Button } from '@/components/ui'

const VILLES = ['Marrakech', 'Casablanca', 'Rabat', 'Fès', 'Agadir', 'Tanger', 'Meknès', 'Oujda']

const SUGGESTIONS = [
  'Plomberie', 'Électricité', 'Peinture', 'Climatisation',
  'Menuiserie', 'Carrelage', 'Maçonnerie', 'Jardinage', 'Serrurerie', 'Bricolage'
]

export default function SearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [ville, setVille] = useState('Marrakech')
  const [showSuggestions, setShowSuggestions] = useState(false)

  const suggestionsFiltrees = query.length > 0
    ? SUGGESTIONS.filter(s => s.toLowerCase().includes(query.toLowerCase()))
    : SUGGESTIONS

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (ville) params.set('ville', ville)
    router.push(`/artisans?${params.toString()}`)
    setShowSuggestions(false)
  }

  function selectSuggestion(suggestion: string) {
    setQuery(suggestion)
    setShowSuggestions(false)
    const params = new URLSearchParams()
    params.set('q', suggestion)
    params.set('ville', ville)
    router.push(`/artisans?${params.toString()}`)
  }

  return (
    <div className="relative">
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
            onChange={e => { setQuery(e.target.value); setShowSuggestions(true) }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder="Plomberie, électricité, peinture…"
            className="flex-1 text-sm text-ink placeholder:text-muted bg-transparent outline-none"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')}
              className="text-gray-400 hover:text-gray-600 text-lg leading-none">
              ×
            </button>
          )}
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

      {/* SUGGESTIONS */}
      {showSuggestions && suggestionsFiltrees.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl
          border border-gray-100 z-50 overflow-hidden">
          <div className="px-4 py-2 border-b border-gray-50">
            <p className="text-xs text-gray-400 font-medium">Suggestions populaires</p>
          </div>
          <div className="py-2">
            {suggestionsFiltrees.map(suggestion => (
              <button key={suggestion}
                onMouseDown={() => selectSuggestion(suggestion)}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700
                  hover:bg-gray-50 flex items-center gap-3 transition-colors">
                <Search size={14} className="text-gray-400 flex-shrink-0" />
                <span>{suggestion}</span>
                {query && suggestion.toLowerCase().includes(query.toLowerCase()) && (
                  <span className="ml-auto text-xs text-[#1B7A56] font-medium">→</span>
                )}
              </button>
            ))}
          </div>
          <div className="px-4 py-2 border-t border-gray-50 bg-gray-50">
            <button onMouseDown={handleSearch}
              className="text-xs text-[#1B7A56] font-medium hover:underline">
              Voir tous les artisans à {ville} →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}