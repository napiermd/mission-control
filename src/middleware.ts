import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check for auth cookie
  const authCookie = request.cookies.get('mc-auth')
  
  if (authCookie?.value === 'authenticated') {
    return NextResponse.next()
  }
  
  // Check for password in query params (for email link access)
  const url = new URL(request.url)
  const password = url.searchParams.get('pw')
  const expected = process.env.MISSION_CONTROL_PASSWORD

  if (password && expected && password === expected) {
    const response = NextResponse.next()
    response.cookies.set('mc-auth', 'authenticated', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    })
    return response
  }
  
  // Redirect to login page
  return NextResponse.redirect(new URL('/login', request.url))
}

export const config = {
  matcher: ['/((?!login|api|_next/static|_next/image|favicon.ico).*)']
}
