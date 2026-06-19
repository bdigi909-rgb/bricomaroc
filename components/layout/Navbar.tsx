'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, Wrench, Bell, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui'
import { clsx } from 'clsx'

interface NavbarProps {
  user?: { full_name: string; role: string } | null
}

export default function Navbar({ user }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-[var(--color-border)] h-14">
      <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between">

        {/* LOGO */}f
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white"
              strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
          </div>
          <span className="text-[17px] font-extrabold tracking-tight text-ink">BricoMaroc</span>
        </Link>

        {/* LIENS DESKTOP */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/artisans" className="text-sm font-medium text-muted hover:text-ink transition-colors">
            Trouver un artisan
          </Link>
          <Link href="/comment-ca-marche" className="text-sm font-medium text-muted hover:text-ink transition-colors">
            Comment ça marche
          </Link>
          <Link href="/auth/register?role=artisan" className="text-sm font-medium text-muted hover:text-ink transition-colors">
  Devenir artisan
</Link>
        </div>

        {/* CTA / USER */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              {/* Notifications */}
              <button className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-sand transition-colors">
                <Bell size={18} className="text-muted" />
                <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-orange-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                  2
                </span>
              </button>
              {/* User menu */}
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-sand transition-colors">
                <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-xs font-bold text-green-700">
                  {user.full_name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium hidden sm:block">{user.full_name.split(' ')[0]}</span>
                <ChevronDown size={14} className="text-muted" />
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm font-medium text-muted hover:text-ink hidden sm:block transition-colors">
                Connexion
              </Link>
              <Button variant="primary" size="sm" asChild>
                <Link href="/demande/nouvelle">Trouver un artisan</Link>
              </Button>
            </>
          )}

          {/* MENU MOBILE */}
          <button
            className="md:hidden ml-1 w-9 h-9 flex items-center justify-center rounded-xl hover:bg-sand transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* MENU MOBILE DROPDOWN */}
      {menuOpen && (
        <div className="md:hidden absolute top-14 inset-x-0 bg-white border-b border-[var(--color-border)] shadow-card-hover animate-fade-in z-40">
          <div className="flex flex-direction-col p-4 gap-1">
            {[
              { href: '/artisans',          label: 'Trouver un artisan' },
              { href: '/comment-ca-marche', label: 'Comment ça marche' },
              { href: '/artisans/inscription', label: 'Devenir artisan' },
              { href: '/auth/login',        label: 'Connexion' },
            ].map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center px-3 py-2.5 text-sm font-medium rounded-xl hover:bg-sand text-ink transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2">
              <Button variant="primary" size="md" fullWidth asChild>
                <Link href="/demande/nouvelle" onClick={() => setMenuOpen(false)}>
                  Publier une demande
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
