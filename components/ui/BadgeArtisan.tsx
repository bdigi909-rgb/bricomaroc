'use client'
import { useState, useEffect } from 'react'

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('darkMode')
    if (saved === 'true') {
      document.documentElement.classList.add('dark')
      setIsDark(true)
    }
  }, [])

  function toggle() {
    if (isDark) {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('darkMode', 'false')
      setIsDark(false)
    } else {
      document.documentElement.classList.add('dark')
      localStorage.setItem('darkMode', 'true')
      setIsDark(true)
    }
  }

  if (!mounted) return null

  return (
    <button onClick={toggle}
      className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-600"
      title={isDark ? 'Mode clair' : 'Mode sombre'}>
      {isDark ? '☀️' : '🌙'}
    </button>
  )
}