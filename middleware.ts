import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ADMIN_EMAIL = 'bdigi909@gmail.com'

const PROTECTED_ROUTES = [
  '/dashboard',
  '/espace-client',
  '/profil',
  '/profil-client',
  '/messages',
  '/suivi',
  '/paiement',
  '/avis',
  '/favoris',
  '/parrainage',
  '/support',
  '/carte-id',
]

const ADMIN_ROUTES = ['/admin']

// Rate limiting en mémoire
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(ip: string, maxRequests: number = 30, windowMs: number = 60000): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count >= maxRequests) return false

  record.count++
  return true
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const ip = request.headers.get('x-forwarded-for') ?? 'anonymous'

  // Rate limiting sur les routes API et auth
  if (pathname.startsWith('/api/') || pathname.startsWith('/auth/')) {
    const maxReq = pathname.startsWith('/api/email') || pathname.startsWith('/api/sms') ? 5 : 30
    const allowed = checkRateLimit(`${ip}:${pathname.split('/')[2]}`, maxReq, 60000)
    if (!allowed) {
      return new NextResponse(
        JSON.stringify({ error: 'Trop de requetes. Reessayez dans 1 minute.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      )
    }
  }

  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  const isAdminRoute = ADMIN_ROUTES.some(route => pathname.startsWith(route))
  if (isAdminRoute) {
    if (!session) return NextResponse.redirect(new URL('/auth/login', request.url))
    if (session.user.email !== ADMIN_EMAIL) return NextResponse.redirect(new URL('/', request.url))
    return response
  }

  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route))
  if (isProtectedRoute && !session) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/espace-client/:path*',
    '/profil/:path*',
    '/profil-client/:path*',
    '/messages/:path*',
    '/suivi/:path*',
    '/paiement/:path*',
    '/avis/:path*',
    '/favoris/:path*',
    '/parrainage/:path*',
    '/carte-id/:path*',
    '/api/:path*',
    '/auth/:path*',
  ],
}