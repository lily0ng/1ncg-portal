import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { db } from '@/lib/db'

interface Params { params: { id: string } }

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const user = await getAuthUser(req)
    if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const reseller = await db.reseller.findUnique({
      where: { id: params.id },
      include: { customers: true }
    })

    if (!reseller) return NextResponse.json({ error: 'Reseller not found' }, { status: 404 })
    return NextResponse.json(reseller)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const user = await getAuthUser(req)
    if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { name, email, domainId, commission, markupPct, active } = body

    const data: Record<string, any> = {}
    if (name !== undefined) data.name = name
    if (email !== undefined) data.email = email
    if (domainId !== undefined) data.domainId = domainId
    if (commission !== undefined) data.commission = Number(commission)
    if (markupPct !== undefined) data.markupPct = Number(markupPct)
    if (active !== undefined) data.active = active

    const reseller = await db.reseller.update({
      where: { id: params.id },
      data
    })

    return NextResponse.json(reseller)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const user = await getAuthUser(req)
    if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await db.reseller.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
