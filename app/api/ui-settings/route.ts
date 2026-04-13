import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

export async function GET() {
  try {
    const settings = await db.uISettings.findUnique({ where: { id: 'default' } })
    return NextResponse.json(settings || { id: 'default', portalName: '1CNG Cloud Portal', theme: 'dark-nebula', primaryColor: '#6366f1' })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const data = await req.json()
    const settings = await db.uISettings.upsert({
      where: { id: 'default' },
      create: { id: 'default', ...data },
      update: data,
    })
    return NextResponse.json(settings)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
