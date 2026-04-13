import { NextRequest, NextResponse } from 'next/server'
import { cloudstack } from '@/lib/cloudstack'
import { getAuthUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const data = await cloudstack('listVpnUsers', { listall: 'true' })
    return NextResponse.json(data.listvpnusersresponse?.vpnuser || [])
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { username, password } = await req.json()
    const data = await cloudstack('addVpnUser', { username, password })
    return NextResponse.json(data.addvpnuserresponse || {})
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
