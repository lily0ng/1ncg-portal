import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(user)
  } catch (error: any) {
    console.error('[auth/me] Error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve user', details: error?.message },
      { status: 500 }
    )
  }
}
