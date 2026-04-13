import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

const PUBLIC_ROUTES = ['/login', '/api/auth/login', '/api/auth/logout', '/api/auth/dev-login', '/api/ui-settings']

type Role = 'ADMIN' | 'RESELLER' | 'USER'

const ROLE_HOME: Record<Role, string> = {
  ADMIN: '/admin',
  RESELLER: '/reseller',
  USER: '/portal',
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow public routes
  if (PUBLIC_ROUTES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Get token from cookie
  const token = req.cookies.get('token')?.value
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Verify token directly using jose (no async helper)
  let payload: { id: string; role: Role } & Record<string, unknown>
  try {
    const { payload: p } = await jwtVerify(token, JWT_SECRET)
    payload = p as typeof payload
  } catch {
    const response = NextResponse.redirect(new URL('/login', req.url))
    response.cookies.delete('token')
    return response
  }

  const role = payload.role as Role

  // Determine which portal the user is trying to access
  const isAdminRoute = pathname.startsWith('/admin')
  const isResellerRoute = pathname.startsWith('/reseller')
  const isUserRoute = pathname.startsWith('/portal')

  // If accessing a role-protected route, verify the role matches
  if (isAdminRoute && role !== 'ADMIN') {
    return NextResponse.redirect(new URL(ROLE_HOME[role], req.url))
  }

  if (isResellerRoute && role !== 'RESELLER') {
    return NextResponse.redirect(new URL(ROLE_HOME[role], req.url))
  }

  if (isUserRoute && role !== 'USER') {
    return NextResponse.redirect(new URL(ROLE_HOME[role], req.url))
  }

  // Redirect root to role home
  if (pathname === '/') {
    return NextResponse.redirect(new URL(ROLE_HOME[role] ?? '/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$|.*\\.ico$).*)'],
}
