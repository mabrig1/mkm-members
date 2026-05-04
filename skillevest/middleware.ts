import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const DASHBOARD_PREFIXES = ['/dashboard', '/tracks', '/gigs', '/wallet', '/leaderboard', '/profile']
const AUTH_PAGES = ['/login', '/register']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  const isDashboard = DASHBOARD_PREFIXES.some(p => pathname.startsWith(p))
  const isAdmin = pathname.startsWith('/admin')
  const isAuthPage = AUTH_PAGES.includes(pathname)

  // Unauthenticated user hitting a protected route → login
  if (!token && (isDashboard || isAdmin)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(url)
  }

  // Authenticated user hitting login/register → dashboard
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Non-admin hitting /admin → dashboard
  if (token && isAdmin && (token as { role?: string }).role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Authenticated but onboarding not complete → onboarding (skip if already there)
  if (
    token &&
    isDashboard &&
    !(token as { onboarding_completed?: boolean }).onboarding_completed &&
    !pathname.startsWith('/onboarding')
  ) {
    return NextResponse.redirect(new URL('/onboarding', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|_next/webpack-hmr).*)'],
}
