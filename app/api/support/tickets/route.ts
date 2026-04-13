import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const where: any = {}
    if (user.role === 'USER') where.userId = user.id
    else if (user.role === 'RESELLER') {
      // Reseller sees tickets from their customers
      const reseller = await db.reseller.findFirst({ where: { userId: user.id } as any })
      if (reseller) {
        const customers = await db.user.findMany({ where: { resellerId: reseller.id }, select: { id: true } })
        where.userId = { in: customers.map((c: any) => c.id) }
      }
    }
    
    const tickets = await db.supportTicket.findMany({ where, orderBy: { createdAt: 'desc' }, take: 50 })
    return NextResponse.json({ tickets })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()
    const ticket = await db.supportTicket.create({
      data: {
        userId: user.id,
        subject: body.subject,
        message: body.message,
        priority: body.priority || 'medium',
        status: 'open',
      }
    })
    return NextResponse.json({ ticket })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
