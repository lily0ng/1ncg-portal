import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const response = NextResponse.json({ success: true })
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    })
    return response
  } catch (error: any) {
    console.error('[auth/logout] Error:', error)
    return NextResponse.json(
      { error: 'Logout failed', details: error?.message },
      { status: 500 }
    )
  }
}
