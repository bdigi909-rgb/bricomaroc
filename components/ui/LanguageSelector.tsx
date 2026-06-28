'use client'
import { useState, useEffect } from 'react'

const LANGUES = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'ar', label: 'العربية', flag: '🇲🇦' },
  { code: 'darija', label: 'Darija', flag: '🇲🇦' },
]

export default function LanguageSelector() {
  const [langue, setLangue] = useState('fr')
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('langue') ?? 'fr'
    setLangue(saved)
    document.documentElement.lang = saved === 'ar' ? 'ar' : 'fr'
    document.documentElement.dir = saved === 'ar' ? 'rtl' : 'ltr'
  }, [])

  function changerLangue(code: string) {
    setLangue(code)
    localStorage.setItem('langue', code)
    document.documentElement.lang = code === 'ar' ? 'ar' : 'fr'
    document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr'
    setOpen(false)
    window.dispatchEvent(new CustomEvent('langueChanged', { detail: code }))
  }

  if (!mounted) return null

  const langueActuelle = LANGUES.find(l => l.code === langue) ?? LANGUES[0]

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl
          hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm">
        <span>{langueActuelle.flag}</span>
        <span className="hidden sm:block text-gray-600 dark:text-gray-300">
          {langueActuelle.label}
        </span>
        <span className="text-gray-400 text-xs">▼</span>
      </button>

      {open && (
        <div className="absolute right-0 top-10 bg-white dark:bg-gray-800 rounded-xl
          shadow-xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden w-36">
          {LANGUES.map(l => (
            <button key={l.code} onClick={() => changerLangue(l.code)}
              className={`w-full text-left px-3 py-2.5 text-sm flex items-center gap-2
                hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                langue === l.code ? 'bg-green-50 text-[#1B7A56] font-semibold' : 'text-gray-700 dark:text-gray-300'
              }`}>
              <span>{l.flag}</span>
              <span>{l.label}</span>
              {langue === l.code && <span className="ml-auto text-[#1B7A56]">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}