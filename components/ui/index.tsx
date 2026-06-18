'use client'

import React from 'react'
import { clsx } from 'clsx'

// ============================================================
// BUTTON
// Supporte `asChild` pour envelopper un <Link> (style appliqué
// directement à l'enfant, sans <button> imbriqué dans <a>)
// ============================================================
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
  asChild?: boolean
}

export function Button({
  variant = 'primary', size = 'md',
  loading, fullWidth, asChild, children, className, disabled, ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary:   'bg-green-500 text-white hover:bg-green-600 focus:ring-green-300 shadow-green',
    secondary: 'bg-white text-green-500 border border-green-500 hover:bg-green-50 focus:ring-green-200',
    ghost:     'bg-transparent text-ink border border-[var(--color-border)] hover:bg-white focus:ring-gray-200',
    danger:    'bg-red-50 text-red-700 border border-red-300 hover:bg-red-100 focus:ring-red-200',
  }
  const sizes = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2.5',
    lg: 'text-base px-6 py-3',
  }
  const classes = clsx(base, variants[variant], sizes[size], fullWidth && 'w-full', className)

  // asChild : on clone l'enfant unique (ex: <Link>) en lui injectant les classes,
  // pour éviter un <button> imbriqué dans un <a> (invalide en HTML).
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement, {
      className: clsx(classes, (children as React.ReactElement).props.className),
    })
  }

  return (
    <button className={classes} disabled={loading || disabled} {...props}>
      {loading ? (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
      ) : null}
      {children}
    </button>
  )
}

// ============================================================
// BADGE
// ============================================================
type BadgeVariant = 'green' | 'gold' | 'gray' | 'orange' | 'red' | 'blue'

export function Badge({ variant = 'gray', children, className }: {
  variant?: BadgeVariant; children: React.ReactNode; className?: string
}) {
  const variants: Record<BadgeVariant, string> = {
    green:  'bg-green-50  text-green-700',
    gold:   'bg-gold-50   text-gold-600',
    gray:   'bg-gray-100  text-gray-600',
    orange: 'bg-orange-50 text-orange-700',
    red:    'bg-red-50    text-red-700',
    blue:   'bg-blue-50   text-blue-700',
  }
  return (
    <span className={clsx(
      'inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full',
      variants[variant], className
    )}>
      {children}
    </span>
  )
}

// ============================================================
// STARS
// ============================================================
export function Stars({ note, size = 'sm' }: { note: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'text-sm', md: 'text-base', lg: 'text-xl' }
  return (
    <span className={clsx('stars-gold', sizes[size])}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ opacity: i <= note ? 1 : 0.2 }}>★</span>
      ))}
    </span>
  )
}

// ============================================================
// AVATAR
// ============================================================
export function Avatar({ name, size = 'md', color = '#1B7A56' }: {
  name: string; size?: 'sm' | 'md' | 'lg'; color?: string
}) {
  const initials = name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase()
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-base' }
  return (
    <div
      className={clsx('rounded-full flex items-center justify-center font-bold text-white flex-shrink-0', sizes[size])}
      style={{ background: color }}
    >
      {initials}
    </div>
  )
}

// ============================================================
// CARD
// ============================================================
export function Card({ children, className, hover, onClick }: {
  children: React.ReactNode; className?: string; hover?: boolean; onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'bg-white border border-[var(--color-border)] rounded-2xl p-4',
        hover && 'hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  )
}

// ============================================================
// SKELETON
// ============================================================
export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx('bg-gray-200 rounded animate-pulse', className)} />
}

export function ArtisanCardSkeleton() {
  return (
    <div className="card">
      <div className="flex gap-3 mb-3">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-3 w-full mb-2" />
      <Skeleton className="h-3 w-3/4 mb-3" />
      <div className="flex gap-2">
        <Skeleton className="h-8 flex-1 rounded-xl" />
        <Skeleton className="h-8 w-20 rounded-xl" />
      </div>
    </div>
  )
}

// ============================================================
// DISPONIBILITE DOT
// ============================================================
export function DisponibiliteDot({ disponible }: { disponible: boolean }) {
  return (
    <span className={clsx(
      'inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full',
      disponible ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
    )}>
      <span className={clsx(
        'w-1.5 h-1.5 rounded-full',
        disponible ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
      )} />
      {disponible ? 'Disponible' : 'Indisponible'}
    </span>
  )
}
