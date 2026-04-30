import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/tracks',
  '/gigs',
  '/leaderboard',
  '/profile',
  '/wallet',
  '/notifications',
]

const AUTH_PAGES = ['/login', '/register']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  const isAuthenticated = !!token
  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  )
  const isAuthPage = AUTH_PAGES.includes(pathname)
  const isOnboarding = pathname === '/onboarding'
  const onboardingCompleted = token?.onboarding_completed as boolean | undefined

  // Unauthenticated → protected route: send to login
  if (!isAuthenticated && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(url)
  }

  if (isAuthenticated) {
    // Authenticated → login/register: redirect to appropriate page
    if (isAuthPage) {
      const url = request.nextUrl.clone()
      url.pathname = onboardingCompleted === false ? '/onboarding' : '/dashboard'
      return NextResponse.redirect(url)
    }

    // Authenticated, onboarding incomplete → force onboarding
    if (isProtected && onboardingCompleted === false && !isOnboarding) {
      const url = request.nextUrl.clone()
      url.pathname = '/onboarding'
      return NextResponse.redirect(url)
    }

    // Authenticated, onboarding done → redirect away from /onboarding
    if (isOnboarding && onboardingCompleted === true) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
