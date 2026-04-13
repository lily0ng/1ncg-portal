import { NextRequest, NextResponse } from 'next/server'
import { signToken } from '@/lib/auth'

// DEV ONLY — bypasses CloudStack auth for testing role-based portals
export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available' }, { status: 404 })
  }
  const { role = 'ADMIN', username = 'devuser', account = 'admin', domainId = 'ROOT' } = await req.json()
  const token = await signToken({
    id: `dev-${role.toLowerCase()}`,
    username,
    email: `${username}@dev.local`,
    role,
    domainId,
    account,
  })
  const response = NextResponse.json({ success: true, role })
  response.cookies.set('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 86400,
    path: '/',
  })
  return response
}
